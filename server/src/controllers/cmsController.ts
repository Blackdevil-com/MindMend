import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAdminDashboardSummary = (req: Request, res: Response) => {
  try {
    // 1. Stat cards
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as any;
    const activeStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'").get() as any;
    const totalStaff = db.prepare('SELECT COUNT(*) as count FROM staff').get() as any;
    const activeCourses = db.prepare('SELECT COUNT(*) as count FROM courses WHERE is_published = 1').get() as any;
    const totalTests = db.prepare('SELECT COUNT(*) as count FROM tests').get() as any;
    const testsCompleted = db.prepare("SELECT COUNT(*) as count FROM test_attempts WHERE status = 'submitted'").get() as any;
    const internshipApplications = db.prepare('SELECT COUNT(*) as count FROM internship_applications').get() as any;
    const avgScoreResult = db.prepare("SELECT ROUND(AVG(percentage), 1) as avg FROM test_attempts WHERE status = 'submitted'").get() as any;

    // 2. Course enrollment counts
    const courseEnrollments = db.prepare(`
      SELECT c.title, COUNT(ce.id) as students_count
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      GROUP BY c.id
      ORDER BY students_count DESC
    `).all();

    // 3. Batch stats
    const batchStats = db.prepare(`
      SELECT 
        b.name,
        c.title as course_title,
        (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) as student_count,
        (SELECT ROUND(AVG(ta.percentage), 1) 
         FROM test_attempts ta 
         JOIN batch_students bs ON ta.student_id = bs.student_id 
         WHERE bs.batch_id = b.id AND ta.status = 'submitted') as avg_score
      FROM batches b
      JOIN courses c ON b.course_id = c.id
    `).all();

    // 4. Score distribution
    const scoreDistribution = [
      { range: '90-100%', count: db.prepare("SELECT COUNT(*) as count FROM test_attempts WHERE status = 'submitted' AND percentage >= 90").get() as any },
      { range: '75-89%', count: db.prepare("SELECT COUNT(*) as count FROM test_attempts WHERE status = 'submitted' AND percentage >= 75 AND percentage < 90").get() as any },
      { range: '60-74%', count: db.prepare("SELECT COUNT(*) as count FROM test_attempts WHERE status = 'submitted' AND percentage >= 60 AND percentage < 75").get() as any },
      { range: '< 60%', count: db.prepare("SELECT COUNT(*) as count FROM test_attempts WHERE status = 'submitted' AND percentage < 60").get() as any },
    ].map(s => ({ range: s.range, count: s.count.count }));

    // 5. Recent Activity Feed
    const recentStudents = db.prepare(`
      SELECT 'New student registered: ' || full_name || ' (' || student_id || ')' as title,
             created_at, 'student' as type
      FROM students
      ORDER BY id DESC LIMIT 3
    `).all() as any[];

    const recentSubmissions = db.prepare(`
      SELECT s.full_name || ' completed test "' || t.title || '" (' || ta.percentage || '%)' as title,
             ta.submitted_at as created_at, 'test' as type
      FROM test_attempts ta
      JOIN students s ON ta.student_id = s.id
      JOIN tests t ON ta.test_id = t.id
      WHERE ta.status = 'submitted'
      ORDER BY ta.id DESC LIMIT 3
    `).all() as any[];

    const recentApps = db.prepare(`
      SELECT 'New internship application for ' || domain || ' by ' || full_name as title,
             applied_at as created_at, 'internship' as type
      FROM internship_applications
      ORDER BY id DESC LIMIT 3
    `).all() as any[];

    const recentActivities = [...recentStudents, ...recentSubmissions, ...recentApps]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

    return res.json({
      stats: {
        total_students: totalStudents.count,
        active_students: activeStudents.count,
        total_staff: totalStaff.count,
        active_courses: activeCourses.count,
        total_tests: totalTests.count,
        tests_completed: testsCompleted.count,
        internship_applications: internshipApplications.count,
        avg_student_score: avgScoreResult.avg || 0,
      },
      charts: {
        course_enrollments: courseEnrollments,
        batch_stats: batchStats,
        score_distribution: scoreDistribution,
      },
      recent_activities: recentActivities,
    });
  } catch (error: any) {
    console.error('Error in getAdminDashboardSummary:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin summary' });
  }
};

export const getTestimonials = (req: Request, res: Response) => {
  try {
    const testimonials = db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY id DESC').all();
    return res.json({ testimonials });
  } catch (error: any) {
    console.error('Error in getTestimonials:', error);
    return res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

export const submitContactMessage = (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please provide name, email, subject, and message' });
    }

    const insert = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message, status)
      VALUES (?, ?, ?, ?, ?, 'new')
    `);

    insert.run(name.trim(), email.toLowerCase().trim(), phone ? phone.trim() : null, subject.trim(), message.trim());

    return res.status(201).json({ message: 'Thank you! Your message has been sent successfully. We will get back to you shortly.' });
  } catch (error: any) {
    console.error('Error in submitContactMessage:', error);
    return res.status(500).json({ error: 'Failed to submit contact message' });
  }
};

export const getContactMessages = (req: Request, res: Response) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
    return res.json({ messages });
  } catch (error: any) {
    console.error('Error in getContactMessages:', error);
    return res.status(500).json({ error: 'Failed to fetch contact inquiries' });
  }
};

export const updateContactStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
    return res.json({ message: `Message status marked as ${status}` });
  } catch (error: any) {
    console.error('Error in updateContactStatus:', error);
    return res.status(500).json({ error: 'Failed to update message' });
  }
};

export const getUserNotifications = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const notifications = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20'
    ).all(req.user.id);

    return res.json({ notifications });
  } catch (error: any) {
    console.error('Error in getUserNotifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markNotificationRead = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user!.id);
    } else {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user!.id);
    }
    return res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error in markNotificationRead:', error);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
};

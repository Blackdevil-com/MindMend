import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllStudents = (req: Request, res: Response) => {
  try {
    const { search, batch_id, course_id, status } = req.query;

    let query = `
      SELECT 
        s.*,
        u.status as account_status,
        b.name as batch_name,
        b.id as batch_id,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.student_id = s.id) as enrolled_courses_count,
        (SELECT COUNT(*) FROM test_attempts ta WHERE ta.student_id = s.id AND ta.status = 'submitted') as completed_tests_count,
        (SELECT ROUND(AVG(ta.percentage), 1) FROM test_attempts ta WHERE ta.student_id = s.id AND ta.status = 'submitted') as avg_score
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN batch_students bs ON s.id = bs.student_id
      LEFT JOIN batches b ON bs.batch_id = b.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ? OR s.email LIKE ? OR s.college_name LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (batch_id) {
      query += ` AND bs.batch_id = ?`;
      params.push(batch_id);
    }

    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.id DESC`;

    const students = db.prepare(query).all(...params);
    return res.json({ students });
  } catch (error: any) {
    console.error('Error in getAllStudents:', error);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = db.prepare(`
      SELECT 
        s.*,
        u.status as account_status,
        u.created_at as joined_date,
        b.id as batch_id,
        b.name as batch_name,
        b.timing as batch_timing
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN batch_students bs ON s.id = bs.student_id
      LEFT JOIN batches b ON bs.batch_id = b.id
      WHERE s.id = ? OR s.student_id = ?
    `).get(id, id) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get enrolled courses
    const courses = db.prepare(`
      SELECT c.*, ce.progress, ce.status as enrollment_status, ce.enrolled_at
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.student_id = ?
    `).all(student.id);

    // Get test attempts & performance
    const isRequesterStudent = (req as any).user && (req as any).user.role === 'student';
    const testAttempts = isRequesterStudent
      ? db.prepare(`
          SELECT 
            ta.id, ta.test_id, ta.student_id, ta.start_time, ta.submitted_at, ta.status, ta.total_marks,
            CASE WHEN t.marks_released = 1 THEN ta.score ELSE NULL END as score,
            CASE WHEN t.marks_released = 1 THEN ta.percentage ELSE NULL END as percentage,
            CASE WHEN t.marks_released = 1 THEN ta.passed ELSE NULL END as passed,
            t.title as test_title,
            t.subject,
            t.duration_minutes,
            t.marks_released
          FROM test_attempts ta
          JOIN tests t ON ta.test_id = t.id
          WHERE ta.student_id = ?
          ORDER BY ta.id DESC
        `).all(student.id)
      : db.prepare(`
          SELECT 
            ta.*,
            t.title as test_title,
            t.subject,
            t.duration_minutes,
            t.marks_released
          FROM test_attempts ta
          JOIN tests t ON ta.test_id = t.id
          WHERE ta.student_id = ?
          ORDER BY ta.id DESC
        `).all(student.id);

    // Get attendance summary
    const attendanceRecords = db.prepare(`
      SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30
    `).all(student.id);

    const totalDays = db.prepare(`SELECT COUNT(*) as count FROM attendance WHERE student_id = ?`).get(student.id) as any;
    const presentDays = db.prepare(`SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'present'`).get(student.id) as any;
    const absentDays = db.prepare(`SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'absent'`).get(student.id) as any;
    const leaveDays = db.prepare(`SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'leave'`).get(student.id) as any;

    const attendancePercentage = totalDays?.count > 0 
      ? Math.round((presentDays.count / totalDays.count) * 100) 
      : 0;

    // Get internship application
    const internshipApplications = db.prepare(`
      SELECT ia.*, i.title as internship_title
      FROM internship_applications ia
      LEFT JOIN internships i ON ia.internship_id = i.id
      WHERE ia.student_id = ? OR ia.email = ?
      ORDER BY ia.id DESC
    `).all(student.id, student.email);

    return res.json({
      student,
      courses,
      test_attempts: testAttempts,
      attendance: {
        records: attendanceRecords,
        total_days: totalDays?.count || 0,
        present_days: presentDays?.count || 0,
        absent_days: absentDays?.count || 0,
        leave_days: leaveDays?.count || 0,
        percentage: attendancePercentage,
      },
      internship_applications: internshipApplications,
    });
  } catch (error: any) {
    console.error('Error in getStudentById:', error);
    return res.status(500).json({ error: 'Failed to retrieve student profile' });
  }
};

export const updateStudentStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or inactive' });
    }

    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(id) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, student.user_id);
    return res.json({ message: `Student status updated to ${status}` });
  } catch (error: any) {
    console.error('Error in updateStudentStatus:', error);
    return res.status(500).json({ error: 'Failed to update student status' });
  }
};

export const assignStudentToBatch = (req: Request, res: Response) => {
  try {
    const { student_id, batch_id } = req.body;

    if (!student_id || !batch_id) {
      return res.status(400).json({ error: 'Student ID and Batch ID are required' });
    }

    // Remove any existing batch assignment
    db.prepare('DELETE FROM batch_students WHERE student_id = ?').run(student_id);

    // Insert new assignment
    db.prepare('INSERT INTO batch_students (batch_id, student_id) VALUES (?, ?)').run(batch_id, student_id);

    // Also auto-enroll in the batch's course if not already enrolled
    const batch = db.prepare('SELECT course_id, name FROM batches WHERE id = ?').get(batch_id) as any;
    if (batch && batch.course_id) {
      db.prepare(`
        INSERT OR IGNORE INTO course_enrollments (course_id, student_id, status, progress) 
        VALUES (?, ?, 'active', 10)
      `).run(batch.course_id, student_id);
    }

    return res.json({ message: `Student assigned to batch ${batch?.name || batch_id} successfully` });
  } catch (error: any) {
    console.error('Error in assignStudentToBatch:', error);
    return res.status(500).json({ error: 'Failed to assign student to batch' });
  }
};

export const assignStudentToCourse = (req: Request, res: Response) => {
  try {
    const { student_id, course_id } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({ error: 'Student ID and Course ID are required' });
    }

    db.prepare(`
      INSERT INTO course_enrollments (course_id, student_id, status, progress)
      VALUES (?, ?, 'active', 0)
      ON CONFLICT(course_id, student_id) DO UPDATE SET status = 'active'
    `).run(course_id, student_id);

    return res.json({ message: 'Student enrolled in course successfully' });
  } catch (error: any) {
    console.error('Error in assignStudentToCourse:', error);
    return res.status(500).json({ error: 'Failed to enroll student' });
  }
};

export const getStudentDashboardStats = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Access restricted to students' });
    }

    const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user.id) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Courses
    const courses = db.prepare(`
      SELECT c.*, ce.progress, ce.status as enrollment_status
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.student_id = ?
    `).all(student.id);

    // Batch info
    const batch = db.prepare(`
      SELECT b.* FROM batch_students bs
      JOIN batches b ON bs.batch_id = b.id
      WHERE bs.student_id = ?
    `).get(student.id) as any;

    // Completed tests & avg score
    const testsCount = db.prepare(`
      SELECT COUNT(*) as count FROM test_attempts WHERE student_id = ? AND status = 'submitted'
    `).get(student.id) as any;

    const avgScoreResult = db.prepare(`
      SELECT ROUND(AVG(percentage), 1) as avg FROM test_attempts WHERE student_id = ? AND status = 'submitted'
    `).get(student.id) as any;

    // Upcoming / Available Tests
    const activeTests = db.prepare(`
      SELECT t.*, 
        (SELECT id FROM test_attempts ta WHERE ta.test_id = t.id AND ta.student_id = ?) as attempt_id,
        (SELECT status FROM test_attempts ta WHERE ta.test_id = t.id AND ta.student_id = ?) as attempt_status,
        CASE WHEN t.marks_released = 1 THEN (SELECT score FROM test_attempts ta WHERE ta.test_id = t.id AND ta.student_id = ?) ELSE NULL END as attempt_score,
        CASE WHEN t.marks_released = 1 THEN (SELECT percentage FROM test_attempts ta WHERE ta.test_id = t.id AND ta.student_id = ?) ELSE NULL END as attempt_percentage
      FROM tests t
      WHERE t.status = 'published' 
        AND (t.batch_id = ? OR t.batch_id IS NULL)
      ORDER BY t.id DESC
    `).all(student.id, student.id, student.id, student.id, batch?.id || null);

    // Attendance
    const totalDays = db.prepare(`SELECT COUNT(*) as count FROM attendance WHERE student_id = ?`).get(student.id) as any;
    const presentDays = db.prepare(`SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'present'`).get(student.id) as any;
    const attendancePercentage = totalDays?.count > 0 ? Math.round((presentDays.count / totalDays.count) * 100) : 100;

    // Internship status
    const latestInternshipApp = db.prepare(`
      SELECT * FROM internship_applications 
      WHERE student_id = ? OR email = ? 
      ORDER BY id DESC LIMIT 1
    `).get(student.id, student.email) as any;

    // Announcements
    const announcements = db.prepare(`
      SELECT a.*, u.role as author_role
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      WHERE a.target_type = 'all' 
         OR (a.target_type = 'batch' AND a.target_id = ?)
      ORDER BY a.id DESC LIMIT 5
    `).all(batch?.id || -1);

    return res.json({
      student,
      batch,
      stats: {
        enrolled_courses: courses.length,
        tests_completed: testsCount?.count || 0,
        average_score: avgScoreResult?.avg || 0,
        attendance_percentage: attendancePercentage,
        internship_status: latestInternshipApp?.status || 'Not Applied',
      },
      courses,
      active_tests: activeTests,
      recent_announcements: announcements,
    });
  } catch (error: any) {
    console.error('Error in getStudentDashboardStats:', error);
    return res.status(500).json({ error: 'Failed to retrieve student dashboard data' });
  }
};

export const exportStudentsCSV = (req: Request, res: Response) => {
  try {
    const students = db.prepare(`
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.mobile,
        s.college_name,
        s.degree,
        s.department,
        s.year_of_study,
        u.status as account_status,
        b.name as batch_name,
        s.created_at
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN batch_students bs ON s.id = bs.student_id
      LEFT JOIN batches b ON bs.batch_id = b.id
      ORDER BY s.id ASC
    `).all() as any[];

    const headers = ['Student ID', 'Full Name', 'Email', 'Mobile', 'College', 'Degree', 'Department', 'Year', 'Status', 'Batch', 'Registered On'];
    const rows = students.map(st => [
      `"${st.student_id}"`,
      `"${st.full_name.replace(/"/g, '""')}"`,
      `"${st.email}"`,
      `"${st.mobile}"`,
      `"${st.college_name.replace(/"/g, '""')}"`,
      `"${st.degree}"`,
      `"${st.department}"`,
      `"${st.year_of_study}"`,
      `"${st.account_status}"`,
      `"${st.batch_name || 'Unassigned'}"`,
      `"${st.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=mindmend_students.csv');
    return res.send(csvContent);
  } catch (error: any) {
    console.error('Error in exportStudentsCSV:', error);
    return res.status(500).json({ error: 'Export failed' });
  }
};

export const deleteStudentAndUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params; // student.id
    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(id) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
    return res.json({ message: 'Student and associated user account removed successfully' });
  } catch (error: any) {
    console.error('Error in deleteStudentAndUser:', error);
    return res.status(500).json({ error: 'Failed to remove student account' });
  }
};

export const changeStudentPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // student.id
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(id) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const hash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, student.user_id);
    return res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error in changeStudentPassword:', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
};

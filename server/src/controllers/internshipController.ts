import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllInternships = (req: Request, res: Response) => {
  try {
    const internships = db.prepare('SELECT * FROM internships WHERE is_active = 1 ORDER BY id ASC').all() as any[];
    
    const parsed = internships.map(item => ({
      ...item,
      skills_required: typeof item.skills_required === 'string' ? JSON.parse(item.skills_required || '[]') : item.skills_required,
      learning_outcomes: typeof item.learning_outcomes === 'string' ? JSON.parse(item.learning_outcomes || '[]') : item.learning_outcomes,
      projects: typeof item.projects === 'string' ? JSON.parse(item.projects || '[]') : item.projects,
    }));

    return res.json({ internships: parsed });
  } catch (error: any) {
    console.error('Error in getAllInternships:', error);
    return res.status(500).json({ error: 'Failed to fetch internships' });
  }
};

export const applyForInternship = (req: AuthRequest, res: Response) => {
  try {
    const {
      internship_id,
      domain,
      full_name,
      email,
      mobile,
      college,
      degree,
      department,
      year_of_study,
      motivation,
    } = req.body;

    if (!domain || !full_name || !email || !mobile || !college || !degree || !department || !year_of_study || !motivation) {
      return res.status(400).json({ error: 'Please complete all required fields' });
    }

    let resumeUrl = null;
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    let studentId = null;
    if (req.user && req.user.role === 'student') {
      const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id) as any;
      if (student) studentId = student.id;
    }

    const insert = db.prepare(`
      INSERT INTO internship_applications (
        internship_id, domain, student_id, full_name, email, mobile,
        college, degree, department, year_of_study, resume_url, motivation, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied')
    `);

    const result = insert.run(
      internship_id || null,
      domain.trim(),
      studentId,
      full_name.trim(),
      email.toLowerCase().trim(),
      mobile.trim(),
      college.trim(),
      degree.trim(),
      department.trim(),
      year_of_study.trim(),
      resumeUrl,
      motivation.trim()
    );

    const applicationId = Number(result.lastInsertRowid);

    // Notify if user logged in
    if (req.user) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'internship_update', ?)
      `).run(
        req.user.id,
        'Internship Application Submitted',
        `Your application for ${domain} Internship has been received and is under review.`,
        '/student/internship'
      );
    }

    return res.status(201).json({
      message: 'Internship application submitted successfully! Our team will review your profile.',
      application_id: applicationId,
    });
  } catch (error: any) {
    console.error('Error in applyForInternship:', error);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
};

export const getAllApplications = (req: Request, res: Response) => {
  try {
    const { status, domain, search } = req.query;

    let query = `
      SELECT 
        ia.*,
        s.student_id,
        i.title as internship_title
      FROM internship_applications ia
      LEFT JOIN students s ON ia.student_id = s.id
      LEFT JOIN internships i ON ia.internship_id = i.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (status) {
      query += ` AND ia.status = ?`;
      params.push(status);
    }
    if (domain) {
      query += ` AND ia.domain LIKE ?`;
      params.push(`%${domain}%`);
    }
    if (search) {
      query += ` AND (ia.full_name LIKE ? OR ia.email LIKE ? OR ia.college LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY ia.id DESC`;

    const applications = db.prepare(query).all(...params);
    return res.json({ applications });
  } catch (error: any) {
    console.error('Error in getAllApplications:', error);
    return res.status(500).json({ error: 'Failed to fetch internship applications' });
  }
};

export const updateApplicationStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_feedback } = req.body;

    const allowed = ['applied', 'under_review', 'shortlisted', 'accepted', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid application status' });
    }

    const app = db.prepare('SELECT * FROM internship_applications WHERE id = ?').get(id) as any;
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    db.prepare(`
      UPDATE internship_applications
      SET status = ?, admin_feedback = COALESCE(?, admin_feedback)
      WHERE id = ?
    `).run(status, admin_feedback, id);

    // If student user exists, send notification
    if (app.student_id) {
      const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(app.student_id) as any;
      if (student) {
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'internship_update', ?)
        `).run(
          student.user_id,
          `Internship Status Update: ${status.replace('_', ' ').toUpperCase()}`,
          `Your ${app.domain} internship application is now ${status.replace('_', ' ')}. ${admin_feedback ? `Feedback: "${admin_feedback}"` : ''}`,
          '/student/internship'
        );
      }
    }

    return res.json({ message: `Application status updated to ${status}` });
  } catch (error: any) {
    console.error('Error in updateApplicationStatus:', error);
    return res.status(500).json({ error: 'Failed to update application status' });
  }
};

export const exportApplicationsCSV = (req: Request, res: Response) => {
  try {
    const apps = db.prepare(`
      SELECT 
        ia.id,
        ia.full_name,
        ia.email,
        ia.mobile,
        ia.college,
        ia.degree,
        ia.department,
        ia.year_of_study,
        ia.domain,
        ia.status,
        ia.admin_feedback,
        ia.applied_at
      FROM internship_applications ia
      ORDER BY ia.id DESC
    `).all() as any[];

    const headers = ['App ID', 'Full Name', 'Email', 'Mobile', 'College', 'Degree', 'Department', 'Year', 'Domain', 'Status', 'Feedback', 'Applied Date'];
    const rows = apps.map(a => [
      a.id,
      `"${a.full_name.replace(/"/g, '""')}"`,
      `"${a.email}"`,
      `"${a.mobile}"`,
      `"${a.college.replace(/"/g, '""')}"`,
      `"${a.degree}"`,
      `"${a.department}"`,
      `"${a.year_of_study}"`,
      `"${a.domain}"`,
      `"${a.status.toUpperCase()}"`,
      `"${(a.admin_feedback || '').replace(/"/g, '""')}"`,
      `"${a.applied_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=internship_applications.csv');
    return res.send(csvContent);
  } catch (error: any) {
    console.error('Error in exportApplicationsCSV:', error);
    return res.status(500).json({ error: 'Failed to export applications' });
  }
};

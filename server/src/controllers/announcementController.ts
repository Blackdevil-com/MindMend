import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllAnnouncements = (req: AuthRequest, res: Response) => {
  try {
    let announcements: any[] = [];

    if (req.user && req.user.role === 'student') {
      const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id) as any;
      const batch = student ? db.prepare('SELECT batch_id FROM batch_students WHERE student_id = ?').get(student.id) as any : null;
      
      announcements = db.prepare(`
        SELECT 
          a.*,
          u.role as author_role,
          CASE 
            WHEN u.role = 'admin' THEN 'MindMend Administration'
            WHEN u.role = 'staff' THEN (SELECT full_name FROM staff WHERE user_id = u.id)
            ELSE 'Instructor'
          END as author_name,
          b.name as batch_name,
          c.title as course_title
        FROM announcements a
        JOIN users u ON a.created_by = u.id
        LEFT JOIN batches b ON a.target_type = 'batch' AND a.target_id = b.id
        LEFT JOIN courses c ON a.target_type = 'course' AND a.target_id = c.id
        WHERE a.target_type = 'all' 
           OR (a.target_type = 'batch' AND a.target_id = ?)
        ORDER BY a.id DESC
      `).all(batch?.batch_id || -1);
    } else {
      // Admin / Staff sees all announcements
      announcements = db.prepare(`
        SELECT 
          a.*,
          u.role as author_role,
          CASE 
            WHEN u.role = 'admin' THEN 'MindMend Administration'
            WHEN u.role = 'staff' THEN (SELECT full_name FROM staff WHERE user_id = u.id)
            ELSE 'Instructor'
          END as author_name,
          b.name as batch_name,
          c.title as course_title
        FROM announcements a
        JOIN users u ON a.created_by = u.id
        LEFT JOIN batches b ON a.target_type = 'batch' AND a.target_id = b.id
        LEFT JOIN courses c ON a.target_type = 'course' AND a.target_id = c.id
        ORDER BY a.id DESC
      `).all();
    }

    return res.json({ announcements });
  } catch (error: any) {
    console.error('Error in getAllAnnouncements:', error);
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, content, target_type, target_id } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const insert = db.prepare(`
      INSERT INTO announcements (title, content, target_type, target_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      content.trim(),
      target_type || 'all',
      target_id || null,
      req.user.id
    );

    return res.status(201).json({
      message: 'Announcement published successfully',
      announcement_id: Number(result.lastInsertRowid),
    });
  } catch (error: any) {
    console.error('Error in createAnnouncement:', error);
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const deleteAnnouncement = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
    return res.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteAnnouncement:', error);
    return res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

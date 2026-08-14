import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { generateNextStaffID } from './authController.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllStaff = (req: Request, res: Response) => {
  try {
    const staffMembers = db.prepare(`
      SELECT 
        st.*,
        u.status as account_status,
        u.created_at as joined_date,
        (SELECT COUNT(*) FROM batches b WHERE b.trainer_id = st.id) as assigned_batches_count,
        (SELECT COUNT(*) FROM courses c WHERE c.trainer_id = st.id) as assigned_courses_count
      FROM staff st
      JOIN users u ON st.user_id = u.id
      ORDER BY st.id ASC
    `).all() as any[];

    // Fetch batches assigned to each staff
    const staffWithBatches = staffMembers.map(st => {
      const batches = db.prepare('SELECT id, name FROM batches WHERE trainer_id = ?').all(st.id);
      const courses = db.prepare('SELECT id, title FROM courses WHERE trainer_id = ?').all(st.id);
      return {
        ...st,
        batches,
        courses,
      };
    });

    return res.json({ staff: staffWithBatches });
  } catch (error: any) {
    console.error('Error in getAllStaff:', error);
    return res.status(500).json({ error: 'Failed to fetch staff members' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, designation, password, can_create_tests } = req.body;

    if (!full_name || !email || !phone || !designation || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const staff_id = generateNextStaffID();

    const insertUser = db.prepare(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)'
    );
    const insertStaff = db.prepare(
      `INSERT INTO staff (user_id, staff_id, full_name, email, phone, designation, can_create_tests) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const transaction = db.transaction(() => {
      const userRes = insertUser.run(cleanEmail, password_hash, 'staff', 'active');
      const userId = Number(userRes.lastInsertRowid);
      const staffRes = insertStaff.run(
        userId,
        staff_id,
        full_name.trim(),
        cleanEmail,
        phone.trim(),
        designation.trim(),
        can_create_tests !== false ? 1 : 0
      );
      return { userId, staffInternalId: Number(staffRes.lastInsertRowid), staff_id };
    });

    const result = transaction();

    return res.status(201).json({
      message: 'Staff account created successfully',
      staff: {
        id: result.staffInternalId,
        staff_id: result.staff_id,
        full_name,
        email: cleanEmail,
        phone,
        designation,
        can_create_tests: can_create_tests !== false,
      },
    });
  } catch (error: any) {
    console.error('Error in createStaff:', error);
    return res.status(500).json({ error: 'Failed to create staff account' });
  }
};

export const updateStaff = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, phone, designation, can_create_tests, status } = req.body;

    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(id) as any;
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    if (status && ['active', 'inactive'].includes(status)) {
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, staff.user_id);
    }

    db.prepare(`
      UPDATE staff 
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          designation = COALESCE(?, designation),
          can_create_tests = COALESCE(?, can_create_tests)
      WHERE id = ?
    `).run(
      full_name, 
      phone, 
      designation, 
      can_create_tests !== undefined ? (can_create_tests ? 1 : 0) : staff.can_create_tests, 
      id
    );

    return res.json({ message: 'Staff member updated successfully' });
  } catch (error: any) {
    console.error('Error in updateStaff:', error);
    return res.status(500).json({ error: 'Failed to update staff' });
  }
};

export const getStaffDashboardStats = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Access restricted to staff' });
    }

    const staff = db.prepare('SELECT * FROM staff WHERE user_id = ?').get(req.user.id) as any;
    if (!staff) {
      return res.status(404).json({ error: 'Staff profile not found' });
    }

    // Assigned batches
    const batches = db.prepare(`
      SELECT b.*, c.title as course_title,
        (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) as student_count
      FROM batches b
      JOIN courses c ON b.course_id = c.id
      WHERE b.trainer_id = ?
    `).all(staff.id) as any[];

    const batchIds = batches.map(b => b.id);
    let totalStudents = 0;
    batches.forEach(b => { totalStudents += b.student_count; });

    // Assigned courses
    const courses = db.prepare('SELECT * FROM courses WHERE trainer_id = ?').all(staff.id);

    // Tests created or assigned to staff's batches
    let tests: any[] = [];
    if (batchIds.length > 0) {
      const placeholders = batchIds.map(() => '?').join(',');
      tests = db.prepare(`
        SELECT t.*, 
          (SELECT COUNT(*) FROM test_attempts ta WHERE ta.test_id = t.id AND ta.status = 'submitted') as completed_submissions,
          (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as questions_count
        FROM tests t
        WHERE t.created_by = ? OR t.batch_id IN (${placeholders})
        ORDER BY t.id DESC LIMIT 10
      `).all(req.user.id, ...batchIds);
    } else {
      tests = db.prepare(`
        SELECT t.*, 
          (SELECT COUNT(*) FROM test_attempts ta WHERE ta.test_id = t.id AND ta.status = 'submitted') as completed_submissions,
          (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as questions_count
        FROM tests t
        WHERE t.created_by = ?
        ORDER BY t.id DESC LIMIT 10
      `).all(req.user.id);
    }

    // Today's attendance status
    const today = new Date().toISOString().split('T')[0];
    const todayAttendanceCount = db.prepare(`
      SELECT COUNT(*) as count FROM attendance WHERE marked_by = ? AND date = ?
    `).get(req.user.id, today) as any;

    return res.json({
      staff,
      stats: {
        assigned_batches_count: batches.length,
        total_students: totalStudents,
        assigned_courses_count: courses.length,
        tests_created: tests.length,
        today_attendance_marked: (todayAttendanceCount?.count || 0) > 0,
      },
      batches,
      courses,
      recent_tests: tests,
    });
  } catch (error: any) {
    console.error('Error in getStaffDashboardStats:', error);
    return res.status(500).json({ error: 'Failed to retrieve staff dashboard stats' });
  }
};

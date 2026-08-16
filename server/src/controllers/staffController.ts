import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { generateNextStaffID } from './authController.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendMail, compileStaffVerificationTemplate } from '../services/emailService.js';

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

    const cleanPhone = phone.replace(/\D/g, '');
    const isPhoneValid = cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
    if (!isPhoneValid) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
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

    // Send email with credentials to manual active staff
    try {
      const host = req.get('host') || 'localhost:5173';
      const protocol = req.secure ? 'https' : 'http';
      const loginUrl = `${protocol}://${host.replace(/:\d+$/, ':5173')}/login`;

      const htmlContent = compileStaffVerificationTemplate({
        full_name,
        staff_id: result.staff_id,
        email: cleanEmail,
        passwordText: password,
        loginUrl
      });

      await sendMail({
        to: cleanEmail,
        subject: 'MindMend Academy - Your Trainer Account is Created!',
        html: htmlContent
      });
    } catch (mailErr) {
      console.error('Failed to send email to manual active staff:', mailErr);
    }

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

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const isPhoneValid = cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
      if (!isPhoneValid) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
      }
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
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const todayAttendanceCount = db.prepare(`
      SELECT COUNT(*) as count FROM attendance WHERE marked_by = ? AND date = ?
    `).get(req.user.id, today) as any;

    // Staff daily login attendance percentage & dates
    const userRecord = db.prepare('SELECT created_at FROM users WHERE id = ?').get(req.user.id) as { created_at: string };
    const signupDateStr = userRecord.created_at.split(' ')[0] || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const signupDate = new Date(signupDateStr);
    const todayDate = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
    const msDiff = todayDate.getTime() - signupDate.getTime();
    const activeDaysCount = Math.max(1, Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1);

    const loginDaysCount = db.prepare('SELECT COUNT(DISTINCT date) as count FROM login_attendance WHERE user_id = ?').get(req.user.id) as { count: number };
    const attendancePercentage = Math.min(100, Math.round((loginDaysCount.count / activeDaysCount) * 100));

    const loginDates = db.prepare('SELECT DISTINCT date FROM login_attendance WHERE user_id = ? ORDER BY date ASC').all(req.user.id) as { date: string }[];
    const presentDatesList = loginDates.map(d => d.date);

    return res.json({
      staff,
      stats: {
        assigned_batches_count: batches.length,
        total_students: totalStudents,
        assigned_courses_count: courses.length,
        tests_created: tests.length,
        today_attendance_marked: (todayAttendanceCount?.count || 0) > 0,
        attendance_percentage: attendancePercentage,
      },
      batches,
      courses,
      recent_tests: tests,
      present_dates: presentDatesList,
    });
  } catch (error: any) {
    console.error('Error in getStaffDashboardStats:', error);
    return res.status(500).json({ error: 'Failed to retrieve staff dashboard stats' });
  }
};

export const deleteStaffAndUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params; // staff.id
    const staff = db.prepare('SELECT user_id FROM staff WHERE id = ?').get(id) as any;
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(staff.user_id);
    return res.json({ message: 'Staff member and associated user account removed successfully' });
  } catch (error: any) {
    console.error('Error in deleteStaffAndUser:', error);
    return res.status(500).json({ error: 'Failed to remove staff account' });
  }
};

export const changeStaffPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // staff.id
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const staff = db.prepare('SELECT user_id FROM staff WHERE id = ?').get(id) as any;
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const hash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, staff.user_id);
    return res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error in changeStaffPassword:', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
};

// Helper to generate next unique staff ID checking both tables
function getNextAvailableStaffID(): string {
  const currentYear = 2026;
  const prefix = `STF${currentYear}`;

  const latestStaff = db.prepare(
    `SELECT staff_id FROM staff WHERE staff_id LIKE '${prefix}%' ORDER BY staff_id DESC LIMIT 1`
  ).get() as { staff_id?: string } | undefined;

  const latestPending = db.prepare(
    `SELECT staff_id FROM pending_staff WHERE staff_id LIKE '${prefix}%' ORDER BY staff_id DESC LIMIT 1`
  ).get() as { staff_id?: string } | undefined;

  let activeNum = 0;
  if (latestStaff && latestStaff.staff_id) {
    activeNum = parseInt(latestStaff.staff_id.replace(prefix, ''), 10) || 0;
  }

  let pendingNum = 0;
  if (latestPending && latestPending.staff_id) {
    pendingNum = parseInt(latestPending.staff_id.replace(prefix, ''), 10) || 0;
  }

  const nextNum = Math.max(activeNum, pendingNum) + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// Helper to generate a random password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GET all pending staff
export const getPendingStaff = (req: Request, res: Response) => {
  try {
    const pending = db.prepare('SELECT * FROM pending_staff ORDER BY id DESC').all();
    return res.json({ pending });
  } catch (error: any) {
    console.error('Error in getPendingStaff:', error);
    return res.status(500).json({ error: 'Failed to fetch pending staff' });
  }
};

// POST manually create pending staff
export const createPendingStaff = (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, designation } = req.body;

    if (!full_name || !email || !phone || !designation) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const isPhoneValid = cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
    if (!isPhoneValid) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // Check users table
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'A registered user with this email already exists' });
    }

    // Check pending table
    const existingPending = db.prepare('SELECT id FROM pending_staff WHERE email = ?').get(cleanEmail);
    if (existingPending) {
      return res.status(400).json({ error: 'A pending staff member with this email already exists' });
    }

    const staff_id = getNextAvailableStaffID();
    
    const result = db.prepare(
      'INSERT INTO pending_staff (full_name, email, phone, designation, staff_id) VALUES (?, ?, ?, ?, ?)'
    ).run(full_name.trim(), cleanEmail, phone.trim(), designation.trim(), staff_id);

    return res.status(201).json({
      message: 'Staff member added to pending list',
      pending: {
        id: Number(result.lastInsertRowid),
        full_name,
        email: cleanEmail,
        phone,
        designation,
        staff_id
      }
    });
  } catch (error: any) {
    console.error('Error in createPendingStaff:', error);
    return res.status(500).json({ error: 'Failed to add pending staff' });
  }
};

// PUT update pending staff
export const updatePendingStaff = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, designation, staff_id } = req.body;

    const pending = db.prepare('SELECT * FROM pending_staff WHERE id = ?').get(id) as any;
    if (!pending) {
      return res.status(404).json({ error: 'Pending staff member not found' });
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const isPhoneValid = cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
      if (!isPhoneValid) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
      }
    }

    const cleanEmail = email ? email.toLowerCase().trim() : pending.email;

    // Check email unique if changed
    if (cleanEmail !== pending.email) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'A registered user with this email already exists' });
      }
      const existingPending = db.prepare('SELECT id FROM pending_staff WHERE email = ? AND id != ?').get(cleanEmail, id);
      if (existingPending) {
        return res.status(400).json({ error: 'Another pending staff member with this email already exists' });
      }
    }

    // Check staff_id unique if changed
    const cleanStaffId = staff_id ? staff_id.trim() : pending.staff_id;
    if (cleanStaffId !== pending.staff_id) {
      const existingStaff = db.prepare('SELECT id FROM staff WHERE staff_id = ?').get(cleanStaffId);
      if (existingStaff) {
        return res.status(400).json({ error: 'An active staff member with this Staff ID already exists' });
      }
      const existingPendingId = db.prepare('SELECT id FROM pending_staff WHERE staff_id = ? AND id != ?').get(cleanStaffId, id);
      if (existingPendingId) {
        return res.status(400).json({ error: 'Another pending staff member with this Staff ID already exists' });
      }
    }

    db.prepare(`
      UPDATE pending_staff 
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          designation = COALESCE(?, designation),
          staff_id = COALESCE(?, staff_id)
      WHERE id = ?
    `).run(
      full_name ? full_name.trim() : null,
      cleanEmail,
      phone ? phone.trim() : null,
      designation ? designation.trim() : null,
      cleanStaffId,
      id
    );

    return res.json({ message: 'Pending staff details updated successfully' });
  } catch (error: any) {
    console.error('Error in updatePendingStaff:', error);
    return res.status(500).json({ error: 'Failed to update pending staff' });
  }
};

// DELETE pending staff (reject)
export const deletePendingStaff = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM pending_staff WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pending staff member not found' });
    }
    return res.json({ message: 'Pending staff member removed/rejected successfully' });
  } catch (error: any) {
    console.error('Error in deletePendingStaff:', error);
    return res.status(500).json({ error: 'Failed to remove pending staff' });
  }
};

// POST verify single pending staff
export const verifyPendingStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pending = db.prepare('SELECT * FROM pending_staff WHERE id = ?').get(id) as any;
    if (!pending) {
      return res.status(404).json({ error: 'Pending staff member not found' });
    }

    // Double check email collision before final approval
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(pending.email);
    if (existingUser) {
      return res.status(400).json({ error: 'A registered user with this email already exists. Reject or edit this pending trainer.' });
    }

    // Generate credentials
    const tempPassword = generateSecurePassword();
    const password_hash = await bcrypt.hash(tempPassword, 10);

    const insertUser = db.prepare(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)'
    );
    const insertStaff = db.prepare(
      `INSERT INTO staff (user_id, staff_id, full_name, email, phone, designation) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const deletePending = db.prepare('DELETE FROM pending_staff WHERE id = ?');

    const transaction = db.transaction(() => {
      const userRes = insertUser.run(pending.email, password_hash, 'staff', 'active');
      const userId = Number(userRes.lastInsertRowid);
      insertStaff.run(
        userId,
        pending.staff_id,
        pending.full_name,
        pending.email,
        pending.phone,
        pending.designation
      );
      deletePending.run(id);
      return userId;
    });

    transaction();

    // Compile email and send
    const host = req.get('host') || 'localhost:5173';
    const protocol = req.secure ? 'https' : 'http';
    const loginUrl = `${protocol}://${host.replace(/:\d+$/, ':5173')}/login`;

    const htmlContent = compileStaffVerificationTemplate({
      full_name: pending.full_name,
      staff_id: pending.staff_id,
      email: pending.email,
      passwordText: tempPassword,
      loginUrl
    });

    await sendMail({
      to: pending.email,
      subject: 'MindMend Academy - Your Trainer Account is Verified!',
      html: htmlContent
    });

    return res.json({ message: `Staff member ${pending.full_name} verified successfully. Credentials emailed!` });
  } catch (error: any) {
    console.error('Error in verifyPendingStaff:', error);
    return res.status(500).json({ error: 'Failed to verify pending staff' });
  }
};

// POST verify multiple pending staff members (bulk)
export const verifyPendingStaffBulk = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Valid array of pending staff IDs is required' });
    }

    let successCount = 0;
    let errors: string[] = [];

    const host = req.get('host') || 'localhost:5173';
    const protocol = req.secure ? 'https' : 'http';
    const loginUrl = `${protocol}://${host.replace(/:\d+$/, ':5173')}/login`;

    for (const id of ids) {
      try {
        const pending = db.prepare('SELECT * FROM pending_staff WHERE id = ?').get(id) as any;
        if (!pending) {
          errors.push(`ID ${id}: Not found`);
          continue;
        }

        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(pending.email);
        if (existingUser) {
          errors.push(`ID ${id} (${pending.email}): Email already registered`);
          continue;
        }

        const tempPassword = generateSecurePassword();
        const password_hash = await bcrypt.hash(tempPassword, 10);

        const insertUser = db.prepare('INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)');
        const insertStaff = db.prepare('INSERT INTO staff (user_id, staff_id, full_name, email, phone, designation) VALUES (?, ?, ?, ?, ?, ?)');
        const deletePending = db.prepare('DELETE FROM pending_staff WHERE id = ?');

        const transaction = db.transaction(() => {
          const userRes = insertUser.run(pending.email, password_hash, 'staff', 'active');
          const userId = Number(userRes.lastInsertRowid);
          insertStaff.run(userId, pending.staff_id, pending.full_name, pending.email, pending.phone, pending.designation);
          deletePending.run(id);
        });

        transaction();

        const htmlContent = compileStaffVerificationTemplate({
          full_name: pending.full_name,
          staff_id: pending.staff_id,
          email: pending.email,
          passwordText: tempPassword,
          loginUrl
        });

        await sendMail({
          to: pending.email,
          subject: 'MindMend Academy - Your Trainer Account is Verified!',
          html: htmlContent
        });

        successCount++;
      } catch (innerError: any) {
        errors.push(`ID ${id}: ${innerError.message || 'Internal error'}`);
      }
    }

    return res.json({
      message: `Verification complete: ${successCount} successfully verified, ${errors.length} skipped.`,
      successCount,
      errors
    });
  } catch (error: any) {
    console.error('Error in verifyPendingStaffBulk:', error);
    return res.status(500).json({ error: 'Failed to complete bulk verification' });
  }
};

// POST preview imported CSV/Excel data
export const importStaffPreview = async (req: Request, res: Response) => {
  try {
    const { rows } = req.body; // Array of { full_name, email, phone, designation }
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'Valid rows array is required' });
    }

    const previewRows: any[] = [];
    let idCounterOffset = 0;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const currentYear = 2026;
    const prefix = `STF${currentYear}`;

    const latestStaff = db.prepare(
      `SELECT staff_id FROM staff WHERE staff_id LIKE '${prefix}%' ORDER BY staff_id DESC LIMIT 1`
    ).get() as { staff_id?: string } | undefined;

    const latestPending = db.prepare(
      `SELECT staff_id FROM pending_staff WHERE staff_id LIKE '${prefix}%' ORDER BY staff_id DESC LIMIT 1`
    ).get() as { staff_id?: string } | undefined;

    let activeNum = 0;
    if (latestStaff && latestStaff.staff_id) {
      activeNum = parseInt(latestStaff.staff_id.replace(prefix, ''), 10) || 0;
    }

    let pendingNum = 0;
    if (latestPending && latestPending.staff_id) {
      pendingNum = parseInt(latestPending.staff_id.replace(prefix, ''), 10) || 0;
    }

    let startIdNum = Math.max(activeNum, pendingNum);

    for (const row of rows) {
      const full_name = (row.full_name || row.FullName || row.name || '').trim();
      const email = (row.email || row.Email || '').toLowerCase().trim();
      const phone = (row.phone || row.Phone || row.mobile || '').trim() || '+91 98765 00000';
      const designation = (row.designation || row.Designation || row.role || '').trim() || 'Trainer';

      let status = 'valid';
      let errorMsg = '';

      if (!full_name) {
        status = 'invalid';
        errorMsg = 'Name is required';
      } else if (!email || !emailRegex.test(email)) {
        status = 'invalid';
        errorMsg = 'Invalid email format';
      } else if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const isPhoneValid = cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
        if (!isPhoneValid) {
          status = 'invalid';
          errorMsg = 'Invalid 10-digit phone number';
        }
      } else {
        const dbUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        const dbPending = db.prepare('SELECT id FROM pending_staff WHERE email = ?').get(email);
        const duplicateInList = previewRows.some(r => r.email === email);

        if (dbUser) {
          status = 'conflict';
          errorMsg = 'Email already registered';
        } else if (dbPending) {
          status = 'conflict';
          errorMsg = 'Email already in pending list';
        } else if (duplicateInList) {
          status = 'conflict';
          errorMsg = 'Duplicate email in import file';
        }
      }

      idCounterOffset++;
      const generatedNum = startIdNum + idCounterOffset;
      const staff_id = `${prefix}${String(generatedNum).padStart(4, '0')}`;

      previewRows.push({
        full_name,
        email,
        phone,
        designation,
        staff_id,
        status,
        errorMsg
      });
    }

    return res.json({ previewRows });
  } catch (error: any) {
    console.error('Error in importStaffPreview:', error);
    return res.status(500).json({ error: 'Failed to parse and preview import data' });
  }
};

// POST commit imported rows to pending list
export const importStaffCommit = (req: Request, res: Response) => {
  try {
    const { rows } = req.body; // Array of verified rows
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Rows array cannot be empty' });
    }

    const insertPending = db.prepare(
      'INSERT INTO pending_staff (full_name, email, phone, designation, staff_id) VALUES (?, ?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      let insertedCount = 0;
      for (const row of rows) {
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(row.email);
        const existingPending = db.prepare('SELECT id FROM pending_staff WHERE email = ?').get(row.email);
        
        if (!existingUser && !existingPending) {
          insertPending.run(
            row.full_name.trim(),
            row.email.toLowerCase().trim(),
            row.phone.trim(),
            row.designation.trim(),
            row.staff_id.trim()
          );
          insertedCount++;
        }
      }
      return insertedCount;
    });

    const count = transaction();
    return res.status(201).json({ message: `Successfully imported ${count} trainers to pending list!`, count });
  } catch (error: any) {
    console.error('Error in importStaffCommit:', error);
    return res.status(500).json({ error: 'Failed to import and save trainers' });
  }
};

// GET sent emails logs
export const getSentEmails = (req: Request, res: Response) => {
  try {
    const emails = db.prepare('SELECT * FROM sent_emails ORDER BY id DESC LIMIT 100').all();
    return res.json({ emails });
  } catch (error: any) {
    console.error('Error in getSentEmails:', error);
    return res.status(500).json({ error: 'Failed to retrieve sent emails logs' });
  }
};

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { generateToken, generateSessionId, AuthRequest } from '../middleware/auth.js';
import { sendMail, compileStudentWelcomeTemplate } from '../services/emailService.js';
import { validateWorkingEmail } from '../services/emailValidator.js';

// Helper to generate the next unique Student ID: e.g. STU20260001
export function generateNextStudentID(): string {
  const currentYear = 2026;
  const prefix = `STU${currentYear}`;
  const latestStudent = db.prepare(
    `SELECT student_id FROM students WHERE student_id LIKE '${prefix}%' ORDER BY student_id DESC LIMIT 1`
  ).get() as { student_id?: string } | undefined;

  if (!latestStudent || !latestStudent.student_id) {
    return `${prefix}0001`;
  }

  const numPart = parseInt(latestStudent.student_id.replace(prefix, ''), 10);
  const nextNum = isNaN(numPart) ? 1 : numPart + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// Helper to generate the next unique Staff ID: e.g. STF20260001
export function generateNextStaffID(): string {
  const currentYear = 2026;
  const prefix = `STF${currentYear}`;
  const latestStaff = db.prepare(
    `SELECT staff_id FROM staff WHERE staff_id LIKE '${prefix}%' ORDER BY staff_id DESC LIMIT 1`
  ).get() as { staff_id?: string } | undefined;

  if (!latestStaff || !latestStaff.staff_id) {
    return `${prefix}0001`;
  }

  const numPart = parseInt(latestStaff.staff_id.replace(prefix, ''), 10);
  const nextNum = isNaN(numPart) ? 1 : numPart + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      mobile,
      password,
      confirm_password,
      college_name,
      degree,
      department,
      year_of_study,
    } = req.body;

    if (!full_name || !email || !mobile || !password || !college_name || !degree || !department || !year_of_study) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Email syntax, disposable domain & live DNS MX record validation
    const emailValidation = await validateWorkingEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.error || 'Invalid or non-working email address' });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const student_id = generateNextStudentID();

    const insertUser = db.prepare(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)'
    );
    const insertStudent = db.prepare(
      `INSERT INTO students (user_id, student_id, full_name, email, mobile, college_name, degree, department, year_of_study) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const transaction = db.transaction(() => {
      const userResult = insertUser.run(email.toLowerCase().trim(), password_hash, 'student', 'active');
      const userId = Number(userResult.lastInsertRowid);
      const studentResult = insertStudent.run(
        userId,
        student_id,
        full_name.trim(),
        email.toLowerCase().trim(),
        mobile.trim(),
        college_name.trim(),
        degree.trim(),
        department.trim(),
        year_of_study.trim()
      );
      const studentInternalId = Number(studentResult.lastInsertRowid);

      // Create welcome notification
      db.prepare(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)'
      ).run(
        userId,
        'Welcome to MindMend Academy!',
        `Your registration was successful. Your Student ID is ${student_id}. Explore courses and upcoming training tests.`,
        'welcome',
        '/student/dashboard'
      );

      return { userId, studentInternalId };
    });

    const { userId, studentInternalId } = transaction();

    // Dispatch welcome email asynchronously
    sendMail({
      to: email.toLowerCase().trim(),
      subject: 'Welcome to MindMend Academy! 🎓',
      html: compileStudentWelcomeTemplate({
        full_name: full_name.trim(),
        student_id,
        email: email.toLowerCase().trim(),
        loginUrl: `${req.protocol}://${req.get('host') || 'localhost:8081'}/login`
      })
    }).catch(err => console.error('Failed to dispatch student welcome email:', err));

    const sessionId = generateSessionId();

    // Store session ID in DB — invalidates any existing session on other devices/browsers
    db.prepare('UPDATE users SET session_token = ? WHERE id = ?').run(sessionId, userId);

    const token = generateToken(
      {
        id: userId,
        email: email.toLowerCase().trim(),
        role: 'student',
        student_id,
        student_internal_id: studentInternalId,
        full_name: full_name.trim(),
      },
      sessionId
    );

    return res.status(201).json({
      message: 'Student registration successful',
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        role: 'student',
        student_id,
        student_internal_id: studentInternalId,
        full_name: full_name.trim(),
        college_name: college_name.trim(),
        degree: degree.trim(),
        department: department.trim(),
        year_of_study: year_of_study.trim(),
      },
    });
  } catch (error: any) {
    console.error('Error in registerStudent:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password, role_hint } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your login identifier and password' });
    }

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid registered email address. ID login is disabled.' });
    }

    let user: any = null;
    let studentInfo: any = null;
    let staffInfo: any = null;

    user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanIdentifier.toLowerCase());
    if (user) {
      if (user.role === 'student') {
        studentInfo = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
      } else if (user.role === 'staff') {
        staffInfo = db.prepare('SELECT * FROM staff WHERE user_id = ?').get(user.id);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact MindMend Administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    let fullName = 'Administrator';
    let studentId = undefined;
    let staffId = undefined;
    let studentInternalId = undefined;
    let staffInternalId = undefined;

    if (user.role === 'student' && studentInfo) {
      fullName = studentInfo.full_name;
      studentId = studentInfo.student_id;
      studentInternalId = studentInfo.id;
    } else if (user.role === 'staff' && staffInfo) {
      fullName = staffInfo.full_name;
      staffId = staffInfo.staff_id;
      staffInternalId = staffInfo.id;
    }

    const sessionId = generateSessionId();

    // Store session ID in DB — invalidates any existing session on other devices/browsers
    db.prepare('UPDATE users SET session_token = ? WHERE id = ?').run(sessionId, user.id);

    const token = generateToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        student_id: studentId,
        staff_id: staffId,
        student_internal_id: studentInternalId,
        staff_internal_id: staffInternalId,
        full_name: fullName,
      },
      sessionId
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: fullName,
        student_id: studentId,
        staff_id: staffId,
        student_internal_id: studentInternalId,
        staff_internal_id: staffInternalId,
        profile: studentInfo || staffInfo || { email: user.email, designation: 'System Administrator' },
      },
    });
  } catch (error: any) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getCurrentUser = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = db.prepare('SELECT id, email, role, status, created_at FROM users WHERE id = ?').get(req.user.id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile: any = null;
    if (user.role === 'student') {
      profile = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
    } else if (user.role === 'staff') {
      profile = db.prepare('SELECT * FROM staff WHERE user_id = ?').get(user.id);
    } else {
      profile = { full_name: 'MindMend Administrator', email: user.email, role: 'admin' };
    }

    // Unread notifications count
    const unreadCount = db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
    ).get(user.id) as { count: number };

    return res.json({
      user: {
        ...user,
        profile,
        student_id: profile?.student_id,
        staff_id: profile?.staff_id,
        student_internal_id: profile?.id,
        staff_internal_id: profile?.id,
        full_name: profile?.full_name || 'Administrator',
        unread_notifications: unreadCount?.count || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in getCurrentUser:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { 
      full_name, 
      mobile, 
      phone, 
      college_name, 
      bio, 
      designation, 
      email, 
      linkedin_url, 
      github_url,
      password 
    } = req.body;

    const userId = req.user.id;
    const cleanEmail = email ? email.toLowerCase().trim() : null;

    // Hash password beforehand if provided
    let passwordHash: string | null = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    const transaction = db.transaction(() => {
      // 1. If email is provided, check uniqueness and update
      if (cleanEmail) {
        const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(cleanEmail, userId);
        if (existing) {
          throw new Error('A user with this email address already exists');
        }
        db.prepare('UPDATE users SET email = ? WHERE id = ?').run(cleanEmail, userId);

        if (req.user!.role === 'student') {
          db.prepare('UPDATE students SET email = ? WHERE user_id = ?').run(cleanEmail, userId);
        } else if (req.user!.role === 'staff') {
          db.prepare('UPDATE staff SET email = ? WHERE user_id = ?').run(cleanEmail, userId);
        }
      }

      // 2. If password is provided, update hash and send security notification email
      if (passwordHash) {
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);

        const userEmail = req.user!.email;
        const userName = req.user!.full_name || 'User';

        sendMail({
          to: userEmail,
          subject: '🔒 MindMend Security Alert: Password Updated Successfully',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #6A1B9A; margin: 0; font-size: 22px;">MindMend Academy</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Account Security Alert</p>
              </div>
              <p style="font-size: 14px; color: #1e293b;">Hello <strong>${userName}</strong>,</p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                This email confirms that the password for your MindMend Academy account (<strong>${userEmail}</strong>) was successfully changed on <strong>${new Date().toLocaleString()}</strong>.
              </p>
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: bold;">⚠️ Did not request this change?</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #b45309;">
                  If you did not change your password, please contact MindMend Administration or Support immediately to secure your account.
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                This is an automated security notice sent to protect your account. Please do not reply directly to this email.
              </p>
            </div>
          `
        }).catch(err => console.error('Failed to send password security email:', err));
      }

      // 3. Update profile tables
      if (req.user!.role === 'student') {
        db.prepare(
          `UPDATE students 
           SET full_name = COALESCE(?, full_name),
               mobile = COALESCE(?, mobile),
               college_name = COALESCE(?, college_name),
               bio = COALESCE(?, bio),
               linkedin_url = ?,
               github_url = ?
           WHERE user_id = ?`
        ).run(
          full_name ? full_name.trim() : null, 
          mobile ? mobile.trim() : null, 
          college_name ? college_name.trim() : null, 
          bio ? bio.trim() : null, 
          linkedin_url ? linkedin_url.trim() : null,
          github_url ? github_url.trim() : null,
          userId
        );
      } else if (req.user!.role === 'staff') {
        db.prepare(
          `UPDATE staff 
           SET full_name = COALESCE(?, full_name),
               phone = COALESCE(?, phone),
               designation = COALESCE(?, designation),
               bio = COALESCE(?, bio),
               linkedin_url = ?,
               github_url = ?
           WHERE user_id = ?`
        ).run(
          full_name ? full_name.trim() : null, 
          phone ? phone.trim() : null, 
          designation ? designation.trim() : null, 
          bio ? bio.trim() : null, 
          linkedin_url ? linkedin_url.trim() : null,
          github_url ? github_url.trim() : null,
          userId
        );
      }
    });

    transaction();

    return res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Error in updateProfile:', error);
    return res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
};

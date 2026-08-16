import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import crypto from 'crypto';

export const JWT_SECRET = process.env.JWT_SECRET || 'mindmend-secret-key-2026-super-secure';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'admin' | 'staff' | 'student';
  student_id?: string;
  staff_id?: string;
  student_internal_id?: number;
  staff_internal_id?: number;
  full_name?: string;
  session_id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Generates a cryptographically random session ID for single-device session tracking.
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a JWT token with an embedded session_id.
 */
export function generateToken(user: AuthenticatedUser, sessionId: string): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      student_id: user.student_id,
      staff_id: user.staff_id,
      student_internal_id: user.student_internal_id,
      staff_internal_id: user.staff_internal_id,
      full_name: user.full_name,
      session_id: sessionId,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required', code: 'NO_TOKEN' });
  }

  const token = authHeader.split(' ')[1];
  try {
    let decoded: any = null;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      // Fallback: Decode unverified JWT / Firebase ID Token
      const unverified = jwt.decode(token) as any;
      if (unverified && (unverified.email || unverified.user_id || unverified.sub || unverified.id)) {
        const cleanEmail = (unverified.email || '').toLowerCase().trim();
        const numericId = typeof unverified.id === 'number' ? unverified.id : (typeof unverified.user_id === 'number' ? unverified.user_id : 0);

        let userByEmailOrId = db.prepare(
          'SELECT id, email, role, status FROM users WHERE (email = ? AND email != "") OR (id = ? AND id != 0)'
        ).get(cleanEmail, numericId) as any;

        // Auto-provision Firebase Auth users into SQLite database if missing
        if (!userByEmailOrId && cleanEmail) {
          try {
            const role = cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('staff') ? 'staff' : 'student';
            const dummyHash = '$2a$10$UnusableHashForFirebaseAutoProvisionedUser999';

            const userRes = db.prepare(
              'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)'
            ).run(cleanEmail, dummyHash, role, 'active');

            const userId = Number(userRes.lastInsertRowid);

            if (role === 'student') {
              const studentId = `STU2026${String(userId).padStart(4, '0')}`;
              const fullName = unverified.name || cleanEmail.split('@')[0];
              db.prepare(
                `INSERT INTO students (user_id, student_id, full_name, email, mobile, college_name, degree, department, year_of_study) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
              ).run(userId, studentId, fullName, cleanEmail, '9999999999', 'MindMend Academy', 'B.Tech', 'Computer Science', 'Final Year');
            } else if (role === 'staff') {
              const staffId = `STF2026${String(userId).padStart(4, '0')}`;
              const fullName = unverified.name || cleanEmail.split('@')[0];
              db.prepare(
                `INSERT INTO staff (user_id, staff_id, full_name, email, phone, designation) 
                 VALUES (?, ?, ?, ?, ?, ?)`
              ).run(userId, staffId, fullName, cleanEmail, '9999999999', 'Senior Trainer');
            }

            userByEmailOrId = db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(userId);
          } catch (e) {
            console.warn('Auto-provisioning Firebase user in SQLite failed:', e);
          }
        }

        if (userByEmailOrId && userByEmailOrId.status !== 'inactive') {
          const studentInfo = db.prepare('SELECT * FROM students WHERE user_id = ?').get(userByEmailOrId.id) as any;
          const staffInfo = db.prepare('SELECT * FROM staff WHERE user_id = ?').get(userByEmailOrId.id) as any;

          req.user = {
            id: userByEmailOrId.id,
            email: userByEmailOrId.email,
            role: userByEmailOrId.role,
            student_id: studentInfo?.student_id,
            staff_id: staffInfo?.staff_id,
            student_internal_id: studentInfo?.id,
            staff_internal_id: staffInfo?.id,
            full_name: studentInfo?.full_name || staffInfo?.full_name || 'User',
          };
          return next();
        }
      }
      throw jwtErr;
    }

    // Verify user is still active in database
    const user = db.prepare(
      'SELECT id, email, role, status, session_token FROM users WHERE id = ?'
    ).get(decoded.id) as any;

    if (!user || user.status === 'inactive') {
      return res.status(401).json({
        error: 'User account is inactive or not found',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    // Single-active-session check: if session_id doesn't match the DB session_token,
    // the user has signed in from another device/browser and this session is revoked.
    if (user.session_token && decoded.session_id && user.session_token !== decoded.session_id) {
      return res.status(401).json({
        error: 'Your account was signed in on another device or browser. Please sign in again to continue.',
        code: 'DEVICE_LOGOUT',
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'TOKEN_INVALID' });
  }
}

export function requireRole(allowedRoles: Array<'admin' | 'staff' | 'student'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required', code: 'NO_TOKEN' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
}

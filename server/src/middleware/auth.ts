import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

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
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: AuthenticatedUser): string {
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
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Verify user is still active in database
    const user = db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(decoded.id) as any;
    if (!user || user.status === 'inactive') {
      return res.status(401).json({ error: 'User account is inactive or not found' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: Array<'admin' | 'staff' | 'student'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
}

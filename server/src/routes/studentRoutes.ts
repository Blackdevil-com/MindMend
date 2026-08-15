import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  updateStudentStatus,
  assignStudentToBatch,
  assignStudentToCourse,
  getStudentDashboardStats,
  exportStudentsCSV,
  deleteStudentAndUser,
  changeStudentPassword,
} from '../controllers/studentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Student self-service
router.get('/dashboard-stats', verifyToken, requireRole(['student']), getStudentDashboardStats);

// Export CSV (Admin)
router.get('/export/csv', verifyToken, requireRole(['admin']), exportStudentsCSV);

// Admin / Staff access
router.get('/', verifyToken, requireRole(['admin', 'staff']), getAllStudents);
router.get('/:id', verifyToken, requireRole(['admin', 'staff', 'student']), getStudentById);
router.patch('/:id/status', verifyToken, requireRole(['admin']), updateStudentStatus);
router.post('/assign-batch', verifyToken, requireRole(['admin']), assignStudentToBatch);
router.post('/assign-course', verifyToken, requireRole(['admin']), assignStudentToCourse);
router.delete('/:id', verifyToken, requireRole(['admin']), deleteStudentAndUser);
router.post('/:id/change-password', verifyToken, requireRole(['admin']), changeStudentPassword);

export default router;

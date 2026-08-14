import { Router } from 'express';
import {
  markBatchAttendance,
  getBatchAttendanceForDate,
  getStudentAttendanceHistory,
  getGlobalAttendanceReports,
  exportAttendanceCSV,
} from '../controllers/attendanceController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/mark', verifyToken, requireRole(['admin', 'staff']), markBatchAttendance);
router.get('/batch/:batchId', verifyToken, requireRole(['admin', 'staff']), getBatchAttendanceForDate);
router.get('/student/:studentId?', verifyToken, getStudentAttendanceHistory);
router.get('/reports', verifyToken, requireRole(['admin']), getGlobalAttendanceReports);
router.get('/export/csv/:batchId', verifyToken, requireRole(['admin', 'staff']), exportAttendanceCSV);

export default router;

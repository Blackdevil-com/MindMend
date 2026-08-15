import { Router } from 'express';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  getStaffDashboardStats,
  deleteStaffAndUser,
  changeStaffPassword,
  // New actions for Pending Verification & Bulk Import
  getPendingStaff,
  createPendingStaff,
  updatePendingStaff,
  deletePendingStaff,
  verifyPendingStaff,
  verifyPendingStaffBulk,
  importStaffPreview,
  importStaffCommit,
  getSentEmails,
} from '../controllers/staffController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Staff Dashboard & Standard Management
router.get('/dashboard-stats', verifyToken, requireRole(['staff']), getStaffDashboardStats);
router.get('/', verifyToken, requireRole(['admin']), getAllStaff);
router.post('/', verifyToken, requireRole(['admin']), createStaff);
router.put('/:id', verifyToken, requireRole(['admin']), updateStaff);
router.delete('/:id', verifyToken, requireRole(['admin']), deleteStaffAndUser);
router.post('/:id/change-password', verifyToken, requireRole(['admin']), changeStaffPassword);

// Pending Staff Verification & Import Management
router.get('/pending', verifyToken, requireRole(['admin']), getPendingStaff);
router.post('/pending', verifyToken, requireRole(['admin']), createPendingStaff);
router.put('/pending/:id', verifyToken, requireRole(['admin']), updatePendingStaff);
router.delete('/pending/:id', verifyToken, requireRole(['admin']), deletePendingStaff);
router.post('/pending/verify-bulk', verifyToken, requireRole(['admin']), verifyPendingStaffBulk);
router.post('/pending/:id/verify', verifyToken, requireRole(['admin']), verifyPendingStaff);

// Bulk Import Previews
router.post('/import-preview', verifyToken, requireRole(['admin']), importStaffPreview);
router.post('/import-commit', verifyToken, requireRole(['admin']), importStaffCommit);

// Sent Email Logs
router.get('/sent-emails', verifyToken, requireRole(['admin']), getSentEmails);

export default router;

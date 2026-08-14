import { Router } from 'express';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  getStaffDashboardStats,
} from '../controllers/staffController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard-stats', verifyToken, requireRole(['staff']), getStaffDashboardStats);
router.get('/', verifyToken, requireRole(['admin']), getAllStaff);
router.post('/', verifyToken, requireRole(['admin']), createStaff);
router.put('/:id', verifyToken, requireRole(['admin']), updateStaff);

export default router;

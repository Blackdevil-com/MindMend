import { Router } from 'express';
import {
  getAdminDashboardSummary,
  getTestimonials,
  submitContactMessage,
  getContactMessages,
  updateContactStatus,
  getUserNotifications,
  markNotificationRead,
} from '../controllers/cmsController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Publicly available
router.get('/testimonials', getTestimonials);
router.post('/contact', submitContactMessage);

// Admin dashboard analytics & messages
router.get('/admin/summary', verifyToken, requireRole(['admin']), getAdminDashboardSummary);
router.get('/admin/messages', verifyToken, requireRole(['admin']), getContactMessages);
router.patch('/admin/messages/:id', verifyToken, requireRole(['admin']), updateContactStatus);

// User notifications
router.get('/notifications', verifyToken, getUserNotifications);
router.patch('/notifications/:id/read', verifyToken, markNotificationRead);

export default router;

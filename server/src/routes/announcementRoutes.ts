import { Router } from 'express';
import {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getAllAnnouncements);
router.post('/', verifyToken, requireRole(['admin', 'staff']), createAnnouncement);
router.delete('/:id', verifyToken, requireRole(['admin']), deleteAnnouncement);

export default router;

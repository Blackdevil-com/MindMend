import { Router } from 'express';
import {
  getAllInternships,
  applyForInternship,
  getAllApplications,
  updateApplicationStatus,
  exportApplicationsCSV,
} from '../controllers/internshipController.js';
import { upload } from '../middleware/upload.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Publicly available listings
router.get('/', getAllInternships);

// Application submission (Supports multipart with optional resume file)
router.post('/apply', (req, res, next) => {
  // Try optional token verification if present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    verifyToken(req as any, res, () => {
      upload.single('resume')(req, res, next);
    });
  } else {
    upload.single('resume')(req, res, next);
  }
}, applyForInternship);

// Admin review
router.get('/applications', verifyToken, requireRole(['admin']), getAllApplications);
router.patch('/applications/:id/status', verifyToken, requireRole(['admin']), updateApplicationStatus);
router.get('/export/csv', verifyToken, requireRole(['admin']), exportApplicationsCSV);

export default router;

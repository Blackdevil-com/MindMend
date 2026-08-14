import { Router } from 'express';
import {
  getAllCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Publicly readable
router.get('/', getAllCourses);
router.get('/:slug', getCourseBySlug);

// Admin-only management
router.post('/', verifyToken, requireRole(['admin']), createCourse);
router.put('/:id', verifyToken, requireRole(['admin']), updateCourse);
router.delete('/:id', verifyToken, requireRole(['admin']), deleteCourse);

export default router;

import { Router } from 'express';
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  addStudentsToBatch,
  removeStudentFromBatch,
} from '../controllers/batchController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, requireRole(['admin', 'staff']), getAllBatches);
router.get('/:id', verifyToken, requireRole(['admin', 'staff']), getBatchById);
router.post('/', verifyToken, requireRole(['admin']), createBatch);
router.put('/:id', verifyToken, requireRole(['admin']), updateBatch);
router.delete('/:id', verifyToken, requireRole(['admin']), deleteBatch);
router.post('/:id/students', verifyToken, requireRole(['admin', 'staff']), addStudentsToBatch);
router.delete('/:id/students/:studentId', verifyToken, requireRole(['admin', 'staff']), removeStudentFromBatch);

export default router;

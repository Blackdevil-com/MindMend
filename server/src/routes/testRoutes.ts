import { Router } from 'express';
import {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  duplicateTest,
  toggleTestStatus,
  toggleTestMarksVisibility,
  getTestForStudent,
  submitTestAttempt,
  getAttemptResult,
  getTestSubmissions,
  exportTestResultsCSV,
} from '../controllers/testController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Student-specific endpoints
router.get('/take/:id', verifyToken, requireRole(['student']), getTestForStudent);
router.post('/submit/:id', verifyToken, requireRole(['student']), submitTestAttempt);
router.get('/result/:attemptId', verifyToken, getAttemptResult);

// Staff / Admin test creation & management
router.get('/', verifyToken, getAllTests);
router.get('/:id', verifyToken, getTestById);
router.post('/', verifyToken, requireRole(['admin', 'staff']), createTest);
router.put('/:id', verifyToken, requireRole(['admin', 'staff']), updateTest);
router.delete('/:id', verifyToken, requireRole(['admin', 'staff']), deleteTest);
router.post('/:id/duplicate', verifyToken, requireRole(['admin', 'staff']), duplicateTest);
router.patch('/:id/status', verifyToken, requireRole(['admin', 'staff']), toggleTestStatus);
router.patch('/:id/toggle-marks', verifyToken, requireRole(['admin', 'staff']), toggleTestMarksVisibility);

// Submissions & CSV Export
router.get('/:id/submissions', verifyToken, requireRole(['admin', 'staff']), getTestSubmissions);
router.get('/:id/export/csv', verifyToken, requireRole(['admin', 'staff']), exportTestResultsCSV);

export default router;

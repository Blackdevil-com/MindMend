import { Router } from 'express';
import { registerStudent, login, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerStudent);
router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);

export default router;

import express from 'express';
import { register, login, verifyEmail, getMe, logout, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email/:token', verifyEmail); // Changed to POST to match spec
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
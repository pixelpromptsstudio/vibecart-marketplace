import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { createRateLimiter } from '../middleware/security';

const router = Router();

const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please wait a few minutes and try again.',
});

const resetRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: 'pwd-reset',
  message: 'Too many password reset attempts. Please try again later.',
});

router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/addresses', authenticateToken, addAddress);
router.delete('/addresses/:addressId', authenticateToken, deleteAddress);
router.post('/forgot-password', resetRateLimit, forgotPassword);
router.post('/reset-password', resetRateLimit, resetPassword);

export default router;

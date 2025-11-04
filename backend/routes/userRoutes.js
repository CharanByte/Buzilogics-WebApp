import express from 'express';
import { getUsers, getProfile, updateProfile, resetPassword } from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, authorizeAdmin, getUsers);
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/reset-password', authenticate, resetPassword);

export default router;
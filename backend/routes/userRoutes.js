import express from 'express';
import { getUsers, getProfile } from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';



const router = express.Router();


router.get('/', authenticate, authorizeAdmin, getUsers);


router.get('/me', authenticate, getProfile);



export default router;
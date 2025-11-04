import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../../../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/sessions', authenticateToken, authController.getActiveSessions.bind(authController));
router.post('/logout-all', authenticateToken, authController.logoutAll.bind(authController));

export default router;

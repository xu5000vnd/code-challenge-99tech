import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../../../middleware/auth';

const router = Router();
const userController = new UserController();

// All routes are protected (authentication is handled by auth module)
router.get('/me', authenticateToken, userController.getCurrentUser.bind(userController));
router.get('/:id', authenticateToken, userController.findById.bind(userController));
router.get('/', authenticateToken, userController.findAll.bind(userController));
router.post('/', authenticateToken, userController.create.bind(userController));
router.put('/:id', authenticateToken, userController.update.bind(userController));
router.delete('/:id', authenticateToken, userController.delete.bind(userController));

export default router;

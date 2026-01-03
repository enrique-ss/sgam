import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/registrar', AuthController.registrar);
router.post('/login', AuthController.login);
router.get('/verificar', authMiddleware, AuthController.verificarToken);

export default router;
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Rotas públicas
router.post('/registrar', AuthController.registrar);
router.post('/login', AuthController.login);

// Rota protegida
router.get('/verificar', authMiddleware, AuthController.verificarToken);

export default router;
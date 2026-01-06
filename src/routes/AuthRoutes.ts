import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Rotas públicas (sem autenticação)
router.post('/cadastrar', AuthController.cadastrar);
router.post('/login', AuthController.login);

// Rotas protegidas (com autenticação)
router.get('/me/:id', authMiddleware, AuthController.buscarPerfil);

export default router;
import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar todos - apenas admin
router.get('/', adminMiddleware, UsuarioController.listar);

// Ver usuário - todos (com regras no controller)
router.get('/:id', UsuarioController.obter);

// Criar - apenas admin
router.post('/', adminMiddleware, UsuarioController.criar);

// Atualizar - todos (com regras no controller)
router.put('/:id', UsuarioController.atualizar);

// Deletar - apenas admin
router.delete('/:id', adminMiddleware, UsuarioController.deletar);

export default router;
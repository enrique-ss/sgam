import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', adminMiddleware, UsuarioController.listar);
router.get('/:id', UsuarioController.obter);
router.post('/', adminMiddleware, UsuarioController.criar);
router.put('/:id', UsuarioController.atualizar);
router.delete('/:id', adminMiddleware, UsuarioController.deletar);

export default router;
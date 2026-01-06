import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Gestão de usuários (admin)
router.get('/clientes', UsuarioController.listarClientes);
router.get('/equipe', UsuarioController.listarEquipe);
router.get('/responsaveis', UsuarioController.listarResponsaveis);
router.put('/:id', UsuarioController.editarUsuario);

// Editar perfil próprio
router.put('/perfil', UsuarioController.editarPerfil);

export default router;
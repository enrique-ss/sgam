import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Criar pedidos
router.post('/cliente', PedidoController.criarPedidoCliente);
router.post('/colaborador', PedidoController.criarPedidoColaborador);

// Listar pedidos
router.get('/pendentes', PedidoController.listarPendentes);
router.get('/meus/cliente', PedidoController.listarMeusPedidosCliente);
router.get('/meus/colaborador', PedidoController.listarMeusPedidosColaborador);
router.get('/todos', PedidoController.listarTodosPedidos);

// Ações em pedidos
router.put('/:id/assumir', PedidoController.assumirPedido);
router.put('/:id/concluir', PedidoController.concluirPedido);
router.put('/:id/cancelar', PedidoController.cancelarPedido);
router.put('/:id', PedidoController.editarPedido);

export default router;
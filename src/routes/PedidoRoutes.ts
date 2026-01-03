import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { authMiddleware, adminOuColaboradorMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar - todos (filtrado no controller)
router.get('/', PedidoController.listar);

// Ver detalhes - todos (filtrado no controller)
router.get('/:id', PedidoController.obter);

// Criar - todos (com regras no controller)
router.post('/', PedidoController.criar);

// Atualizar - todos (com regras no controller)
router.put('/:id', PedidoController.atualizar);

// Deletar - todos (com regras no controller)
router.delete('/:id', PedidoController.deletar);

// Demandas - apenas admin/colaborador
router.post('/:pedido_id/demandas', adminOuColaboradorMiddleware, PedidoController.criarDemanda);
router.put('/demandas/:id', adminOuColaboradorMiddleware, PedidoController.atualizarDemanda);

export default router;
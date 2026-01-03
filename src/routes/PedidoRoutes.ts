import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController';
import { authMiddleware, adminOuColaboradorMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', PedidoController.listar);
router.get('/:id', PedidoController.obter);
router.post('/', PedidoController.criar);
router.put('/:id', PedidoController.atualizar);
router.delete('/:id', PedidoController.deletar);

router.post('/:pedido_id/demandas', adminOuColaboradorMiddleware, PedidoController.criarDemanda);
router.put('/demandas/:id', adminOuColaboradorMiddleware, PedidoController.atualizarDemanda);

export default router;
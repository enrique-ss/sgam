import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware, adminOuColaboradorMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', DashboardController.obterDashboard);
router.get('/pedidos-abertos', DashboardController.pedidosAbertos);
router.get('/entregas', DashboardController.entregasFinalizadas);
router.get('/clientes', adminOuColaboradorMiddleware, DashboardController.listarClientes);

export default router;
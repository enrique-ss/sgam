import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware, adminOuColaboradorMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Dashboard - admin/colaborador (validado no controller)
router.get('/', DashboardController.obterDashboard);

// Pedidos abertos - todos (filtrado no controller)
router.get('/pedidos-abertos', DashboardController.pedidosAbertos);

// Entregas finalizadas - todos (filtrado no controller)
router.get('/entregas', DashboardController.entregasFinalizadas);

// Clientes - apenas admin/colaborador
router.get('/clientes', adminOuColaboradorMiddleware, DashboardController.listarClientes);

export default router;
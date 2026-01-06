import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Dashboards
router.get('/colaborador', DashboardController.obterEstatisticasColaborador);
router.get('/admin', DashboardController.obterEstatisticasAdmin);

export default router;
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { DashboardService } from '../service/DashboardService';

export const DashboardController = {
    async obterDashboard(req: AuthRequest, res: Response) {
        try {
            const usuarioLogado = req.user!;

            // Cliente não tem acesso ao dashboard
            if (usuarioLogado.nivel_acesso === 'cliente') {
                return res.status(403).json({
                    erro: 'Clientes não têm acesso ao dashboard',
                    mensagem: 'Use as opções de "Meus Pedidos" para visualizar suas informações'
                });
            }

            const dashboard = await DashboardService.obterDashboard(usuarioLogado);

            res.json(dashboard);
        } catch (error) {
            console.error('Erro no dashboard:', error);
            res.status(500).json({ erro: 'Erro ao carregar dashboard' });
        }
    },

    async pedidosAbertos(req: AuthRequest, res: Response) {
        try {
            const usuarioLogado = req.user!;

            const pedidos = await DashboardService.pedidosAbertos(usuarioLogado);

            res.json({
                pedidos,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Erro ao buscar pedidos abertos:', error);
            res.status(500).json({ erro: 'Erro ao buscar pedidos abertos' });
        }
    },

    async entregasFinalizadas(req: AuthRequest, res: Response) {
        try {
            const usuarioLogado = req.user!;

            const entregas = await DashboardService.entregasFinalizadas(usuarioLogado);

            res.json({
                entregas,
                total: entregas.length
            });
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
            res.status(500).json({ erro: 'Erro ao buscar entregas' });
        }
    },

    async listarClientes(req: AuthRequest, res: Response) {
        try {
            const clientes = await DashboardService.listarClientes();

            res.json({
                clientes,
                total: clientes.length
            });
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ erro: 'Erro ao listar clientes' });
        }
    }
};
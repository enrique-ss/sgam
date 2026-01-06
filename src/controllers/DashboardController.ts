import { Request, Response } from 'express';
import { DashboardService } from '../service/DashboardService';

export class DashboardController {
  // GET /api/dashboard/colaborador
  static async obterEstatisticasColaborador(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth;

      if (nivelAcesso === 'cliente') {
        res.status(403).json({ 
          erro: 'Clientes não têm acesso ao dashboard' 
        });
        return;
      }

      const estatisticas = await DashboardService.obterEstatisticasColaborador(usuarioId);

      res.status(200).json(estatisticas);
    } catch (error: any) {
      res.status(500).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/dashboard/admin
  static async obterEstatisticasAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth;

      if (nivelAcesso !== 'admin') {
        res.status(403).json({ 
          erro: 'Apenas administradores têm acesso às estatísticas globais' 
        });
        return;
      }

      const estatisticas = await DashboardService.obterEstatisticasAdmin(usuarioId);

      res.status(200).json(estatisticas);
    } catch (error: any) {
      res.status(500).json({ 
        erro: error.message 
      });
    }
  }
}
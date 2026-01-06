import pool from '../database';
import { RowDataPacket } from 'mysql2';

export interface EstatisticasPessoais {
  porTipoServico: { tipo: string; total: number }[];
  porStatus: { status: string; total: number }[];
  proximasEntregas: any[];
  pedidosAtrasados: any[];
}

export interface EstatisticasGlobais {
  totalPedidos: number;
  taxaConclusao: number;
  tempoMedioEntrega: number;
  pedidosAtrasados: number;
  porResponsavel: {
    nome: string;
    emAberto: number;
    atrasados: number;
  }[];
  alertasInatividade: {
    nome: string;
    diasSemLogin: number;
    ativo: boolean;
  }[];
}

export class DashboardService {
  // Dashboard Colaborador (estatísticas pessoais)
  static async obterEstatisticasColaborador(colaboradorId: number): Promise<EstatisticasPessoais> {
    // Pedidos por tipo de serviço
    const [porTipo] = await pool.query<RowDataPacket[]>(
      `SELECT tipo_servico as tipo, COUNT(*) as total 
       FROM pedidos 
       WHERE responsavel_id = ? 
       GROUP BY tipo_servico`,
      [colaboradorId]
    );

    // Pedidos por status
    const [porStatus] = await pool.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) as total 
       FROM pedidos 
       WHERE responsavel_id = ? 
       GROUP BY status`,
      [colaboradorId]
    );

    // Próximas entregas (ordenadas por prioridade)
    const [proximasEntregas] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.titulo, p.prazo_entrega, p.prioridade, u.nome as cliente_nome 
       FROM pedidos p 
       JOIN usuarios u ON p.cliente_id = u.id 
       WHERE p.responsavel_id = ? 
       AND p.status IN ('em_andamento', 'atrasado')
       ORDER BY 
         CASE p.prioridade
           WHEN 'urgente' THEN 1
           WHEN 'alta' THEN 2
           WHEN 'media' THEN 3
           WHEN 'baixa' THEN 4
         END,
         p.prazo_entrega ASC
       LIMIT 5`,
      [colaboradorId]
    );

    // Pedidos atrasados
    const [pedidosAtrasados] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.titulo, p.prazo_entrega, u.nome as cliente_nome 
       FROM pedidos p 
       JOIN usuarios u ON p.cliente_id = u.id 
       WHERE p.responsavel_id = ? 
       AND p.status = 'atrasado' 
       ORDER BY p.prazo_entrega ASC`,
      [colaboradorId]
    );

    return {
      porTipoServico: porTipo as any[],
      porStatus: porStatus as any[],
      proximasEntregas: proximasEntregas as any[],
      pedidosAtrasados: pedidosAtrasados as any[]
    };
  }

  // Dashboard Admin (estatísticas pessoais + globais)
  static async obterEstatisticasAdmin(adminId: number): Promise<{
    pessoais: EstatisticasPessoais;
    globais: EstatisticasGlobais;
  }> {
    // Estatísticas pessoais (igual ao colaborador)
    const pessoais = await this.obterEstatisticasColaborador(adminId);

    // Estatísticas globais
    const [totalPedidosResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM pedidos'
    );
    const totalPedidos = totalPedidosResult[0].total;

    const [pedidosEntreguesResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM pedidos WHERE status = "entregue"'
    );
    const pedidosEntregues = pedidosEntreguesResult[0].total;

    const taxaConclusao = totalPedidos > 0 
      ? Math.round((pedidosEntregues / totalPedidos) * 100) 
      : 0;

    // Tempo médio de entrega (em dias)
    const [tempoMedioResult] = await pool.query<RowDataPacket[]>(
      `SELECT AVG(DATEDIFF(data_conclusao, criado_em)) as media 
       FROM pedidos 
       WHERE status = 'entregue'`
    );
    const tempoMedioEntrega = Math.round(tempoMedioResult[0].media || 0);

    // Pedidos atrasados (total)
    const [pedidosAtrasadosResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM pedidos WHERE status = "atrasado"'
    );
    const pedidosAtrasados = pedidosAtrasadosResult[0].total;

    // Visão por responsável
    const [porResponsavel] = await pool.query<RowDataPacket[]>(
      `SELECT 
         u.nome,
         COUNT(CASE WHEN p.status IN ('em_andamento', 'atrasado') THEN 1 END) as emAberto,
         COUNT(CASE WHEN p.status = 'atrasado' THEN 1 END) as atrasados
       FROM usuarios u
       LEFT JOIN pedidos p ON u.id = p.responsavel_id
       WHERE u.nivel_acesso IN ('colaborador', 'admin')
       AND u.ativo = true
       GROUP BY u.id, u.nome
       ORDER BY u.nome`
    );

    // Alertas de inatividade
    const [alertasInatividade] = await pool.query<RowDataPacket[]>(
      `SELECT 
         nome,
         DATEDIFF(CURDATE(), ultimo_login) as diasSemLogin,
         ativo
       FROM usuarios
       WHERE nivel_acesso = 'colaborador'
       AND DATEDIFF(CURDATE(), ultimo_login) >= 25
       ORDER BY diasSemLogin DESC`
    );

    return {
      pessoais,
      globais: {
        totalPedidos,
        taxaConclusao,
        tempoMedioEntrega,
        pedidosAtrasados,
        porResponsavel: porResponsavel as any[],
        alertasInatividade: alertasInatividade as any[]
      }
    };
  }
}
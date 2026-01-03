import { Response } from 'express';
import { db } from '../database';
import { AuthRequest } from '../middlewares/auth';

export const DashboardController = {
    async obterDashboard(req: AuthRequest, res: Response) {
        const usuarioLogado = req.user!;

        // REGRA: Cliente não tem acesso ao dashboard
        if (usuarioLogado.nivel_acesso === 'cliente') {
            return res.status(403).json({
                erro: 'Clientes não têm acesso ao dashboard',
                mensagem: 'Use as opções de "Meus Pedidos" para visualizar suas informações'
            });
        }

        try {
            let dashboard: any = {
                usuario: {
                    id: usuarioLogado.id,
                    nivel_acesso: usuarioLogado.nivel_acesso
                }
            };

            if (usuarioLogado.nivel_acesso === 'admin') {
                const totalPedidos = await db('pedidos').count('* as total').first() as { total: number } | undefined;

                const pedidosPorStatus = await db('pedidos')
                    .select('status')
                    .count('* as quantidade')
                    .groupBy('status');

                const pedidosPendentes = await db('pedidos')
                    .where('status', 'aberto')
                    .whereNull('responsavel_id')
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const pedidosEmAndamento = await db('pedidos')
                    .where('status', 'em_andamento')
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const pedidosFinalizados = await db('pedidos')
                    .where('status', 'finalizado')
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const totalClientes = await db('usuarios')
                    .where('nivel_acesso', 'cliente')
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const totalColaboradores = await db('usuarios')
                    .where('nivel_acesso', 'colaborador')
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const pedidosRecentes = await db('pedidos')
                    .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                    .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
                    .select(
                        'pedidos.*',
                        'c.nome as cliente_nome',
                        'r.nome as responsavel_nome'
                    )
                    .orderBy('pedidos.created_at', 'desc')
                    .limit(10);

                dashboard = {
                    ...dashboard,
                    estatisticas: {
                        total_pedidos: Number(totalPedidos?.total || 0),
                        pedidos_por_status: pedidosPorStatus,
                        pedidos_pendentes: Number(pedidosPendentes?.total || 0),
                        pedidos_em_andamento: Number(pedidosEmAndamento?.total || 0),
                        pedidos_finalizados: Number(pedidosFinalizados?.total || 0),
                        total_clientes: Number(totalClientes?.total || 0),
                        total_colaboradores: Number(totalColaboradores?.total || 0)
                    },
                    pedidos_recentes: pedidosRecentes
                };
            } else if (usuarioLogado.nivel_acesso === 'colaborador') {
                const totalPedidos = await db('pedidos').count('* as total').first() as { total: number } | undefined;

                const meusPedidos = await db('pedidos')
                    .where('responsavel_id', usuarioLogado.id)
                    .whereIn('status', ['em_andamento'])
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const pedidosPendentes = await db('pedidos')
                    .where('status', 'aberto')
                    .whereNull('responsavel_id')
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const pedidosFinalizadosPorMim = await db('pedidos')
                    .where('responsavel_id', usuarioLogado.id)
                    .where('status', 'finalizado')
                    .count('* as total')
                    .first() as { total: number } | undefined;

                const pedidosRecentes = await db('pedidos')
                    .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                    .select(
                        'pedidos.*',
                        'c.nome as cliente_nome'
                    )
                    .where('pedidos.responsavel_id', usuarioLogado.id)
                    .orderBy('pedidos.created_at', 'desc')
                    .limit(5);

                dashboard = {
                    ...dashboard,
                    estatisticas: {
                        total_pedidos: Number(totalPedidos?.total || 0),
                        minhas_demandas: Number(meusPedidos?.total || 0),
                        pedidos_pendentes: Number(pedidosPendentes?.total || 0),
                        pedidos_finalizados: Number(pedidosFinalizadosPorMim?.total || 0)
                    },
                    meus_pedidos_recentes: pedidosRecentes
                };
            }

            res.json(dashboard);
        } catch (error) {
            console.error('Erro no dashboard:', error);
            res.status(500).json({ erro: 'Erro ao carregar dashboard' });
        }
    },

    async pedidosAbertos(req: AuthRequest, res: Response) {
        const usuarioLogado = req.user!;

        try {
            let query = db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome',
                    'r.nome as responsavel_nome'
                )
                .whereIn('pedidos.status', ['aberto', 'em_andamento']);

            // Cliente vê apenas seus pedidos
            if (usuarioLogado.nivel_acesso === 'cliente') {
                query = query.where('pedidos.cliente_id', usuarioLogado.id);
            }

            const pedidos = await query.orderBy('pedidos.created_at', 'desc');

            res.json({
                pedidos,
                total: pedidos.length
            });
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar pedidos abertos' });
        }
    },

    async entregasFinalizadas(req: AuthRequest, res: Response) {
        const usuarioLogado = req.user!;

        try {
            let query = db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome',
                    'r.nome as responsavel_nome'
                )
                .where('pedidos.status', 'finalizado');

            // Cliente vê apenas seus pedidos
            if (usuarioLogado.nivel_acesso === 'cliente') {
                query = query.where('pedidos.cliente_id', usuarioLogado.id);
            }

            const entregas = await query.orderBy('pedidos.updated_at', 'desc');

            res.json({
                entregas,
                total: entregas.length
            });
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar entregas' });
        }
    },

    async listarClientes(req: AuthRequest, res: Response) {
        // Apenas admin e colaborador podem ver clientes
        const usuarioLogado = req.user!;

        if (usuarioLogado.nivel_acesso === 'cliente') {
            return res.status(403).json({ erro: 'Sem permissão' });
        }

        try {
            const clientes = await db('usuarios')
                .leftJoin('pedidos', 'usuarios.id', 'pedidos.cliente_id')
                .select(
                    'usuarios.id',
                    'usuarios.nome',
                    'usuarios.email',
                    'usuarios.ativo',
                    'usuarios.created_at'
                )
                .count('pedidos.id as total_pedidos')
                .where('usuarios.nivel_acesso', 'cliente')
                .groupBy('usuarios.id')
                .orderBy('usuarios.created_at', 'desc');

            res.json({
                clientes,
                total: clientes.length
            });
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao listar clientes' });
        }
    }
};
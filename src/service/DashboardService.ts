import { db } from '../database';

export const DashboardService = {
    async obterDashboard(usuarioLogado: any) {
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

            const pedidosPorServico = await db('pedidos')
                .select('tipo_servico')
                .count('* as quantidade')
                .whereNotNull('tipo_servico')
                .groupBy('tipo_servico');

            const pedidosPendentes = await db('pedidos')
                .where('status', 'pendente')
                .count('* as total')
                .first() as { total: number } | undefined;

            const pedidosEmAndamento = await db('pedidos')
                .where('status', 'em_andamento')
                .count('* as total')
                .first() as { total: number } | undefined;

            const pedidosAtrasados = await db('pedidos')
                .where('status', 'atrasado')
                .count('* as total')
                .first() as { total: number } | undefined;

            const pedidosEntregues = await db('pedidos')
                .where('status', 'entregue')
                .count('* as total')
                .first() as { total: number } | undefined;

            const pedidosCancelados = await db('pedidos')
                .where('status', 'cancelado')
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

            const pedidosUrgentes = await db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome'
                )
                .where('pedidos.status', 'atrasado')
                .orWhere('pedidos.prioridade', 'urgente')
                .orderBy('pedidos.prazo_entrega', 'asc')
                .limit(5);

            const proximasEntregas = await db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome',
                    'r.nome as responsavel_nome'
                )
                .whereIn('pedidos.status', ['em_andamento', 'atrasado'])
                .whereNotNull('pedidos.prazo_entrega')
                .orderBy('pedidos.prazo_entrega', 'asc')
                .limit(5);

            dashboard = {
                ...dashboard,
                estatisticas: {
                    total_pedidos: Number(totalPedidos?.total || 0),
                    pedidos_por_status: pedidosPorStatus,
                    pedidos_por_servico: pedidosPorServico,
                    pedidos_pendentes: Number(pedidosPendentes?.total || 0),
                    pedidos_em_andamento: Number(pedidosEmAndamento?.total || 0),
                    pedidos_atrasados: Number(pedidosAtrasados?.total || 0),
                    pedidos_entregues: Number(pedidosEntregues?.total || 0),
                    pedidos_cancelados: Number(pedidosCancelados?.total || 0),
                    total_clientes: Number(totalClientes?.total || 0),
                    total_colaboradores: Number(totalColaboradores?.total || 0)
                },
                pedidos_recentes: pedidosRecentes,
                avisos: {
                    pedidos_urgentes: pedidosUrgentes,
                    proximas_entregas: proximasEntregas
                }
            };
        } else if (usuarioLogado.nivel_acesso === 'colaborador') {
            const totalPedidos = await db('pedidos').count('* as total').first() as { total: number } | undefined;

            const meusPedidos = await db('pedidos')
                .where('responsavel_id', usuarioLogado.id)
                .whereIn('status', ['em_andamento', 'atrasado'])
                .count('* as total')
                .first() as { total: number } | undefined;

            const pedidosPorServico = await db('pedidos')
                .select('tipo_servico')
                .count('* as quantidade')
                .where('responsavel_id', usuarioLogado.id)
                .whereNotNull('tipo_servico')
                .groupBy('tipo_servico');

            const pedidosPorStatus = await db('pedidos')
                .select('status')
                .count('* as quantidade')
                .where('responsavel_id', usuarioLogado.id)
                .groupBy('status');

            const pedidosPendentes = await db('pedidos')
                .where('status', 'pendente')
                .count('* as total')
                .first() as { total: number } | undefined;

            const pedidosEntreguesPorMim = await db('pedidos')
                .where('responsavel_id', usuarioLogado.id)
                .where('status', 'entregue')
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

            const meusUrgentes = await db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome'
                )
                .where('pedidos.responsavel_id', usuarioLogado.id)
                .where(function () {
                    this.where('pedidos.status', 'atrasado')
                        .orWhere('pedidos.prioridade', 'urgente');
                })
                .orderBy('pedidos.prazo_entrega', 'asc')
                .limit(5);

            const minhasProximasEntregas = await db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome'
                )
                .where('pedidos.responsavel_id', usuarioLogado.id)
                .whereIn('pedidos.status', ['em_andamento', 'atrasado'])
                .whereNotNull('pedidos.prazo_entrega')
                .orderBy('pedidos.prazo_entrega', 'asc')
                .limit(5);

            dashboard = {
                ...dashboard,
                estatisticas: {
                    total_pedidos: Number(totalPedidos?.total || 0),
                    minhas_demandas: Number(meusPedidos?.total || 0),
                    pedidos_por_servico: pedidosPorServico,
                    pedidos_por_status: pedidosPorStatus,
                    pedidos_pendentes: Number(pedidosPendentes?.total || 0),
                    pedidos_entregues: Number(pedidosEntreguesPorMim?.total || 0)
                },
                meus_pedidos_recentes: pedidosRecentes,
                avisos: {
                    meus_urgentes: meusUrgentes,
                    minhas_proximas_entregas: minhasProximasEntregas
                }
            };
        }

        return dashboard;
    },

    async pedidosAbertos(usuarioLogado: any) {
        let query = db('pedidos')
            .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
            .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
            .select(
                'pedidos.*',
                'c.nome as cliente_nome',
                'r.nome as responsavel_nome'
            )
            .whereIn('pedidos.status', ['pendente', 'em_andamento', 'atrasado']);

        // Cliente vê apenas seus pedidos
        if (usuarioLogado.nivel_acesso === 'cliente') {
            query = query.where('pedidos.cliente_id', usuarioLogado.id);
        }

        const pedidos = await query.orderBy('pedidos.created_at', 'desc');

        return pedidos;
    },

    async entregasFinalizadas(usuarioLogado: any) {
        let query = db('pedidos')
            .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
            .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
            .select(
                'pedidos.*',
                'c.nome as cliente_nome',
                'r.nome as responsavel_nome'
            )
            .whereIn('pedidos.status', ['entregue', 'cancelado']);

        // Cliente vê apenas seus pedidos
        if (usuarioLogado.nivel_acesso === 'cliente') {
            query = query.where('pedidos.cliente_id', usuarioLogado.id);
        }

        const entregas = await query.orderBy('pedidos.updated_at', 'desc');

        return entregas;
    },

    async listarClientes() {
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

        return clientes;
    }
};
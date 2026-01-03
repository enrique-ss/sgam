import { db } from '../database';

export const PedidoService = {
    async listar(usuarioLogado: any, filtros: any) {
        let query = db('pedidos')
            .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
            .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
            .select(
                'pedidos.*',
                'c.nome as cliente_nome',
                'c.email as cliente_email',
                'r.nome as responsavel_nome'
            );

        // Cliente só vê seus próprios pedidos
        if (usuarioLogado.nivel_acesso === 'cliente') {
            query = query.where('pedidos.cliente_id', usuarioLogado.id);
        }

        // Filtro por status
        if (filtros.status) {
            const statusArray = filtros.status.split(',');
            query = query.whereIn('pedidos.status', statusArray);
        }

        // Filtro por responsável
        if (filtros.responsavel_id) {
            query = query.where('pedidos.responsavel_id', filtros.responsavel_id);
        }

        const pedidos = await query.orderBy('pedidos.created_at', 'desc');

        // Atualizar status para atrasado se necessário
        await this.atualizarStatusAtrasados();

        return pedidos;
    },

    async obter(id: number, usuarioLogado: any) {
        const pedido = await db('pedidos')
            .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
            .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
            .select(
                'pedidos.*',
                'c.nome as cliente_nome',
                'c.email as cliente_email',
                'r.nome as responsavel_nome'
            )
            .where('pedidos.id', id)
            .first();

        if (!pedido) {
            throw new Error('PEDIDO_NAO_ENCONTRADO');
        }

        // Cliente só vê seus próprios pedidos
        if (usuarioLogado.nivel_acesso === 'cliente' && pedido.cliente_id !== usuarioLogado.id) {
            throw new Error('SEM_PERMISSAO');
        }

        const demandas = await db('demandas')
            .leftJoin('usuarios', 'demandas.responsavel_id', 'usuarios.id')
            .select('demandas.*', 'usuarios.nome as responsavel_nome')
            .where('demandas.pedido_id', id)
            .orderBy('demandas.created_at', 'desc');

        return { pedido, demandas };
    },

    async criar(dados: any, usuarioLogado: any) {
        let clienteIdFinal = usuarioLogado.id;

        // Admin/Colaborador deve especificar cliente_id
        if (usuarioLogado.nivel_acesso !== 'cliente') {
            if (!dados.cliente_id) {
                throw new Error('ADMIN_COLABORADOR_DEVE_ESPECIFICAR_CLIENTE');
            }

            const clienteExiste = await db('usuarios')
                .where({ id: dados.cliente_id, nivel_acesso: 'cliente' })
                .first();

            if (!clienteExiste) {
                throw new Error('CLIENTE_NAO_ENCONTRADO');
            }

            clienteIdFinal = dados.cliente_id;
        }

        const [id] = await db('pedidos').insert({
            cliente_id: clienteIdFinal,
            titulo: dados.titulo,
            tipo_servico: dados.tipo_servico,
            descricao: dados.descricao,
            orcamento: dados.orcamento,
            prazo_entrega: dados.prazo_entrega,
            status: 'pendente',
            prioridade: usuarioLogado.nivel_acesso !== 'cliente' ? dados.prioridade : null,
            responsavel_id: null,
            data_conclusao: null
        });

        return await db('pedidos').where({ id }).first();
    },

    async atualizar(id: number, dados: any, usuarioLogado: any) {
        const pedido = await db('pedidos').where({ id }).first();

        if (!pedido) {
            throw new Error('PEDIDO_NAO_ENCONTRADO');
        }

        // Cliente não pode alterar status/responsável/prioridade
        if (usuarioLogado.nivel_acesso === 'cliente') {
            if (pedido.cliente_id !== usuarioLogado.id) {
                throw new Error('SEM_PERMISSAO');
            }

            if (dados.status || dados.responsavel_id !== undefined || dados.prioridade !== undefined) {
                throw new Error('CLIENTE_NAO_PODE_ALTERAR_STATUS_RESPONSAVEL_PRIORIDADE');
            }
        }

        const updateData: any = { updated_at: db.fn.now() };

        if (dados.titulo) updateData.titulo = dados.titulo;
        if (dados.tipo_servico) updateData.tipo_servico = dados.tipo_servico;
        if (dados.descricao !== undefined) updateData.descricao = dados.descricao;
        if (dados.orcamento !== undefined) updateData.orcamento = dados.orcamento;
        if (dados.prazo_entrega) updateData.prazo_entrega = dados.prazo_entrega;

        // Apenas admin/colaborador altera status/responsável/prioridade
        if (usuarioLogado.nivel_acesso !== 'cliente') {
            if (dados.status) {
                const statusValidos = ['pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado'];
                if (!statusValidos.includes(dados.status)) {
                    throw new Error('STATUS_INVALIDO');
                }

                updateData.status = dados.status;

                // Ao assumir (pendente->em_andamento), atribui responsável e prioridade
                if (dados.status === 'em_andamento' && pedido.status === 'pendente') {
                    updateData.responsavel_id = dados.responsavel_id || usuarioLogado.id;
                    if (dados.prioridade) {
                        const prioridadesValidas = ['baixa', 'media', 'alta', 'urgente'];
                        if (!prioridadesValidas.includes(dados.prioridade)) {
                            throw new Error('PRIORIDADE_INVALIDA');
                        }
                        updateData.prioridade = dados.prioridade;
                    }
                }

                // Ao concluir ou cancelar, registra data de conclusão
                if ((dados.status === 'entregue' || dados.status === 'cancelado') &&
                    (pedido.status !== 'entregue' && pedido.status !== 'cancelado')) {
                    updateData.data_conclusao = db.fn.now();
                }

                // Ao recusar (em_andamento->pendente), remove responsável e prioridade
                if (dados.status === 'pendente' && pedido.status === 'em_andamento') {
                    updateData.responsavel_id = null;
                    updateData.prioridade = null;
                    updateData.data_conclusao = null;
                }
            }

            // Pode alterar prioridade apenas em pedidos em andamento
            if (dados.prioridade !== undefined && pedido.status === 'em_andamento') {
                const prioridadesValidas = ['baixa', 'media', 'alta', 'urgente'];
                if (!prioridadesValidas.includes(dados.prioridade)) {
                    throw new Error('PRIORIDADE_INVALIDA');
                }
                updateData.prioridade = dados.prioridade;
            }

            if (dados.responsavel_id !== undefined) {
                updateData.responsavel_id = dados.responsavel_id;
            }
        }

        await db('pedidos').where({ id }).update(updateData);

        return await db('pedidos')
            .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
            .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
            .select(
                'pedidos.*',
                'c.nome as cliente_nome',
                'r.nome as responsavel_nome'
            )
            .where('pedidos.id', id)
            .first();
    },

    async deletar(id: number, usuarioLogado: any) {
        const pedido = await db('pedidos').where({ id }).first();

        if (!pedido) {
            throw new Error('PEDIDO_NAO_ENCONTRADO');
        }

        // Cliente só deleta seus pedidos não finalizados
        if (usuarioLogado.nivel_acesso === 'cliente') {
            if (pedido.cliente_id !== usuarioLogado.id) {
                throw new Error('SEM_PERMISSAO');
            }

            if (pedido.status === 'entregue') {
                throw new Error('NAO_PODE_CANCELAR_PEDIDO_ENTREGUE');
            }
        }

        // Colaborador só deleta pedidos que é responsável
        if (usuarioLogado.nivel_acesso === 'colaborador') {
            if (pedido.responsavel_id && pedido.responsavel_id !== usuarioLogado.id) {
                throw new Error('COLABORADOR_SO_DELETA_SEUS_PEDIDOS');
            }
        }

        await db('demandas').where({ pedido_id: id }).del();
        await db('pedidos').where({ id }).del();
    },

    async atualizarStatusAtrasados() {
        const hoje = new Date().toISOString().split('T')[0];

        await db('pedidos')
            .where('status', 'em_andamento')
            .where('prazo_entrega', '<', hoje)
            .update({ status: 'atrasado' });
    },

    async criarDemanda(pedido_id: number, dados: any, usuarioLogado: any) {
        const pedido = await db('pedidos').where({ id: pedido_id }).first();

        if (!pedido) {
            throw new Error('PEDIDO_NAO_ENCONTRADO');
        }

        const [id] = await db('demandas').insert({
            pedido_id,
            titulo: dados.titulo,
            descricao: dados.descricao,
            responsavel_id: dados.responsavel_id || usuarioLogado.id,
            status: 'aberta'
        });

        return await db('demandas')
            .leftJoin('usuarios', 'demandas.responsavel_id', 'usuarios.id')
            .select('demandas.*', 'usuarios.nome as responsavel_nome')
            .where('demandas.id', id)
            .first();
    },

    async atualizarDemanda(id: number, dados: any, usuarioLogado: any) {
        const demanda = await db('demandas').where({ id }).first();

        if (!demanda) {
            throw new Error('DEMANDA_NAO_ENCONTRADA');
        }

        // Colaborador só atualiza suas demandas
        if (usuarioLogado.nivel_acesso === 'colaborador') {
            if (demanda.responsavel_id !== usuarioLogado.id) {
                throw new Error('COLABORADOR_SO_ATUALIZA_SUAS_DEMANDAS');
            }
        }

        const updateData: any = { updated_at: db.fn.now() };

        if (dados.titulo) updateData.titulo = dados.titulo;
        if (dados.descricao !== undefined) updateData.descricao = dados.descricao;

        if (dados.status) {
            const statusValidos = ['aberta', 'em_progresso', 'concluida'];
            if (!statusValidos.includes(dados.status)) {
                throw new Error('STATUS_DEMANDA_INVALIDO');
            }
            updateData.status = dados.status;
        }

        if (dados.responsavel_id !== undefined && usuarioLogado.nivel_acesso === 'admin') {
            updateData.responsavel_id = dados.responsavel_id;
        }

        await db('demandas').where({ id }).update(updateData);

        return await db('demandas')
            .leftJoin('usuarios', 'demandas.responsavel_id', 'usuarios.id')
            .select('demandas.*', 'usuarios.nome as responsavel_nome')
            .where('demandas.id', id)
            .first();
    }
};
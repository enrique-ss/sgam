import { Response } from 'express';
import { db } from '../database';
import { AuthRequest } from '../middlewares/auth';

export const PedidoController = {
    async listar(req: AuthRequest, res: Response) {
        const usuarioLogado = req.user!;
        const { status, responsavel_id } = req.query;

        try {
            let query = db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome',
                    'c.email as cliente_email',
                    'r.nome as responsavel_nome'
                );

            // REGRA: Cliente só vê seus próprios pedidos
            if (usuarioLogado.nivel_acesso === 'cliente') {
                query = query.where('pedidos.cliente_id', usuarioLogado.id);
            }

            // Filtro por status (aceita múltiplos separados por vírgula)
            if (status) {
                const statusArray = (status as string).split(',');
                query = query.whereIn('pedidos.status', statusArray);
            }

            // Filtro por responsável (para minhas demandas)
            if (responsavel_id) {
                query = query.where('pedidos.responsavel_id', responsavel_id as string);
            }

            const pedidos = await query.orderBy('pedidos.created_at', 'desc');

            res.json({
                pedidos,
                total: pedidos.length
            });
        } catch (error) {
            console.error('Erro ao listar:', error);
            res.status(500).json({ erro: 'Erro ao listar pedidos' });
        }
    },

    async obter(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const usuarioLogado = req.user!;

        try {
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
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            // REGRA: Cliente só vê seus próprios pedidos
            if (usuarioLogado.nivel_acesso === 'cliente' &&
                pedido.cliente_id !== usuarioLogado.id) {
                return res.status(403).json({ erro: 'Sem permissão' });
            }

            const demandas = await db('demandas')
                .leftJoin('usuarios', 'demandas.responsavel_id', 'usuarios.id')
                .select('demandas.*', 'usuarios.nome as responsavel_nome')
                .where('demandas.pedido_id', id)
                .orderBy('demandas.created_at', 'desc');

            res.json({
                pedido,
                demandas
            });
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao obter pedido' });
        }
    },

    async criar(req: AuthRequest, res: Response) {
        const { titulo, descricao, prioridade, data_entrega, cliente_id } = req.body;
        const usuarioLogado = req.user!;

        if (!titulo) {
            return res.status(400).json({ erro: 'Título obrigatório' });
        }

        try {
            let clienteIdFinal = usuarioLogado.id;

            // REGRA: Admin/Colaborador deve especificar cliente_id
            if (usuarioLogado.nivel_acesso !== 'cliente') {
                if (!cliente_id) {
                    return res.status(400).json({
                        erro: 'Admin/Colaborador deve especificar cliente_id'
                    });
                }

                const clienteExiste = await db('usuarios')
                    .where({ id: cliente_id, nivel_acesso: 'cliente' })
                    .first();

                if (!clienteExiste) {
                    return res.status(404).json({ erro: 'Cliente não encontrado' });
                }

                clienteIdFinal = cliente_id;
            }

            // REGRA: Todo pedido começa "aberto" sem responsável
            const [id] = await db('pedidos').insert({
                cliente_id: clienteIdFinal,
                titulo,
                descricao,
                status: 'aberto',
                prioridade: prioridade || 'media',
                data_entrega,
                responsavel_id: null
            });

            const pedido = await db('pedidos').where({ id }).first();

            res.status(201).json({
                mensagem: 'Pedido criado. Aguardando aceite de colaborador.',
                pedido
            });
        } catch (error) {
            console.error('Erro ao criar:', error);
            res.status(500).json({ erro: 'Erro ao criar pedido' });
        }
    },

    async atualizar(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { titulo, descricao, status, prioridade, responsavel_id, data_entrega } = req.body;
        const usuarioLogado = req.user!;

        try {
            const pedido = await db('pedidos').where({ id }).first();

            if (!pedido) {
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            // REGRA: Cliente não pode alterar status/responsável
            if (usuarioLogado.nivel_acesso === 'cliente') {
                if (pedido.cliente_id !== usuarioLogado.id) {
                    return res.status(403).json({ erro: 'Sem permissão' });
                }

                if (status || responsavel_id !== undefined) {
                    return res.status(403).json({
                        erro: 'Cliente não pode alterar status ou responsável'
                    });
                }
            }

            const updateData: any = { updated_at: db.fn.now() };

            if (titulo) updateData.titulo = titulo;
            if (descricao !== undefined) updateData.descricao = descricao;
            if (prioridade) updateData.prioridade = prioridade;
            if (data_entrega) updateData.data_entrega = data_entrega;

            // REGRA: Apenas admin/colaborador altera status/responsável
            if (usuarioLogado.nivel_acesso !== 'cliente') {
                if (status) {
                    const statusValidos = ['aberto', 'em_andamento', 'finalizado', 'cancelado'];
                    if (!statusValidos.includes(status)) {
                        return res.status(400).json({ erro: 'Status inválido' });
                    }

                    updateData.status = status;

                    // REGRA: Ao aceitar (aberto->em_andamento), atribui responsável
                    if (status === 'em_andamento' && pedido.status === 'aberto') {
                        updateData.responsavel_id = responsavel_id || usuarioLogado.id;
                    }

                    // REGRA: Ao recusar, remove responsável
                    if (status === 'aberto' && pedido.status === 'em_andamento') {
                        updateData.responsavel_id = null;
                    }
                }

                if (responsavel_id !== undefined) {
                    updateData.responsavel_id = responsavel_id;
                }
            }

            await db('pedidos').where({ id }).update(updateData);

            const pedidoAtualizado = await db('pedidos')
                .leftJoin('usuarios as c', 'pedidos.cliente_id', 'c.id')
                .leftJoin('usuarios as r', 'pedidos.responsavel_id', 'r.id')
                .select(
                    'pedidos.*',
                    'c.nome as cliente_nome',
                    'r.nome as responsavel_nome'
                )
                .where('pedidos.id', id)
                .first();

            res.json({
                mensagem: 'Pedido atualizado',
                pedido: pedidoAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            res.status(500).json({ erro: 'Erro ao atualizar pedido' });
        }
    },

    async deletar(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const usuarioLogado = req.user!;

        try {
            const pedido = await db('pedidos').where({ id }).first();

            if (!pedido) {
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            // REGRA: Cliente só deleta seus pedidos não finalizados
            if (usuarioLogado.nivel_acesso === 'cliente') {
                if (pedido.cliente_id !== usuarioLogado.id) {
                    return res.status(403).json({ erro: 'Sem permissão' });
                }

                if (pedido.status === 'finalizado') {
                    return res.status(400).json({
                        erro: 'Não é possível cancelar pedido finalizado'
                    });
                }
            }

            // REGRA: Colaborador só deleta pedidos que é responsável
            if (usuarioLogado.nivel_acesso === 'colaborador') {
                if (pedido.responsavel_id && pedido.responsavel_id !== usuarioLogado.id) {
                    return res.status(403).json({
                        erro: 'Você só pode deletar pedidos que você é responsável'
                    });
                }
            }

            await db('demandas').where({ pedido_id: id }).del();
            await db('pedidos').where({ id }).del();

            res.json({ mensagem: 'Pedido deletado' });
        } catch (error) {
            console.error('Erro ao deletar:', error);
            res.status(500).json({ erro: 'Erro ao deletar pedido' });
        }
    },

    async criarDemanda(req: AuthRequest, res: Response) {
        const { pedido_id } = req.params;
        const { titulo, descricao, responsavel_id } = req.body;
        const usuarioLogado = req.user!;

        if (!titulo) {
            return res.status(400).json({ erro: 'Título obrigatório' });
        }

        // REGRA: Apenas admin/colaborador cria demandas
        if (usuarioLogado.nivel_acesso === 'cliente') {
            return res.status(403).json({
                erro: 'Clientes não podem criar demandas'
            });
        }

        try {
            const pedido = await db('pedidos').where({ id: pedido_id }).first();

            if (!pedido) {
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            const [id] = await db('demandas').insert({
                pedido_id,
                titulo,
                descricao,
                responsavel_id: responsavel_id || usuarioLogado.id,
                status: 'aberta'
            });

            const demanda = await db('demandas')
                .leftJoin('usuarios', 'demandas.responsavel_id', 'usuarios.id')
                .select('demandas.*', 'usuarios.nome as responsavel_nome')
                .where('demandas.id', id)
                .first();

            res.status(201).json({
                mensagem: 'Demanda criada',
                demanda
            });
        } catch (error) {
            console.error('Erro ao criar demanda:', error);
            res.status(500).json({ erro: 'Erro ao criar demanda' });
        }
    },

    async atualizarDemanda(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { titulo, descricao, status, responsavel_id } = req.body;
        const usuarioLogado = req.user!;

        // REGRA: Apenas admin/colaborador atualiza demandas
        if (usuarioLogado.nivel_acesso === 'cliente') {
            return res.status(403).json({ erro: 'Clientes não podem atualizar demandas' });
        }

        try {
            const demanda = await db('demandas').where({ id }).first();

            if (!demanda) {
                return res.status(404).json({ erro: 'Demanda não encontrada' });
            }

            // REGRA: Colaborador só atualiza suas demandas
            if (usuarioLogado.nivel_acesso === 'colaborador') {
                if (demanda.responsavel_id !== usuarioLogado.id) {
                    return res.status(403).json({
                        erro: 'Você só pode atualizar suas demandas'
                    });
                }
            }

            const updateData: any = { updated_at: db.fn.now() };

            if (titulo) updateData.titulo = titulo;
            if (descricao !== undefined) updateData.descricao = descricao;

            if (status) {
                const statusValidos = ['aberta', 'em_progresso', 'concluida'];
                if (!statusValidos.includes(status)) {
                    return res.status(400).json({ erro: 'Status inválido' });
                }
                updateData.status = status;
            }

            if (responsavel_id !== undefined && usuarioLogado.nivel_acesso === 'admin') {
                updateData.responsavel_id = responsavel_id;
            }

            await db('demandas').where({ id }).update(updateData);

            const demandaAtualizada = await db('demandas')
                .leftJoin('usuarios', 'demandas.responsavel_id', 'usuarios.id')
                .select('demandas.*', 'usuarios.nome as responsavel_nome')
                .where('demandas.id', id)
                .first();

            res.json({
                mensagem: 'Demanda atualizada',
                demanda: demandaAtualizada
            });
        } catch (error) {
            console.error('Erro ao atualizar demanda:', error);
            res.status(500).json({ erro: 'Erro ao atualizar demanda' });
        }
    }
};
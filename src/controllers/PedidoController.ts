import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PedidoService } from '../service/PedidoService';

export const PedidoController = {
    async listar(req: AuthRequest, res: Response) {
        try {
            const usuarioLogado = req.user!;
            const filtros = req.query;

            const pedidos = await PedidoService.listar(usuarioLogado, filtros);

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
        try {
            const { id } = req.params;
            const usuarioLogado = req.user!;

            const resultado = await PedidoService.obter(parseInt(id), usuarioLogado);

            res.json(resultado);
        } catch (error: any) {
            console.error('Erro ao obter:', error);

            if (error.message === 'PEDIDO_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            if (error.message === 'SEM_PERMISSAO') {
                return res.status(403).json({ erro: 'Sem permissão' });
            }

            res.status(500).json({ erro: 'Erro ao obter pedido' });
        }
    },

    async criar(req: AuthRequest, res: Response) {
        try {
            const { titulo } = req.body;
            const usuarioLogado = req.user!;

            if (!titulo) {
                return res.status(400).json({ erro: 'Título obrigatório' });
            }

            const pedido = await PedidoService.criar(req.body, usuarioLogado);

            res.status(201).json({
                mensagem: 'Pedido criado. Aguardando aceite de colaborador.',
                pedido
            });
        } catch (error: any) {
            console.error('Erro ao criar:', error);

            if (error.message === 'ADMIN_COLABORADOR_DEVE_ESPECIFICAR_CLIENTE') {
                return res.status(400).json({
                    erro: 'Admin/Colaborador deve especificar cliente_id'
                });
            }

            if (error.message === 'CLIENTE_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Cliente não encontrado' });
            }

            res.status(500).json({ erro: 'Erro ao criar pedido' });
        }
    },

    async atualizar(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioLogado = req.user!;

            const pedido = await PedidoService.atualizar(parseInt(id), req.body, usuarioLogado);

            res.json({
                mensagem: 'Pedido atualizado',
                pedido
            });
        } catch (error: any) {
            console.error('Erro ao atualizar:', error);

            if (error.message === 'PEDIDO_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            if (error.message === 'SEM_PERMISSAO') {
                return res.status(403).json({ erro: 'Sem permissão' });
            }

            if (error.message === 'CLIENTE_NAO_PODE_ALTERAR_STATUS_RESPONSAVEL_PRIORIDADE') {
                return res.status(403).json({
                    erro: 'Cliente não pode alterar status, responsável ou prioridade'
                });
            }

            if (error.message === 'STATUS_INVALIDO') {
                return res.status(400).json({ erro: 'Status inválido' });
            }

            if (error.message === 'PRIORIDADE_INVALIDA') {
                return res.status(400).json({ erro: 'Prioridade inválida' });
            }

            res.status(500).json({ erro: 'Erro ao atualizar pedido' });
        }
    },

    async deletar(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioLogado = req.user!;

            await PedidoService.deletar(parseInt(id), usuarioLogado);

            res.json({ mensagem: 'Pedido deletado' });
        } catch (error: any) {
            console.error('Erro ao deletar:', error);

            if (error.message === 'PEDIDO_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            if (error.message === 'SEM_PERMISSAO') {
                return res.status(403).json({ erro: 'Sem permissão' });
            }

            if (error.message === 'NAO_PODE_CANCELAR_PEDIDO_ENTREGUE') {
                return res.status(400).json({
                    erro: 'Não é possível cancelar pedido entregue'
                });
            }

            if (error.message === 'COLABORADOR_SO_DELETA_SEUS_PEDIDOS') {
                return res.status(403).json({
                    erro: 'Você só pode deletar pedidos que você é responsável'
                });
            }

            res.status(500).json({ erro: 'Erro ao deletar pedido' });
        }
    },

    async criarDemanda(req: AuthRequest, res: Response) {
        try {
            const { pedido_id } = req.params;
            const { titulo } = req.body;
            const usuarioLogado = req.user!;

            if (!titulo) {
                return res.status(400).json({ erro: 'Título obrigatório' });
            }

            const demanda = await PedidoService.criarDemanda(parseInt(pedido_id), req.body, usuarioLogado);

            res.status(201).json({
                mensagem: 'Demanda criada',
                demanda
            });
        } catch (error: any) {
            console.error('Erro ao criar demanda:', error);

            if (error.message === 'PEDIDO_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Pedido não encontrado' });
            }

            res.status(500).json({ erro: 'Erro ao criar demanda' });
        }
    },

    async atualizarDemanda(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioLogado = req.user!;

            const demanda = await PedidoService.atualizarDemanda(parseInt(id), req.body, usuarioLogado);

            res.json({
                mensagem: 'Demanda atualizada',
                demanda
            });
        } catch (error: any) {
            console.error('Erro ao atualizar demanda:', error);

            if (error.message === 'DEMANDA_NAO_ENCONTRADA') {
                return res.status(404).json({ erro: 'Demanda não encontrada' });
            }

            if (error.message === 'COLABORADOR_SO_ATUALIZA_SUAS_DEMANDAS') {
                return res.status(403).json({
                    erro: 'Você só pode atualizar suas demandas'
                });
            }

            if (error.message === 'STATUS_DEMANDA_INVALIDO') {
                return res.status(400).json({ erro: 'Status inválido' });
            }

            res.status(500).json({ erro: 'Erro ao atualizar demanda' });
        }
    }
};
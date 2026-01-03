import { Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../database';
import { AuthRequest } from '../middlewares/auth';

export const UsuarioController = {
    async listar(req: AuthRequest, res: Response) {
        const usuarioLogado = req.user!;

        // REGRA: Apenas admin pode listar todos os usuários
        if (usuarioLogado.nivel_acesso !== 'admin') {
            return res.status(403).json({
                erro: 'Apenas administradores podem listar usuários'
            });
        }

        try {
            const usuarios = await db('usuarios')
                .select('id', 'nome', 'email', 'nivel_acesso', 'ativo', 'created_at', 'updated_at')
                .orderBy('created_at', 'desc');

            res.json({
                usuarios,
                total: usuarios.length
            });
        } catch (error) {
            console.error('Erro ao listar:', error);
            res.status(500).json({ erro: 'Erro ao listar usuários' });
        }
    },

    async obter(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const usuarioLogado = req.user!;

        // REGRA: Cliente só pode ver seus próprios dados
        // Admin/Colaborador podem ver qualquer usuário
        if (usuarioLogado.nivel_acesso === 'cliente' &&
            parseInt(id) !== usuarioLogado.id) {
            return res.status(403).json({
                erro: 'Você só pode visualizar seus próprios dados'
            });
        }

        try {
            const usuario = await db('usuarios')
                .select('id', 'nome', 'email', 'nivel_acesso', 'ativo', 'created_at', 'updated_at')
                .where({ id })
                .first();

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            // Se for cliente vendo outro usuário, retorna dados limitados
            if (usuarioLogado.nivel_acesso === 'cliente' && parseInt(id) !== usuarioLogado.id) {
                return res.json({
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome
                    }
                });
            }

            res.json({ usuario });
        } catch (error) {
            console.error('Erro ao obter:', error);
            res.status(500).json({ erro: 'Erro ao obter usuário' });
        }
    },

    async criar(req: AuthRequest, res: Response) {
        const { nome, email, senha, nivel_acesso } = req.body;
        const usuarioLogado = req.user!;

        // REGRA: Apenas admin pode criar novos usuários (admin/colaborador)
        if (usuarioLogado.nivel_acesso !== 'admin') {
            return res.status(403).json({
                erro: 'Apenas administradores podem criar usuários',
                mensagem: 'Use o endpoint de registro para criar contas de cliente'
            });
        }

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
        }

        const niveisValidos = ['admin', 'colaborador', 'cliente'];
        if (nivel_acesso && !niveisValidos.includes(nivel_acesso)) {
            return res.status(400).json({
                erro: 'Nível de acesso inválido',
                validos: niveisValidos
            });
        }

        try {
            const emailExiste = await db('usuarios').where({ email }).first();

            if (emailExiste) {
                return res.status(409).json({ erro: 'Email já cadastrado' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);
            const nivelFinal = nivel_acesso || 'colaborador';

            const [id] = await db('usuarios').insert({
                nome,
                email,
                senha: senhaHash,
                nivel_acesso: nivelFinal,
                ativo: true
            });

            const usuario = await db('usuarios')
                .select('id', 'nome', 'email', 'nivel_acesso', 'ativo', 'created_at')
                .where({ id })
                .first();

            res.status(201).json({
                mensagem: `Usuário ${nivelFinal} criado com sucesso`,
                usuario
            });
        } catch (error) {
            console.error('Erro ao criar:', error);
            res.status(500).json({ erro: 'Erro ao criar usuário' });
        }
    },

    async atualizar(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { nome, email, senha, nivel_acesso, ativo } = req.body;
        const usuarioLogado = req.user!;

        // REGRA: Admin pode atualizar qualquer usuário
        // Usuários podem atualizar apenas seus próprios dados (com restrições)
        const podeAtualizar =
            usuarioLogado.nivel_acesso === 'admin' ||
            parseInt(id) === usuarioLogado.id;

        if (!podeAtualizar) {
            return res.status(403).json({
                erro: 'Você só pode alterar seus próprios dados'
            });
        }

        // REGRA: Apenas admin pode alterar nível de acesso e status ativo
        if (usuarioLogado.nivel_acesso !== 'admin' &&
            (nivel_acesso !== undefined || ativo !== undefined)) {
            return res.status(403).json({
                erro: 'Apenas administradores podem alterar nível de acesso ou status ativo'
            });
        }

        // REGRA: Não pode alterar próprio nível de acesso (nem admin)
        if (parseInt(id) === usuarioLogado.id && nivel_acesso !== undefined) {
            return res.status(400).json({
                erro: 'Você não pode alterar seu próprio nível de acesso'
            });
        }

        // REGRA: Não pode desativar a si mesmo
        if (parseInt(id) === usuarioLogado.id && ativo === false) {
            return res.status(400).json({
                erro: 'Você não pode desativar sua própria conta'
            });
        }

        try {
            const usuarioExistente = await db('usuarios').where({ id }).first();

            if (!usuarioExistente) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            const updateData: any = { updated_at: db.fn.now() };

            if (nome) updateData.nome = nome;

            if (email) {
                // Verifica se email já está em uso por outro usuário
                const emailEmUso = await db('usuarios')
                    .where({ email })
                    .whereNot({ id })
                    .first();

                if (emailEmUso) {
                    return res.status(409).json({ erro: 'Email já está em uso' });
                }

                updateData.email = email;
            }

            if (senha) {
                updateData.senha = await bcrypt.hash(senha, 10);
            }

            // Apenas admin pode alterar estes campos
            if (usuarioLogado.nivel_acesso === 'admin') {
                if (nivel_acesso) {
                    const niveisValidos = ['admin', 'colaborador', 'cliente'];
                    if (!niveisValidos.includes(nivel_acesso)) {
                        return res.status(400).json({ erro: 'Nível de acesso inválido' });
                    }
                    updateData.nivel_acesso = nivel_acesso;
                }

                if (ativo !== undefined) {
                    updateData.ativo = ativo;
                }
            }

            await db('usuarios').where({ id }).update(updateData);

            const usuario = await db('usuarios')
                .select('id', 'nome', 'email', 'nivel_acesso', 'ativo', 'updated_at')
                .where({ id })
                .first();

            res.json({
                mensagem: 'Usuário atualizado com sucesso',
                usuario
            });
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            res.status(500).json({ erro: 'Erro ao atualizar usuário' });
        }
    },

    async deletar(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const usuarioLogado = req.user!;

        // REGRA: Apenas admin pode deletar usuários
        if (usuarioLogado.nivel_acesso !== 'admin') {
            return res.status(403).json({
                erro: 'Apenas administradores podem deletar usuários'
            });
        }

        // REGRA: Não pode deletar a si mesmo
        if (parseInt(id) === usuarioLogado.id) {
            return res.status(400).json({
                erro: 'Você não pode deletar sua própria conta'
            });
        }

        try {
            const usuario = await db('usuarios').where({ id }).first();

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            // Verifica se usuário tem pedidos vinculados
            const temPedidos = await db('pedidos')
                .where('cliente_id', id)
                .orWhere('responsavel_id', id)
                .first();

            if (temPedidos) {
                return res.status(400).json({
                    erro: 'Não é possível deletar usuário com pedidos vinculados',
                    mensagem: 'Desative o usuário ao invés de deletá-lo'
                });
            }

            await db('usuarios').where({ id }).del();

            res.json({
                mensagem: `Usuário ${usuario.nome} deletado com sucesso`
            });
        } catch (error) {
            console.error('Erro ao deletar:', error);
            res.status(500).json({ erro: 'Erro ao deletar usuário' });
        }
    }
};
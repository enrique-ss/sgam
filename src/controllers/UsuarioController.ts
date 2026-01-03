import { Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../database';
import { AuthRequest } from '../middlewares/auth';

export const UsuarioController = {
    async listar(req: AuthRequest, res: Response) {
        const usuarioLogado = req.user!;

        // REGRA: Apenas admin lista todos os usuários
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

        // REGRA: Cliente só vê seus próprios dados
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

            res.json({ usuario });
        } catch (error) {
            console.error('Erro ao obter:', error);
            res.status(500).json({ erro: 'Erro ao obter usuário' });
        }
    },

    async criar(req: AuthRequest, res: Response) {
        const { nome, email, senha, nivel_acesso } = req.body;
        const usuarioLogado = req.user!;

        // REGRA: Apenas admin cria usuários (admin/colaborador)
        if (usuarioLogado.nivel_acesso !== 'admin') {
            return res.status(403).json({
                erro: 'Apenas administradores podem criar usuários'
            });
        }

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Dados incompletos' });
        }

        const niveisValidos = ['admin', 'colaborador', 'cliente'];
        if (nivel_acesso && !niveisValidos.includes(nivel_acesso)) {
            return res.status(400).json({ erro: 'Nível de acesso inválido' });
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
                mensagem: `Usuário ${nivelFinal} criado`,
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

        // REGRA: Admin atualiza qualquer um, usuários só a si mesmos
        const podeAtualizar =
            usuarioLogado.nivel_acesso === 'admin' ||
            parseInt(id) === usuarioLogado.id;

        if (!podeAtualizar) {
            return res.status(403).json({
                erro: 'Você só pode alterar seus próprios dados'
            });
        }

        // REGRA: Apenas admin altera nível/status
        if (usuarioLogado.nivel_acesso !== 'admin' &&
            (nivel_acesso !== undefined || ativo !== undefined)) {
            return res.status(403).json({
                erro: 'Apenas admin pode alterar nível/status'
            });
        }

        // REGRA: Não altera próprio nível
        if (parseInt(id) === usuarioLogado.id && nivel_acesso !== undefined) {
            return res.status(400).json({
                erro: 'Você não pode alterar seu próprio nível'
            });
        }

        // REGRA: Não desativa a si mesmo
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
                const emailEmUso = await db('usuarios')
                    .where({ email })
                    .whereNot({ id })
                    .first();

                if (emailEmUso) {
                    return res.status(409).json({ erro: 'Email já em uso' });
                }

                updateData.email = email;
            }

            if (senha) {
                updateData.senha = await bcrypt.hash(senha, 10);
            }

            if (usuarioLogado.nivel_acesso === 'admin') {
                if (nivel_acesso) {
                    const niveisValidos = ['admin', 'colaborador', 'cliente'];
                    if (!niveisValidos.includes(nivel_acesso)) {
                        return res.status(400).json({ erro: 'Nível inválido' });
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
                mensagem: 'Usuário atualizado',
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

        // REGRA: Apenas admin deleta usuários
        if (usuarioLogado.nivel_acesso !== 'admin') {
            return res.status(403).json({
                erro: 'Apenas admin pode deletar usuários'
            });
        }

        // REGRA: Não deleta a si mesmo
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

            // REGRA: Não deleta se tiver pedidos vinculados
            const temPedidos = await db('pedidos')
                .where('cliente_id', id)
                .orWhere('responsavel_id', id)
                .first();

            if (temPedidos) {
                return res.status(400).json({
                    erro: 'Usuário tem pedidos vinculados. Desative ao invés de deletar.'
                });
            }

            await db('usuarios').where({ id }).del();

            res.json({
                mensagem: `Usuário ${usuario.nome} deletado`
            });
        } catch (error) {
            console.error('Erro ao deletar:', error);
            res.status(500).json({ erro: 'Erro ao deletar usuário' });
        }
    }
};
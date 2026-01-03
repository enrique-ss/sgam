import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { UsuarioService } from '../service/UsuarioService';

export const UsuarioController = {
    async listar(req: AuthRequest, res: Response) {
        try {
            const usuarios = await UsuarioService.listar();

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
        try {
            const { id } = req.params;
            const usuarioLogado = req.user!;

            // Cliente só vê seus próprios dados
            if (usuarioLogado.nivel_acesso === 'cliente' && parseInt(id) !== usuarioLogado.id) {
                return res.status(403).json({ erro: 'Você só pode visualizar seus próprios dados' });
            }

            const usuario = await UsuarioService.obter(parseInt(id));

            res.json({ usuario });
        } catch (error: any) {
            console.error('Erro ao obter:', error);

            if (error.message === 'USUARIO_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            res.status(500).json({ erro: 'Erro ao obter usuário' });
        }
    },

    async criar(req: AuthRequest, res: Response) {
        try {
            const { nome, email, senha, nivel_acesso } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Dados incompletos' });
            }

            const nivelFinal = nivel_acesso || 'colaborador';
            const usuario = await UsuarioService.criar(nome, email, senha, nivelFinal);

            res.status(201).json({
                mensagem: `Usuário ${nivelFinal} criado`,
                usuario
            });
        } catch (error: any) {
            console.error('Erro ao criar:', error);

            if (error.message === 'NIVEL_INVALIDO') {
                return res.status(400).json({ erro: 'Nível de acesso inválido' });
            }

            if (error.message === 'EMAIL_JA_CADASTRADO') {
                return res.status(409).json({ erro: 'Email já cadastrado' });
            }

            res.status(500).json({ erro: 'Erro ao criar usuário' });
        }
    },

    async atualizar(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioLogado = req.user!;
            const dados = req.body;

            const usuario = await UsuarioService.atualizar(
                parseInt(id),
                dados,
                usuarioLogado.id,
                usuarioLogado.nivel_acesso
            );

            res.json({
                mensagem: 'Usuário atualizado',
                usuario
            });
        } catch (error: any) {
            console.error('Erro ao atualizar:', error);

            if (error.message === 'USUARIO_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            if (error.message === 'SEM_PERMISSAO') {
                return res.status(403).json({ erro: 'Você só pode alterar seus próprios dados' });
            }

            if (error.message === 'NAO_PODE_ALTERAR_PROPRIO_NIVEL') {
                return res.status(400).json({ erro: 'Você não pode alterar seu próprio nível' });
            }

            if (error.message === 'NAO_PODE_DESATIVAR_SI_MESMO') {
                return res.status(400).json({ erro: 'Você não pode desativar sua própria conta' });
            }

            if (error.message === 'EMAIL_JA_CADASTRADO') {
                return res.status(409).json({ erro: 'Email já em uso' });
            }

            if (error.message === 'NIVEL_INVALIDO') {
                return res.status(400).json({ erro: 'Nível inválido' });
            }

            if (error.message === 'APENAS_ADMIN_ALTERA_NIVEL_STATUS') {
                return res.status(403).json({ erro: 'Apenas admin pode alterar nível/status' });
            }

            res.status(500).json({ erro: 'Erro ao atualizar usuário' });
        }
    },

    async deletar(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const usuarioLogado = req.user!;

            const nomeUsuario = await UsuarioService.deletar(parseInt(id), usuarioLogado.id);

            res.json({ mensagem: `Usuário ${nomeUsuario} deletado` });
        } catch (error: any) {
            console.error('Erro ao deletar:', error);

            if (error.message === 'USUARIO_NAO_ENCONTRADO') {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            if (error.message === 'NAO_PODE_DELETAR_SI_MESMO') {
                return res.status(400).json({ erro: 'Você não pode deletar sua própria conta' });
            }

            if (error.message === 'USUARIO_COM_PEDIDOS_VINCULADOS') {
                return res.status(400).json({
                    erro: 'Usuário tem pedidos vinculados. Desative ao invés de deletar.'
                });
            }

            res.status(500).json({ erro: 'Erro ao deletar usuário' });
        }
    }
};
import { Request, Response } from 'express';
import { AuthService } from '../service/AuthService';

export const AuthController = {
    async registrar(req: Request, res: Response) {
        try {
            const { nome, email, senha } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Dados incompletos' });
            }

            const resultado = await AuthService.registrar(nome, email, senha);

            res.status(201).json({
                mensagem: 'Conta criada como cliente',
                token: resultado.token,
                usuario: resultado.usuario
            });
        } catch (error: any) {
            console.error('Erro ao registrar:', error);

            if (error.message === 'EMAIL_JA_CADASTRADO') {
                return res.status(409).json({ erro: 'Email já cadastrado' });
            }

            res.status(500).json({ erro: 'Erro ao registrar' });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ erro: 'Email e senha obrigatórios' });
            }

            const resultado = await AuthService.login(email, senha);

            res.json({
                mensagem: 'Login realizado',
                token: resultado.token,
                usuario: resultado.usuario
            });
        } catch (error: any) {
            console.error('Erro ao fazer login:', error);

            if (error.message === 'CREDENCIAIS_INVALIDAS') {
                return res.status(401).json({ erro: 'Email ou senha incorretos' });
            }

            if (error.message === 'CONTA_DESATIVADA') {
                return res.status(403).json({ erro: 'Conta desativada. Contate o administrador.' });
            }

            res.status(500).json({ erro: 'Erro ao fazer login' });
        }
    },

    async verificarToken(req: Request, res: Response) {
        res.json({
            valido: true,
            usuario: (req as any).user
        });
    }
};
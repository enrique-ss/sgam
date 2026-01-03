import { Request, Response } from 'express';
import { db } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sgam_secret_key_2024';

export const AuthController = {
    async registrar(req: Request, res: Response) {
        try {
            const { nome, email, senha } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Dados incompletos' });
            }

            // Verifica se email já existe
            const existente = await db('usuarios').where({ email }).first();
            if (existente) {
                return res.status(400).json({ erro: 'Email já cadastrado' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            // REGRA: Todo registro cria cliente
            const [id] = await db('usuarios').insert({
                nome,
                email,
                senha: senhaHash,
                nivel_acesso: 'cliente',
                ativo: true
            });

            const usuario = await db('usuarios')
                .select('id', 'nome', 'email', 'nivel_acesso')
                .where({ id })
                .first();

            const token = jwt.sign(
                { id: usuario.id, nivel_acesso: usuario.nivel_acesso },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                mensagem: 'Conta criada como cliente',
                token,
                usuario
            });
        } catch (error: any) {
            console.error('Erro ao registrar:', error);
            res.status(500).json({ erro: 'Erro ao registrar' });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ erro: 'Email e senha obrigatórios' });
            }

            const usuario = await db('usuarios').where({ email }).first();

            if (!usuario) {
                return res.status(401).json({ erro: 'Email ou senha incorretos' });
            }

            // Verifica senha
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Email ou senha incorretos' });
            }

            // Não permite login de conta desativada
            if (!usuario.ativo) {
                return res.status(403).json({
                    erro: 'Conta desativada. Contate o administrador.'
                });
            }

            const token = jwt.sign(
                { id: usuario.id, nivel_acesso: usuario.nivel_acesso },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const { senha: _, ...usuarioSemSenha } = usuario;

            res.json({
                mensagem: 'Login realizado',
                token,
                usuario: usuarioSemSenha
            });
        } catch (error: any) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ erro: 'Erro ao fazer login' });
        }
    },

    async verificarToken(req: Request, res: Response) {
        // Token já foi verificado pelo middleware
        res.json({
            valido: true,
            usuario: (req as any).user
        });
    }
};
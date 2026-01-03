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

            const existente = await db('usuarios').where({ email }).first();
            if (existente) return res.status(400).json({ erro: 'Email já cadastrado' });

            const senhaHash = await bcrypt.hash(senha, 10);

            const [id] = await db('usuarios').insert({
                nome,
                email,
                senha: senhaHash,
                nivel_acesso: 'cliente'
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
                mensagem: 'Conta criada',
                token,
                usuario
            });
        } catch (error: any) {
            res.status(500).json({ erro: 'Erro ao registrar', details: error.message });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;
            const usuario = await db('usuarios').where({ email }).first();

            if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
                return res.status(401).json({ erro: 'Email ou senha incorretos' });
            }

            if (!usuario.ativo) {
                return res.status(403).json({ erro: 'Conta desativada' });
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
            res.status(500).json({ erro: 'Erro ao fazer login' });
        }
    },

    async verificarToken(req: Request, res: Response) {
        res.json({ valido: true, usuario: (req as any).user });
    }
};
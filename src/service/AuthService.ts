import { db } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sgam_secret_key_2024';

export const AuthService = {
    async registrar(nome: string, email: string, senha: string) {
        const existente = await db('usuarios').where({ email }).first();
        if (existente) {
            throw new Error('EMAIL_JA_CADASTRADO');
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const [id] = await db('usuarios').insert({
            nome,
            email,
            senha: senhaHash,
            nivel_acesso: 'cliente',
            ativo: true
        });

        const usuario = await db('usuarios')
            .select('id', 'nome', 'email', 'nivel_acesso', 'ativo')
            .where({ id })
            .first();

        const token = jwt.sign(
            { id: usuario.id, nivel_acesso: usuario.nivel_acesso },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { token, usuario };
    },

    async login(email: string, senha: string) {
        const usuario = await db('usuarios').where({ email }).first();

        if (!usuario) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            throw new Error('CREDENCIAIS_INVALIDAS');
        }

        // Verifica se está ativo
        if (!usuario.ativo) {
            throw new Error('CONTA_DESATIVADA');
        }

        // Atualiza último login
        await db('usuarios')
            .where({ id: usuario.id })
            .update({ ultimo_login: db.fn.now() });

        const token = jwt.sign(
            { id: usuario.id, nivel_acesso: usuario.nivel_acesso },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { senha: _, ...usuarioSemSenha } = usuario;

        return { token, usuario: usuarioSemSenha };
    },

    async verificarInatividade() {
        // Desativa colaboradores inativos há mais de 30 dias
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

        await db('usuarios')
            .where('nivel_acesso', 'colaborador')
            .where('ativo', true)
            .where('ultimo_login', '<', trintaDiasAtras)
            .update({ ativo: false });
    }
};
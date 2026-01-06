import bcrypt from 'bcrypt';
import pool from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  nivel_acesso: 'admin' | 'colaborador' | 'cliente';
  ativo: boolean;
  ultimo_login: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

export class AuthService {
  // Cadastrar novo usuário
  static async cadastrar(nome: string, email: string, senha: string): Promise<Usuario> {
    // Verificar se email já existe
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      throw new Error('Email já cadastrado');
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário (sempre como cliente, sempre ativo)
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO usuarios (nome, email, senha, nivel_acesso, ativo) 
       VALUES (?, ?, ?, 'cliente', true)`,
      [nome, email, senhaHash]
    );

    // Buscar usuário criado
    const [usuario] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    return usuario[0] as Usuario;
  }

  // Login
  static async login(email: string, senha: string): Promise<Usuario> {
    // Buscar usuário por email
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      throw new Error('Email ou senha incorretos');
    }

    const usuario = rows[0] as Usuario;

    // Verificar se conta está ativa
    if (!usuario.ativo) {
      throw new Error('Sua conta está desativada. Contate o administrador.');
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new Error('Email ou senha incorretos');
    }

    // Atualizar ultimo_login
    await pool.query(
      'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
      [usuario.id]
    );

    return usuario;
  }

  // Verificar inatividade de colaboradores (job automático)
  static async verificarInatividade(): Promise<void> {
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    await pool.query(
      `UPDATE usuarios 
       SET ativo = false 
       WHERE nivel_acesso = 'colaborador' 
       AND ultimo_login < ? 
       AND ativo = true`,
      [trintaDiasAtras]
    );
  }

  // Buscar usuário por ID
  static async buscarPorId(id: number): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? (rows[0] as Usuario) : null;
  }
}
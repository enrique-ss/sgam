import bcrypt from 'bcrypt';
import pool from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Usuario } from './AuthService';

export class UsuarioService {
  // Listar clientes (apenas para admin)
  static async listarClientes(usuarioLogadoId: number, nivelAcesso: string): Promise<Usuario[]> {
    if (nivelAcesso !== 'admin') {
      throw new Error('Apenas administradores podem listar clientes');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE nivel_acesso = "cliente" ORDER BY nome'
    );

    return rows as Usuario[];
  }

  // Listar equipe (colaboradores e admins - apenas para admin)
  static async listarEquipe(usuarioLogadoId: number, nivelAcesso: string): Promise<Usuario[]> {
    if (nivelAcesso !== 'admin') {
      throw new Error('Apenas administradores podem listar a equipe');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM usuarios 
       WHERE nivel_acesso IN ('colaborador', 'admin') 
       ORDER BY nome`
    );

    return rows as Usuario[];
  }

  // Editar perfil próprio (nome e senha)
  static async editarPerfil(
    usuarioId: number,
    nome?: string,
    senhaAtual?: string,
    senhaNova?: string
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    // Atualizar nome se fornecido
    if (nome) {
      updates.push('nome = ?');
      values.push(nome);
    }

    // Atualizar senha se fornecida
    if (senhaAtual && senhaNova) {
      // Buscar usuário para verificar senha atual
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT senha FROM usuarios WHERE id = ?',
        [usuarioId]
      );

      if (rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const usuario = rows[0];
      const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

      if (!senhaCorreta) {
        throw new Error('Senha atual incorreta');
      }

      const senhaHash = await bcrypt.hash(senhaNova, 10);
      updates.push('senha = ?');
      values.push(senhaHash);
    }

    if (updates.length === 0) {
      throw new Error('Nenhuma alteração fornecida');
    }

    values.push(usuarioId);

    await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  // Editar usuário (ativo e nivel_acesso - apenas admin)
  static async editarUsuario(
    adminId: number,
    nivelAcessoAdmin: string,
    usuarioId: number,
    ativo?: boolean,
    nivelAcesso?: 'admin' | 'colaborador' | 'cliente'
  ): Promise<void> {
    if (nivelAcessoAdmin !== 'admin') {
      throw new Error('Apenas administradores podem editar usuários');
    }

    // Admin não pode alterar próprio nivel_acesso
    if (adminId === usuarioId && nivelAcesso) {
      throw new Error('Você não pode alterar seu próprio nível de acesso');
    }

    // Admin não pode desativar própria conta
    if (adminId === usuarioId && ativo === false) {
      throw new Error('Você não pode desativar sua própria conta');
    }

    // Verificar se colaborador tem pedidos em aberto ao desativar
    if (ativo === false) {
      const [pedidos] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total 
         FROM pedidos 
         WHERE responsavel_id = ? 
         AND status IN ('em_andamento', 'atrasado')`,
        [usuarioId]
      );

      if (pedidos[0].total > 0) {
        throw new Error(
          `Este usuário tem ${pedidos[0].total} pedido(s) em aberto. ` +
          `Deseja realmente desativar?`
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (ativo !== undefined) {
      updates.push('ativo = ?');
      values.push(ativo);
    }

    if (nivelAcesso) {
      updates.push('nivel_acesso = ?');
      values.push(nivelAcesso);
    }

    if (updates.length === 0) {
      throw new Error('Nenhuma alteração fornecida');
    }

    values.push(usuarioId);

    await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  // Buscar colaboradores/admins para atribuição (apenas admin)
  static async listarResponsaveisDisponiveis(nivelAcesso: string): Promise<Usuario[]> {
    if (nivelAcesso !== 'admin') {
      throw new Error('Apenas administradores podem listar responsáveis');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, nome, email, nivel_acesso 
       FROM usuarios 
       WHERE nivel_acesso IN ('colaborador', 'admin') 
       AND ativo = true 
       ORDER BY nome`
    );

    return rows as Usuario[];
  }
}
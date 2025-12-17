import { Request, Response } from 'express';
import db from '../../database/connection';

interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  nivel_acesso: 'admin' | 'colaborador' | 'cliente';
  status: 'ATIVO' | 'INATIVO';
  data_criacao?: Date;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const usuarios = await db('usuario')
      .select('id', 'nome', 'email', 'nivel_acesso', 'status', 'data_criacao')
      .orderBy('data_criacao', 'desc');
    
    return res.json(usuarios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const usuario = await db('usuario')
      .select('id', 'nome', 'email', 'nivel_acesso', 'status', 'data_criacao')
      .where({ id })
      .first();
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    return res.json(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
};

export const create = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nome, email, senha, nivel_acesso, status }: Usuario = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    const emailExiste = await db('usuario').where({ email }).first();
    if (emailExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    const [id] = await db('usuario').insert({
      nome,
      email,
      senha,
      nivel_acesso: nivel_acesso || 'cliente',
      status: status || 'ATIVO'
    });
    
    return res.status(201).json({ 
      mensagem: 'Usuário criado com sucesso',
      id 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { nome, email, senha, nivel_acesso, status }: Partial<Usuario> = req.body;
    
    const usuario = await db('usuario').where({ id }).first();
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    if (email && email !== usuario.email) {
      const emailExiste = await db('usuario')
        .where({ email })
        .whereNot({ id })
        .first();
      
      if (emailExiste) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
    }
    
    const dadosAtualizacao: Partial<Usuario> = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (senha) dadosAtualizacao.senha = senha;
    if (nivel_acesso) dadosAtualizacao.nivel_acesso = nivel_acesso;
    if (status) dadosAtualizacao.status = status;
    
    await db('usuario').where({ id }).update(dadosAtualizacao);
    
    return res.json({ mensagem: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
};

export const deleteUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const usuario = await db('usuario').where({ id }).first();
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    const temDemandas = await db('demandas').where({ cliente_id: id }).first();
    if (temDemandas) {
      return res.status(400).json({ 
        erro: 'Não é possível deletar usuário com demandas associadas' 
      });
    }
    
    await db('usuario').where({ id }).delete();
    
    return res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar usuário' });
  }
};
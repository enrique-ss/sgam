
import { Request, Response } from 'express';
import db from '../database/connection';

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const index = async (req: any, res: any) => {
  try {
    const usuarios = await db('usuario').select('id', 'nome', 'email', 'nivel_acesso', 'status');
    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const create = async (req: any, res: any) => {
  try {
    const { nome, email, senha, nivel_acesso } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });

    const [id] = await db('usuario').insert({
      nome, email, senha, 
      nivel_acesso: nivel_acesso || 'cliente'
    });
    return res.status(201).json({ id, mensagem: 'Usuário criado' });
  } catch (error) {
    return res.status(400).json({ erro: 'Email já cadastrado ou erro no banco' });
  }
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const update = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await db('usuario').where({ id }).update(req.body);
    return res.json({ mensagem: 'Usuário atualizado' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar' });
  }
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const deleteUsuario = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const temDemandas = await db('demandas').where({ cliente_id: id }).first();
    if (temDemandas) return res.status(400).json({ erro: 'Usuário possui demandas vinculadas' });
    
    await db('usuario').where({ id }).delete();
    return res.json({ mensagem: 'Usuário removido' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao deletar' });
  }
};

// Apelidos solicitados para o seu router.ts
export const criarUsuario = create;
export const listarCliente = index;

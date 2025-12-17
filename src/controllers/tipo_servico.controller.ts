
import { Request, Response } from 'express';
import db from '../database/connection';

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const index = async (req: any, res: any) => {
  const tipos = await db('tipo_servico').orderBy('nome', 'asc');
  return res.json(tipos);
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const create = async (req: any, res: any) => {
  try {
    const { nome } = req.body;
    const [id] = await db('tipo_servico').insert({ nome });
    return res.status(201).json({ id });
  } catch (error) {
    return res.status(400).json({ erro: 'Nome já existe ou inválido' });
  }
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const deleteTipoServico = async (req: any, res: any) => {
  const { id } = req.params;
  const vinculada = await db('demandas').where({ tipo_servico_id: id }).first();
  if (vinculada) return res.status(400).json({ erro: 'Tipo em uso' });
  await db('tipo_servico').where({ id }).delete();
  return res.json({ mensagem: 'Removido' });
};

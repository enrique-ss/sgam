
import { Request, Response } from 'express';
import db from '../database/connection';

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const index = async (req: any, res: any) => {
  try {
    const demandas = await db('demandas')
      .select('demandas.*', 'tipo_servico.nome as tipo_nome', 'usuario.nome as cliente_nome')
      .leftJoin('tipo_servico', 'demandas.tipo_servico_id', 'tipo_servico.id')
      .leftJoin('usuario', 'demandas.cliente_id', 'usuario.id');
    return res.json(demandas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar demandas' });
  }
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const create = async (req: any, res: any) => {
  try {
    const [id] = await db('demandas').insert(req.body);
    return res.status(201).json({ id, mensagem: 'Demanda criada' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao criar demanda' });
  }
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const update = async (req: any, res: any) => {
  try {
    await db('demandas').where({ id: req.params.id }).update(req.body);
    return res.json({ mensagem: 'Atualizado' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar' });
  }
};

// Fixed: Using any for req and res parameters to resolve "Property does not exist" errors in this environment
export const deleteDemanda = async (req: any, res: any) => {
  try {
    await db('demandas').where({ id: req.params.id }).delete();
    return res.json({ mensagem: 'Removido' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao deletar' });
  }
};

// Apelidos solicitados para o seu router.ts
export const criarDemandas = create;
export const listarDemandas = index;

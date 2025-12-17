import { Request, Response } from 'express';
import db from '../../database/connection';

interface TipoServico {
  id?: number;
  nome: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const tipos = await db('tipo_servico')
      .select('*')
      .orderBy('nome', 'asc');
    
    return res.json(tipos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar tipos de serviço' });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const tipo = await db('tipo_servico')
      .where({ id })
      .first();
    
    if (!tipo) {
      return res.status(404).json({ erro: 'Tipo de serviço não encontrado' });
    }
    
    return res.json(tipo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar tipo de serviço' });
  }
};

export const create = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nome }: TipoServico = req.body;
    
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    
    const existe = await db('tipo_servico').where({ nome }).first();
    if (existe) {
      return res.status(400).json({ erro: 'Tipo de serviço já cadastrado' });
    }
    
    const [id] = await db('tipo_servico').insert({ nome });
    
    return res.status(201).json({ 
      mensagem: 'Tipo de serviço criado com sucesso',
      id 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar tipo de serviço' });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { nome }: TipoServico = req.body;
    
    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    
    const tipo = await db('tipo_servico').where({ id }).first();
    if (!tipo) {
      return res.status(404).json({ erro: 'Tipo de serviço não encontrado' });
    }
    
    if (nome !== tipo.nome) {
      const nomeExiste = await db('tipo_servico')
        .where({ nome })
        .whereNot({ id })
        .first();
      
      if (nomeExiste) {
        return res.status(400).json({ erro: 'Nome já cadastrado' });
      }
    }
    
    await db('tipo_servico').where({ id }).update({ nome });
    
    return res.json({ mensagem: 'Tipo de serviço atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar tipo de serviço' });
  }
};

export const deleteTipoServico = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const tipo = await db('tipo_servico').where({ id }).first();
    if (!tipo) {
      return res.status(404).json({ erro: 'Tipo de serviço não encontrado' });
    }
    
    const temDemandas = await db('demandas')
      .where({ tipo_servico_id: id })
      .first();
    
    if (temDemandas) {
      return res.status(400).json({ 
        erro: 'Não é possível deletar tipo de serviço com demandas associadas' 
      });
    }
    
    await db('tipo_servico').where({ id }).delete();
    
    return res.json({ mensagem: 'Tipo de serviço deletado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar tipo de serviço' });
  }
};
import { Request, Response } from 'express';
import db from '../../database/connection';

interface Demanda {
  id?: number;
  nome: string;
  tipo_servico_id: number;
  descricao: string;
  cliente_id: number;
  orcamento: number;
  prazo_entrega: string;
  data_conclusao?: string | null;
  status_servico: 'EM ANDAMENTO' | 'ATRASADO' | 'CONCLUÍDO' | 'CANCELADO';
  data_criacao?: Date;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const demandas = await db('demandas')
      .select(
        'demandas.*',
        'tipo_servico.nome as tipo_servico_nome',
        'usuario.nome as cliente_nome',
        'usuario.email as cliente_email'
      )
      .leftJoin('tipo_servico', 'demandas.tipo_servico_id', 'tipo_servico.id')
      .leftJoin('usuario', 'demandas.cliente_id', 'usuario.id')
      .orderBy('demandas.data_criacao', 'desc');
    
    return res.json(demandas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar demandas' });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const demanda = await db('demandas')
      .select(
        'demandas.*',
        'tipo_servico.nome as tipo_servico_nome',
        'usuario.nome as cliente_nome',
        'usuario.email as cliente_email'
      )
      .leftJoin('tipo_servico', 'demandas.tipo_servico_id', 'tipo_servico.id')
      .leftJoin('usuario', 'demandas.cliente_id', 'usuario.id')
      .where('demandas.id', id)
      .first();
    
    if (!demanda) {
      return res.status(404).json({ erro: 'Demanda não encontrada' });
    }
    
    return res.json(demanda);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar demanda' });
  }
};

export const create = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { 
      nome, 
      tipo_servico_id, 
      descricao, 
      cliente_id, 
      orcamento, 
      prazo_entrega,
      status_servico
    }: Demanda = req.body;
    
    if (!nome || !tipo_servico_id || !descricao || !cliente_id || !orcamento || !prazo_entrega) {
      return res.status(400).json({ 
        erro: 'Nome, tipo de serviço, descrição, cliente, orçamento e prazo são obrigatórios' 
      });
    }
    
    const tipoExiste = await db('tipo_servico').where({ id: tipo_servico_id }).first();
    if (!tipoExiste) {
      return res.status(400).json({ erro: 'Tipo de serviço não encontrado' });
    }
    
    const clienteExiste = await db('usuario').where({ id: cliente_id }).first();
    if (!clienteExiste) {
      return res.status(400).json({ erro: 'Cliente não encontrado' });
    }
    
    const [id] = await db('demandas').insert({
      nome,
      tipo_servico_id,
      descricao,
      cliente_id,
      orcamento,
      prazo_entrega,
      status_servico: status_servico || 'EM ANDAMENTO'
    });
    
    return res.status(201).json({ 
      mensagem: 'Demanda criada com sucesso',
      id 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar demanda' });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { 
      nome, 
      tipo_servico_id, 
      descricao, 
      cliente_id, 
      orcamento, 
      prazo_entrega,
      data_conclusao,
      status_servico
    }: Partial<Demanda> = req.body;
    
    const demanda = await db('demandas').where({ id }).first();
    if (!demanda) {
      return res.status(404).json({ erro: 'Demanda não encontrada' });
    }
    
    const dadosAtualizacao: Partial<Demanda> = {};
    
    if (nome) dadosAtualizacao.nome = nome;
    if (descricao) dadosAtualizacao.descricao = descricao;
    if (orcamento) dadosAtualizacao.orcamento = orcamento;
    if (prazo_entrega) dadosAtualizacao.prazo_entrega = prazo_entrega;
    if (data_conclusao !== undefined) dadosAtualizacao.data_conclusao = data_conclusao;
    if (status_servico) dadosAtualizacao.status_servico = status_servico;
    
    if (tipo_servico_id) {
      const tipoExiste = await db('tipo_servico').where({ id: tipo_servico_id }).first();
      if (!tipoExiste) {
        return res.status(400).json({ erro: 'Tipo de serviço não encontrado' });
      }
      dadosAtualizacao.tipo_servico_id = tipo_servico_id;
    }
    
    if (cliente_id) {
      const clienteExiste = await db('usuario').where({ id: cliente_id }).first();
      if (!clienteExiste) {
        return res.status(400).json({ erro: 'Cliente não encontrado' });
      }
      dadosAtualizacao.cliente_id = cliente_id;
    }
    
    await db('demandas').where({ id }).update(dadosAtualizacao);
    
    return res.json({ mensagem: 'Demanda atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar demanda' });
  }
};

export const deleteDemanda = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const demanda = await db('demandas').where({ id }).first();
    if (!demanda) {
      return res.status(404).json({ erro: 'Demanda não encontrada' });
    }
    
    await db('demandas').where({ id }).delete();
    
    return res.json({ mensagem: 'Demanda deletada com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar demanda' });
  }
};

export const byCliente = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { cliente_id } = req.params;
    
    const demandas = await db('demandas')
      .select(
        'demandas.*',
        'tipo_servico.nome as tipo_servico_nome'
      )
      .leftJoin('tipo_servico', 'demandas.tipo_servico_id', 'tipo_servico.id')
      .where('demandas.cliente_id', cliente_id)
      .orderBy('demandas.data_criacao', 'desc');
    
    return res.json(demandas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar demandas do cliente' });
  }
};

export const byStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status } = req.params;
    
    const demandas = await db('demandas')
      .select(
        'demandas.*',
        'tipo_servico.nome as tipo_servico_nome',
        'usuario.nome as cliente_nome'
      )
      .leftJoin('tipo_servico', 'demandas.tipo_servico_id', 'tipo_servico.id')
      .leftJoin('usuario', 'demandas.cliente_id', 'usuario.id')
      .where('demandas.status_servico', status)
      .orderBy('demandas.data_criacao', 'desc');
    
    return res.json(demandas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar demandas por status' });
  }
};
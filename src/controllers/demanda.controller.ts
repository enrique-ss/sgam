import db from '../database/connection';

export const index = async (req: any, res: any) => {
  const demandas = await db('demandas')
    .select('demandas.*', 'tipo_servico.nome as tipo_nome', 'usuario.nome as cliente_nome')
    .leftJoin('tipo_servico', 'demandas.tipo_servico_id', 'tipo_servico.id')
    .leftJoin('usuario', 'demandas.cliente_id', 'usuario.id')
    .where("status_servico", "EM ANDAMENTO")
    .orWhere("status_servico", "ATRASADO");
  return res.json(demandas);
 
};

export const create = async (req: any, res: any) => {  
  const [id] = await db('demandas').insert(req.body);
  return res.status(201).json({ id, mensagem: 'Demanda criada' });
};

export const update = async (req: any, res: any) => {
  await db('demandas').where({ id: req.params.id }).update(req.body);
  return res.json({ mensagem: 'Atualizado' });
};

export const deleteDemanda = async (req: any, res: any) => {
  await db('demandas').where({ id: req.params.id }).delete();
  return res.json({ mensagem: 'Removido' });
};

export const criarDemandas = create;
export const listarDemandas = index;
export const atualizarDemandas = update;

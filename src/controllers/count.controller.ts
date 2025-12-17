import db from '../database/connection';

export const countAndamento = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "EM ANDAMENTO")
  .count("id as total");
  return res.json(entregas);
};

export const countAtrasado = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "ATRASADO")
  .count("id as total");
  return res.json(entregas);
};

export const countConcluido = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "CONCLUÍDO")
  .count("id as total");
  return res.json(entregas);
};

export const countCancelado = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "CANCELADO")
  .count("id as total");
  return res.json(entregas);
};


// Tipos de Serviços 

export const countSocialMedia = async (req: any, res: any) => {
  const servico = await db('tipo_servico')
  .where("nome", "Social Media")
  .count("id as total");
  return res.json(servico);
};

export const countDesignGrafico = async (req: any, res: any) => {
  const servico = await db('tipo_servico')
  .where("nome", "Design Gráfico")
  .count("id as total");
  return res.json(servico);
};

export const countCopywriting = async (req: any, res: any) => {
  const servico = await db('tipo_servico')
  .where("nome", "Copywriting")
  .count("id as total");
  return res.json(servico);
};

export const countProducaoConteudo = async (req: any, res: any) => {
  const servico = await db('tipo_servico')
  .where("nome", "Produção de Conteúdo")
  .count("id as total");
  return res.json(servico);
};

export const countRelatoriosEstrategia = async (req: any, res: any) => {
  const servico = await db('tipo_servico')
  .where("nome", "Relatórios e Estratégia")
  .count("id as total");
  return res.json(servico);
};
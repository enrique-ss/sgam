import { db } from "../database/connection";

export const listarDemandas = async (req: any, res: any) => {
    const demanda = await db('demandas').select('*')
    .innerJoin("tipo_servico", "demandas.tipo_servico_id", "tipo_servico.id")
    .innerJoin("cliente", "demandas.cliente_id", "cliente.id");

    return res.json(demanda);
};


import { db } from "../database/connection";

export const listarCliente = async (req: any, res: any) =>{
    const nome = await db('cliente').select('*');
    return res.json(nome);
};
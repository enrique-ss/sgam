import { db } from "../database/connection";

export const criarUsuario = async (req: any, res: any) => {
    const { nome, email, senha, nivel_acesso } = req.body;
    const usuario = await db('usuario').insert({ nome, email, senha, nivel_acesso });
    return res.json(usuario);
};


export const listarCliente = async (req: any, res: any) => {
    const cliente = await db('usuario').where('nivel_acesso','cliente');
    return res.json(cliente)
};
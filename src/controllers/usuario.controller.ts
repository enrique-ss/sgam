import { db } from "../database/connection";

export const criarUsuario = async (req: any, res: any) => {
    const { nome, email, senha, telefone, nivel_acesso } = req.body;
    const usuario = await db('usuario').insert({ nome, email, senha, telefone, nivel_acesso });
    return res.json(usuario)
};

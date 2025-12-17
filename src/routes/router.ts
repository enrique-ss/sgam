import { Router } from "express";
import { criarUsuario, listarCliente } from "../controllers/usuario.controller";
import { criarDemandas, listarDemandas } from "../controllers/demanda.controller";


export const router = Router();

// usuario
router.post('/criar-usuario', criarUsuario);
router.get('/listar-cliente', listarCliente);


// demanda
router.post('/demandas', criarDemandas);
router.get('/demandas', listarDemandas);

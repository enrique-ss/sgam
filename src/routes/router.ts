import { Router } from "express";
import { criarUsuario } from "../controllers/usuario.controller";
import { criarDemandas, listarDemandas } from "../controllers/demanda.controller";


export const router = Router();

// usuario
router.post('/criar-usuario', criarUsuario);

// tipo_servico



// demanda
router.get('/demandas', listarDemandas);
router.post('/demandas', criarDemandas);

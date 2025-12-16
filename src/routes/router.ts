<<<<<<< HEAD
import { Router } from "express";
import { criarUsuario } from "../controllers/usuario.controller";
import { listarCliente } from "../controllers/cliente.controller";
import { criarDemandas, listarDemandas } from "../controllers/demanda.controller";


export const router = Router();

// usuario
router.post('/criar-usuario', criarUsuario);

// cliente
router.get('/clientes', listarCliente);

// demanda
router.get('/demandas', listarDemandas);
router.post('/demandas', criarDemandas);
=======
>>>>>>> parent of 06557ff (Merge branch 'main' of https://github.com/enrique-ss/rsti-final)

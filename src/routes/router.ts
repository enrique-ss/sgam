import { Router } from "express";
import { criarUsuario, listarCliente } from "../controllers/usuario.controller";
import { atualizarDemandas, criarDemandas, listarDemandas } from "../controllers/demanda.controller";
import { listarEntregas } from "../controllers/entregas.controller";
import { countAndamento, countAtrasado, countCancelado, countConcluido, countCopywriting, countDesignGrafico, countProducaoConteudo, countRelatoriosEstrategia, countSocialMedia } from "../controllers/count.controller";


export const router = Router();

// usuario
router.post('/usuario', criarUsuario);
router.get('/cliente', listarCliente);

// demanda
router.post('/demandas', criarDemandas);
router.get('/demandas', listarDemandas);
router.put('/demandas/:id', atualizarDemandas);

// entrega
router.get('/entregas', listarEntregas);

// count status
router.get('/andamento', countAndamento);
router.get('/atrasado', countAtrasado);
router.get('/concluido', countConcluido);
router.get('/cancelado', countCancelado);

// count tipo serviço
router.get('/social-media', countSocialMedia);
router.get('/design-grafico', countDesignGrafico);
router.get('/copywriting', countCopywriting);
router.get('/producao-conteudo', countProducaoConteudo);
router.get('/relatorios-estrategia', countRelatoriosEstrategia);

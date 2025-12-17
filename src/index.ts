import express, { Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', routes);

// Rota raiz
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    mensagem: 'API RSTI-FINAL está rodando!',
    endpoints: {
      usuarios: '/api/usuarios',
      tiposServico: '/api/tipos-servico',
      demandas: '/api/demandas'
    }
  });
});

// Tratamento de erro 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
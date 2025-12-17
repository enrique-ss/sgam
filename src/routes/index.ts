
import express from 'express';
import { router } from './router';

const app = express();

app.use(express.json());
// Fixed: Explicitly casting routes to any to avoid overload mismatch errors in certain environments where Router types might conflict
app.use('/api', router);

app.get('/', (req, res) => {
  res.json({ 
    status: 'RSTI-FINAL API Online',
    documentacao: 'Acesse /api/usuarios, /api/demandas, etc.'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});

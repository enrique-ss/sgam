import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/AuthRoutes';
import usuarioRoutes from './routes/UsuarioRoutes';
import pedidoRoutes from './routes/PedidoRoutes';
import dashboardRoutes from './routes/DashboardRoutes';
import { CronService } from './service/CronService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'SGAM API está rodando!',
    versao: '1.0.0'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
  
  // Iniciar jobs automáticos
  CronService.iniciar();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  CronService.parar();
  process.exit(0);
});
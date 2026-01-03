import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './database';

import routerAuth from './routes/AuthRoutes';
import routerUsuario from './routes/UsuarioRoutes';
import routerPedido from './routes/PedidoRoutes';
import routerDashboard from './routes/DashboardRoutes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registrar rotas
app.use('/api/auth', routerAuth);
app.use('/api/usuarios', routerUsuario);
app.use('/api/pedidos', routerPedido);
app.use('/api/dashboard', routerDashboard);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SGAM Online!' });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'SGAM - Sistema de Gerenciamento para Agências de Marketing',
    versao: '1.0.0'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await db.raw('SELECT 1');
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.clear();
      console.log('🚀 SGAM ONLINE EM: http://127.0.0.1:' + PORT);
      console.log('\n👉 Admin: admin@sgam.com / Admin@123');
      console.log('👉 CLI: npm run cli\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
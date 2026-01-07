import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './env';
import routes from '../routes';
import { errorHandler } from '../middlewares/errorHandler';
import { logger } from '../middlewares/logger';

export function configureExpress(): Application {
  const app = express();

  // Middlewares de segurança
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }));

  // Parser de JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  app.use(logger);

  // Servir arquivos estáticos (frontend)
  app.use(express.static('public'));

  // Rotas da API
  app.use('/api', routes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV 
    });
  });

  // Tratamento de erros (deve ser o último middleware)
  app.use(errorHandler);

  return app;
}

export default configureExpress;
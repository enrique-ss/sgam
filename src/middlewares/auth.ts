import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/AuthService';

// Extender o tipo Request para incluir dados de autenticação
declare global {
  namespace Express {
    interface Request {
      body: {
        auth?: {
          usuarioId: number;
          nivelAcesso: string;
        };
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Por simplicidade, esperamos o usuarioId no header
    // Em produção, isso seria um JWT token
    const usuarioId = req.headers['x-usuario-id'];

    if (!usuarioId) {
      res.status(401).json({ 
        erro: 'Autenticação necessária' 
      });
      return;
    }

    // Buscar usuário
    const usuario = await AuthService.buscarPorId(parseInt(usuarioId as string));

    if (!usuario) {
      res.status(401).json({ 
        erro: 'Usuário não encontrado' 
      });
      return;
    }

    if (!usuario.ativo) {
      res.status(403).json({ 
        erro: 'Conta desativada. Contate o administrador.' 
      });
      return;
    }

    // Adicionar dados de autenticação ao body
    req.body.auth = {
      usuarioId: usuario.id,
      nivelAcesso: usuario.nivel_acesso
    };

    next();
  } catch (error: any) {
    res.status(500).json({ 
      erro: 'Erro na autenticação' 
    });
  }
}
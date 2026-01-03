import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sgam_secret_key_2024';

export interface AuthRequest extends Request {
    userId?: number;
    userNivel?: string;
    user?: { id: number; nivel_acesso: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; nivel_acesso: string };
        req.userId = decoded.id;
        req.userNivel = decoded.nivel_acesso;
        req.user = { id: decoded.id, nivel_acesso: decoded.nivel_acesso };
        next();
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido' });
    }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userNivel !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas admin.' });
    }
    next();
};

export const adminOuColaboradorMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userNivel !== 'admin' && req.userNivel !== 'colaborador') {
        return res.status(403).json({ erro: 'Acesso negado.' });
    }
    next();
};
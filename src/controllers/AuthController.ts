import { Request, Response } from 'express';
import { AuthService } from '../service/AuthService';

export class AuthController {
  // POST /api/auth/cadastrar
  static async cadastrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha } = req.body;

      // Validações básicas
      if (!nome || !email || !senha) {
        res.status(400).json({ 
          erro: 'Todos os campos são obrigatórios' 
        });
        return;
      }

      const usuario = await AuthService.cadastrar(nome, email, senha);

      // Não retornar senha
      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(201).json({
        mensagem: 'Usuário cadastrado com sucesso',
        usuario: usuarioSemSenha
      });
    } catch (error: any) {
      res.status(400).json({ 
        erro: error.message 
      });
    }
  }

  // POST /api/auth/login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        res.status(400).json({ 
          erro: 'Email e senha são obrigatórios' 
        });
        return;
      }

      const usuario = await AuthService.login(email, senha);

      // Não retornar senha
      const { senha: _, ...usuarioSemSenha } = usuario;

      // Em produção, aqui geraria um JWT token
      // Por simplicidade, retornamos os dados do usuário
      res.status(200).json({
        mensagem: 'Login realizado com sucesso',
        usuario: usuarioSemSenha
      });
    } catch (error: any) {
      res.status(401).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/auth/me/:id
  static async buscarPerfil(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ 
          erro: 'ID inválido' 
        });
        return;
      }

      const usuario = await AuthService.buscarPorId(id);

      if (!usuario) {
        res.status(404).json({ 
          erro: 'Usuário não encontrado' 
        });
        return;
      }

      // Não retornar senha
      const { senha: _, ...usuarioSemSenha } = usuario;

      res.status(200).json(usuarioSemSenha);
    } catch (error: any) {
      res.status(500).json({ 
        erro: error.message 
      });
    }
  }
}
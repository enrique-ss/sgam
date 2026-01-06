import { Request, Response } from 'express';
import { UsuarioService } from '../service/UsuarioService';

export class UsuarioController {
  // GET /api/usuarios/clientes
  static async listarClientes(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth; // Middleware de autenticação

      const clientes = await UsuarioService.listarClientes(usuarioId, nivelAcesso);

      // Remover senhas
      const clientesSemSenha = clientes.map(c => {
        const { senha, ...resto } = c;
        return resto;
      });

      res.status(200).json(clientesSemSenha);
    } catch (error: any) {
      res.status(403).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/usuarios/equipe
  static async listarEquipe(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth;

      const equipe = await UsuarioService.listarEquipe(usuarioId, nivelAcesso);

      // Remover senhas
      const equipeSemSenha = equipe.map(e => {
        const { senha, ...resto } = e;
        return resto;
      });

      res.status(200).json(equipeSemSenha);
    } catch (error: any) {
      res.status(403).json({ 
        erro: error.message 
      });
    }
  }

  // PUT /api/usuarios/perfil
  static async editarPerfil(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.body.auth;
      const { nome, senhaAtual, senhaNova } = req.body;

      await UsuarioService.editarPerfil(
        usuarioId,
        nome,
        senhaAtual,
        senhaNova
      );

      res.status(200).json({
        mensagem: 'Perfil atualizado com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({ 
        erro: error.message 
      });
    }
  }

  // PUT /api/usuarios/:id
  static async editarUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId: adminId, nivelAcesso } = req.body.auth;
      const usuarioId = parseInt(req.params.id);
      const { ativo, nivel_acesso } = req.body;

      if (isNaN(usuarioId)) {
        res.status(400).json({ 
          erro: 'ID inválido' 
        });
        return;
      }

      await UsuarioService.editarUsuario(
        adminId,
        nivelAcesso,
        usuarioId,
        ativo,
        nivel_acesso
      );

      res.status(200).json({
        mensagem: 'Usuário atualizado com sucesso'
      });
    } catch (error: any) {
      res.status(403).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/usuarios/responsaveis
  static async listarResponsaveis(req: Request, res: Response): Promise<void> {
    try {
      const { nivelAcesso } = req.body.auth;

      const responsaveis = await UsuarioService.listarResponsaveisDisponiveis(nivelAcesso);

      res.status(200).json(responsaveis);
    } catch (error: any) {
      res.status(403).json({ 
        erro: error.message 
      });
    }
  }
}
import { UsuarioModel } from '../models';
import { UnauthorizedError, ValidationError } from '../exceptions';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { LoginResponse } from '../types/Auth.types';
import { MENSAGENS } from '../constants/mensagens';

export class AuthService {
  /**
   * Realizar login
   */
  static async login(email: string, senha: string): Promise<LoginResponse> {
    // Buscar usuário por email
    const usuario = await UsuarioModel.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedError(MENSAGENS.AUTH.LOGIN_ERRO);
    }

    // Verificar se a conta está ativa
    if (!usuario.ativo) {
      throw new UnauthorizedError(MENSAGENS.AUTH.CONTA_DESATIVADA);
    }

    // Verificar senha
    const senhaValida = await comparePassword(senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedError(MENSAGENS.AUTH.LOGIN_ERRO);
    }

    // Atualizar último login
    await UsuarioModel.updateUltimoLogin(usuario.id);

    // Gerar token JWT
    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      nivel_acesso: usuario.nivel_acesso,
    });

    // Remover senha do retorno
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      token,
      usuario: usuarioSemSenha,
    };
  }

  /**
   * Verificar se o token é válido (já feito pelo middleware)
   */
  static async verificarToken(usuarioId: number) {
    const usuario = await UsuarioModel.findByIdSemSenha(usuarioId);

    if (!usuario) {
      throw new UnauthorizedError(MENSAGENS.AUTH.TOKEN_INVALIDO);
    }

    if (!usuario.ativo) {
      throw new UnauthorizedError(MENSAGENS.AUTH.CONTA_DESATIVADA);
    }

    return usuario;
  }
}

export default AuthService;
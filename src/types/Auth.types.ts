import { NivelAcesso } from '../constants/nivelAcesso';
import { UsuarioSemSenha } from './Usuario.types';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSemSenha;
}

export interface JWTPayload {
  id: number;
  email: string;
  nivel_acesso: NivelAcesso;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Express.Request {
  usuario?: JWTPayload;
}
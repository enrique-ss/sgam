import { NivelAcesso } from '../constants/nivelAcesso';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  nivel_acesso: NivelAcesso;
  ativo: boolean;
  ultimo_login: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface UsuarioSemSenha extends Omit<Usuario, 'senha'> {}

export interface CreateUsuarioData {
  nome: string;
  email: string;
  senha: string;
  nivel_acesso?: NivelAcesso;
}

export interface UpdateUsuarioData {
  nome?: string;
  email?: string;
  senha?: string;
  nivel_acesso?: NivelAcesso;
  ativo?: boolean;
}
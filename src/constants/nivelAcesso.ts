export const nivelAcesso = {
  CLIENTE: 'cliente',
  COLABORADOR: 'colaborador',
  ADMIN: 'admin',
} as const;

export type NivelAcesso = typeof nivelAcesso[keyof typeof nivelAcesso];

export const NIVEIS_ACESSO = Object.values(nivelAcesso);

export function isNivelAcessoValido(nivel: string): boolean {
  return NIVEIS_ACESSO.includes(nivel as NivelAcesso);
}

export default nivelAcesso;
export const statusPedido = {
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  ATRASADO: 'atrasado',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado',
} as const;

export type StatusPedido = typeof statusPedido[keyof typeof statusPedido];

export const STATUS_PEDIDOS = Object.values(statusPedido);

export function isStatusPedidoValido(status: string): boolean {
  return STATUS_PEDIDOS.includes(status as StatusPedido);
}

// Transições válidas de status
export const TRANSICOES_VALIDAS: Record<StatusPedido, StatusPedido[]> = {
  [statusPedido.PENDENTE]: [statusPedido.EM_ANDAMENTO, statusPedido.CANCELADO],
  [statusPedido.EM_ANDAMENTO]: [statusPedido.ATRASADO, statusPedido.ENTREGUE, statusPedido.CANCELADO],
  [statusPedido.ATRASADO]: [statusPedido.ENTREGUE, statusPedido.CANCELADO],
  [statusPedido.ENTREGUE]: [], // Estado final
  [statusPedido.CANCELADO]: [], // Estado final
};

export function podeTransicionarStatus(
  statusAtual: StatusPedido,
  statusNovo: StatusPedido
): boolean {
  return TRANSICOES_VALIDAS[statusAtual].includes(statusNovo);
}

export default statusPedido;
import { StatusPedido } from '../constants/statusPedido';

export enum Prioridade {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export interface Pedido {
  id: number;
  cliente_id: number;
  responsavel_id: number | null;
  titulo: string;
  tipo_servico: string;
  descricao: string;
  orcamento: number;
  prazo_entrega: Date;
  status: StatusPedido;
  prioridade: Prioridade | null;
  cancelado_por: number | null;
  concluido_por: number | null;
  data_conclusao: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface CreatePedidoData {
  cliente_id?: number;
  titulo: string;
  tipo_servico: string;
  descricao: string;
  orcamento: number;
  prazo_entrega: string;
  prioridade?: Prioridade;
}

export interface UpdatePedidoData {
  titulo?: string;
  tipo_servico?: string;
  descricao?: string;
  orcamento?: number;
  prazo_entrega?: string;
  prioridade?: Prioridade;
  status?: StatusPedido;
}

export interface PedidoStatusLog {
  id: number;
  pedido_id: number;
  status_anterior: StatusPedido | null;
  status_novo: StatusPedido;
  alterado_por: number | null;
  alterado_em: Date;
}
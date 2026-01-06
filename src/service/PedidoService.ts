import pool from '../database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Pedido {
  id: number;
  cliente_id: number;
  responsavel_id: number | null;
  titulo: string;
  tipo_servico: string;
  descricao: string;
  orcamento: number;
  prazo_entrega: Date;
  status: 'pendente' | 'em_andamento' | 'atrasado' | 'entregue' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente' | null;
  data_conclusao: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface CriarPedidoCliente {
  titulo: string;
  tipo_servico: string;
  descricao: string;
  orcamento: number;
  prazo_entrega: string; // YYYY-MM-DD
}

export interface CriarPedidoColaborador {
  cliente_id: number;
  titulo: string;
  tipo_servico: string;
  descricao: string;
  orcamento: number;
  prazo_entrega: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  responsavel_id?: number; // Apenas admin pode escolher outro responsável
}

export class PedidoService {
  // Criar pedido (CLIENTE)
  static async criarPedidoCliente(
    clienteId: number,
    dados: CriarPedidoCliente
  ): Promise<Pedido> {
    const { titulo, tipo_servico, descricao, orcamento, prazo_entrega } = dados;

    // Validações
    if (!titulo || !tipo_servico || !descricao || !orcamento || !prazo_entrega) {
      throw new Error('Todos os campos são obrigatórios');
    }

    // Inserir pedido
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO pedidos 
       (cliente_id, titulo, tipo_servico, descricao, orcamento, prazo_entrega, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pendente')`,
      [clienteId, titulo, tipo_servico, descricao, orcamento, prazo_entrega]
    );

    // Buscar pedido criado
    const [pedido] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pedidos WHERE id = ?',
      [result.insertId]
    );

    return pedido[0] as Pedido;
  }

  // Criar pedido (COLABORADOR/ADMIN)
  static async criarPedidoColaborador(
    usuarioId: number,
    nivelAcesso: string,
    dados: CriarPedidoColaborador
  ): Promise<Pedido> {
    if (nivelAcesso !== 'colaborador' && nivelAcesso !== 'admin') {
      throw new Error('Apenas colaboradores e administradores podem criar pedidos para clientes');
    }

    const { cliente_id, titulo, tipo_servico, descricao, orcamento, prazo_entrega, prioridade, responsavel_id } = dados;

    // Validações
    if (!cliente_id || !titulo || !tipo_servico || !descricao || !orcamento || !prazo_entrega || !prioridade) {
      throw new Error('Todos os campos são obrigatórios');
    }

    // Verificar se cliente existe
    const [cliente] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM usuarios WHERE id = ? AND nivel_acesso = "cliente"',
      [cliente_id]
    );

    if (cliente.length === 0) {
      throw new Error('Cliente não encontrado');
    }

    // Determinar responsável
    let responsavelFinal = usuarioId;

    // Apenas admin pode escolher outro responsável
    if (nivelAcesso === 'admin' && responsavel_id) {
      // Verificar se responsável existe e é colaborador/admin
      const [responsavel] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM usuarios WHERE id = ? AND nivel_acesso IN ("colaborador", "admin")',
        [responsavel_id]
      );

      if (responsavel.length === 0) {
        throw new Error('Responsável inválido');
      }

      responsavelFinal = responsavel_id;
    }

    // Inserir pedido (já com responsável e em andamento)
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO pedidos 
       (cliente_id, responsavel_id, titulo, tipo_servico, descricao, orcamento, 
        prazo_entrega, prioridade, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'em_andamento')`,
      [cliente_id, responsavelFinal, titulo, tipo_servico, descricao, orcamento, prazo_entrega, prioridade]
    );

    // Buscar pedido criado
    const [pedido] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pedidos WHERE id = ?',
      [result.insertId]
    );

    return pedido[0] as Pedido;
  }

  // Listar pedidos pendentes (sem responsável)
  static async listarPendentes(nivelAcesso: string): Promise<Pedido[]> {
    if (nivelAcesso === 'cliente') {
      throw new Error('Clientes não podem ver pedidos pendentes de outros');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, u.nome as cliente_nome 
       FROM pedidos p 
       JOIN usuarios u ON p.cliente_id = u.id 
       WHERE p.status = 'pendente' 
       ORDER BY p.criado_em DESC`
    );

    return rows as Pedido[];
  }

  // Listar pedidos do cliente
  static async listarMeusPedidosCliente(clienteId: number): Promise<{
    emAberto: Pedido[];
    entregas: Pedido[];
  }> {
    // Pedidos em aberto (pendente, em_andamento, atrasado)
    const [emAberto] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, u.nome as responsavel_nome 
       FROM pedidos p 
       LEFT JOIN usuarios u ON p.responsavel_id = u.id 
       WHERE p.cliente_id = ? 
       AND p.status IN ('pendente', 'em_andamento', 'atrasado') 
       ORDER BY p.criado_em DESC`,
      [clienteId]
    );

    // Pedidos finalizados (entregue, cancelado)
    const [entregas] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, u.nome as responsavel_nome 
       FROM pedidos p 
       LEFT JOIN usuarios u ON p.responsavel_id = u.id 
       WHERE p.cliente_id = ? 
       AND p.status IN ('entregue', 'cancelado') 
       ORDER BY p.data_conclusao DESC`,
      [clienteId]
    );

    return {
      emAberto: emAberto as Pedido[],
      entregas: entregas as Pedido[]
    };
  }

  // Listar pedidos do colaborador
  static async listarMeusPedidosColaborador(colaboradorId: number): Promise<{
    emAberto: Pedido[];
    finalizados: Pedido[];
  }> {
    // Pedidos em aberto (em_andamento, atrasado)
    const [emAberto] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, u.nome as cliente_nome 
       FROM pedidos p 
       JOIN usuarios u ON p.cliente_id = u.id 
       WHERE p.responsavel_id = ? 
       AND p.status IN ('em_andamento', 'atrasado') 
       ORDER BY p.prazo_entrega ASC`,
      [colaboradorId]
    );

    // Pedidos finalizados (entregue, cancelado)
    const [finalizados] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, u.nome as cliente_nome 
       FROM pedidos p 
       JOIN usuarios u ON p.cliente_id = u.id 
       WHERE p.responsavel_id = ? 
       AND p.status IN ('entregue', 'cancelado') 
       ORDER BY p.data_conclusao DESC`,
      [colaboradorId]
    );

    return {
      emAberto: emAberto as Pedido[],
      finalizados: finalizados as Pedido[]
    };
  }

  // Listar todos os pedidos (apenas admin)
  static async listarTodosPedidos(nivelAcesso: string): Promise<Pedido[]> {
    if (nivelAcesso !== 'admin') {
      throw new Error('Apenas administradores podem ver todos os pedidos');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, 
              c.nome as cliente_nome,
              r.nome as responsavel_nome
       FROM pedidos p 
       JOIN usuarios c ON p.cliente_id = c.id 
       LEFT JOIN usuarios r ON p.responsavel_id = r.id 
       ORDER BY p.criado_em DESC`
    );

    return rows as Pedido[];
  }

  // Assumir pedido
  static async assumirPedido(
    usuarioId: number,
    nivelAcesso: string,
    pedidoId: number,
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  ): Promise<void> {
    if (nivelAcesso === 'cliente') {
      throw new Error('Clientes não podem assumir pedidos');
    }

    // Verificar se pedido existe e está pendente
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pedidos WHERE id = ? AND status = "pendente"',
      [pedidoId]
    );

    if (rows.length === 0) {
      throw new Error('Pedido não encontrado ou já foi assumido');
    }

    // Atualizar pedido
    await pool.query(
      `UPDATE pedidos 
       SET responsavel_id = ?, 
           status = 'em_andamento',
           prioridade = ?
       WHERE id = ?`,
      [usuarioId, prioridade, pedidoId]
    );
  }

  // Concluir pedido
  static async concluirPedido(
    usuarioId: number,
    nivelAcesso: string,
    pedidoId: number
  ): Promise<void> {
    // Verificar se pedido existe e pertence ao usuário
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pedidos WHERE id = ? AND responsavel_id = ?',
      [pedidoId, usuarioId]
    );

    if (rows.length === 0 && nivelAcesso !== 'admin') {
      throw new Error('Pedido não encontrado ou você não é o responsável');
    }

    // Admin pode concluir qualquer pedido
    if (nivelAcesso === 'admin' && rows.length === 0) {
      const [pedido] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM pedidos WHERE id = ?',
        [pedidoId]
      );

      if (pedido.length === 0) {
        throw new Error('Pedido não encontrado');
      }
    }

    // Atualizar pedido
    await pool.query(
      `UPDATE pedidos 
       SET status = 'entregue', 
           data_conclusao = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [pedidoId]
    );
  }

  // Cancelar pedido
  static async cancelarPedido(
    usuarioId: number,
    nivelAcesso: string,
    pedidoId: number
  ): Promise<void> {
    // Cliente pode cancelar seus próprios pedidos
    if (nivelAcesso === 'cliente') {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM pedidos WHERE id = ? AND cliente_id = ?',
        [pedidoId, usuarioId]
      );

      if (rows.length === 0) {
        throw new Error('Pedido não encontrado ou você não é o dono');
      }
    } else {
      // Colaborador só pode cancelar pedidos que assumiu
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM pedidos WHERE id = ? AND responsavel_id = ?',
        [pedidoId, usuarioId]
      );

      if (rows.length === 0 && nivelAcesso !== 'admin') {
        throw new Error('Pedido não encontrado ou você não é o responsável');
      }

      // Admin pode cancelar qualquer pedido
      if (nivelAcesso === 'admin' && rows.length === 0) {
        const [pedido] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM pedidos WHERE id = ?',
          [pedidoId]
        );

        if (pedido.length === 0) {
          throw new Error('Pedido não encontrado');
        }
      }
    }

    // Atualizar pedido
    await pool.query(
      `UPDATE pedidos 
       SET status = 'cancelado', 
           data_conclusao = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [pedidoId]
    );
  }

  // Verificar pedidos atrasados (job automático)
  static async verificarPedidosAtrasados(): Promise<void> {
    await pool.query(
      `UPDATE pedidos 
       SET status = 'atrasado' 
       WHERE status = 'em_andamento' 
       AND prazo_entrega < CURDATE()`
    );
  }

  // Editar pedido (apenas admin)
  static async editarPedido(
    nivelAcesso: string,
    pedidoId: number,
    dados: Partial<Pedido>
  ): Promise<void> {
    if (nivelAcesso !== 'admin') {
      throw new Error('Apenas administradores podem editar pedidos');
    }

    const updates: string[] = [];
    const values: any[] = [];

    // Campos editáveis
    if (dados.titulo) {
      updates.push('titulo = ?');
      values.push(dados.titulo);
    }
    if (dados.descricao) {
      updates.push('descricao = ?');
      values.push(dados.descricao);
    }
    if (dados.tipo_servico) {
      updates.push('tipo_servico = ?');
      values.push(dados.tipo_servico);
    }
    if (dados.orcamento) {
      updates.push('orcamento = ?');
      values.push(dados.orcamento);
    }
    if (dados.prazo_entrega) {
      updates.push('prazo_entrega = ?');
      values.push(dados.prazo_entrega);
    }
    if (dados.prioridade) {
      updates.push('prioridade = ?');
      values.push(dados.prioridade);
    }
    if (dados.responsavel_id !== undefined) {
      updates.push('responsavel_id = ?');
      values.push(dados.responsavel_id);
    }

    if (updates.length === 0) {
      throw new Error('Nenhuma alteração fornecida');
    }

    values.push(pedidoId);

    await pool.query(
      `UPDATE pedidos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}
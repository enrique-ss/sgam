import { Request, Response } from 'express';
import { PedidoService } from '../service/PedidoService';

export class PedidoController {
  // POST /api/pedidos/cliente
  static async criarPedidoCliente(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.body.auth;
      const dados = req.body;

      const pedido = await PedidoService.criarPedidoCliente(usuarioId, dados);

      res.status(201).json({
        mensagem: 'Pedido criado com sucesso',
        pedido
      });
    } catch (error: any) {
      res.status(400).json({ 
        erro: error.message 
      });
    }
  }

  // POST /api/pedidos/colaborador
  static async criarPedidoColaborador(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth;
      const dados = req.body;

      const pedido = await PedidoService.criarPedidoColaborador(
        usuarioId,
        nivelAcesso,
        dados
      );

      res.status(201).json({
        mensagem: 'Pedido criado com sucesso',
        pedido
      });
    } catch (error: any) {
      res.status(400).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/pedidos/pendentes
  static async listarPendentes(req: Request, res: Response): Promise<void> {
    try {
      const { nivelAcesso } = req.body.auth;

      const pedidos = await PedidoService.listarPendentes(nivelAcesso);

      res.status(200).json(pedidos);
    } catch (error: any) {
      res.status(403).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/pedidos/meus (cliente)
  static async listarMeusPedidosCliente(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.body.auth;

      const pedidos = await PedidoService.listarMeusPedidosCliente(usuarioId);

      res.status(200).json(pedidos);
    } catch (error: any) {
      res.status(500).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/pedidos/meus (colaborador)
  static async listarMeusPedidosColaborador(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.body.auth;

      const pedidos = await PedidoService.listarMeusPedidosColaborador(usuarioId);

      res.status(200).json(pedidos);
    } catch (error: any) {
      res.status(500).json({ 
        erro: error.message 
      });
    }
  }

  // GET /api/pedidos/todos (admin)
  static async listarTodosPedidos(req: Request, res: Response): Promise<void> {
    try {
      const { nivelAcesso } = req.body.auth;

      const pedidos = await PedidoService.listarTodosPedidos(nivelAcesso);

      res.status(200).json(pedidos);
    } catch (error: any) {
      res.status(403).json({ 
        erro: error.message 
      });
    }
  }

  // PUT /api/pedidos/:id/assumir
  static async assumirPedido(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth;
      const pedidoId = parseInt(req.params.id);
      const { prioridade } = req.body;

      if (isNaN(pedidoId)) {
        res.status(400).json({ 
          erro: 'ID inválido' 
        });
        return;
      }

      if (!prioridade) {
        res.status(400).json({ 
          erro: 'Prioridade é obrigatória' 
        });
        return;
      }

      await PedidoService.assumirPedido(usuarioId, nivelAcesso, pedidoId, prioridade);

      res.status(200).json({
        mensagem: 'Pedido assumido com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({ 
        erro: error.message 
      });
    }
  }

  // PUT /api/pedidos/:id/concluir
  static async concluirPedido(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth;
      const pedidoId = parseInt(req.params.id);

      if (isNaN(pedidoId)) {
        res.status(400).json({ 
          erro: 'ID inválido' 
        });
        return;
      }

      await PedidoService.concluirPedido(usuarioId, nivelAcesso, pedidoId);

      res.status(200).json({
        mensagem: 'Pedido concluído com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({ 
        erro: error.message 
      });
    }
  }

  // PUT /api/pedidos/:id/cancelar
  static async cancelarPedido(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, nivelAcesso } = req.body.auth;
      const pedidoId = parseInt(req.params.id);

      if (isNaN(pedidoId)) {
        res.status(400).json({ 
          erro: 'ID inválido' 
        });
        return;
      }

      await PedidoService.cancelarPedido(usuarioId, nivelAcesso, pedidoId);

      res.status(200).json({
        mensagem: 'Pedido cancelado com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({ 
        erro: error.message 
      });
    }
  }

  // PUT /api/pedidos/:id (admin)
  static async editarPedido(req: Request, res: Response): Promise<void> {
    try {
      const { nivelAcesso } = req.body.auth;
      const pedidoId = parseInt(req.params.id);
      const dados = req.body;

      if (isNaN(pedidoId)) {
        res.status(400).json({ 
          erro: 'ID inválido' 
        });
        return;
      }

      await PedidoService.editarPedido(nivelAcesso, pedidoId, dados);

      res.status(200).json({
        mensagem: 'Pedido atualizado com sucesso'
      });
    } catch (error: any) {
      res.status(403).json({ 
        erro: error.message 
      });
    }
  }
}
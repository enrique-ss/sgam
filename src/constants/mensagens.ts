export const MENSAGENS = {
  // Autenticação
  AUTH: {
    LOGIN_SUCESSO: 'Login realizado com sucesso!',
    LOGIN_ERRO: 'Email ou senha incorretos.',
    CONTA_DESATIVADA: 'Sua conta está desativada. Contate o administrador.',
    TOKEN_INVALIDO: 'Token inválido ou expirado.',
    NAO_AUTORIZADO: 'Você não tem autorização para acessar este recurso.',
  },

  // Usuários
  USUARIO: {
    CRIADO_SUCESSO: 'Usuário criado com sucesso!',
    ATUALIZADO_SUCESSO: 'Usuário atualizado com sucesso!',
    DELETADO_SUCESSO: 'Usuário deletado com sucesso!',
    NAO_ENCONTRADO: 'Usuário não encontrado.',
    EMAIL_JA_EXISTE: 'Este email já está cadastrado.',
    SENHA_INVALIDA: 'A senha deve ter no mínimo 6 caracteres.',
    NAO_PODE_DESATIVAR_PROPRIO: 'Você não pode desativar sua própria conta.',
    NAO_PODE_ALTERAR_PROPRIO_NIVEL: 'Você não pode alterar seu próprio nível de acesso.',
  },

  // Pedidos
  PEDIDO: {
    CRIADO_SUCESSO: 'Pedido criado com sucesso!',
    ATUALIZADO_SUCESSO: 'Pedido atualizado com sucesso!',
    DELETADO_SUCESSO: 'Pedido deletado com sucesso!',
    NAO_ENCONTRADO: 'Pedido não encontrado.',
    ASSUMIDO_SUCESSO: 'Pedido assumido com sucesso!',
    CONCLUIDO_SUCESSO: 'Pedido concluído com sucesso!',
    CANCELADO_SUCESSO: 'Pedido cancelado com sucesso!',
    JA_TEM_RESPONSAVEL: 'Este pedido já tem um responsável.',
    NAO_E_RESPONSAVEL: 'Você não é o responsável por este pedido.',
    NAO_PODE_ASSUMIR: 'Apenas colaboradores e administradores podem assumir pedidos.',
    TRANSICAO_INVALIDA: 'Transição de status inválida.',
    STATUS_INVALIDO: 'Status inválido.',
  },

  // Validação
  VALIDACAO: {
    CAMPO_OBRIGATORIO: 'Este campo é obrigatório.',
    EMAIL_INVALIDO: 'Email inválido.',
    DATA_INVALIDA: 'Data inválida.',
    VALOR_INVALIDO: 'Valor inválido.',
    DADOS_INVALIDOS: 'Dados inválidos fornecidos.',
  },

  // Sistema
  SISTEMA: {
    ERRO_INTERNO: 'Erro interno do servidor. Tente novamente mais tarde.',
    BANCO_ERRO: 'Erro ao acessar o banco de dados.',
  },
};

export default MENSAGENS;
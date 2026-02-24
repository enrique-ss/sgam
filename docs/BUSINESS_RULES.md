# Regras de Negócio

## Visão geral

Sistema para gerenciar pedidos de serviços de uma agência de marketing. Clientes solicitam serviços, colaboradores executam e administradores supervisionam tudo.

---

## Níveis de acesso

**Cliente:** cria pedidos, acompanha e cancela os seus próprios, vê o histórico dos seus pedidos. Não acessa pedidos de outros clientes nem gerencia usuários.

**Colaborador:** vê todos os pedidos pendentes, assume pedidos, cria pedidos em nome de clientes que pedem por telefone ou email, conclui e cancela os pedidos que assumiu. Não acessa pedidos de outros colaboradores nem relatórios globais.

**Administrador:** tudo que o colaborador faz, mais acesso a todos os pedidos do sistema, edição de qualquer pedido, gestão de usuários e relatórios globais. Não pode se autodesativar nem alterar o próprio nível de acesso.

---

## Estados de um pedido

| Estado | Significado |
|---|---|
| Pendente | Aguardando alguém assumir |
| Em andamento | Alguém está trabalhando |
| Atrasado | Passou do prazo |
| Entregue | Finalizado com sucesso |
| Cancelado | Abortado com justificativa |

### Transições permitidas

Pendente pode ir para Em andamento (quando assumido) ou Cancelado.

Em andamento pode ir para Entregue (quando concluído), Atrasado (quando o prazo passa) ou Cancelado.

Atrasado pode ir para Entregue (quando concluído) ou Cancelado.

Entregue e Cancelado são estados finais. Não há transição a partir deles.

---

## Casos de uso

### Cliente cria pedido

O cliente preenche título, tipo, descrição, orçamento e prazo. O sistema cria o pedido com status Pendente e registra no histórico.

### Colaborador assume pedido

O colaborador seleciona um pedido Pendente e o assume. O status muda para Em andamento. O histórico é registrado e o cliente é notificado.

### Colaborador conclui pedido

O colaborador conclui um pedido Em andamento ou Atrasado. O status muda para Entregue, a data de conclusão é registrada e o cliente é notificado.

### Cancelar pedido

Qualquer usuário com permissão pode cancelar um pedido que não esteja Entregue ou já Cancelado. O motivo é obrigatório com mínimo de 10 caracteres. O histórico é registrado com o motivo e as partes envolvidas são notificadas.

### Detecção automática de atraso

Todo dia à meia noite o sistema verifica pedidos Em andamento com prazo vencido. Os que ainda não foram marcados como atrasados mudam para Atrasado. O histórico é registrado pelo sistema e o responsável e o admin são notificados. Pedidos já atrasados são ignorados para evitar registros duplicados.

### Desativação de colaborador

Quando um admin desativa um colaborador, o sistema redistribui automaticamente os pedidos Em andamento ou Atrasados que eram dele. O responsável é removido, o status volta para Pendente e o histórico é registrado com o motivo "Responsável desativado".

---

## Entidades

### Usuarios

| Campo | Tipo | Descrição |
|---|---|---|
| id | Número | Identificador único |
| nome | Texto (255) | Nome completo |
| email | Texto (255) | Email único, usado no login |
| senha | Texto (255) | Senha criptografada |
| nivel_acesso | Enum | cliente, colaborador, admin |
| ativo | Boolean | Define se pode acessar o sistema |
| ultimo_login | Data e hora | Última vez que entrou |
| criado_em | Data e hora | Data de cadastro |
| atualizado_em | Data e hora | Última modificação |

### Pedidos

| Campo | Tipo | Descrição |
|---|---|---|
| id | Número | Identificador único |
| cliente_id | Número | Dono do pedido |
| criado_por | Número | Quem registrou no sistema |
| responsavel_id | Número | Quem está executando |
| titulo | Texto (255) | Nome do pedido |
| tipo_servico | Texto (100) | Design, Dev, Story ou SEO |
| descricao | Texto longo | Detalhes do pedido |
| orcamento | Decimal | Valor do serviço |
| prazo_entrega | Data | Data limite |
| status | Enum | Estado atual |
| prioridade | Enum | baixa, media, alta, urgente |
| concluido_em | Data e hora | Quando foi finalizado |
| criado_em | Data e hora | Quando foi criado |
| atualizado_em | Data e hora | Última modificação |

`cliente_id` e `criado_por` são campos distintos porque um colaborador pode registrar um pedido em nome de um cliente que entrou em contato por fora do sistema.

### Pedidos Status Log

| Campo | Tipo | Descrição |
|---|---|---|
| id | Número | Identificador único |
| pedido_id | Número | Pedido relacionado |
| status_anterior | Enum | Estado antes da mudança |
| status_novo | Enum | Estado depois da mudança |
| alterado_por | Número | Quem alterou. Vazio quando é o sistema |
| motivo | Texto longo | Justificativa da mudança |
| alterado_em | Data e hora | Quando ocorreu |

Este log é imutável e nunca é apagado. Serve como trilha de auditoria completa de tudo que aconteceu com cada pedido.

---

## Regras de integridade

Se `responsavel_id` estiver vazio, o status deve ser Pendente. Se estiver preenchido, o status não pode ser Pendente. Essa regra evita inconsistências como pedido com responsável parado em Pendente ou pedido Em andamento sem ninguém responsável.

Usuários nunca são deletados do banco. Apenas marcados como `ativo = false`. Isso preserva a integridade do histórico e permite reativação futura.

---

## Função central de mudança de status

Toda mudança de status passa por uma única função. Ela recebe o ID do pedido, o novo status, o ID do usuário responsável pela ação (vazio se for o sistema) e o motivo quando aplicável. A função atualiza o pedido, registra no histórico e dispara a notificação. Nenhuma parte do sistema muda status diretamente sem passar por ela.

---

## Validações

Ao criar pedido: título com mínimo de 5 caracteres, tipo deve ser Design, Dev, Story ou SEO, descrição com mínimo de 20 caracteres, orçamento maior que zero e prazo em data futura.

Ao cadastrar usuário: nome com mínimo de 3 caracteres, email em formato válido e único, senha com mínimo de 8 caracteres.

Ao cancelar: motivo com mínimo de 10 caracteres.

---

## Notificações

| Evento | Quem recebe |
|---|---|
| Pedido criado | Cliente |
| Pedido assumido | Cliente |
| Pedido concluído | Cliente |
| Pedido cancelado | Cliente e responsável |
| Pedido atrasado | Responsável e admin |

---

## Roadmap

**V1:** cadastro e login, três níveis de acesso, fluxo completo de pedidos, histórico imutável, dashboards por nível, gestão de usuários, relatórios, notificações in-app, detecção automática de atraso e redistribuição ao desativar colaborador.

**V2:** notificações por email, desativação automática por inatividade, upload de anexos, comentários em pedidos e tags customizáveis.
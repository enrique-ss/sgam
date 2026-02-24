# SGAM

Sistema de Gerenciamento de Agência de Marketing. Desenvolvido como projeto final do curso RSTI Backend do Senac, a partir das necessidades reais de uma cliente. Gerencia pedidos de serviços entre clientes, colaboradores e administradores, com histórico completo, automações e dashboards por nível de acesso.

## Como rodar

Clone o repositório, instale as dependências com `npm install`, configure o `.env` com base no `.env.example` e execute com `npm run dev`.

## O que o sistema faz

Clientes criam pedidos de serviços. Colaboradores assumem e executam. Administradores supervisionam tudo. O sistema acompanha cada mudança de status com histórico imutável e automatiza detecção de atrasos e redistribuição de pedidos quando um colaborador é desativado.

## Níveis de acesso

**Cliente:** cria e acompanha seus próprios pedidos.

**Colaborador:** vê pedidos pendentes, assume, conclui e cancela os que são seus.

**Administrador:** acesso total, gestão de usuários, relatórios e estatísticas globais.

## Estados de um pedido

Pendente, Em Andamento, Atrasado, Entregue e Cancelado. Toda mudança de estado passa por uma função central que registra o histórico automaticamente, tornando impossível perder o rastreio de uma alteração.

## Automações

Todo dia à meia noite o sistema detecta pedidos com prazo vencido e os marca como atrasados. Ao desativar um colaborador, seus pedidos em aberto voltam automaticamente para a fila de pendentes.

## Stack

TypeScript, Node.js, Express e MySQL. Arquitetura em camadas com Controllers, Services e Models.

## Documentação

As regras de negócio completas, fluxos de estado, permissões e decisões de arquitetura estão documentadas em `/docs`.

---

Desenvolvido por Luiz Enrique.
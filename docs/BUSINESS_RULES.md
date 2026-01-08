# 📋 REGRAS DE NEGÓCIO - SISTEMA DE PEDIDOS

## 🎯 PASSO 1: VISÃO GERAL

### **O que é o sistema?**

Um sistema para gerenciar pedidos de serviços de uma agência de marketing. Clientes solicitam serviços, colaboradores executam, e administradores gerenciam tudo.

### **Quem usa?**

- **👤 Cliente:** Pessoa que solicita serviços (Logo, Site, Campanha, etc)
- **👨‍💼 Colaborador:** Profissional que executa os serviços
- **👔 Administrador:** Gerencia equipe e sistema (também pode executar serviços)

### **O que o sistema faz?**

- Cliente cria pedidos
- Colaboradores assumem e executam pedidos
- Sistema acompanha o progresso
- Admin supervisiona tudo
- Todos veem o histórico completo

---

## 🚦 PASSO 2: FLUXO DO PEDIDO (MACRO)

### **Estados do Pedido:**

Um pedido pode estar em 5 estados diferentes:

| Estado         | Significado                    |
|----------------|--------------------------------|
| **PENDENTE**   | Aguardando alguém assumir      |
| **EM_ANDAMENTO** | Alguém está trabalhando      |
| **ATRASADO**   | Passou do prazo                |
| **ENTREGUE**   | Finalizado com sucesso         |
| **CANCELADO**  | Abortado por algum motivo      |

### **Fluxo Visual:**

```
CRIAÇÃO
   ↓
PENDENTE ──assumir──► EM_ANDAMENTO ──concluir──► ENTREGUE
   │                       │
   │                       ├──atraso──► ATRASADO ──concluir──► ENTREGUE
   │                       │                │
   └───────cancelar────────┴────────cancelar┴──► CANCELADO
```

### **Regras Básicas:**

1. **PENDENTE:** Ninguém está trabalhando ainda
2. **EM_ANDAMENTO:** Alguém assumiu e está fazendo
3. **ATRASADO:** Sistema detecta que passou do prazo
4. **ENTREGUE:** Trabalho concluído
5. **CANCELADO:** Não será feito

---

## 👥 PASSO 3: PAPÉIS E PERMISSÕES (CONCEITUAL)

### **🔷 CLIENTE**

**O que pode fazer:**
- Criar pedidos
- Ver seus pedidos
- Cancelar seus pedidos (com justificativa)
- Ver histórico dos seus pedidos

**O que NÃO pode fazer:**
- Ver pedidos de outros clientes
- Assumir pedidos
- Gerenciar usuários

---

### **🔷 COLABORADOR**

**O que pode fazer:**
- Ver todos os pedidos pendentes
- Assumir pedidos pendentes
- Criar pedidos (para clientes que pedem por telefone/email)
- Concluir pedidos que assumiu
- Cancelar pedidos que assumiu (com justificativa)
- Ver histórico dos pedidos que assumiu

**O que NÃO pode fazer:**
- Concluir pedidos de outros colaboradores
- Gerenciar usuários
- Ver relatórios globais

---

### **🔷 ADMINISTRADOR**

**O que pode fazer:**
- Tudo que colaborador faz
- Ver TODOS os pedidos do sistema
- Ver histórico de QUALQUER pedido
- Editar qualquer pedido
- Gerenciar usuários (ativar/desativar, mudar nível)
- Ver relatórios e estatísticas globais
- Cancelar qualquer pedido (com justificativa)

**Restrições de segurança:**
- Não pode se auto-desativar
- Não pode mudar seu próprio nível de acesso

---

## 📝 PASSO 4: CASOS DE USO PRINCIPAIS

### **Caso 1: Cliente Cria Pedido**

**Ator:** Cliente  
**Pré-condição:** Cliente está logado  

**Fluxo:**
1. Cliente preenche formulário (Título, Tipo, Descrição, Orçamento, Prazo)
2. Sistema cria pedido com status PENDENTE
3. Sistema registra histórico: "Cliente criou pedido"
4. Cliente recebe confirmação

**Resultado:** Pedido criado e aguardando colaborador assumir

---

### **Caso 2: Colaborador Assume Pedido**

**Ator:** Colaborador ou Admin  
**Pré-condição:** Pedido está PENDENTE  

**Fluxo:**
1. Colaborador vê lista de pedidos pendentes
2. Colaborador clica "Assumir"
3. Sistema muda status para EM_ANDAMENTO
4. Sistema registra histórico: "Colaborador assumiu pedido"
5. Cliente recebe notificação

**Resultado:** Colaborador agora é responsável pelo pedido

---

### **Caso 3: Colaborador Conclui Pedido**

**Ator:** Colaborador (responsável) ou Admin  
**Pré-condição:** Pedido está EM_ANDAMENTO ou ATRASADO  

**Fluxo:**
1. Colaborador clica "Concluir"
2. Sistema muda status para ENTREGUE
3. Sistema registra data de conclusão
4. Sistema registra histórico: "Colaborador concluiu pedido"
5. Cliente recebe notificação

**Resultado:** Pedido finalizado

---

### **Caso 4: Cancelar Pedido**

**Atores:** Cliente (seus pedidos), Colaborador (pedidos que assumiu), Admin (qualquer)  
**Pré-condição:** Pedido NÃO está ENTREGUE ou CANCELADO  

**Fluxo:**
1. Usuário clica "Cancelar"
2. Sistema pede motivo (obrigatório, mínimo 10 caracteres)
3. Usuário preenche motivo
4. Sistema muda status para CANCELADO
5. Sistema registra data de conclusão
6. Sistema registra histórico com motivo
7. Partes envolvidas recebem notificação

**Resultado:** Pedido cancelado com justificativa registrada

---

### **Caso 5: Sistema Detecta Atraso**

**Ator:** Sistema (automático)  
**Quando:** Todo dia às 00:00  

**Fluxo:**
1. Sistema busca pedidos EM_ANDAMENTO
2. Para cada pedido, verifica se prazo passou
3. Se passou E ainda não foi marcado como atrasado:
   - Muda status para ATRASADO
   - Registra histórico: "Sistema detectou atraso"
   - Notifica responsável e admin

**Resultado:** Pedidos atrasados ficam visíveis e destacados

---

### **Caso 6: Admin Desativa Colaborador**

**Ator:** Admin  
**Pré-condição:** Colaborador tem pedidos em aberto  

**Fluxo:**
1. Admin desativa colaborador
2. Sistema avisa: "Este usuário tem X pedidos em aberto"
3. Admin confirma
4. Sistema remove colaborador dos pedidos
5. Pedidos voltam para status PENDENTE
6. Sistema registra histórico: "Sistema removeu responsável inativo"
7. Pedidos ficam disponíveis para outros assumirem

**Resultado:** Trabalho não fica parado

---

## 📦 PASSO 5: ENTIDADES E DADOS (A partir daqui entramos em estrutura técnica)

Agora que você entende como o sistema funciona, vamos definir o que precisa ser guardado.

### **Entidade 1: USUARIOS**

**O que guarda:** Dados das pessoas que usam o sistema

| Campo          | Tipo          | Descrição                    |
|----------------|---------------|------------------------------|
| id             | Número        | Identificador único          |
| nome           | Texto (255)   | Nome completo                |
| email          | Texto (255)   | Email único (login)          |
| senha          | Texto (255)   | Senha criptografada          |
| nivel_acesso   | Opções        | cliente, colaborador, admin  |
| ativo          | Sim/Não       | Pode entrar no sistema?      |
| ultimo_login   | Data e Hora   | Última vez que entrou        |
| criado_em      | Data e Hora   | Quando foi cadastrado        |
| atualizado_em  | Data e Hora   | Última modificação           |

**Valores permitidos:**
- `nivel_acesso`: "cliente", "colaborador", "admin"

---

### **Entidade 2: PEDIDOS**

**O que guarda:** Informações sobre serviços solicitados

| Campo          | Tipo          | Descrição                    |
|----------------|---------------|------------------------------|
| id             | Número        | Identificador único          |
| cliente_id     | Número        | Quem solicitou               |
| criado_por     | Número        | Quem registrou no sistema    |
| responsavel_id | Número        | Quem está fazendo            |
| titulo         | Texto (255)   | Nome do pedido               |
| tipo_servico   | Texto (100)   | Design, Dev, Story, SEO      |
| descricao      | Texto longo   | Detalhes do pedido           |
| orcamento      | Dinheiro      | Valor do serviço             |
| prazo_entrega  | Data          | Data limite                  |
| status         | Opções        | Estado atual                 |
| prioridade     | Opções        | Urgência                     |
| concluido_em   | Data e Hora   | Quando finalizou             |
| criado_em      | Data e Hora   | Quando foi criado            |
| atualizado_em  | Data e Hora   | Última modificação           |

**Valores permitidos:**
- `status`: "pendente", "em_andamento", "atrasado", "entregue", "cancelado"
- `prioridade`: "baixa", "media", "alta", "urgente"

**Por que cliente_id ≠ criado_por?**
- `cliente_id`: De quem é o pedido (dono)
- `criado_por`: Quem registrou no sistema (pode ser colaborador ajudando)
- Exemplo: Cliente liga, colaborador registra o pedido dele

---

### **Entidade 3: PEDIDOS_STATUS_LOG**

**O que guarda:** Histórico de todas as mudanças de status

| Campo           | Tipo        | Descrição                    |
|-----------------|-------------|------------------------------|
| id              | Número      | Identificador único          |
| pedido_id       | Número      | Qual pedido                  |
| status_anterior | Opções      | Estado antes                 |
| status_novo     | Opções      | Estado depois                |
| alterado_por    | Número      | Quem mudou (vazio = sistema) |
| motivo          | Texto longo | Justificativa                |
| alterado_em     | Data e Hora | Quando mudou                 |

**Para que serve:**
- **Auditoria:** Saber tudo que aconteceu
- **Rastreabilidade:** Quem fez e quando
- **Justificativas:** Por que foi cancelado
- **Permanente:** Nunca é apagado

---

## 🔒 PASSO 6: REGRAS DE INTEGRIDADE E AUTOMAÇÕES

### **Regra 1: Integridade Status x Responsável**

```
SE responsavel_id está vazio
ENTÃO status DEVE ser 'pendente'

SE responsavel_id está preenchido
ENTÃO status NÃO pode ser 'pendente'
```

**Por quê?** Evita inconsistências:
- ❌ Pedido com responsável mas pendente
- ❌ Pedido sem responsável mas em andamento

---

### **Regra 2: Soft Delete de Usuários**

```
❌ NUNCA deletar usuários do banco
✅ Apenas marcar como ativo = false
```

**Por quê?**
- Preserva integridade (pedidos, histórico)
- Permite reativação futura
- Mantém auditoria completa

---

### **Regra 3: Automação - Atraso**

**Quando:** Todo dia às 00:00  
**O que faz:**

```
Para cada pedido:
  SE status == 'em_andamento'
  E data_atual > prazo_entrega
  E NÃO existe log de atraso
  ENTÃO:
    • Muda status para 'atrasado'
    • Registra histórico (alterado_por = vazio)
    • Motivo: "Prazo excedido automaticamente"
    • Notifica responsável e admin
```

**Proteção:** Pedidos já atrasados são ignorados (não processa de novo)

---

### **Regra 4: Automação - Responsável Desativado**

**Quando:** Admin desativa colaborador  
**O que faz:**

```
Para cada pedido do colaborador:
  SE status == 'em_andamento' OU 'atrasado'
  ENTÃO:
    • Remove responsavel_id (fica vazio)
    • Muda status para 'pendente'
    • Registra histórico (alterado_por = vazio)
    • Motivo: "Responsável desativado"
```

**Resultado:** Pedidos voltam para fila de pendentes

---

## 🎯 PASSO 7: IMPLEMENTAÇÃO TÉCNICA

### **Função Central de Mudança de Status**

**Problema:** Se status puder ser mudado em vários lugares, é fácil esquecer de registrar histórico.

**Solução:** UMA função que SEMPRE é usada para mudar status.

**Como funciona:**

```
Função: mudarStatusPedido

Entrada:
  • ID do pedido
  • Novo status
  • ID do usuário (vazio se sistema)
  • Motivo (se cancelamento)

Executa:
  1. Busca status atual
  2. Atualiza pedido
  3. Atualiza concluido_em (se aplicável)
  4. Registra no histórico (SEMPRE)
  5. Cria notificação

Resultado: Impossível esquecer histórico
```

**Quem usa:**
- Controller ao assumir pedido
- Controller ao concluir pedido
- Controller ao cancelar pedido
- Job de atraso
- Automação de desativação

---

### **Validações**

**Ao criar pedido:**
- Título: mínimo 5 caracteres
- Tipo: Design, Dev, Story ou SEO
- Descrição: mínimo 20 caracteres
- Orçamento: maior que zero
- Prazo: data futura

**Ao cadastrar usuário:**
- Nome: mínimo 3 caracteres
- Email: formato válido e único
- Senha: mínimo 8 caracteres

**Ao cancelar:**
- Motivo: mínimo 10 caracteres

---

### **Notificações**

**Quando notificar:**

| Evento              | Quem recebe           | Mensagem                    |
|---------------------|-----------------------|-----------------------------|
| Pedido criado       | Cliente               | "Pedido criado!"            |
| Pedido assumido     | Cliente               | "Maria assumiu seu pedido"  |
| Pedido concluído    | Cliente               | "Pedido entregue!"          |
| Pedido cancelado    | Cliente + Responsável | "Pedido cancelado. Motivo..." |
| Pedido atrasado     | Responsável + Admin   | "Pedido atrasado"           |

**Onde exibir:**
- Sino no topo da tela (badge com número)
- Dropdown com últimas notificações
- Página "Todas as notificações"

---

## 📊 PASSO 8: UX, DASHBOARDS E RELATÓRIOS

### **Dashboard Cliente**

**Visão:**
- Meus pedidos em aberto (pendente, andamento, atrasado)
- Minhas entregas (entregue, cancelado)
- Botão criar novo pedido

---

### **Dashboard Colaborador**

**Estatísticas Pessoais:**
- Gráfico: Meus pedidos por tipo de serviço
- Gráfico: Meus pedidos por status
- Próximas entregas (ordenadas por prioridade)
- Meus pedidos atrasados

**Ações:**
- Ver pedidos pendentes (assumir)
- Ver meus pedidos (concluir/cancelar)
- Ver finalizados (histórico)

---

### **Dashboard Admin**

**Estatísticas Pessoais (como colaborador):**
- Meus pedidos por tipo
- Meus pedidos por status
- Minhas próximas entregas

**Estatísticas Globais:**
- Total de pedidos
- Taxa de conclusão
- Tempo médio de entrega
- Pedidos atrasados (todos)
- Produtividade por responsável
- Alertas de inatividade

**Ações Administrativas:**
- Gestão de clientes (ativar/desativar)
- Gestão de equipe (ativar/desativar, mudar nível)
- Ver todos os pedidos
- Relatórios avançados

---

### **Relatórios (Admin)**

**1. Ranking de Produtividade**
- Quem mais conclui pedidos

**2. Taxa de Cancelamento**
- Quem mais cancela (motivos principais)

**3. Tempo Médio de Entrega**
- Desempenho por pedido concluído

**4. Análise de Atrasos**
- Pedidos que atrasaram (dias de atraso)

**5. Motivos de Cancelamento**
- Por que clientes cancelam

---

### **Cores e Visual**

**Status:**
- 🔵 Pendente: Azul
- 🟡 Em Andamento: Amarelo
- 🔴 Atrasado: Vermelho
- 🟢 Entregue: Verde
- ⚫ Cancelado: Cinza

**Prioridade:**
- 🔴 Urgente: Vermelho
- 🟠 Alta: Laranja
- 🟡 Média: Amarelo
- 🟢 Baixa: Verde

---

## ✅ PASSO 9: CHECKLIST FINAL

### **Funcionalidades V1:**

**Essenciais:**
- ✅ Cadastro e login
- ✅ 3 níveis de acesso
- ✅ Criar, assumir, concluir, cancelar pedidos
- ✅ 5 estados de pedido
- ✅ Histórico completo com motivos
- ✅ Dashboard por nível
- ✅ Gestão de usuários (admin)
- ✅ Relatórios (admin)
- ✅ Notificações in-app
- ✅ Atraso automático
- ✅ Desativação com redistribuição

**Segurança:**
- ✅ Senhas criptografadas
- ✅ Soft delete
- ✅ Validação de permissões
- ✅ Histórico imutável
- ✅ Proteções admin

---

### **Recursos Futuros (V2):**

- ⏳ Notificações por email
- ⏳ Desativação automática por inatividade (30 dias)
- ⏳ Upload de arquivos (anexos)
- ⏳ Comentários em pedidos
- ⏳ Tags customizáveis

---

## 🎓 ROADMAP DE IMPLEMENTAÇÃO

**Fase 1: Base**
1. Backend: Tabelas e migrations
2. Backend: Função central de status
3. Backend: Autenticação e permissões

**Fase 2: Core**
4. CRUD de pedidos
5. Histórico automático
6. Dashboard básico

**Fase 3: Automações**
7. Job de atraso
8. Desativação com redistribuição
9. Notificações in-app

**Fase 4: Admin**
10. Gestão de usuários
11. Relatórios
12. Estatísticas globais

**Fase 5: Polimento**
13. Responsividade
14. Validações completas
15. Testes e ajustes
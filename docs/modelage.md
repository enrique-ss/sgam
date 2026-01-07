# 📊 MODELAGEM DE DADOS - SGAM

## 💭 CONTEXTO E MOTIVAÇÃO

### **🎯 O Problema**

Durante o desenvolvimento do SGAM, criei três interfaces diferentes para o mesmo sistema:

```
📱 Interface Web (Frontend)
   └─► Permitia criar pedidos sem prioridade
   └─► Status mudavam de forma diferente
   └─► Algumas validações não existiam

🖥️ CLI (Command Line Interface)
   └─► Tinha regras próprias de negócio
   └─► Colaborador podia criar pedido como cliente
   └─► Comportamento diferente do web

🔌 Backend API
   └─► Validações parcialmente implementadas
   └─► Endpoints com comportamentos inconsistentes
   └─► Sem documentação clara das regras
```

**Resultado:** Parecia que eu tinha 3 sistemas diferentes, não 1 só!

### **😓 Dores que eu sentia:**

1. **Perda de tempo brutal** - Precisava abrir 3 códigos diferentes pra lembrar as regras
2. **Bugs e inconsistências** - Backend aceitava dados que o frontend bloqueava
3. **Falta de clareza** - Eu mesmo não sabia mais quais eram as regras "corretas"

### **💡 A Solução: Modelagem de Dados**

Percebi que o problema não era técnico, era de **planejamento**. Parei de codificar e comecei a documentar.

### **🎯 Resultado Final**

✅ **Uma fonte única da verdade** - Todas as interfaces seguem as mesmas regras  
✅ **Facilidade para desenvolver** - Abro a documentação e sei exatamente o que implementar  
✅ **Consistência garantida** - Backend valida exatamente o que o frontend espera  
✅ **Manutenibilidade** - Mudanças são planejadas na documentação primeiro  

---

## 🧩 PASSO 1: IDENTIFICAR ENTIDADES

**Pergunta:** O que preciso guardar no sistema?

```
👤 PESSOAS que usam o sistema → USUARIOS
📋 SERVIÇOS solicitados → PEDIDOS
📜 HISTÓRICO de mudanças → PEDIDOS_STATUS_LOG
```

---

## 📋 PASSO 2: DEFINIR ESTRUTURA DAS TABELAS

### **📦 Tabela: USUARIOS**

```
┌─────────────────────────────────────┐
│              USUARIOS               │
├─────────────────────────────────────┤
│ 🔑 id (PK)       → Identificador    │
│ 👤 nome          → "João Silva"     │
│ 📧 email         → Login único      │
│ 🔒 senha         → Criptografada    │
│ 🎭 nivel_acesso  → Tipo usuário     │
│ ✅ ativo         → Pode entrar?     │
│ 🕐 ultimo_login  → Última vez       │
│ 📅 criado_em     → Quando criou     │
│ 🔄 atualizado_em → Última mudança   │
└─────────────────────────────────────┘
```

### **🔐 Regras de Segurança**

**AO CADASTRAR:**
1. Email único (verifica se já existe)
2. Senha criptografada (bcrypt, nunca texto puro)
3. Valores iniciais automáticos: `nivel_acesso = 'cliente'`, `ativo = true`

**VERIFICAÇÃO DIÁRIA (00:00):**
```
Para cada usuário:
  SE nivel_acesso == 'colaborador'
  E ultimo_login > 30 dias
  ENTÃO ativo = false
  
⚡ Admin e Cliente são IMUNES
```

**AO FAZER LOGIN:**
```
1. Email existe? ✅
2. Senha correta? ✅
3. ativo = false? ❌ Bloquear login com mensagem:
   "Conta desativada. Contate um Administrador."
```

**🚫 DELEÇÃO DE USUÁRIOS:**
```
❌ NUNCA deletar usuários do banco de dados (soft delete obrigatório)
✅ Apenas marcar como ativo = false

Por quê?
• Preserva integridade referencial (pedidos, logs)
• Mantém auditoria completa
• Permite reativação futura se necessário
```

### **📋 Especificações Técnicas - USUARIOS**

| Campo         | Tipo          | Restrições                    | Por que?                                    |
|---------------|---------------|-------------------------------|---------------------------------------------|
| id            | INT           | PK, AUTO_INCREMENT            | Identificador único automático              |
| nome          | VARCHAR(255)  | NOT NULL                      | Nome obrigatório                            |
| email         | VARCHAR(255)  | NOT NULL, UNIQUE              | Login único                                 |
| senha         | VARCHAR(255)  | NOT NULL                      | Hash bcrypt (60 chars)                      |
| nivel_acesso  | ENUM          | DEFAULT 'cliente'             | 'cliente', 'colaborador', 'admin'           |
| ativo         | BOOLEAN       | DEFAULT true                  | Controla acesso ao sistema                  |
| ultimo_login  | TIMESTAMP     | NULL                          | Última vez que entrou                       |
| criado_em     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Data de cadastro (banco controla)           |
| atualizado_em | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Última modificação (TRIGGER atualiza)       |

**⚠️ DECISÃO TÉCNICA: ENUM vs Tabelas de Domínio**
```
Este projeto usa ENUM para simplicidade:
• nivel_acesso: ENUM('cliente', 'colaborador', 'admin')
• status: ENUM('pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado')
• prioridade: ENUM('baixa', 'media', 'alta', 'urgente')

Vantagens:
✅ Menos JOINs nas queries
✅ Validação nativa do banco
✅ Mais simples de implementar

Desvantagens:
❌ Mudar valores requer ALTER TABLE
❌ Sem metadados (descrição, ordem, etc)

💡 Para projetos maiores, considere tabelas de domínio separadas
```

---

### **📦 Tabela: PEDIDOS**

```
┌─────────────────────────────────────┐
│           PEDIDOS                   │
├─────────────────────────────────────┤
│ 🔑 id (PK)           → Identificador│
│ 👤 cliente_id (FK)   → Quem pediu   │
│ 👤 responsavel_id (FK) → Quem assumiu│
│ 📝 titulo            → "Logo Nova"  │
│ 🏷️ tipo_servico      → "Design"     │
│ 📄 descricao         → Detalhes     │
│ 💰 orcamento         → R$ 5.000     │
│ 📅 prazo_entrega     → 2026-01-20   │
│ 🚦 status            → Estado atual │
│ ⚡ prioridade        → Importância  │
│ 👤 cancelado_por (FK) → Quem cancelou│
│ 👤 concluido_por (FK) → Quem finalizou│
│ ✅ data_conclusao    → Quando acabou│
│ 📅 criado_em         → Quando criou │
│ 🔄 atualizado_em     → Última mudança│
└─────────────────────────────────────┘
```

### **📝 Regras ao Criar Pedido**

**CLIENTE cria pedido:**
```
Formulário:
  ✅ Título, Tipo Serviço, Descrição, Orçamento, Prazo (obrigatórios)
  
Banco salva automaticamente:
  • cliente_id = ID do usuário logado
  • responsavel_id = NULL
  • status = 'pendente'
  • prioridade = NULL
  
Log automático:
  • pedido_id, status_novo = 'pendente', alterado_por = ID do cliente
```

**COLABORADOR/ADMIN cria pedido:**
```
Formulário:
  ✅ Cliente, Título, Tipo, Descrição, Orçamento, Prazo, Prioridade (obrigatórios)
  
Banco salva automaticamente:
  • cliente_id = escolhido no formulário
  • responsavel_id = ID do colab/admin logado
  • status = 'em_andamento' (já assume o pedido)
  • prioridade = valor escolhido
  
Log automático:
  • pedido_id, status_novo = 'em_andamento', alterado_por = ID do colab
  
🎯 Uso: Registrar pedidos vindos de fora da plataforma
```

### **📋 Especificações Técnicas - PEDIDOS**

| Campo          | Tipo          | Restrições                    | Por que?                                    |
|----------------|---------------|-------------------------------|---------------------------------------------|
| id             | INT           | PK, AUTO_INCREMENT            | Identificador único automático              |
| cliente_id     | INT           | FK USUARIOS.id, NOT NULL      | Quem solicitou o pedido                     |
| responsavel_id | INT           | FK USUARIOS.id, NULL          | Quem está fazendo                           |
| titulo         | VARCHAR(255)  | NOT NULL                      | Nome do pedido                              |
| tipo_servico   | VARCHAR(100)  | NOT NULL                      | Design, Dev, Story, SEO                     |
| descricao      | TEXT          | NOT NULL                      | Detalhes do pedido                          |
| orcamento      | DECIMAL(10,2) | NOT NULL                      | Valor até 99.999.999,99                     |
| prazo_entrega  | DATE          | NOT NULL                      | Data limite (YYYY-MM-DD)                    |
| status         | ENUM          | DEFAULT 'pendente'            | 'pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado' |
| prioridade     | ENUM          | NULL                          | 'baixa', 'media', 'alta', 'urgente'         |
| cancelado_por  | INT           | FK USUARIOS.id, NULL          | Rastreabilidade                             |
| concluido_por  | INT           | FK USUARIOS.id, NULL          | Rastreabilidade                             |
| data_conclusao | TIMESTAMP     | NULL                          | Quando finalizou                            |
| criado_em      | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Data de criação (banco controla)            |
| atualizado_em  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Última modificação (TRIGGER atualiza)       |

---

### **📦 Tabela: PEDIDOS_STATUS_LOG**

```
┌─────────────────────────────────────┐
│      PEDIDOS_STATUS_LOG             │
├─────────────────────────────────────┤
│ 🔑 id (PK)          → Identificador │
│ 📋 pedido_id (FK)   → Qual pedido   │
│ 🔴 status_anterior  → Estado antigo │
│ 🟢 status_novo      → Estado novo   │
│ 👤 alterado_por (FK) → Quem mudou   │
│ 📅 alterado_em      → Quando mudou  │
└─────────────────────────────────────┘
```

### **🎯 Objetivo**

- **Auditoria:** Saber o que aconteceu com cada pedido
- **Rastreabilidade:** Quem fez cada mudança e quando
- **Histórico permanente:** Log nunca é deletado (pedido_id pode virar NULL se pedido for excluído)

### **📜 Quando Registra**

```
Criar pedido    → status_anterior = NULL, status_novo = 'pendente' ou 'em_andamento'
Assumir         → 'pendente' → 'em_andamento'
Atraso (AUTO)   → 'em_andamento' → 'atrasado' (alterado_por = NULL, APENAS NA PRIMEIRA VEZ)
Concluir        → 'em_andamento' ou 'atrasado' → 'entregue'
Cancelar        → qualquer status → 'cancelado'

⚡ alterado_por = NULL significa que foi o SISTEMA (não um usuário)
⚡ Job de atraso gera log APENAS UMA VEZ na primeira detecção
```

### **📋 Especificações Técnicas - PEDIDOS_STATUS_LOG**

| Campo           | Tipo       | Restrições                 | Por que?                                    |
|-----------------|------------|----------------------------|---------------------------------------------|
| id              | INT        | PK, AUTO_INCREMENT         | Identificador único automático              |
| pedido_id       | INT        | FK PEDIDOS.id, NULL        | Qual pedido mudou (NULL se pedido deletado) |
| status_anterior | ENUM       | NULL                       | 'pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado' |
| status_novo     | ENUM       | NOT NULL                   | 'pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado' |
| alterado_por    | INT        | FK USUARIOS.id, NULL       | Quem mudou (NULL = sistema)                 |
| alterado_em     | TIMESTAMP  | DEFAULT CURRENT_TIMESTAMP  | Quando mudou                                |

---

## 🚦 PASSO 3: DEFINIR FLUXO DE ESTADOS

### **📊 Fluxo de Status**

```
CRIAÇÃO
   ↓
PENDENTE ──assumir──► EM_ANDAMENTO ──concluir──► ENTREGUE
   │                       │
   │                       ├──atraso (auto)──► ATRASADO ──concluir──► ENTREGUE
   │                       │                       │
   └───────cancelar────────┴───────cancelar───────┴──► CANCELADO
```

### **📊 Descrição dos Estados**

| Status           | Descrição                                          | Como chega?                                                   |
|------------------|----------------------------------------------------|---------------------------------------------------------------|
| **📝 PENDENTE**  | Aguardando alguém assumir                          | Cliente cria pedido                                           |
| **🔄 EM_ANDAMENTO** | Alguém assumiu e está trabalhando               | Colab/Admin assume OU Colab/Admin cria (assume automaticamente) |
| **⏰ ATRASADO**  | Passou do prazo, não foi entregue                  | Sistema verifica: `data_atual > prazo_entrega` (automático)   |
| **✅ ENTREGUE**  | Finalizado e entregue                              | Colaborador conclui                                           |
| **❌ CANCELADO** | Abortado/cancelado                                 | Cliente/Colaborador cancela (de qualquer estado)              |

### **⚠️ Atraso Automático (JOB DIÁRIO 00:00)**

```
Para cada pedido:
  SE status == 'em_andamento'
  E data_atual > prazo_entrega
  E NÃO existe log com status_novo = 'atrasado' para este pedido
  ENTÃO
    • status = 'atrasado'
    • Cria log com alterado_por = NULL (sistema)
    
⚡ Log gerado APENAS UMA VEZ na primeira detecção de atraso
⚡ Não gera log repetido nos dias seguintes se pedido continuar atrasado
```

---

## 🔗 PASSO 4: ESTABELECER RELACIONAMENTOS

### **Por que Foreign Keys?**

Foreign Keys conectam tabelas. Exemplo: `cliente_id` no pedido "aponta" para o `id` do usuário.

### **Relacionamentos**

```
USUARIOS 1───N PEDIDOS (cliente_id)           [PROTEGIDO - Soft Delete]
   │              
   ├────1───N PEDIDOS (responsavel_id)        [ON DELETE SET NULL + TRIGGER]
   │
   ├────1───N PEDIDOS (concluido_por)         [ON DELETE SET NULL]
   │
   ├────1───N PEDIDOS (cancelado_por)         [ON DELETE SET NULL]
   │
   └────1───N PEDIDOS_STATUS_LOG (alterado_por) [ON DELETE SET NULL]

PEDIDOS 1───N PEDIDOS_STATUS_LOG (pedido_id)  [ON DELETE SET NULL]
```

### **Regras de Deleção**

| Relacionamento | Regra | Motivo |
|----------------|-------|--------|
| **cliente_id** | PROTEGIDO | Usuários NUNCA são deletados (soft delete via ativo=false) |
| **responsavel_id** | SET NULL + TRIGGER | FK zera o campo, TRIGGER muda status para 'pendente' |
| **concluido_por / cancelado_por** | SET NULL | Mantém histórico sem identificar quem fez |
| **pedido_id (log)** | SET NULL | Log sobrevive para auditoria permanente |
| **alterado_por (log)** | SET NULL | Mantém histórico sem identificar quem fez |

### **🤖 AUTOMAÇÃO 1: Responsável Inativo → Pedido Volta para Pendente**

**O que acontece:**
Quando um colaborador é desativado (`ativo = false`), seus pedidos em aberto voltam automaticamente para 'pendente'.

**Como funciona tecnicamente:**

1. **Foreign Key:** `responsavel_id` tem `ON DELETE SET NULL` (se usuário fosse deletado, zeraria o campo)
2. **Trigger no PEDIDOS:** Detecta quando `responsavel_id` muda de valor para NULL e automaticamente:
   - Muda `status` para 'pendente'
   - Gera log com `alterado_por = NULL` (indica sistema)

**Exemplo de comportamento:**

```
Admin desativa Maria (que tinha 3 pedidos)

ANTES:
┌────┬─────────────┬────────────────┬──────────────┐
│ id │ titulo      │ responsavel_id │ status       │
├────┼─────────────┼────────────────┼──────────────┤
│ 15 │ Logo Nova   │ 7 (Maria)      │ em_andamento │
│ 22 │ Site Corp   │ 7 (Maria)      │ em_andamento │
│ 29 │ Campanha    │ 7 (Maria)      │ atrasado     │
└────┴─────────────┴────────────────┴──────────────┘

Admin muda Maria para ativo = false

DEPOIS (trigger executou automaticamente):
┌────┬─────────────┬────────────────┬──────────────┐
│ id │ titulo      │ responsavel_id │ status       │
├────┼─────────────┼────────────────┼──────────────┤
│ 15 │ Logo Nova   │ NULL           │ pendente ✅  │
│ 22 │ Site Corp   │ NULL           │ pendente ✅  │
│ 29 │ Campanha    │ NULL           │ pendente ✅  │
└────┴─────────────┴────────────────┴──────────────┘

LOG GERADO (alterado_por = NULL = Sistema):
┌────┬───────────┬─────────────────┬────────────┬──────────────┐
│ id │ pedido_id │ status_anterior │ status_novo│ alterado_por │
├────┼───────────┼─────────────────┼────────────┼──────────────┤
│ 87 │ 15        │ em_andamento    │ pendente   │ NULL         │
│ 88 │ 22        │ em_andamento    │ pendente   │ NULL         │
│ 89 │ 29        │ atrasado        │ pendente   │ NULL         │
└────┴───────────┴─────────────────┴────────────┴──────────────┘
```

**Onde o trigger é criado:**
- Tabela: `PEDIDOS`
- Evento: `AFTER UPDATE`
- Condição: `OLD.responsavel_id IS NOT NULL AND NEW.responsavel_id IS NULL`

### **🤖 AUTOMAÇÃO 2: Atualização de atualizado_em**

**O que acontece:**
Sempre que um registro de USUARIOS ou PEDIDOS é modificado, o campo `atualizado_em` é atualizado automaticamente.

**Como funciona tecnicamente:**

1. **Trigger no USUARIOS:** `BEFORE UPDATE` seta `NEW.atualizado_em = CURRENT_TIMESTAMP`
2. **Trigger no PEDIDOS:** `BEFORE UPDATE` seta `NEW.atualizado_em = CURRENT_TIMESTAMP`

**Exemplo de comportamento:**

```
Desenvolvedor faz UPDATE:
  UPDATE pedidos SET status = 'entregue' WHERE id = 42;

Banco AUTOMATICAMENTE atualiza:
  atualizado_em = '2026-01-06 14:30:22' ✅
  
⚡ Não precisa lembrar de atualizar manualmente
⚡ Impossível esquecer ou manipular a data de auditoria
```

**Onde os triggers são criados:**
- Tabelas: `USUARIOS` e `PEDIDOS`
- Evento: `BEFORE UPDATE`
- Ação: Seta `NEW.atualizado_em = CURRENT_TIMESTAMP`

---

## 👥 PASSO 5: DEFINIR PERMISSÕES POR NÍVEL

### **🔷 CLIENTE**

| Tela                 | O que vê?                                           | O que pode fazer?              |
|----------------------|-----------------------------------------------------|--------------------------------|
| **📋 Meus Pedidos**  | Seus pedidos (pendente, em_andamento, atrasado)     | Criar, Cancelar                |
| **✅ Minhas Entregas** | Seus pedidos (entregue, cancelado)                | Visualizar                     |
| **👤 Perfil**        | Nome, Email, Senha, Nível (readonly)                | Editar Nome e Senha            |

### **🔷 COLABORADOR**

| Tela                          | O que vê?                                           | O que pode fazer?                   |
|-------------------------------|-----------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Estatísticas pessoais e avisos                      | Visualizar                          |
| **📝 Pedidos Pendentes**      | Todos pedidos 'pendente' (sem responsável)          | Assumir, Criar                      |
| **🔄 Meus Pedidos**           | Pedidos que assumiu (em_andamento, atrasado)        | Concluir, Cancelar, Ver Histórico   |
| **✅ Finalizados**            | Pedidos que entregou/cancelou                       | Visualizar, Ver Histórico           |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (readonly)                | Editar Nome e Senha                 |

**Dashboard Colaborador:**
```
📈 ESTATÍSTICAS:
  • Gráfico: Pedidos por tipo_servico (Design, Dev, Story, SEO)
  • Gráfico: Pedidos por status (Pendente, Andamento, Atrasado, Entregue)

⚠️ AVISOS:
  • Próximas entregas (ordenadas por prioridade: Urgente, Alta, Média, Baixa)
  • Pedidos atrasados do colaborador
```

**Histórico (Colaborador):**
```
O colaborador pode ver o histórico completo apenas dos seus próprios pedidos:
- Pedidos que ele assumiu
- Pedidos que ele criou (quando cria como colaborador)
- Pedidos que ele entregou ou cancelou

Exemplo: Maria acessa histórico do Pedido #42 que ela assumiu:
┌────┬─────────────────┬────────────────┬──────────────────┬─────────────────────┐
│ id │ status_anterior │ status_novo    │ alterado_por     │ alterado_em         │
├────┼─────────────────┼────────────────┼──────────────────┼─────────────────────┤
│ 1  │ NULL            │ pendente       │ João Silva       │ 2026-01-01 10:00:00 │
│ 2  │ pendente        │ em_andamento   │ Maria Costa      │ 2026-01-02 14:30:00 │
│ 3  │ em_andamento    │ atrasado       │ Sistema          │ 2026-01-06 00:00:00 │
│ 4  │ atrasado        │ entregue       │ Maria Costa      │ 2026-01-10 16:45:00 │
└────┴─────────────────┴────────────────┴──────────────────┴─────────────────────┘

💡 Útil para: Mostrar ao cliente o que aconteceu com o pedido dele
```

### **🔷 ADMINISTRADOR**

**O admin é colaborador + gerente. Ele trabalha E gerencia a equipe.**

| Tela                          | O que vê?                                                     | O que pode fazer?                   |
|-------------------------------|---------------------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Visão Pessoal (trabalho dele) + Visão Global (equipe)         | Visualizar                          |
| **📝 Pedidos Pendentes**      | Todos pedidos 'pendente'                                      | Assumir, Criar                      |
| **🔄 Meus Pedidos**           | Pedidos que ELE assumiu                                       | Concluir, Cancelar, Ver Histórico   |
| **✅ Finalizados**            | Pedidos que ELE entregou/cancelou                             | Visualizar, Ver Histórico           |
| **👥 Gestão de Clientes**     | Lista de clientes                                             | Editar ativo e nivel_acesso         |
| **👨‍💼 Gestão de Equipe**       | Lista de colaboradores e admins                               | Editar ativo e nivel_acesso         |
| **📋 Todos os Pedidos**       | Todos os pedidos do sistema (de todos)                        | Visualizar, Editar, Ver Histórico   |
| **📊 Relatórios**             | Estatísticas e análises do sistema                            | Visualizar                          |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (readonly)                          | Editar Nome e Senha                 |

**Dashboard Administrador:**
```
📈 ESTATÍSTICAS PESSOAIS (do próprio admin):
  • Gráfico: Pedidos que ELE assumiu por tipo_servico
  • Gráfico: Pedidos que ELE assumiu por status
  • Próximas entregas DELE (ordenadas por prioridade)
  • Pedidos atrasados DELE

📈 ESTATÍSTICAS GLOBAIS DA EQUIPE:
  • Total de Pedidos: 65
  • Taxa de Conclusão: 85%
  • Tempo Médio de Entrega: 7 dias
  • Pedidos Atrasados: 3

👥 VISÃO POR RESPONSÁVEL:
  • Carlos (Admin) | Em Aberto: 4 | Atrasados: 1  ← Inclui o próprio admin
  • Maria Silva    | Em Aberto: 5 | Atrasados: 1
  • João Costa     | Em Aberto: 3 | Atrasados: 0

⚠️ ALERTAS DO SISTEMA:
  • Pedro Santos - 25 dias sem login
  • Carlos Lima - 32 dias sem login (INATIVO)
```

### **📋 Tela: Todos os Pedidos (Admin)**

**Diferença crucial:** Admin vê pedidos de TODOS, não só os dele.

**Funcionalidades:**
- Visualizar todos os pedidos do sistema (pendentes, em andamento, atrasados, entregues, cancelados)
- Filtrar por status, cliente, responsável, tipo de serviço
- Editar qualquer campo de qualquer pedido
- **Ver histórico completo de qualquer pedido (não só os dele)**

**Exemplo: Admin vê histórico do Pedido #42 que a Maria assumiu:**
```
Pedido #42: Logo Pet Shop (Responsável: Maria Costa)

Histórico de Status:
┌────┬─────────────────┬────────────────┬──────────────────┬─────────────────────┐
│ id │ status_anterior │ status_novo    │ alterado_por     │ alterado_em         │
├────┼─────────────────┼────────────────┼──────────────────┼─────────────────────┤
│ 1  │ NULL            │ pendente       │ João Silva       │ 2026-01-01 10:00:00 │
│ 2  │ pendente        │ em_andamento   │ Maria Costa      │ 2026-01-02 14:30:00 │
│ 3  │ em_andamento    │ atrasado       │ Sistema          │ 2026-01-06 00:00:00 │
│ 4  │ atrasado        │ entregue       │ Maria Costa      │ 2026-01-10 16:45:00 │
└────┴─────────────────┴────────────────┴──────────────────┴─────────────────────┘

📖 Linha do tempo:
1. João Silva criou o pedido (status: pendente)
2. Maria Costa assumiu o pedido (status: em_andamento)
3. Sistema detectou atraso automático (status: atrasado)
4. Maria Costa concluiu o pedido (status: entregue)

💡 Admin vê isso mesmo não sendo o responsável pelo pedido
```

### **📊 Tela: Relatórios (Admin)**

**Funcionalidades:**
- Visualizar estatísticas e análises detalhadas
- Gerar relatórios de desempenho da equipe
- Identificar gargalos e oportunidades de melhoria

**Relatórios disponíveis:**

**1. Ranking de Produtividade**
```
Quem mais conclui pedidos:
┌─────────────────┬────────────────────┐
│ nome            │ pedidos_concluidos │
├─────────────────┼────────────────────┤
│ Maria Costa     │ 45                 │
│ João Silva      │ 32                 │
│ Pedro Santos    │ 28                 │
└─────────────────┴────────────────────┘
```

**2. Taxa de Cancelamento**
```
Quem mais cancela pedidos:
┌─────────────────┬────────────────────┐
│ nome            │ pedidos_cancelados │
├─────────────────┼────────────────────┤
│ João Silva      │ 12                 │
│ Ana Oliveira    │ 8                  │
│ Carlos Lima     │ 5                  │
└─────────────────┴────────────────────┘

💡 Útil para: Identificar problemas com clientes ou colaboradores
```

**3. Tempo Médio de Entrega**
```
Desempenho por pedido:
┌────┬───────────────┬──────────┬─────────────┬─────────────┬──────────────┬────────────┐
│ id │ titulo        │ cliente  │ responsavel │ criacao     │ conclusao    │ dias_total │
├────┼───────────────┼──────────┼─────────────┼─────────────┼──────────────┼────────────┤
│ 42 │ Logo Pet Shop │ João     │ Maria       │ 01/01 10:00 │ 10/01 16:45  │ 9          │
│ 38 │ Site Empresa  │ Ana      │ Pedro       │ 28/12 09:00 │ 05/01 18:00  │ 8          │
└────┴───────────────┴──────────┴─────────────┴─────────────┴──────────────┴────────────┘

💡 Útil para: Planejar prazos realistas, identificar colaboradores rápidos/lentos
```

**4. Análise de Atrasos**
```
Pedidos que atrasaram:
┌────┬────────────────┬─────────────┬──────────────┬─────────────┬────────────┐
│ id │ titulo         │ responsavel │ prazo        │ data_atraso │ dias_atraso│
├────┼────────────────┼─────────────┼──────────────┼─────────────┼────────────┤
│ 29 │ Campanha       │ Carlos      │ 02/01        │ 03/01 00:00 │ 5          │
│ 33 │ Identidade     │ Ana         │ 03/01        │ 04/01 00:00 │ 3          │
└────┴────────────────┴─────────────┴──────────────┴─────────────┴────────────┘

💡 Útil para: Identificar sobrecarga de colaboradores, prazos irrealistas
```

---

## 🎯 PASSO 6: DEFINIR AÇÕES EM PEDIDOS

### **✅ Assumir Pedido**

```
Quem: Colaborador/Admin
De: 'pendente'
Para: 'em_andamento'

Banco atualiza:
  • status = 'em_andamento'
  • responsavel_id = ID do colaborador

Log automático:
  • status_anterior = 'pendente'
  • status_novo = 'em_andamento'
  • alterado_por = ID do colaborador
```

### **✅ Concluir Pedido**

```
Quem: Colaborador/Admin (apenas o responsável)
De: 'em_andamento' ou 'atrasado'
Para: 'entregue'

Banco atualiza:
  • status = 'entregue'
  • concluido_por = ID do colaborador
  • data_conclusao = timestamp atual

Log automático:
  • status_anterior = 'em_andamento' ou 'atrasado'
  • status_novo = 'entregue'
  • alterado_por = ID do colaborador
```

### **❌ Cancelar Pedido**

```
Quem:
  • Cliente: apenas seus próprios pedidos
  • Colaborador: apenas pedidos que assumiu
  • Admin: qualquer pedido

De: qualquer status (exceto 'entregue' e 'cancelado')
Para: 'cancelado'

Banco atualiza:
  • status = 'cancelado'
  • cancelado_por = ID de quem cancelou
  • data_conclusao = timestamp atual

Log automático:
  • status_anterior = status anterior
  • status_novo = 'cancelado'
  • alterado_por = ID de quem cancelou
```

---

## 🔐 PASSO 7: DEFINIR GESTÃO DE USUÁRIOS

### **👥 Gestão (Admin)**

**Telas:**
- **Gestão de Clientes:** Lista usuários com `nivel_acesso = 'cliente'`
- **Gestão de Equipe:** Lista usuários com `nivel_acesso = 'colaborador'` ou `'admin'`

**O que pode editar:**
- `ativo` (true/false)
- `nivel_acesso` (cliente, colaborador, admin)

### **🔐 Restrições de Segurança**
```
1. Admin NÃO pode alterar próprio nivel_acesso
   → Evita perder acesso admin acidentalmente

2. Admin NÃO pode desativar própria conta
   → Evita ficar bloqueado do sistema

3. Ao desativar colaborador com pedidos em aberto
   → Sistema avisa: "Este usuário tem X pedidos em aberto"
   → Admin decide se continua
   → Se continuar, pedidos voltam automaticamente para pendente (trigger)

4. 🚫 NUNCA permitir DELETE de usuários
   → Apenas desativação (ativo = false)
   → Preserva integridade dos dados históricos
```
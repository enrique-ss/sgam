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

1. **Perda de tempo brutal**
   - "Espera, como funciona mesmo a criação de pedido no web?"
   - "No CLI eu fiz de um jeito, no web de outro... qual é o certo?"
   - Precisava abrir 3 códigos diferentes pra lembrar as regras

2. **Bugs e inconsistências**
   - Cliente criava pedido no web sem prioridade
   - Colaborador no CLI conseguia fazer coisas que não deveria
   - Backend aceitava dados que o frontend bloqueava

3. **Impossível de manter**
   - Mudança em uma regra = alterar 3 lugares diferentes
   - Alto risco de esquecer de atualizar uma das interfaces
   - Testes viravam um pesadelo

4. **Falta de clareza**
   - Eu mesmo não sabia mais quais eram as regras "corretas"
   - Não havia uma fonte única da verdade
   - Difícil explicar o sistema para outras pessoas

### **💡 A Solução: Modelagem de Dados**

Percebi que o problema não era técnico, era de **planejamento**. Eu estava codando sem ter definido claramente:

- ✅ Quais dados eu preciso guardar?
- ✅ Quais são as regras de negócio?
- ✅ Como os dados se relacionam?
- ✅ O que cada tipo de usuário pode fazer?
- ✅ Quais são os fluxos possíveis?

**Então parei de codificar e comecei a documentar.**

### **📚 O que aprendi com este processo:**

#### **1. Documentação ANTES do código**
```
❌ ANTES: Código → Problema → Refatorar → Mais problemas
✅ AGORA: Documentação → Código seguindo as regras → Sistema coeso
```

#### **2. A modelagem é a fonte única da verdade**
- Backend, CLI e Web agora seguem a MESMA documentação
- Qualquer dúvida? Consulto a modelagem
- Mudança necessária? Atualizo a modelagem primeiro, depois o código

#### **3. Regras de negócio não são código, são requisitos**
```
Exemplo:
"Cliente não pode assumir pedidos" 

Isso não é uma decisão técnica de implementação.
É uma REGRA DE NEGÓCIO que deve estar documentada ANTES de codar.
```

#### **4. Visualização ajuda MUITO**
Os diagramas ASCII art me ajudaram a:
- Entender os relacionamentos entre tabelas
- Ver os fluxos de estado dos pedidos
- Identificar campos faltantes
- Perceber regras inconsistentes

#### **5. Pensar em "quem pode fazer o quê" é essencial**
Antes eu pensava em features: "preciso de uma tela de pedidos"
Agora penso em permissões: "o que cada nível de usuário pode fazer?"

### **🎯 Resultado Final**

Agora tenho:

✅ **Uma fonte única da verdade**
   - Todas as interfaces seguem as mesmas regras
   - Zero ambiguidade sobre comportamentos

✅ **Facilidade para desenvolver**
   - Abro a documentação e sei exatamente o que implementar
   - Não preciso ficar "adivinhando" regras

✅ **Consistência garantida**
   - Backend valida exatamente o que o frontend espera
   - CLI se comporta igual ao web
   - Bugs diminuíram drasticamente

✅ **Manutenibilidade**
   - Mudanças são planejadas na documentação primeiro
   - Depois aplico em todas as interfaces de forma consistente

✅ **Comunicação clara**
   - Posso mostrar essa doc para qualquer pessoa
   - Ela entende o sistema sem precisar ler código

### **🚀 Próximos Passos**

Esta documentação é a base para:
1. Refatorar o backend seguindo as regras definidas
2. Atualizar o CLI para ser consistente
3. Ajustar o frontend web para seguir o mesmo padrão
4. Criar testes baseados nas regras documentadas
5. Eventualmente, adicionar novas features de forma estruturada

---

## 🧩 PASSO 1: IDENTIFICAR ENTIDADES

**Pergunta:** O que preciso guardar no sistema?

Pensando no objetivo do SGAM (gerenciar pedidos de uma agência), temos:

```
👤 PESSOAS que usam o sistema
   (clientes, colaboradores, admins)
   └─► Vão virar a tabela: USUARIOS

📋 SERVIÇOS solicitados pelos clientes
   (pedidos de design, desenvolvimento, etc)
   └─► Vão virar a tabela: PEDIDOS
```

## 📋 PASSO 2: DEFINIR ESTRUTURA DAS TABELAS

Agora vamos detalhar **o que guardar** sobre cada "coisa" identificada.

### **📦 Tabela: USUARIOS**

**O que guardar sobre uma pessoa?**

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

### **🔐 Regras de Segurança e Cadastro**

```
📝 AO CADASTRAR UM NOVO USUÁRIO:

1. Email único
   └─► Sistema verifica se o email já existe no banco
   └─► Se existir → Erro: "Email já cadastrado"

2. Senha criptografada
   └─► NUNCA guardar senha em texto puro
   └─► Usar bcrypt para gerar hash
   └─► Exemplo: "senha123" vira "$2a$10$N9qo8uLOickgx2ZMRZoMye..."

3. Valores iniciais automáticos
   └─► nivel_acesso = 'cliente' (sempre)
   └─► ativo = true (sempre)
   └─► criado_em = timestamp atual
```

### **⚠️ Regra de Inatividade Automática**

```
🕐 VERIFICAÇÃO DIÁRIA:

Para cada usuário no banco:
  
  SE nivel_acesso == 'colaborador'
  E ultimo_login > 30 dias atrás
  ENTÃO
    └─► ativo = false
    └─► Conta desativada automaticamente

⚡ IMPORTANTE:
  - Admin e Cliente são IMUNES a essa regra
  - Apenas colaboradores são afetados
  - Objetivo: manter equipe ativa atualizada
```

### **🚫 Bloqueio de Acesso**

```
🔐 AO FAZER LOGIN:

1. Verificar se email existe → ✅
2. Verificar se senha está correta → ✅
3. Verificar se ativo = false → ❌

SE ativo == false:
  └─► Bloquear login
  └─► Mensagem: "Sua conta está desativada. Contate o administrador."
  └─► Não importa se a senha está correta!
```

### **📋 Especificações Técnicas**

| Campo         | Tipo          | Restrições                    | Por que?                                    |
|---------------|---------------|-------------------------------|---------------------------------------------|
| id            | INT           | PK, AUTO_INCREMENT            | Número único gerado automaticamente         |
| nome          | VARCHAR(255)  | NOT NULL                      | Nome obrigatório, até 255 caracteres        |
| email         | VARCHAR(255)  | NOT NULL, UNIQUE              | Email obrigatório e único (login)           |
| senha         | VARCHAR(255)  | NOT NULL                      | Bcrypt gera hash de 60 chars (sempre hash!) |
| nivel_acesso  | ENUM          | DEFAULT 'cliente'             | Só aceita: admin, colaborador, cliente      |
| ativo         | BOOLEAN       | DEFAULT true                  | true ou false (conta ativa/inativa)         |
| ultimo_login  | TIMESTAMP     | NULL                          | Data/hora do último acesso (pode ser nulo)  |
| criado_em     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Preenche automaticamente ao criar           |
| atualizado_em | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Atualiza automaticamente ao modificar       |

### **📦 Tabela: PEDIDOS**

**O que guardar sobre um pedido?**

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
└──────────────────────────────────────┘
```

### **📝 Regras ao Criar Pedido (CLIENTE)**

```
🆕 QUANDO O CLIENTE CLICA "NOVO PEDIDO":

┌─────────────────────────────────────────┐
│ Formulário de Criação                   │
├─────────────────────────────────────────┤
│ Título:        [__________________] ✅ │ ← Obrigatório
│ Tipo Serviço:  [Design ▼          ] ✅ │ ← Obrigatório
│ Descrição:     [__________________] ✅ │ ← Obrigatório
│ Orçamento:     [R$ _______________] ✅ │ ← Obrigatório
│ Prazo:         [📅 __/__/____     ] ✅ │ ← Obrigatório
│                                         │
│           [ Criar Pedido ]              │
└─────────────────────────────────────────┘

💾 AO CLICAR "CRIAR PEDIDO", O BANCO SALVA:

PEDIDOS:
  ├─► titulo = "valor digitado"           ✅ Obrigatório
  ├─► cliente_id = 3                      🤖 Automático (ID do usuário logado)
  ├─► responsavel_id = NULL               🤖 Automático (ainda não foi assumido)
  ├─► status = 'pendente'                 🤖 Automático (sempre começa assim)
  ├─► tipo_servico = "valor digitado"     ✅ Obrigatório
  ├─► descricao = "valor digitado"        ✅ Obrigatório
  ├─► orcamento = 5000.00                 ✅ Obrigatório
  ├─► prazo_entrega = '2026-01-20'        ✅ Obrigatório
  ├─► prioridade = NULL                   🤖 Automático (NULL por padrão até que o responsável escolha a prioridade)
  └─► criado_em = CURRENT_TIMESTAMP       🤖 Automático (Data atual)
```

### **📝 Regras ao Criar Pedido (COLABORADOR/ADMINISTRADOR)**

```
🆕 QUANDO COLABORADOR/ADMINISTRADOR CLICA "NOVO PEDIDO":

┌─────────────────────────────────────────┐
│ Formulário de Criação                   │
├─────────────────────────────────────────┤
│ Cliente:       [João Silva ▼      ] ✅ │ ← Obrigatório
│ Título:        [__________________] ✅ │ ← Obrigatório
│ Tipo Serviço:  [Design ▼          ] ✅ │ ← Obrigatório
│ Descrição:     [__________________] ✅ │ ← Obrigatório
│ Orçamento:     [R$ _______________] ✅ │ ← Obrigatório
│ Prazo:         [📅 __/__/____     ] ✅ │ ← Obrigatório
│ Prioridade:    [Alta ▼            ] ✅ │ ← Obrigatório
│                                         │
│           [ Criar Pedido ]              │
└─────────────────────────────────────────┘

💾 AO CLICAR "CRIAR PEDIDO", O BANCO SALVA:

PEDIDOS:
  ├─► cliente_id = 3                      ✅ Obrigatório
  ├─► titulo = "valor digitado"           ✅ Obrigatório
  ├─► tipo_servico = "valor digitado"     ✅ Obrigatório
  ├─► descricao = "valor digitado"        ✅ Obrigatório
  ├─► orcamento = 5000.00                 ✅ Obrigatório
  ├─► prazo_entrega = '2026-01-20'        ✅ Obrigatório
  ├─► prioridade = 'alta'                 ✅ Obrigatório
  ├─► responsavel_id = 5                  🤖 Automático / ✅ Obrigatório (Se for colab = ID do colab logado) (Se for admin = Pode se atribuir como responsável ou escolher outro colaborador/admin)
  ├─► status = 'em_andamento'             🤖 Automático (Por ter responsável)
  └─► criado_em = CURRENT_TIMESTAMP       🤖 Automático (Data atual)

✅ DIFERENÇA CRUCIAL:
  • Cliente: cria pedido → status 'pendente' → aguarda ser assumido
  • Colaborador: cria pedido → JÁ SE TORNA RESPONSÁVEL → status 'em_andamento'
  
🎯 USO PRINCIPAL:
  • Pedidos vindos de fora da plataforma
  • Colaborador registra o pedido no sistema
  • Cliente pode ou não ter conta no sistema
  • Pedido já entra em andamento com responsável definido
  • Designar funções pros colaboradores
```

### **📋 Especificações Técnicas**

| Campo          | Tipo          | Restrições                    | Por que?                                    |
|----------------|---------------|-------------------------------|---------------------------------------------|
| id             | INT           | PK, AUTO_INCREMENT            | Número único gerado automaticamente         |
| cliente_id     | INT           | FK, NOT NULL                  | **Conecta** com USUARIOS.id (quem criou)    |
| responsavel_id | INT           | FK, NULL                      | **Conecta** com USUARIOS.id (quem assumiu)  |
| titulo         | VARCHAR(255)  | NOT NULL                      | Nome do pedido (obrigatório)                |
| tipo_servico   | VARCHAR(100)  | NOT NULL                      | Categorias: Design, Dev, Story, SEO         | 
| descricao      | TEXT          | NOT NULL                      | Texto longo obrigatório com detalhes        |
| orcamento      | DECIMAL(10,2) | NOT NULL                      | Valor obrigatório até 99.999.999,99         |
| prazo_entrega  | DATE          | NOT NULL                      | Data limite obrigatória (YYYY-MM-DD)        |
| status         | ENUM          | DEFAULT 'pendente'            | pendente, em_andamento, atrasado, entregue, cancelado 
| prioridade     | ENUM          | NULL                          | baixa, media, alta, urgente (obrigatório)   |
| cancelado_por  | INT           |FK usuarios.id, NULL           | Quem cancelou o pedido (rastreabilidade)    |
| concluido_por  | INT           |FK usuarios.id, NULL           | Quem concluiu o pedido (rastreabilidade)    |
| data_conclusao | TIMESTAMP     | NULL                          | Preenche automaticamente ao finalizar       |
| criado_em      | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Preenche automaticamente ao criar           |
| atualizado_em  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Atualiza automaticamente ao modificar       |

PEDIDOS_STATUS_LOG

📦 Estrutura da Tabela: PEDIDOS_STATUS_LOG
Para que serve?

Guardar histórico completo de mudanças de status
Rastreabilidade: saber quem mudou o quê e quando
Auditoria: identificar padrões e problemas no fluxo

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
📋 Especificações Técnicas - PEDIDOS_STATUS_LOG
CampoTipoRestriçõesPor que?idINTPK, AUTO_INCREMENTNúmero único gerado automaticamentepedido_idINTFK, NOT NULLConecta com PEDIDOS.idstatus_anteriorENUMNULLEstado antes da mudança (NULL na criação)status_novoENUMNOT NULLEstado depois da mudançaalterado_porINTFK, NULLConecta com USUARIOS.id (NULL = sistema)alterado_emTIMESTAMPDEFAULT CURRENT_TIMESTAMPQuando a mudança aconteceu

## 🚦 PASSO 3: DEFINIR FLUXO DE ESTADOS

### **📊 Fluxo de Estados**

```
PENDENTE:
	• Pedido foi criado e está aguardando alguém assumir
	• Ação: Colaborador clica "Assumir" → status vai para EM_ANDAMENTO

EM_ANDAMENTO:
	• Alguém assumiu o pedido e está trabalhando nele
	• Pode seguir 3 caminhos:
		Automático: Se Data Atual > Prazo → vai para ATRASADO
		Ação: Colaborador clica "Concluir" → vai para ENTREGUE
		Ação: Colaborador/Cliente clica "Cancelar" → vai para CANCELADO

ATRASADO:
	• Pedido passou do prazo mas ainda não foi entregue
	• Ação: Colaborador clica "Concluir" → vai para ENTREGUE

ENTREGUE:
	• Pedido foi finalizado e entregue ao cliente
	• Estado final (não muda mais)

CANCELADO:
	• Pedido foi cancelado antes de ser concluído
	• Pode acontecer de QUALQUER estado (pendente, em_andamento, atrasado)
	• Estado final (não muda mais)

💡 OBSERVAÇÃO:
- CANCELADO pode acontecer de QUALQUER estado (pendente, em_andamento, atrasado)
- ATRASADO não é um "estado final" - o pedido ainda pode ser concluído
```

### **📊 Descrição Detalhada dos Estados**

| Status           | Descrição                                          | Como chega nesse estado?                                    |
|------------------|----------------------------------------------------|-------------------------------------------------------------|
| **📝 PENDENTE**  | Pedido criado, aguardando alguém assumir           | • Cliente cria pedido<br>• Admin/Colab cria pedido          |
| **🔄 EM_ANDAMENTO** | Alguém assumiu e está trabalhando               | • Colaborador clica "Assumir" em pedido pendente            |
| **⏰ ATRASADO**  | Passou do prazo e ainda não foi entregue           | • Sistema verifica: `Data Atual > prazo_entrega`            |
| **✅ ENTREGUE**  | Trabalho finalizado e entregue ao cliente          | • Colaborador clica "Concluir" (em_andamento ou atrasado)   |
| **❌ CANCELADO** | Pedido foi abortado/cancelado                      | • Cliente/Colaborador clica "Cancelar" (qualquer estado)    |

### **⚠️ Regra de Atraso Automático**

```
🤖 JOB AUTOMÁTICO:

Para cada pedido no banco:
  
  SE status == 'em_andamento'
  E Data Atual > prazo_entrega
  ENTÃO
    └─► status muda para 'atrasado'
    └─► atualizado_em = timestamp atual

📌 EXEMPLO:

Pedido #42:
  • status = 'em_andamento'
  • prazo_entrega = 2026-01-05
  • responsavel_id = 5 (Maria)

🗓️ Dia 2026-01-06:
  └─► Sistema detecta: 06 > 05 ✅
  └─► status muda automaticamente para 'atrasado'
```

## 🔗 PASSO 4: ESTABELECER RELACIONAMENTOS

Agora que sabemos **quais campos** cada tabela tem, vamos conectá-las usando **Foreign Keys (FK)**.

### **🤔 Por que precisamos de Foreign Keys?**

```
❓ PROBLEMA:

Pedido #1: "Criar Logo"
  └─► Quem criou esse pedido?
  └─► Quem está trabalhando nele?

💡 SOLUÇÃO: Foreign Keys (Chaves Estrangeiras)

  As FKs são campos que "apontam" para registros de outra tabela!
```

### **🔗 Relacionamento 1: CLIENTE cria PEDIDO**

```
┌────────────────┐           ┌────────────────┐
│    USUARIOS    │           │    PEDIDOS     │
├────────────────┤           ├────────────────┤
│ 🔑 id = 1      │◄─────────┤ cliente_id = 1 │
│ nome: "João"   │   aponta  │ titulo: "Logo" │
│ email: ...     │           │ status: ...    │
└────────────────┘           └────────────────┘

📖 LEITURA:
"O pedido 'Logo' foi criado pelo usuário João (id=1)"
```

- **Tipo de Relacionamento:** `1:N` (Um para Muitos)
- **1 usuário** pode criar **vários pedidos**
- **1 pedido** pertence a **apenas 1 cliente**

**Regra de Deleção:** `ON DELETE CASCADE`

```
❌ SE deletar João do sistema:
   └─► Todos os pedidos dele também são DELETADOS
   └─► Motivo: Pedido sem cliente não faz sentido
```

### **🔗 Relacionamento 2: RESPONSÁVEL assume PEDIDO**

```
┌────────────────┐           ┌────────────────────┐
│    USUARIOS    │           │     PEDIDOS        │
├────────────────┤           ├────────────────────┤
│ 🔑 id = 5      │◄─────────┤ responsavel_id = 5 │
│ nome: "Maria"  │   aponta  │ titulo: "Logo"     │
│ nivel: colab   │           │ status: ...        │
└────────────────┘           └────────────────────┘

📖 LEITURA:
"O pedido 'Logo' está sendo feito pela colaboradora Maria (id=5)"
```

- **Tipo de Relacionamento:** `1:N` (Um para Muitos)
- **1 colaborador** pode assumir **vários pedidos**
- **1 pedido** tem **apenas 1 responsável** (ou nenhum, quando NULL)

**Regra de Deleção:** `ON DELETE SET NULL`

```
❌ SE deletar Maria do sistema:
   └─► Os pedidos dela NÃO são deletados
   └─► Apenas o responsavel_id vira NULL (sem responsável)
   └─► Motivo: O pedido ainda existe, só ficou sem responsável, mas futuramente pode ser assumido por outro
   └─► Status volta para "pendente" e outros colaboradores/administradores podem encontrola-lo na aba de 'Pedidos Pendentes'
```

## 👥 PASSO 5: DEFINIR PERMISSÕES POR NÍVEL

Agora vamos ver **o que cada tipo de usuário pode fazer** no sistema.

### **🔷 NÍVEL: CLIENTE**

**Telas e Permissões:**

| Tela                 | O que vê?                                           | O que pode fazer?              |
|----------------------|-----------------------------------------------------|--------------------------------|
| **📋 Meus Pedidos**  | Pedidos `pendente`, `em_andamento` e `atrasado`     | Criar novo pedido, Cancelar pedido|
| **✅ Minhas Entregas** | Pedidos `entregue` e `cancelado`                  | Apenas visualizar              |
| **👤 Perfil**        | Nome, Email, Senha, Nível (somente leitura)         | Editar Nome e Senha            |

### **🔷 NÍVEL: COLABORADOR**

**Telas e Permissões:**

| Tela                          | O que vê?                                           | O que pode fazer?                   |
|-------------------------------|-----------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Estatísticas pessoais e avisos                      | Apenas visualizar                   |
| **📝 Pedidos Pendentes**      | Lista global de pedidos `pendente` (sem dono)       | Assumir pedido                      |
| **🔄 Meus Pedidos**           | Pedidos que assumiu (`em_andamento` ou `atrasado`)  | Concluir, Cancelar                  |
| **✅ Finalizados**            | Pedidos que entregou/cancelou                       | Apenas visualizar                   |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (somente leitura)         | Editar Nome e Senha                 |

### **📊 Dashboard - Estatísticas e Avisos**

```
┌───────────────────────────────────────────────────────┐
│                      📊 DASHBOARD                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  📈 ESTATÍSTICAS:                                     │
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │  Gráfico Pizza      │  │  Gráfico Barras     │     │
│  │  ───────────────    │  │  ───────────────    │     │
│  │  Pedidos por        │  │  Pedidos por        │     │
│  │  tipo_servico:      │  │  status:            │     │
│  │                     │  │                     │     │
│  │  🎨 Design: 35%    │  │  📝 Pendente: 5     │     │
│  │  💻 Dev: 35%       │  │  🔄 Andamento: 12   │     │
│  │  📱 Story: 25%      │  │  ⏰ Atrasado: 3     │     │
│  │  📈 SEO: 5%        │  │  ✅ Entregue: 45    │      │
│  └─────────────────────┘  └─────────────────────┘     │
│                                                       │
│  ⚠️ AVISOS:                                           │
│                                                       │
│  📅 PRÓXIMAS ENTREGAS (Definidos pela prioridade):    │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #42 - Logo Cliente X    | 05/01 | Urgente  │    │
│  │ 🟠 #38 - Site Cliente Y    | 06/01 | Alta     │    │
│  │ 🟡 #51 - Banner Cliente Z  | 08/01 | Média    │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  🚨 PEDIDOS URGENTES (ATRASADOS):                     │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #29 - Campanha Cliente A | Prazo: 02/01    │    │
│  │ 🔴 #33 - Identidade Cliente B | Prazo: 03/01  │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### **🔷 NÍVEL: ADMINISTRADOR**

**Telas e Permissões:**

| Tela                          | O que vê?                                                     | O que pode fazer?                   |
|-------------------------------|---------------------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Visão Pessoal + Visão Global da Equipe                        | Apenas visualizar                   |
| **📝 Pedidos Pendentes**      | Lista global de pedidos `pendente` (sem dono)                 | Assumir pedido                      |
| **🔄 Meus Pedidos**           | Pedidos que assumiu (`em_andamento` ou `atrasado`)            | Concluir, Cancelar                  |
| **✅ Finalizados**            | Pedidos que entregou/cancelou                                 | Apenas visualizar                   |
| **👥 Gestão de Clientes**     | Lista de usuários com `nivel_acesso = 'cliente'`              | Editar `ativo` e `nivel_acesso`     |
| **👨‍💼 Gestão de Equipe**       | Lista de usuários `nivel_acesso = 'colaborador'` ou `'admin'` | Editar `ativo` e `nivel_acesso`     |
| **📋 Todos os Pedidos**       | Lista completa de todos os pedidos do sistema                 | Visualizar, Editar qualquer campo   |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (somente leitura)                   | Editar Nome e Senha                 |

### **📊 Dashboard Administrativo**

```
┌───────────────────────────────────────────────────────┐
│                      📊 DASHBOARD                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  📈 ESTATÍSTICAS PESSOAIS:                            │
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │  Gráfico Pizza      │  │  Gráfico Barras     │     │
│  │  ───────────────    │  │  ───────────────    │     │
│  │  Pedidos por        │  │  Pedidos por        │     │
│  │  tipo_servico:      │  │  status:            │     │
│  │                     │  │                     │     │
│  │  🎨 Design: 35%    │  │  📝 Pendente: 5     │     │
│  │  💻 Dev: 35%       │  │  🔄 Andamento: 12   │     │
│  │  📱 Story: 25%      │  │  ⏰ Atrasado: 3     │     │
│  │  📈 SEO: 5%        │  │  ✅ Entregue: 45   │      │
│  └─────────────────────┘  └─────────────────────┘     │
│                                                       │
│  ⚠️ AVISOS PESSOAIS:                                  │
│                                                       │
│  📅 PRÓXIMAS ENTREGAS PESSOAIS (Definidos pela prioridade): 
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #42 - Logo Cliente X    | 05/01 | Urgente  │    │
│  │ 🟠 #38 - Site Cliente Y    | 06/01 | Alta     │    │
│  │ 🟡 #51 - Banner Cliente Z  | 08/01 | Média    │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  🚨 PEDIDOS URGENTES PESSOAIS (ATRASADOS):             │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #29 - Campanha Cliente A | Prazo: 02/01    │    │
│  │ 🔴 #33 - Identidade Cliente B | Prazo: 03/01  │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  📈 ESTATÍSTICAS GLOBAIS DA EQUIPE:                   │
│  ┌─────────────────────────────────────────────┐      │
│  │ 📊 Total de Pedidos: 65                     │      │
│  │ ✅ Taxa de Conclusão: 85%                   │      │
│  │ ⏰ Tempo Médio de Entrega: 7 dias           │      │
│  │ 🚨 Pedidos Atrasados: 3                     │      │
│  └─────────────────────────────────────────────┘      │
│                                                       │
│  👥 VISÃO POR RESPONSÁVEL:                            │
│  ┌───────────────────────────────────────────────┐    │
│  │ Carlos (Admin) | Em Aberto: 4  | Atrasados: 1 │    │
│  │ Maria Silva    | Em Aberto: 5  | Atrasados: 1 │    │
│  │ João Costa     | Em Aberto: 3  | Atrasados: 0 │    │
│  │ Ana Oliveira   | Em Aberto: 7  | Atrasados: 2 │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  ⚠️ ALERTAS DO SISTEMA:                               │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🟡 Pedro Santos - 25 dias sem login           │   │
│  │ 🔴 Carlos Lima - 32 dias sem login (INATIVO)  │   │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  📊 GRÁFICOS E ESTATÍSTICAS:                          │
│  [Gráficos de pizza e barras como no dashboard do     │
│   colaborador, mostrando distribuição de tipos de     │
│   serviço e status dos pedidos]                       │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## 🎯 PASSO 6: DEFINIR AÇÕES EM PEDIDOS

### **✅ Ação: "ASSUMIR" Pedido**

```
📋 COLABORADOR MARIA ESTÁ NA TELA "PEDIDOS PENDENTES":

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
| ID: 41 | Título: Logo Pet Shop | Tipo: Logo | Descrição: Fazer uma logo... | Orçamento: 100 | Prazo: 02/12/26 | Cliente: João │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
1. Assumir -> Digite o ID do pedido

👆 Maria digita o ID do pedido que deseja assumir.

↓

💾 BANCO ATUALIZA O PEDIDO #42:

ANTES:
  ├─► status = 'pendente'
  └─► responsavel_id = NULL

DEPOIS:
  ├─► status = 'em_andamento'             ← Mudou
  ├─► responsavel_id = 5                  ← ID da Maria
  └─► atualizado_em = 2026-01-04 15:00:00 ← Timestamp

📋 RESULTADO:
  • Pedido sai da lista "Pedidos Pendentes"
  • Pedido aparece em "Meus Pedidos" da Maria
  • João vê o pedido com status "em andamento" em "Meus Pedidos"
```

### **✅ Ação: "CONCLUIR" Pedido**

```
🔄 MARIA ESTÁ EM "MEUS PEDIDOS (EM ABERTO)":

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
| Título: Logo Pet Shop | Tipo: Logo | Descrição: Fazer uma logo... | Orçamento: 100 | Prazo: 02/12/26 | Cliente: João │
│ Status: Em andamento | Prioridade: Alta                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
1. Concluir
2. Cancelar
0. Voltar

👆 Maria clica "Concluir"

↓

💾 BANCO ATUALIZA O PEDIDO #42:

ANTES:
  ├─► status = 'em_andamento'
  └─► data_conclusao = NULL

DEPOIS:
  ├─► status = 'entregue'                       ← Mudou
  ├─► data_conclusao = 2026-01-10 16:45:00      ← Timestamp do servidor
  └─► atualizado_em = 2026-01-10 16:45:00       ← Timestamp

📋 RESULTADO:
  • Pedido sai de "Meus Pedidos (Em Aberto)" da Maria
  • Pedido aparece em "Finalizados" da Maria
  • João vê o pedido em "Minhas Entregas" com status "entregue"
```

### **❌ Ação: "CANCELAR" Pedido**

```
Funciona igual ao "Concluir", mas:

💾 BANCO ATUALIZA:
  ├─► status = 'cancelado'                      ← Mudou
  ├─► data_conclusao = 2026-01-10 17:00:00      ← Timestamp do servidor
  └─► atualizado_em = 2026-01-10 17:00:00       ← Timestamp

📋 RESULTADO:
  • Pedido SAI de "Meus Pedidos (Em Aberto)"
  • Pedido APARECE em "Finalizados" com status "cancelado"
  • Cliente vê em "Minhas Entregas" com status "cancelado"
```

## 🔐 PASSO 7: DEFINIR GESTÃO DE USUÁRIOS

### **👥 Tela de Gestão de Usuários**

```
🔐 TELA "GESTÃO DE CLIENTES":

┌─────────────────────────────────────────────────────────────┐
│ ID  │ Nome          │ Email              │ Ativo │ Nível    │
├─────┼───────────────┼────────────────────┼───────┼──────────┤
│ 1   │ João Silva    │ joao@email.com     │  ✅   │ Cliente  │
│ 2   │ Maria Santos  │ maria@email.com    │  ✅   │ Cliente  │
│ 3   │ Pedro Costa   │ pedro@email.com    │  ❌   │ Cliente  │
└─────┴───────────────┴────────────────────┴───────┴──────────┘
1. Editar -> Digite o ID do Usuário:
0. Voltar -> Volta pro menu anterior

👆 Admin digita 1 e depois digita o ID correspondente ao "Pedro Costa"

↓

📝 Menu aparece:

┌────────────────────────────────────────┐
│ Editar Usuário: Pedro Costa            │
├────────────────────────────────────────┤
│ Status:                                │
│ 1. Ativo                               │
│ 2. Inativo                             │
│ 0. Manter                              │
│                                        │
│ Nível de Acesso:                       │
│ 1. Cliente                             │
│ 2. Colaborador                         │
│ 3. Administrador                       │
│ 0. Manter                              │
└────────────────────────────────────────┘
```

### **🔐 Regras de Segurança**

```
⚠️ RESTRIÇÕES PARA PROTEGER O SISTEMA:

1. Admin NÃO pode alterar próprio nivel_acesso
   └─► Evita perder acesso admin acidentalmente

2. Admin NÃO pode desativar própria conta
   └─► Evita ficar bloqueado do sistema

3. Ao mudar cliente → colaborador
   └─► Usuário ganha acesso a Dashboard, Pedidos Pendentes, etc

4. Ao mudar colaborador → cliente
   └─► Usuário perde acesso a pedidos de outras pessoas
   └─► Se tiver pedidos em aberto como responsável, avisar!

5. Ao desativar colaborador com pedidos em aberto
   └─► Sistema deve avisar: "Este usuário tem X pedidos em aberto"
   └─► Admin decide se realmente quer desativar
```
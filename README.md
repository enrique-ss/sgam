# SGAM - Sistema de Gerenciamento para Agências de Marketing

Sistema completo de gerenciamento de pedidos e clientes para agências de marketing, com 3 níveis de acesso: Admin, Colaborador e Cliente.

## 🚀 Funcionalidades

### Sistema de Autenticação
- ✅ Registro de novos usuários (padrão: nível Cliente)
- ✅ Login com JWT
- ✅ 3 níveis de acesso: Admin, Colaborador, Cliente
- ✅ Credencial padrão para primeiro Admin

### Níveis de Acesso

#### 👨‍💼 Admin
- Vê todos os pedidos do sistema
- Gerencia todos os usuários (criar, editar, ativar/desativar, mudar nível)
- Vê dashboard completo com estatísticas gerais
- Gerencia todas as demandas
- Acesso a configurações de todos os usuários

#### 👷 Colaborador
- Vê todos os pedidos do sistema
- Vê suas demandas atribuídas
- Vê dashboard com estatísticas gerais
- Acessa apenas suas próprias configurações
- Não pode gerenciar usuários

#### 👤 Cliente
- Vê apenas seus próprios pedidos
- Cria novos pedidos
- Vê pedidos em aberto e finalizados
- Acessa apenas suas próprias configurações
- Dashboard personalizado com seus dados

## 📋 Estrutura do Banco de Dados

### Tabela: `usuarios`
```sql
- id (serial)
- nome (varchar)
- email (varchar, unique)
- senha (varchar, hash bcrypt)
- nivel_acesso (enum: 'admin', 'colaborador', 'cliente')
- ativo (boolean)
- created_at, updated_at (timestamp)
```

### Tabela: `pedidos`
```sql
- id (serial)
- cliente_id (fk → usuarios)
- titulo (varchar)
- descricao (text)
- status (enum: 'aberto', 'em_andamento', 'finalizado', 'cancelado')
- prioridade (enum: 'baixa', 'media', 'alta', 'urgente')
- responsavel_id (fk → usuarios)
- data_entrega (date)
- created_at, updated_at (timestamp)
```

### Tabela: `demandas`
```sql
- id (serial)
- pedido_id (fk → pedidos)
- titulo (varchar)
- descricao (text)
- responsavel_id (fk → usuarios)
- status (enum: 'aberta', 'em_progresso', 'concluida')
- created_at, updated_at (timestamp)
```

## 🔧 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd SGAM
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**

Crie um banco de dados PostgreSQL:
```sql
CREATE DATABASE sgam;
```

4. **Configure as variáveis de ambiente**

Copie o arquivo `.env` e ajuste as configurações:
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do PostgreSQL.

5. **Inicie o servidor**
```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000` e criará automaticamente:
- Todas as tabelas necessárias
- Usuário admin padrão

6. **Use a CLI para testar (em outro terminal)**
```bash
npm run cli
```

A CLI oferece uma interface interativa completa para testar todas as funcionalidades do sistema.

## 🔐 Credenciais Padrão

**Admin:**
- Email: `admin@sgam.com`
- Senha: `Admin@123`

⚠️ **IMPORTANTE:** Altere essas credenciais após o primeiro acesso!

## 📡 API Endpoints

### Autenticação

#### POST `/api/auth/registrar`
Criar nova conta (padrão: cliente)

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "mensagem": "Conta criada com sucesso",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "nivel_acesso": "cliente"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/api/auth/login`
Fazer login

**Body:**
```json
{
  "email": "admin@sgam.com",
  "senha": "Admin@123"
}
```

**Response:**
```json
{
  "mensagem": "Login realizado com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@sgam.com",
    "nivel_acesso": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/api/auth/verificar`
Verificar se token é válido

**Headers:**
```
Authorization: Bearer {token}
```

### Usuários (🔒 Requer Autenticação)

#### GET `/api/usuarios`
Listar todos os usuários (apenas admin)

#### GET `/api/usuarios/:id`
Obter usuário específico

#### POST `/api/usuarios`
Criar usuário (apenas admin)

**Body:**
```json
{
  "nome": "Maria Colaboradora",
  "email": "maria@sgam.com",
  "senha": "senha123",
  "nivel_acesso": "colaborador"
}
```

#### PUT `/api/usuarios/:id`
Atualizar usuário

**Body:**
```json
{
  "nome": "Novo Nome",
  "ativo": false,
  "nivel_acesso": "admin"
}
```

#### DELETE `/api/usuarios/:id`
Deletar usuário (apenas admin)

### Pedidos (🔒 Requer Autenticação)

#### GET `/api/pedidos`
Listar pedidos (filtrado por nível de acesso)

**Query Params:**
- `status`: filtrar por status

#### GET `/api/pedidos/:id`
Obter pedido específico com demandas

#### POST `/api/pedidos`
Criar novo pedido

**Body:**
```json
{
  "titulo": "Campanha Redes Sociais",
  "descricao": "Criar posts para Instagram e Facebook",
  "prioridade": "alta",
  "data_entrega": "2024-12-31"
}
```

#### PUT `/api/pedidos/:id`
Atualizar pedido

**Body:**
```json
{
  "status": "em_andamento",
  "responsavel_id": 2
}
```

#### DELETE `/api/pedidos/:id`
Deletar pedido

#### POST `/api/pedidos/:pedido_id/demandas`
Criar demanda em um pedido (admin/colaborador)

**Body:**
```json
{
  "titulo": "Criar artes",
  "descricao": "3 artes para Instagram",
  "responsavel_id": 3
}
```

#### PUT `/api/pedidos/demandas/:id`
Atualizar demanda (admin/colaborador)

### Dashboard (🔒 Requer Autenticação)

#### GET `/api/dashboard`
Obter dashboard personalizado por nível de acesso

**Response (Admin):**
```json
{
  "usuario": {
    "nome": "admin@sgam.com",
    "nivel_acesso": "admin"
  },
  "estatisticas": {
    "total_pedidos": 15,
    "pedidos_por_status": [...],
    "demandas_abertas": 5,
    "pedidos_finalizados": 8,
    "total_clientes": 12
  },
  "pedidos_recentes": [...]
}
```

**Response (Cliente):**
```json
{
  "usuario": {
    "nome": "cliente@email.com",
    "nivel_acesso": "cliente"
  },
  "estatisticas": {
    "meus_pedidos": 3,
    "pedidos_abertos": 2,
    "pedidos_finalizados": 1
  },
  "meus_pedidos_recentes": [...]
}
```

#### GET `/api/dashboard/pedidos-abertos`
Listar pedidos em aberto

#### GET `/api/dashboard/entregas`
Listar entregas finalizadas

#### GET `/api/dashboard/clientes`
Listar todos os clientes (admin/colaborador)

## 🔐 Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer {seu_token_jwt}
```

O token expira em 24 horas.

## 🛡️ Regras de Negócio

### Criação de Conta
- Por padrão, toda nova conta é criada como **Cliente**
- Apenas Admin pode criar contas Admin ou Colaborador

### Permissões de Usuários

#### Admin pode:
- ✅ Ver todos os pedidos e demandas
- ✅ Criar, editar e deletar qualquer usuário
- ✅ Ativar/desativar contas
- ✅ Alterar nível de acesso
- ✅ Gerenciar todos os pedidos

#### Colaborador pode:
- ✅ Ver todos os pedidos
- ✅ Ver suas demandas atribuídas
- ✅ Criar e gerenciar demandas
- ✅ Editar apenas suas configurações
- ❌ Não pode gerenciar usuários

#### Cliente pode:
- ✅ Ver apenas seus pedidos
- ✅ Criar novos pedidos
- ✅ Editar seus pedidos
- ✅ Ver pedidos em aberto e finalizados
- ✅ Editar apenas suas configurações
- ❌ Não pode ver pedidos de outros clientes
- ❌ Não pode gerenciar usuários ou demandas

### Pedidos
- Cliente cria pedido para si mesmo
- Admin/Colaborador pode criar pedido para qualquer cliente
- Status do pedido: `aberto` → `em_andamento` → `finalizado` ou `cancelado`
- Prioridades: `baixa`, `media`, `alta`, `urgente`

### Demandas
- São tarefas internas vinculadas a um pedido
- Apenas Admin/Colaborador pode criar e gerenciar
- Status: `aberta` → `em_progresso` → `concluida`

## 🚀 Scripts

```bash
# Desenvolvimento (iniciar servidor)
npm run dev

# CLI para testes
npm run cli

# Build
npm run build

# Produção
npm start
```

## 📝 Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgam
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=sgam_secret_key_super_segura_2024
CORS_ORIGIN=http://localhost:5173
```

## 🏗️ Arquitetura

```
SGAM/
├── src/
│   ├── controllers/       # Lógica de negócio
│   │   ├── AuthController.ts
│   │   ├── UsuarioController.ts
│   │   ├── PedidoController.ts
│   │   └── DashboardController.ts
│   ├── middlewares/       # Middlewares de autenticação
│   │   ├── auth.ts
│   │   └── checkRole.ts
│   ├── routes/           # Definição de rotas
│   │   ├── auth.ts
│   │   ├── usuario.ts
│   │   ├── pedido.ts
│   │   ├── dashboard.ts
│   │   └── index.ts
│   ├── cli.ts            # Interface CLI para testes
│   ├── database.ts       # Configuração do PostgreSQL
│   ├── setup.ts          # Configuração do Express
│   └── index.ts          # Entrada da aplicação
├── .env                  # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Segurança

- Senhas com hash bcrypt (10 rounds)
- JWT para autenticação stateless
- Headers de segurança com Helmet
- Validação de entrada em todos os endpoints
- Prevenção de SQL Injection com queries parametrizadas
- CORS configurável

## 📚 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Helmet** - Segurança HTTP
- **Morgan** - Logger
- **CORS** - Cross-Origin Resource Sharing

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

ISC

---

Desenvolvido para gerenciamento eficiente de agências de marketing 🚀
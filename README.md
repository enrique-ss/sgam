# 🎯 SGAM - Sistema de Gerenciamento de Agência de Marketing

> Projeto desenvolvido no programa "RSTI: Desenvolvimento Backend" para gerenciar o fluxo de trabalho de agências criativas

## 🤔 O que é isso?

O SGAM (Sistema de Gerenciamento de Agência de Marketing) é um sistema completo desenvolvido como projeto final do programa "RSTI Backend". Ele nasceu a partir das necessidades reais da nossa cliente, que precisava de uma solução para organizar pedidos de serviços criativos (design, desenvolvimento web, social media, SEO) e gerenciar o fluxo de trabalho entre clientes e colaboradores.

O sistema permite que clientes solicitem serviços, acompanhem o andamento em tempo real, enquanto colaboradores assumem e gerenciam os pedidos, e administradores controlam toda a operação da agência.

## 💡 Por que fiz essa modelagem?

Este projeto foi desenvolvido no contexto do programa "RSTI Backend", onde tínhamos uma cliente real com necessidades específicas de gestão. Durante o desenvolvimento, enfrentei um desafio interessante:

- Comecei criando três interfaces diferentes (Backend API, CLI e Web)
- Cada interface tinha suas próprias regras e comportamentos
- Isso gerou inconsistências: o backend validava de um jeito, o CLI de outro, e o frontend de outro
- Eu mesmo ficava confuso sobre qual era o comportamento "correto" 😅

**A virada de chave:** Parei de codificar e comecei a documentar. Criei uma modelagem de dados completa que serve como fonte única da verdade para todas as interfaces. Foi a melhor decisão do projeto!

Agora todas as interfaces seguem as mesmas regras, o código ficou mais organizado, e qualquer pessoa consegue entender o sistema lendo a documentação.

## 📚 Documentação

A parte mais importante desse projeto é a **[documentação de modelagem](docs/MODELAGEM.md)**. Lá eu explico:

- Por que decidi fazer essa documentação
- Como funciona o sistema inteiro
- Quais são as regras de cada coisa
- Como os dados se relacionam

Recomendo ler ela antes de mexer no código!

## 🛠️ Tecnologias que estou usando

- **Backend:** Node.js com TypeScript e Express
- **Banco:** MySQL com Knex.js (query builder)
- **Frontend Web:** HTML, CSS e JavaScript puros (sem frameworks)
- **CLI:** TypeScript (interface de linha de comando)

**Responsabilidades:**
- **Controllers**: Recebem requisições e retornam respostas
- **Services**: Contêm a lógica de negócio
- **Models**: Interagem com o banco de dados
- **DTOs**: Validam e tipam dados de entrada
- **Middlewares**: Interceptam requisições (auth, logs, validação)
- **Exceptions**: Tratam erros de forma estruturada

## 📁 Estrutura do Projeto

```
sgam/
├── docs/                         # Documentação técnica do projeto
│   └── MODELAGEM.md              # Diagrama ER, regras de negócio e especificação do banco
│
├── public/                       # Arquivos estáticos servidos pelo navegador
│   ├── index.html                # Interface web principal do sistema
│   ├── script.js                 # Lógica client-side (requisições, manipulação DOM)
│   └── style.css                 # Estilos visuais da interface
│
├── src/                          # Código-fonte TypeScript do backend
│   ├── config/                   # Configurações centralizadas do sistema
│   │   ├── database.ts           # Pool de conexões SQLite, configuração do Knex
│   │   ├── env.ts                # Carregamento e validação de variáveis de ambiente
│   │   └── express.ts            # Configuração do servidor (CORS, parsers, rotas)
│   │
│   ├── constants/                # Valores fixos utilizados em todo o sistema
│   │   ├── mensagens.ts          # Mensagens padronizadas de erro, sucesso e validação
│   │   ├── nivelAcesso.ts        # Enum dos níveis (CLIENTE=1, COLABORADOR=2, ADMIN=3)
│   │   └── statusPedido.ts       # Enum dos status (ABERTO, EM_ANDAMENTO, CONCLUIDO, etc)
│   │
│   ├── controllers/                # Camada de controle (recebe requisições HTTP)
│   │   ├── AuthController.ts       # Login, logout, verificação de sessão
│   │   ├── DashboardController.ts  # Retorna métricas agregadas (total pedidos, atrasados)
│   │   ├── PedidoController.ts     # CRUD de pedidos e mudanças de status
│   │   └── UsuarioController.ts    # CRUD de usuários (apenas admins podem criar/editar)
│   │
│   ├── database/                                 # Scripts de gerenciamento do banco de dados
│   │   ├── migrations/                           # Versionamento do schema (cria tabelas)
│   │   │   ├── 001_create_usuarios.ts            # Tabela usuarios (id, nome, email, senha_hash, nivel_acesso)
│   │   │   ├── 002_create_pedidos.ts             # Tabela pedidos (id, titulo, descricao, status, prazo, cliente_id, colaborador_id)
│   │   │   └── 003_create_pedidos_status_log.ts  # Tabela de auditoria (rastreia mudanças de status)
│   │   └── seeds/                                # Dados iniciais para desenvolvimento/testes
│   │       ├── usuarios.ts                       # Cria usuários padrão (admin, colaborador, cliente)
│   │       └── pedidos.ts                        # Cria pedidos de exemplo para popular o sistema
│   │
│   ├── dto/                      # Data Transfer Objects (validação de entrada)
│   │   ├── CreatePedidoDto.ts    # Valida campos obrigatórios ao criar pedido
│   │   ├── CreateUsuarioDto.ts   # Valida email, senha forte, nível de acesso
│   │   ├── LoginDto.ts           # Valida credenciais de login (email + senha)
│   │   ├── UpdateUsuarioDto.ts   # Valida campos opcionais ao atualizar usuário
│   │   └── index.ts              # Exporta todos os DTOs em um único import
│   │
│   ├── exceptions/               # Classes de erro customizadas
│   │   ├── AppError.ts           # Classe base (status HTTP + mensagem)
│   │   ├── NotFoundError.ts      # Erro 404 (recurso não encontrado)
│   │   ├── UnauthorizedError.ts  # Erro 401 (não autenticado ou sem permissão)
│   │   ├── ValidationError.ts    # Erro 400 (dados inválidos)
│   │   └── index.ts              # Exporta todos os erros em um único import
│   │
│   ├── middlewares/              # Funções executadas antes dos controllers
│   │   ├── auth.ts               # Valida JWT e adiciona usuário ao request
│   │   ├── errorHandler.ts       # Captura erros e retorna JSON padronizado
│   │   ├── logger.ts             # Loga todas as requisições (método, URL, tempo)
│   │   └── validation.ts         # Valida corpo da requisição contra DTOs
│   │
│   ├── models/                   # Representação das tabelas do banco
│   │   ├── Usuario.ts            # Model de usuários (métodos CRUD + autenticação)
│   │   ├── Pedido.ts             # Model de pedidos (métodos CRUD + queries complexas)
│   │   ├── PedidoStatusLog.ts    # Model de histórico (registra quem mudou o status e quando)
│   │   └── index.ts              # Exporta todos os models em um único import
│   │
│   ├── routes/                   # Definição dos endpoints da API REST
│   │   ├── AuthRoutes.ts         # POST /auth/login, POST /auth/logout, GET /auth/me
│   │   ├── DashboardRoutes.ts    # GET /dashboard (métricas gerais do sistema)
│   │   ├── PedidoRoutes.ts       # GET/POST/PUT/DELETE /pedidos, PATCH /pedidos/:id/status
│   │   ├── UsuarioRoutes.ts      # GET/POST/PUT/DELETE /usuarios (apenas admins)
│   │   └── index.ts              # Agrupa todas as rotas sob o prefixo /api
│   │
│   ├── services/                 # Lógica de negócio (regras complexas)
│   │   ├── AuthService.ts        # Gera JWT, verifica senha, valida tokens
│   │   ├── CronService.ts        # Jobs automáticos (marca pedidos atrasados, notifica inatividade)
│   │   ├── DashboardService.ts   # Calcula estatísticas agregadas do banco
│   │   ├── PedidoService.ts      # Regras de negócio (transição de status, validações)
│   │   └── UsuarioService.ts     # Regras de negócio (hash de senha, validação de email)
│   │
│   ├── types/                    # Definições TypeScript customizadas
│   │   ├── Auth.types.ts         # Tipos do payload JWT, sessão, token
│   │   ├── Pedido.types.ts       # Interface de pedido, filtros, ordenação
│   │   ├── Usuario.types.ts      # Interface de usuário (com e sem senha)
│   │   ├── express.d.ts          # Extende Request do Express (adiciona user, auth)
│   │   └── index.ts              # Exporta todos os tipos em um único import
│   │
│   ├── utils/                    # Funções auxiliares reutilizáveis
│   │   ├── date.ts               # Formata datas (ISO, BR), calcula diferenças
│   │   ├── jwt.ts                # Cria e verifica tokens JWT (usa jsonwebtoken)
│   │   ├── password.ts           # Hash bcrypt e comparação segura de senhas
│   │   ├── validator.ts          # Valida CPF, email, telefone, etc
│   │   └── index.ts              # Exporta todos os utils em um único import
│   │
│   ├── cli.ts                    # Interface de linha de comando (npm run cli)
│   │                             # Comandos: criar usuário, resetar banco, rodar migrations
│   ├── index.ts                  # Entry point da API (inicia servidor Express)
│   └── setup.ts                  # Script inicial (cria banco, roda migrations, seeds)
│
├── tests/                        # Suíte de testes automatizados (Jest)
│   ├── integration/              # Testa fluxos completos da API
│   │   ├── auth.test.ts          # Testa login, logout, proteção de rotas
│   │   ├── pedido.test.ts        # Testa CRUD completo de pedidos
│   │   └── usuario.test.ts       # Testa CRUD completo de usuários
│   └── unit/                     # Testa funções isoladas
│       ├── services/             # Testa lógica de negócio dos services
│       └── utils/                # Testa funções auxiliares (hash, JWT, validação)
│
├── .env                          # Variáveis secretas (JWT_SECRET, DB_PATH) - ignorado pelo git
├── .env.example                  # Template de configuração (commitado para referência)
├── .gitattributes                # Garante line endings consistentes (LF) em todos OS
├── .gitignore                    # Lista arquivos não versionados (node_modules, .env, *.db)
├── package.json                  # Dependências npm e scripts (start, dev, test, migrate)
├── package-lock.json             # Lock exato de versões das dependências
├── README.md                     # Documentação principal (como instalar, rodar, deploy)
├── SGAM-final.pdf                # Documentação acadêmica final (apresentação, diagramas)
└── tsconfig.json                 # Configuração do compilador TypeScript
```

## 🚀 Como rodar

### Requisitos
- Node.js 16+
- MySQL instalado e rodando

### Passos

1. **Clone o projeto:**
```bash
git clone https://github.com/seu-usuario/sgam.git
cd sgam
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure suas credenciais do MySQL:**
```bash
# Crie o arquivo .env em seu projeto seguindo o ".env.example"
```

4. **Configure o banco de dados:**
```bash
npm run setup
# Isso vai criar o banco e as tabelas automaticamente
# ⚠️ Cuidado: se já existir um banco com o nome, ele será deletado!
```

5. **Inicie o servidor:**
```bash
npm run dev
```

6. **Use a interface que preferir:**

**Interface Web:**
```bash
npm run web
# Abre o HTML no navegador
```

**Interface CLI:**
```bash
npm run cli
# Abre a interface de linha de comando
```

## 📖 O que aprendi até agora

- ✅ Importância de documentar ANTES de codificar (evita retrabalho)
- ✅ Como fazer relacionamentos entre tabelas (Foreign Keys) no MySQL
- ✅ Uso do Knex.js para query builder e migrations
- ✅ Diferença entre regras de negócio e implementação técnica
- ✅ Como organizar permissões por tipo de usuário (RBAC)
- ✅ Fluxos de estado e transições (pedido: pendente → em_andamento → entregue)
- ✅ Desenvolvimento com TypeScript e Express
- ✅ Importância de manter consistência entre múltiplas interfaces
- ✅ Trabalho em equipe usando Git e GitHub (branches, pull requests, code review)
- ✅ Como resolver conflitos de merge e manter o código sincronizado
- ✅ Arquitetura em camadas (Controllers → Services → Models)
- ✅ Uso de DTOs para validação e tipagem forte
- ✅ Tratamento de erros com exceptions customizadas
- ✅ Padrão Barrel Export para imports limpos

## 🤝 Quer contribuir ou dar feedback?

Fique à vontade! Qualquer dica ou sugestão é bem-vinda. Ainda estou aprendendo, então provavelmente tem muita coisa pra melhorar.

💭 **Reflexão pessoal:** Este projeto me ensinou que código limpo começa com planejamento limpo. O tempo investido em documentação não é perda de tempo, é economia de retrabalho. Foi uma experiência valiosa desenvolver um sistema a partir de necessidades reais de uma cliente no contexto do RSTI Backend.

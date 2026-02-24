# Arquitetura do SGAM

## Estrutura atual do projeto

```
SGAM/
├── src/
│   ├── controllers/
│   │   ├── AluguelController.ts
│   │   ├── AuthController.ts
│   │   ├── LivroController.ts
│   │   └── UsuarioController.ts
│   ├── middlewares/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── aluguelRoutes.ts
│   │   ├── AuthRoutes.ts
│   │   ├── livroRoutes.ts
│   │   └── UsuarioRoutes.ts
│   ├── cli.ts
│   ├── database.ts
│   ├── index.ts
│   └── setup.ts
├── .env.example
├── .gitattributes
├── .gitignore
├── nodemon.json
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

---

## Detalhamento

### src/controllers/

Cada controller cuida de um domínio do sistema. Recebe a requisição, aplica as regras de negócio e retorna a resposta.

**AluguelController.ts:** operações de aluguel de itens, listar, criar, devolver e cancelar.

**AuthController.ts:** login, registro e dados do usuário autenticado.

**LivroController.ts:** operações sobre o acervo, listar, buscar, criar, atualizar e remover.

**UsuarioController.ts:** listagem e gestão de usuários, exclusivo para administradores.

---

### src/middlewares/

**auth.ts:** verifica o token JWT no header, valida, decodifica e anexa os dados do usuário na requisição. Bloqueia se o token for inválido ou inexistente.

---

### src/routes/

Cada arquivo agrupa as rotas de um domínio e aplica os middlewares necessários antes de chamar o controller.

---

### src/database.ts

Configura e exporta a conexão com o banco de dados. Ponto único de acesso ao MySQL via Knex.

---

### src/index.ts

Ponto de entrada do servidor. Importa as rotas, registra os middlewares globais e sobe a aplicação na porta configurada.

---

### src/cli.ts

Interface de linha de comando para operações administrativas sem depender da API HTTP.

---

### src/setup.ts

Script de configuração inicial do banco de dados. Cria as tabelas e insere dados iniciais quando necessário.

---

## Observação

Esta arquitetura representa o estado atual do projeto. A modelagem completa planejada, incluindo services, jobs, types, utils, migrations, seeds e frontend, está documentada separadamente e será implementada nas próximas versões.
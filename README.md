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
- O que cada tipo de usuário pode fazer
- Como os dados se relacionam

Recomendo ler ela antes de mexer no código!

## 🛠️ Tecnologias que estou usando

- **Backend:** Node.js com TypeScript
- **Banco:** MySQL
- **Frontend Web:** HTML, CSS e JavaScript puros (sem frameworks)
- **CLI:** TypeScript (interface de linha de comando)

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

2. **Configure suas credenciais do MySQL:**
```bash
# Edite o arquivo de configuração com seu usuário e senha do MySQL
# (o arquivo já existe no projeto (.env))
```

3. **Configure o banco de dados:**
```bash
npm run setup
# Isso vai criar o banco e as tabelas automaticamente
# ⚠️ Cuidado: se já existir um banco com o nome, ele será deletado!
```

4. **Inicie o servidor:**
```bash
npm run dev
```

5. **Use a interface que preferir:**

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
- ✅ Diferença entre regras de negócio e implementação técnica
- ✅ Como organizar permissões por tipo de usuário (RBAC)
- ✅ Fluxos de estado e transições (pedido: pendente → em_andamento → entregue)
- ✅ Desenvolvimento com TypeScript e integração com banco de dados
- ✅ Importância de manter consistência entre múltiplas interfaces
- ✅ Trabalho em equipe usando Git e GitHub (branches, pull requests, code review)
- ✅ Como resolver conflitos de merge e manter o código sincronizado


## 🤝 Quer contribuir ou dar feedback?

Fique à vontade! Qualquer dica ou sugestão é bem-vinda. Ainda estou aprendendo, então provavelmente tem muita coisa pra melhorar.

💭 **Reflexão pessoal:** Este projeto me ensinou que código limpo começa com planejamento limpo. O tempo investido em documentação não é perda de tempo, é economia de retrabalho. Foi uma experiência valiosa desenvolver um sistema a partir de necessidades reais de uma cliente no contexto do RSTI Backend.
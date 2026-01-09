# 🎯 SGAM - Sistema de Gerenciamento de Agência de Marketing

Sistema desenvolvido no programa **RSTI Backend** para gerenciar pedidos de serviços criativos (design, desenvolvimento web, social media, SEO). Permite que:

- **Clientes** solicitem e acompanhem serviços em tempo real
- **Colaboradores** assumam e gerenciem pedidos
- **Administradores** controlem toda operação da agência

## 🚀 Quick Start

```bash
git clone https://github.com/seu-usuario/sgam.git
cd sgamInstale dependências
npm installConfigure o banco (crie .env baseado no .env.example)
npm run setupInicie o servidor
npm run dev
```
**Interfaces disponíveis:**
- 🌐 **Web:** `npm run web` (abre no navegador)
- 💻 **CLI:** `npm run cli` (linha de comando)

## 🛠️ Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Banco:** MySQL + Knex.js
- **Frontend:** HTML/CSS/JS puro
- **Arquitetura:** Layered (Controllers → Services → Models)

## 📚 Documentação

- **[📊 Modelagem de Dados](docs/MODELAGEM.md)** - Estrutura do banco, regras de negócio
- **[🏗️ Arquitetura](docs/ARCHITECTURE.md)** - Estrutura do código, padrões
- **[📖 Aprendizados](docs/LEARNINGS.md)** - Lições do desenvolvimento

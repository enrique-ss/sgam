import axios from 'axios';
import * as readline from 'readline';

const BASE_URL = 'http://127.0.0.1:3000/api';
let token: string | null = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function login() {
    console.clear();
    console.log('=== LOGIN ===\n');

    const email = await question('Email: ');
    const senha = await question('Senha: ');

    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, { email, senha });
        token = response.data.token;
        console.log('\n✅ Login realizado!');
        console.log(`👤 Bem-vindo, ${response.data.usuario.nome}!`);
        console.log(`📋 Nível: ${response.data.usuario.nivel_acesso}\n`);
        await question('Pressione ENTER para continuar...');
        return true;
    } catch (error: any) {
        console.error('\n❌ Erro:', error.response?.data?.erro || 'Erro ao fazer login');
        await question('\nPressione ENTER para continuar...');
        return false;
    }
}

async function registrar() {
    console.clear();
    console.log('=== REGISTRAR ===\n');

    const nome = await question('Nome: ');
    const email = await question('Email: ');
    const senha = await question('Senha: ');

    try {
        const response = await axios.post(`${BASE_URL}/auth/registrar`, { nome, email, senha });
        console.log('\n✅ Conta criada!');
        console.log(`📋 Tipo: ${response.data.usuario.nivel_acesso}\n`);
        await question('Pressione ENTER para continuar...');
    } catch (error: any) {
        console.error('\n❌ Erro:', error.response?.data?.erro || 'Erro ao registrar');
        await question('\nPressione ENTER para continuar...');
    }
}

async function listarPedidos() {
    if (!token) {
        console.log('\n❌ Faça login primeiro!');
        await question('Pressione ENTER para continuar...');
        return;
    }

    console.clear();
    console.log('=== MEUS PEDIDOS ===\n');

    try {
        const response = await axios.get(`${BASE_URL}/pedidos`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const pedidos = response.data.pedidos;

        if (pedidos.length === 0) {
            console.log('Nenhum pedido encontrado.\n');
        } else {
            pedidos.forEach((p: any) => {
                console.log(`#${p.id} - ${p.titulo}`);
                console.log(`   Status: ${p.status} | Prioridade: ${p.prioridade || 'N/A'}`);
                console.log(`   Cliente: ${p.cliente_nome}`);
                console.log(`   Responsável: ${p.responsavel_nome || 'Sem responsável'}`);
                console.log('');
            });
        }

        await question('Pressione ENTER para continuar...');
    } catch (error: any) {
        console.error('\n❌ Erro:', error.response?.data?.erro || 'Erro ao listar pedidos');
        await question('\nPressione ENTER para continuar...');
    }
}

async function criarPedido() {
    if (!token) {
        console.log('\n❌ Faça login primeiro!');
        await question('Pressione ENTER para continuar...');
        return;
    }

    console.clear();
    console.log('=== CRIAR PEDIDO ===\n');

    const titulo = await question('Título: ');
    const tipo_servico = await question('Tipo de Serviço: ');
    const descricao = await question('Descrição: ');
    const orcamento = await question('Orçamento (opcional): ');
    const prazo_entrega = await question('Prazo (YYYY-MM-DD, opcional): ');

    try {
        const dados: any = { titulo, tipo_servico, descricao };
        if (orcamento) dados.orcamento = parseFloat(orcamento);
        if (prazo_entrega) dados.prazo_entrega = prazo_entrega;

        const response = await axios.post(`${BASE_URL}/pedidos`, dados, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n✅', response.data.mensagem);
        await question('\nPressione ENTER para continuar...');
    } catch (error: any) {
        console.error('\n❌ Erro:', error.response?.data?.erro || 'Erro ao criar pedido');
        await question('\nPressione ENTER para continuar...');
    }
}

async function menuPrincipal() {
    while (true) {
        console.clear();
        console.log('╔════════════════════════════════╗');
        console.log('║     SGAM - CLI v1.0            ║');
        console.log('╚════════════════════════════════╝\n');

        if (token) {
            console.log('1. Listar Meus Pedidos');
            console.log('2. Criar Pedido');
            console.log('3. Sair (Logout)');
            console.log('0. Fechar');
        } else {
            console.log('1. Login');
            console.log('2. Registrar');
            console.log('0. Fechar');
        }

        const opcao = await question('\nEscolha: ');

        if (!token) {
            switch (opcao) {
                case '1':
                    await login();
                    break;
                case '2':
                    await registrar();
                    break;
                case '0':
                    console.log('\n👋 Até logo!');
                    rl.close();
                    process.exit(0);
                default:
                    console.log('\n❌ Opção inválida!');
                    await question('Pressione ENTER...');
            }
        } else {
            switch (opcao) {
                case '1':
                    await listarPedidos();
                    break;
                case '2':
                    await criarPedido();
                    break;
                case '3':
                    token = null;
                    console.log('\n✅ Logout realizado!');
                    await question('Pressione ENTER...');
                    break;
                case '0':
                    console.log('\n👋 Até logo!');
                    rl.close();
                    process.exit(0);
                default:
                    console.log('\n❌ Opção inválida!');
                    await question('Pressione ENTER...');
            }
        }
    }
}

menuPrincipal().catch(console.error);
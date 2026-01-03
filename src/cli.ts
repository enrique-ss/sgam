import axios from 'axios';
import * as readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();
const api = axios.create({ baseURL: 'http://127.0.0.1:3000/api' });
let token: string | null = null;
let user: any = null;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const pergunta = (t: string): Promise<string> => new Promise((r) => rl.question(t, r));
api.interceptors.request.use((config) => { if (token) config.headers.Authorization = `Bearer ${token}`; return config; });

// Utilitários de interface
const limpar = () => console.clear();
const cores = { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', vermelho: '\x1b[31m', verde: '\x1b[32m', amarelo: '\x1b[33m', azul: '\x1b[34m', magenta: '\x1b[35m', ciano: '\x1b[36m', branco: '\x1b[37m' };
const emoji = { pedido: '📋', usuario: '👤', admin: '👨‍💼', colaborador: '👷', cliente: '🙋', dashboard: '📊', check: '✅', erro: '❌', info: 'ℹ️', voltar: '↩️', sair: '🚪', adicionar: '➕', editar: '✏️', deletar: '🗑️', email: '📧', senha: '🔒', pendente: '⏳', finalizado: '🎉', clientes: '👥' };

const colorir = (texto: string, cor: string) => `${cor}${texto}${cores.reset}`;
const titulo = (texto: string, cor = cores.ciano) => { const l = '═'.repeat(texto.length + 4); console.log(colorir(l, cor)); console.log(colorir(`  ${texto}  `, cor)); console.log(colorir(l, cor)); };
const sucesso = (texto: string) => console.log(colorir(`\n${emoji.check} ${texto}`, cores.verde + cores.bold));
const erro = (texto: string) => console.log(colorir(`\n${emoji.erro} ${texto}`, cores.vermelho + cores.bold));
const info = (texto: string) => console.log(colorir(`${emoji.info} ${texto}`, cores.ciano));
const divisor = (cor = cores.ciano) => console.log(colorir('─'.repeat(70), cor));
const caixaOpcao = (numero: string, texto: string, icone: string) => console.log(`  ${colorir(numero, cores.amarelo + cores.bold)} ${icone}  ${texto}`);
const mostrarBanner = () => { console.log(`\n  ${cores.magenta}███████╗ ██████╗  █████╗ ███╗   ███╗${cores.reset}\n  ${cores.magenta}██╔════╝██╔════╝ ██╔══██╗████╗ ████║${cores.reset}\n  ${cores.ciano}███████╗██║  ███╗███████║██╔████╔██║${cores.reset}\n  ${cores.ciano}╚════██║██║   ██║██╔══██║██║╚██╔╝██║${cores.reset}\n  ${cores.azul}███████║╚██████╔╝██║  ██║██║ ╚═╝ ██║${cores.reset}\n  ${cores.azul}╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝${cores.reset}\n  `); console.log(colorir('    Sistema de Gerenciamento para Agências de Marketing v1.0.0', cores.dim)); };

// ===== CLIENTE =====
async function criarPedidoCliente() {
    limpar();
    titulo('➕ CRIAR PEDIDO', cores.verde);
    try {
        const titulo_pedido = await pergunta(colorir(`\n${emoji.pedido} Título: `, cores.ciano));
        const descricao = await pergunta(colorir(`📝 Descrição: `, cores.ciano));
        const res = await api.post('/pedidos', { titulo: titulo_pedido, descricao });
        sucesso(res.data.mensagem || 'Pedido criado!');
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function verMeusPedidosAbertos() {
    limpar();
    titulo('📂 MEUS PEDIDOS EM ABERTO', cores.azul);
    try {
        const res = await api.get('/pedidos?status=aberto,em_andamento');
        if (res.data.total === 0) {
            info('Nenhum pedido em aberto.');
        } else {
            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
            res.data.pedidos.forEach((p: any, i: number) => {
                console.log(colorir(`${i + 1}. ${p.titulo}`, cores.branco + cores.bold));
                console.log(colorir(`   ID: ${p.id} | Status: ${p.status} | Responsável: ${p.responsavel_nome || 'Aguardando'}`, cores.dim));
            });
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function verMeusPedidosFinalizados() {
    limpar();
    titulo('✅ PEDIDOS FINALIZADOS', cores.verde);
    try {
        const res = await api.get('/pedidos?status=finalizado');
        if (res.data.total === 0) {
            info('Nenhum pedido finalizado.');
        } else {
            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
            res.data.pedidos.forEach((p: any, i: number) => {
                console.log(colorir(`${i + 1}. ${p.titulo}`, cores.branco + cores.bold));
                console.log(colorir(`   ID: ${p.id} | Responsável: ${p.responsavel_nome}`, cores.dim));
            });
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function verEditarPerfilCliente() {
    limpar();
    titulo('👤 MEU PERFIL', cores.ciano);
    try {
        const res = await api.get(`/usuarios/${user.id}`);
        const u = res.data.usuario;
        console.log(`\nNome: ${u.nome}\nEmail: ${u.email}\nNível: ${u.nivel_acesso}`);

        const op = await pergunta(colorir('\n1. Editar | 0. Voltar: ', cores.amarelo));

        if (op === '1') {
            info('\nDeixe vazio para manter\n');
            const nome = await pergunta(colorir('Novo nome: ', cores.ciano));
            const email = await pergunta(colorir('Novo email: ', cores.ciano));
            const senha = await pergunta(colorir('Nova senha: ', cores.ciano));

            const data: any = {};
            if (nome) data.nome = nome;
            if (email) data.email = email;
            if (senha) data.senha = senha;

            if (Object.keys(data).length > 0) {
                await api.put(`/usuarios/${user.id}`, data);
                if (nome) user.nome = nome;
                if (email) user.email = email;
                sucesso('Dados atualizados!');
            }
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

// ===== ADMIN/COLABORADOR =====
async function verDashboard() {
    limpar();
    titulo('📊 DASHBOARD', cores.magenta);
    try {
        const res = await api.get('/dashboard');
        const d = res.data;

        console.log('\n📈 ESTATÍSTICAS:');
        if (user.nivel_acesso === 'admin') {
            console.log(`Total: ${d.estatisticas.total_pedidos} | Pendentes: ${d.estatisticas.pedidos_pendentes} | Em Andamento: ${d.estatisticas.pedidos_em_andamento}`);
            console.log(`Finalizados: ${d.estatisticas.pedidos_finalizados} | Clientes: ${d.estatisticas.total_clientes} | Colaboradores: ${d.estatisticas.total_colaboradores}`);
        } else {
            console.log(`Minhas Demandas: ${d.estatisticas.minhas_demandas} | Pendentes: ${d.estatisticas.pedidos_pendentes} | Finalizados: ${d.estatisticas.pedidos_finalizados}`);
        }

        const pedidos = d.pedidos_recentes || d.meus_pedidos_recentes;
        if (pedidos?.length > 0) {
            console.log('\n📋 PEDIDOS RECENTES:');
            console.table(pedidos.map((p: any) => ({ ID: p.id, Título: p.titulo, Status: p.status })));
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function verPedidosPendentes() {
    limpar();
    titulo('📥 PEDIDOS PENDENTES', cores.amarelo);
    try {
        const res = await api.get('/pedidos?status=aberto');
        if (res.data.total === 0) {
            info('Nenhum pedido pendente.');
        } else {
            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
            console.table(res.data.pedidos.map((p: any) => ({ ID: p.id, Título: p.titulo, Cliente: p.cliente_nome })));

            const op = await pergunta(colorir('\n1. Aceitar | 2. Ver detalhes | 0. Voltar: ', cores.amarelo));

            if (op === '1') {
                const id = await pergunta('ID: ');
                await api.put(`/pedidos/${id}`, { status: 'em_andamento', responsavel_id: user.id });
                sucesso('Pedido aceito!');
                await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
            } else if (op === '2') {
                const id = await pergunta('ID: ');
                const det = await api.get(`/pedidos/${id}`);
                console.log('\n', JSON.stringify(det.data.pedido, null, 2));
                await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
            }
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
}

async function verMinhasDemandas() {
    limpar();
    titulo('✅ MINHAS DEMANDAS', cores.verde);
    try {
        const res = await api.get(`/pedidos?status=em_andamento&responsavel_id=${user.id}`);
        if (res.data.total === 0) {
            info('Nenhuma demanda.');
        } else {
            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
            console.table(res.data.pedidos.map((p: any) => ({ ID: p.id, Título: p.titulo, Cliente: p.cliente_nome })));

            const op = await pergunta(colorir('\n1. Finalizar | 2. Recusar | 0. Voltar: ', cores.amarelo));

            if (op === '1') {
                const id = await pergunta('ID: ');
                const conf = await pergunta('Confirmar finalização? (s/n): ');
                if (conf.toLowerCase() === 's') {
                    await api.put(`/pedidos/${id}`, { status: 'finalizado' });
                    sucesso('Pedido finalizado!');
                }
                await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
            } else if (op === '2') {
                const id = await pergunta('ID: ');
                const conf = await pergunta('Confirmar recusa? (s/n): ');
                if (conf.toLowerCase() === 's') {
                    await api.put(`/pedidos/${id}`, { status: 'aberto', responsavel_id: null });
                    sucesso('Pedido recusado!');
                }
                await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
            }
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
}

async function listarClientes() {
    limpar();
    titulo('👥 CLIENTES', cores.ciano);
    try {
        const res = await api.get('/dashboard/clientes');
        if (res.data.total === 0) {
            info('Nenhum cliente.');
        } else {
            console.table(res.data.clientes.map((c: any) => ({ ID: c.id, Nome: c.nome, Email: c.email, Pedidos: c.total_pedidos })));
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function listarUsuarios() {
    limpar();
    titulo('👥 USUÁRIOS', cores.magenta);
    try {
        const res = await api.get('/usuarios');
        console.table(res.data.usuarios.map((u: any) => ({ ID: u.id, Nome: u.nome, Email: u.email, Nível: u.nivel_acesso })));
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function criarUsuario() {
    limpar();
    titulo('➕ CRIAR USUÁRIO', cores.verde);
    try {
        const nome = await pergunta('Nome: ');
        const email = await pergunta('Email: ');
        const senha = await pergunta('Senha: ');
        const nivel = await pergunta('Nível (1. Admin | 2. Colaborador): ');

        await api.post('/usuarios', {
            nome,
            email,
            senha,
            nivel_acesso: nivel === '1' ? 'admin' : 'colaborador'
        });
        sucesso('Usuário criado!');
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function atualizarUsuario() {
    limpar();
    titulo('✏️  ATUALIZAR USUÁRIO', cores.amarelo);
    try {
        const id = await pergunta('ID do usuário: ');
        info('\nDeixe vazio para manter\n');
        const nome = await pergunta('Novo nome: ');
        const nivel = await pergunta('Nível (1. Admin | 2. Colaborador | 3. Cliente | 0. Manter): ');
        const ativo = await pergunta('Ativo (1. Sim | 2. Não | 0. Manter): ');

        const data: any = {};
        if (nome) data.nome = nome;
        if (nivel === '1') data.nivel_acesso = 'admin';
        else if (nivel === '2') data.nivel_acesso = 'colaborador';
        else if (nivel === '3') data.nivel_acesso = 'cliente';
        if (ativo === '1') data.ativo = true;
        else if (ativo === '2') data.ativo = false;

        if (Object.keys(data).length > 0) {
            await api.put(`/usuarios/${id}`, data);
            sucesso('Usuário atualizado!');
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

async function deletarUsuario() {
    limpar();
    titulo('🗑️  DELETAR USUÁRIO', cores.vermelho);
    try {
        const id = await pergunta('ID do usuário: ');
        const conf = await pergunta('Confirmar exclusão? (s/n): ');
        if (conf.toLowerCase() === 's') {
            await api.delete(`/usuarios/${id}`);
            sucesso('Usuário deletado!');
        }
    } catch (e: any) {
        erro(`${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
}

// ===== MENUS =====
async function menuCliente() {
    while (true) {
        limpar();
        console.log(colorir(`\n  ${emoji.cliente} ${user.nome} | CLIENTE`, cores.ciano + cores.bold));
        divisor();
        caixaOpcao('1', 'Criar pedido', emoji.adicionar);
        caixaOpcao('2', 'Pedidos em aberto', emoji.pendente);
        caixaOpcao('3', 'Pedidos finalizados', emoji.finalizado);
        caixaOpcao('4', 'Meu perfil', emoji.usuario);
        divisor(cores.vermelho);
        caixaOpcao('0', 'Sair', emoji.sair);
        divisor();

        const op = await pergunta(colorir('\nOpção: ', cores.amarelo));

        if (op === '0') return start();
        else if (op === '1') await criarPedidoCliente();
        else if (op === '2') await verMeusPedidosAbertos();
        else if (op === '3') await verMeusPedidosFinalizados();
        else if (op === '4') await verEditarPerfilCliente();
    }
}

async function menuAdminColaborador() {
    while (true) {
        limpar();
        const icone = user.nivel_acesso === 'admin' ? emoji.admin : emoji.colaborador;
        console.log(colorir(`\n  ${icone} ${user.nome} | ${user.nivel_acesso.toUpperCase()}`, cores.magenta + cores.bold));
        divisor();
        caixaOpcao('1', 'Dashboard', emoji.dashboard);
        caixaOpcao('2', 'Pedidos Pendentes', emoji.pedido);
        caixaOpcao('3', 'Minhas Demandas', emoji.check);
        if (user.nivel_acesso === 'admin' || user.nivel_acesso === 'colaborador') caixaOpcao('4', 'Clientes', emoji.clientes);
        if (user.nivel_acesso === 'admin') {
            caixaOpcao('5', 'Listar usuários', emoji.usuario);
            caixaOpcao('6', 'Criar usuário', emoji.adicionar);
            caixaOpcao('7', 'Atualizar usuário', emoji.editar);
            caixaOpcao('8', 'Deletar usuário', emoji.deletar);
        }
        divisor(cores.vermelho);
        caixaOpcao('0', 'Sair', emoji.sair);
        divisor();

        const op = await pergunta(colorir('\nOpção: ', cores.amarelo));

        if (op === '0') return start();
        else if (op === '1') await verDashboard();
        else if (op === '2') await verPedidosPendentes();
        else if (op === '3') await verMinhasDemandas();
        else if (op === '4') await listarClientes();
        else if (op === '5' && user.nivel_acesso === 'admin') await listarUsuarios();
        else if (op === '6' && user.nivel_acesso === 'admin') await criarUsuario();
        else if (op === '7' && user.nivel_acesso === 'admin') await atualizarUsuario();
        else if (op === '8' && user.nivel_acesso === 'admin') await deletarUsuario();
    }
}

// ===== LOGIN =====
async function start() {
    limpar();
    mostrarBanner();
    divisor();
    caixaOpcao('1', 'Login', '🔐');
    caixaOpcao('2', 'Cadastro', '✍️');
    caixaOpcao('0', 'Sair', emoji.sair);
    divisor();

    const op = await pergunta(colorir('\n> ', cores.amarelo));

    if (op === '0') {
        console.log(colorir('\n👋 Até logo!\n', cores.ciano));
        process.exit(0);
    }

    const email = await pergunta(colorir(`\n${emoji.email} Email: `, cores.ciano));
    const senha = await pergunta(colorir(`${emoji.senha} Senha: `, cores.ciano));

    try {
        if (op === '2') {
            const nome = await pergunta(colorir(`${emoji.usuario} Nome: `, cores.ciano));
            const res = await api.post('/auth/registrar', { nome, email, senha });
            token = res.data.token;
            user = res.data.usuario;
            sucesso(res.data.mensagem);
        } else if (op === '1') {
            const res = await api.post('/auth/login', { email, senha });
            token = res.data.token;
            user = res.data.usuario;
            sucesso(res.data.mensagem);
        }

        await pergunta(colorir(`\n${emoji.voltar} Enter para continuar...`, cores.verde));
        user.nivel_acesso === 'cliente' ? menuCliente() : menuAdminColaborador();
    } catch (e: any) {
        erro(`${e.response?.data?.erro || 'Servidor offline'}`);
        await pergunta(colorir(`\n${emoji.voltar} Enter...`, cores.dim));
        start();
    }
}

start();
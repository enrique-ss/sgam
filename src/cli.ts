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

// ===== UTILITÁRIOS DE INTERFACE =====
const limpar = () => console.clear();
const cores = { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', vermelho: '\x1b[31m', verde: '\x1b[32m', amarelo: '\x1b[33m', azul: '\x1b[34m', magenta: '\x1b[35m', ciano: '\x1b[36m', branco: '\x1b[37m' };
const emoji = { pedido: '📋', usuario: '👤', admin: '👨‍💼', colaborador: '👷', cliente: '🙋', dashboard: '📊', check: '✅', erro: '❌', info: 'ℹ️', voltar: '↩️', sair: '🚪', adicionar: '➕', editar: '✏️', deletar: '🗑️', lupa: '🔍', email: '📧', senha: '🔒', pendente: '⏳', finalizado: '🎉', demanda: '✅', clientes: '👥', config: '⚙️' };

const colorir = (texto: string, cor: string) => `${cor}${texto}${cores.reset}`;
const titulo = (texto: string, cor = cores.ciano) => { const l = '═'.repeat(texto.length + 4); console.log(colorir(l, cor)); console.log(colorir(`  ${texto}  `, cor)); console.log(colorir(l, cor)); };
const subtitulo = (texto: string) => { console.log(colorir(`\n${texto}`, cores.amarelo + cores.bold)); console.log(colorir('─'.repeat(texto.length), cores.amarelo)); };
const sucesso = (texto: string) => console.log(colorir(`\n${emoji.check} ${texto}`, cores.verde + cores.bold));
const erro = (texto: string) => console.log(colorir(`\n${emoji.erro} ${texto}`, cores.vermelho + cores.bold));
const info = (texto: string) => console.log(colorir(`${emoji.info} ${texto}`, cores.ciano));
const divisor = (cor = cores.ciano) => console.log(colorir('─'.repeat(70), cor));
const caixaOpcao = (numero: string, texto: string, icone: string) => console.log(`  ${colorir(numero, cores.amarelo + cores.bold)} ${icone}  ${texto}`);
const mostrarBanner = () => { console.log(`\n  ${cores.magenta}███████╗ ██████╗  █████╗ ███╗   ███╗${cores.reset}\n  ${cores.magenta}██╔════╝██╔════╝ ██╔══██╗████╗ ████║${cores.reset}\n  ${cores.ciano}███████╗██║  ███╗███████║██╔████╔██║${cores.reset}\n  ${cores.ciano}╚════██║██║   ██║██╔══██║██║╚██╔╝██║${cores.reset}\n  ${cores.azul}███████║╚██████╔╝██║  ██║██║ ╚═╝ ██║${cores.reset}\n  ${cores.azul}╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝${cores.reset}\n  `); console.log(colorir('    Sistema de Gerenciamento para Agências de Marketing v1.0.0', cores.dim)); };

// ===== FUNÇÕES AUXILIARES =====
// Exibe detalhes completos de um pedido
async function exibirDetalhesPedido(id: string) {
    try {
        const res = await api.get(`/pedidos/${id}`);
        const p = res.data.pedido;
        console.log('');
        divisor(cores.magenta);
        console.log(colorir(`ID: ${p.id}`, cores.amarelo));
        console.log(colorir(`Título: ${p.titulo}`, cores.branco + cores.bold));
        console.log(colorir(`Descrição: ${p.descricao}`, cores.dim));
        console.log(colorir(`Status: ${p.status} | Prioridade: ${p.prioridade}`, cores.amarelo));
        console.log(colorir(`Cliente: ${p.cliente_nome}`, cores.ciano));
        console.log(colorir(`Responsável: ${p.responsavel_nome || 'Aguardando'}`, cores.ciano));
        console.log(colorir(`Criado: ${new Date(p.created_at).toLocaleString('pt-BR')}`, cores.dim));
        divisor(cores.magenta);
        if (res.data.demandas && res.data.demandas.length > 0) {
            subtitulo('📝 DEMANDAS VINCULADAS');
            console.table(res.data.demandas.map((d: any) => ({ ID: d.id, Título: d.titulo, Status: d.status })));
        }
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
}

// ===== FUNÇÕES CLIENTE =====
// Cliente cria novo pedido (sem definir prioridade)
async function criarPedidoCliente() {
    limpar();
    titulo('➕ CRIAR NOVO PEDIDO', cores.verde);
    try {
        console.log('');
        const titulo_pedido = await pergunta(colorir(`${emoji.pedido} Título: `, cores.ciano));
        const descricao = await pergunta(colorir(`📝 Descrição: `, cores.ciano));
        const res = await api.post('/pedidos', { titulo: titulo_pedido, descricao });
        sucesso('Pedido criado!');
        console.log(colorir(`${emoji.pedido} ID: ${res.data.pedido.id} | Status: ${res.data.pedido.status}`, cores.verde));
        console.log(colorir('\n💡 A prioridade será definida pelo colaborador ao aceitar.', cores.ciano));
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
}

// Cliente visualiza seus pedidos em aberto (com detalhes expandidos)
async function verMeusPedidosAbertos() {
    while (true) {
        limpar();
        titulo('📂 MEUS PEDIDOS EM ABERTO', cores.azul);
        try {
            const res = await api.get('/pedidos?status=aberto,em_andamento');
            if (res.data.total === 0) {
                info('Você não tem pedidos em aberto.');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
                break;
            }
            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));

            // Exibe lista de pedidos
            res.data.pedidos.forEach((p: any, index: number) => {
                console.log(colorir(`\n${index + 1}. `, cores.amarelo + cores.bold) + colorir(`${p.titulo}`, cores.branco + cores.bold));
                divisor(cores.dim);
                console.log(colorir(`   ID: ${p.id} | Status: ${p.status === 'aberto' ? '⏳ AGUARDANDO' : '🔄 EM ANDAMENTO'}`, cores.ciano));
                console.log(colorir(`   Prioridade: ${p.prioridade.toUpperCase()} | Responsável: ${p.responsavel_nome || 'Aguardando aceite'}`, cores.dim));
                console.log(colorir(`   Descrição: ${p.descricao}`, cores.dim));
                console.log(colorir(`   Criado: ${new Date(p.created_at).toLocaleString('pt-BR')}`, cores.dim));
            });

            console.log('\n');
            divisor(cores.amarelo);
            caixaOpcao('0', 'Voltar', emoji.voltar);
            divisor();

            const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));
            if (op === '0') break;
            else {
                erro('Opção inválida!');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
        } catch (e: any) {
            erro(`Erro: ${e.response?.data?.erro || e.message}`);
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            break;
        }
    }
}

// Cliente visualiza seus pedidos finalizados (com detalhes expandidos)
async function verMeusPedidosFinalizados() {
    while (true) {
        limpar();
        titulo('✅ MEUS PEDIDOS FINALIZADOS', cores.verde);
        try {
            const res = await api.get('/pedidos?status=finalizado');
            if (res.data.total === 0) {
                info('Você não tem pedidos finalizados.');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
                break;
            }
            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));

            // Exibe lista de pedidos finalizados
            res.data.pedidos.forEach((p: any, index: number) => {
                console.log(colorir(`\n${index + 1}. `, cores.amarelo + cores.bold) + colorir(`${p.titulo}`, cores.branco + cores.bold));
                divisor(cores.dim);
                console.log(colorir(`   ID: ${p.id} | Status: 🎉 FINALIZADO`, cores.verde));
                console.log(colorir(`   Responsável: ${p.responsavel_nome}`, cores.ciano));
                console.log(colorir(`   Descrição: ${p.descricao}`, cores.dim));
                console.log(colorir(`   Finalizado: ${new Date(p.updated_at).toLocaleString('pt-BR')}`, cores.dim));
            });

            console.log('\n');
            divisor(cores.amarelo);
            caixaOpcao('0', 'Voltar', emoji.voltar);
            divisor();

            const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));
            if (op === '0') break;
            else {
                erro('Opção inválida!');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
        } catch (e: any) {
            erro(`Erro: ${e.response?.data?.erro || e.message}`);
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            break;
        }
    }
}

// Cliente visualiza e edita seu perfil
async function verEditarPerfilCliente() {
    while (true) {
        limpar();
        titulo('👤 MEU PERFIL', cores.ciano);
        try {
            const res = await api.get(`/usuarios/${user.id}`);
            const u = res.data.usuario;

            console.log('');
            divisor();
            console.log(colorir(`ID: ${u.id}`, cores.amarelo));
            console.log(colorir(`Nome: ${u.nome}`, cores.branco + cores.bold));
            console.log(colorir(`Email: ${u.email}`, cores.ciano));
            console.log(colorir(`Nível: ${u.nivel_acesso.toUpperCase()}`, cores.magenta));
            console.log(colorir(`Ativo: ${u.ativo ? 'Sim' : 'Não'}`, cores.verde));
            console.log(colorir(`Criado em: ${new Date(u.created_at).toLocaleString('pt-BR')}`, cores.dim));
            divisor();

            console.log('');
            caixaOpcao('1', 'Editar dados', emoji.editar);
            console.log('');
            divisor(cores.amarelo);
            caixaOpcao('0', 'Voltar', emoji.voltar);
            divisor();

            const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));

            if (op === '0') break;
            else if (op === '1') {
                limpar();
                titulo('✏️  EDITAR DADOS', cores.amarelo);

                subtitulo('📋 DADOS ATUAIS');
                console.log(colorir(`Nome: ${user.nome}`, cores.dim));
                console.log(colorir(`Email: ${user.email}`, cores.dim));

                info('\nDeixe em branco para manter o valor atual\n');

                const nome = await pergunta(colorir(`${emoji.usuario} Novo nome: `, cores.ciano));
                const email = await pergunta(colorir(`${emoji.email} Novo email: `, cores.ciano));
                const senha = await pergunta(colorir(`${emoji.senha} Nova senha: `, cores.ciano));

                const data: any = {};
                if (nome) data.nome = nome;
                if (email) data.email = email;
                if (senha) data.senha = senha;

                if (Object.keys(data).length === 0) {
                    info('Nenhuma alteração realizada.');
                } else {
                    await api.put(`/usuarios/${user.id}`, data);
                    if (nome) user.nome = nome;
                    if (email) user.email = email;
                    sucesso('Dados atualizados!');
                }
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
            else {
                erro('Opção inválida!');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
        } catch (e: any) {
            erro(`Erro: ${e.response?.data?.erro || e.message}`);
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            break;
        }
    }
}

// ===== FUNÇÕES ADMIN/COLABORADOR =====
// Exibe dashboard com estatísticas (admin vê mais info que colaborador)
async function verDashboard() {
    limpar();
    titulo('📊 DASHBOARD', cores.magenta);
    try {
        const res = await api.get('/dashboard');
        const d = res.data;

        console.log('');
        divisor();

        if (user.nivel_acesso === 'admin') {
            subtitulo('📈 ESTATÍSTICAS GERAIS');
            console.log(colorir(`Pedidos: Total ${d.estatisticas.total_pedidos} | Pendentes ${d.estatisticas.pedidos_pendentes} | Em Andamento ${d.estatisticas.pedidos_em_andamento} | Finalizados ${d.estatisticas.pedidos_finalizados}`, cores.ciano));
            console.log(colorir(`Recusados ${d.estatisticas.pedidos_recusados || 0} | Cancelados ${d.estatisticas.pedidos_cancelados || 0} | Atrasados ${d.estatisticas.pedidos_atrasados || 0}`, cores.vermelho));

            divisor();
            subtitulo('👥 USUÁRIOS');
            console.log(colorir(`Clientes: ${d.estatisticas.total_clientes} | Colaboradores: ${d.estatisticas.total_colaboradores}`, cores.magenta));
        } else {
            subtitulo('📈 MINHAS ESTATÍSTICAS');
            console.log(colorir(`Minhas Demandas: ${d.estatisticas.minhas_demandas} | Finalizados: ${d.estatisticas.pedidos_finalizados}`, cores.ciano));
            console.log(colorir(`Recusados: ${d.estatisticas.pedidos_recusados || 0} | Cancelados: ${d.estatisticas.pedidos_cancelados || 0} | Atrasados: ${d.estatisticas.pedidos_atrasados || 0}`, cores.vermelho));
        }

        divisor();

        const pedidos = user.nivel_acesso === 'admin' ? d.pedidos_recentes : d.meus_pedidos_recentes;
        if (pedidos && pedidos.length > 0) {
            subtitulo('📋 PEDIDOS RECENTES');
            console.table(pedidos.map((p: any) => ({ ID: p.id, Título: p.titulo, Status: p.status, Cliente: p.cliente_nome })));
        }
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
}

// Colaborador/Admin visualiza e aceita pedidos pendentes
async function verPedidosPendentes() {
    while (true) {
        limpar();
        titulo('📥 PEDIDOS PENDENTES', cores.amarelo);
        try {
            const res = await api.get('/pedidos?status=aberto');
            if (res.data.total === 0) {
                info('Nenhum pedido pendente.');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
                break;
            }

            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
            console.table(res.data.pedidos.map((p: any) => ({
                ID: p.id,
                Título: p.titulo,
                Cliente: p.cliente_nome,
                Prioridade: p.prioridade.toUpperCase(),
                Criado: new Date(p.created_at).toLocaleDateString('pt-BR')
            })));

            console.log('');
            divisor();
            caixaOpcao('1', 'Aceitar pedido', emoji.check);
            caixaOpcao('2', 'Ver detalhes', emoji.lupa);
            console.log('');
            divisor(cores.amarelo);
            caixaOpcao('0', 'Voltar', emoji.voltar);
            divisor();

            const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));

            if (op === '0') break;
            else if (op === '1') {
                const id = await pergunta(colorir(`\n🔢 ID do pedido: `, cores.ciano));
                await api.put(`/pedidos/${id}`, { status: 'em_andamento', responsavel_id: user.id });
                sucesso('Pedido aceito!');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            } else if (op === '2') {
                const id = await pergunta(colorir(`\n🔢 ID do pedido: `, cores.ciano));
                await exibirDetalhesPedido(id);
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
            else {
                erro('Opção inválida!');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
        } catch (e: any) {
            erro(`Erro: ${e.response?.data?.erro || e.message}`);
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        }
    }
}

// Colaborador visualiza e gerencia suas demandas ativas
async function verMinhasDemandas() {
    while (true) {
        limpar();
        titulo('✅ MINHAS DEMANDAS', cores.verde);
        try {
            const res = await api.get(`/pedidos?responsavel_id=${user.id}&status=em_andamento`);
            if (res.data.total === 0) {
                info('Você não tem demandas no momento.');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
                break;
            }

            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
            console.table(res.data.pedidos.map((p: any) => ({
                ID: p.id,
                Título: p.titulo,
                Cliente: p.cliente_nome,
                Prioridade: p.prioridade.toUpperCase()
            })));

            console.log('');
            divisor();
            caixaOpcao('1', 'Finalizar pedido', emoji.finalizado);
            caixaOpcao('2', 'Recusar pedido', emoji.erro);
            caixaOpcao('3', 'Ver detalhes', emoji.lupa);
            console.log('');
            divisor(cores.amarelo);
            caixaOpcao('0', 'Voltar', emoji.voltar);
            divisor();

            const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));

            if (op === '0') break;
            else if (op === '1') {
                const id = await pergunta(colorir(`\n🔢 ID do pedido: `, cores.ciano));
                const confirma = await pergunta(colorir(`\n⚠️  Confirmar finalização? (s/N): `, cores.verde + cores.bold));
                if (confirma.toLowerCase() === 's') {
                    await api.put(`/pedidos/${id}`, { status: 'finalizado' });
                    sucesso('Pedido finalizado!');
                }
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            } else if (op === '2') {
                const id = await pergunta(colorir(`\n🔢 ID do pedido: `, cores.ciano));
                const confirma = await pergunta(colorir(`\n⚠️  Confirmar recusa? (s/N): `, cores.vermelho + cores.bold));
                if (confirma.toLowerCase() === 's') {
                    await api.put(`/pedidos/${id}`, { status: 'aberto', responsavel_id: null });
                    sucesso('Pedido recusado!');
                }
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            } else if (op === '3') {
                const id = await pergunta(colorir(`\n🔢 ID do pedido: `, cores.ciano));
                await exibirDetalhesPedido(id);
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
            else {
                erro('Opção inválida!');
                await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            }
        } catch (e: any) {
            erro(`Erro: ${e.response?.data?.erro || e.message}`);
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        }
    }
}

// Admin visualiza lista de clientes
async function listarClientes() {
    limpar();
    titulo('👥 CLIENTES', cores.ciano);
    try {
        const res = await api.get('/dashboard/clientes');
        if (res.data.total === 0) {
            info('Nenhum cliente cadastrado.');
        } else {
            console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
            console.table(res.data.clientes.map((c: any) => ({
                ID: c.id,
                Nome: c.nome,
                Email: c.email,
                Pedidos: c.total_pedidos,
                Ativo: c.ativo ? '✅' : '❌'
            })));
        }
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
}

// ===== FUNÇÕES ADMIN - GERENCIAMENTO DE USUÁRIOS =====
// Lista todos os usuários do sistema
async function listarUsuarios() {
    limpar();
    titulo('👥 USUÁRIOS', cores.magenta);
    try {
        const res = await api.get('/usuarios');
        console.log(colorir(`\nTotal: ${res.data.total}\n`, cores.ciano));
        console.table(res.data.usuarios.map((u: any) => ({
            ID: u.id,
            Nome: u.nome,
            Email: u.email,
            Nível: u.nivel_acesso.toUpperCase(),
            Ativo: u.ativo ? '✅' : '❌'
        })));
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
}

// Admin cria novo usuário (admin ou colaborador)
async function criarUsuario() {
    limpar();
    titulo('➕ CRIAR USUÁRIO', cores.verde);
    try {
        console.log('');
        const nome = await pergunta(colorir(`${emoji.usuario} Nome: `, cores.ciano));
        const email = await pergunta(colorir(`${emoji.email} Email: `, cores.ciano));
        const senha = await pergunta(colorir(`${emoji.senha} Senha: `, cores.ciano));

        console.log(colorir('\nNível: 1. Admin | 2. Colaborador', cores.amarelo));
        const nivelOp = await pergunta(colorir('> ', cores.amarelo));

        const res = await api.post('/usuarios', {
            nome,
            email,
            senha,
            nivel_acesso: nivelOp === '1' ? 'admin' : 'colaborador'
        });

        sucesso('Usuário criado!');
        console.log(colorir(`ID: ${res.data.usuario.id}`, cores.verde));
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
}

// Admin atualiza dados de um usuário
async function atualizarUsuario() {
    limpar();
    titulo('✏️  ATUALIZAR USUÁRIO', cores.amarelo);
    try {
        const usuarios = await api.get('/usuarios');
        console.log(colorir(`\nTotal: ${usuarios.data.total}\n`, cores.ciano));
        console.table(usuarios.data.usuarios.map((u: any) => ({
            ID: u.id,
            Nome: u.nome,
            Email: u.email,
            Nível: u.nivel_acesso
        })));

        const id = await pergunta(colorir(`\n🔢 ID do usuário: `, cores.ciano));
        const usuarioAtual = usuarios.data.usuarios.find((u: any) => u.id === parseInt(id));

        if (!usuarioAtual) {
            erro('Usuário não encontrado!');
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
            return;
        }

        subtitulo('📋 DADOS ATUAIS');
        console.log(colorir(`Nome: ${usuarioAtual.nome} | Email: ${usuarioAtual.email} | Nível: ${usuarioAtual.nivel_acesso}`, cores.dim));

        info('\nDeixe em branco para manter o valor atual\n');

        const nome = await pergunta(colorir(`${emoji.usuario} Novo nome: `, cores.ciano));
        console.log(colorir('\nNível: 1. Admin | 2. Colaborador | 3. Cliente | 0. Manter', cores.amarelo));
        const nivelOp = await pergunta(colorir('> ', cores.amarelo));
        console.log(colorir('\nAtivo: 1. Sim | 2. Não | 0. Manter', cores.amarelo));
        const ativoOp = await pergunta(colorir('> ', cores.amarelo));

        const data: any = {};
        if (nome) data.nome = nome;
        if (nivelOp === '1') data.nivel_acesso = 'admin';
        else if (nivelOp === '2') data.nivel_acesso = 'colaborador';
        else if (nivelOp === '3') data.nivel_acesso = 'cliente';
        if (ativoOp === '1') data.ativo = true;
        else if (ativoOp === '2') data.ativo = false;

        if (Object.keys(data).length === 0) {
            info('Nenhuma alteração realizada.');
        } else {
            await api.put(`/usuarios/${id}`, data);
            sucesso('Usuário atualizado!');
        }
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
}

// Admin deleta um usuário (ação irreversível)
async function deletarUsuario() {
    limpar();
    titulo('🗑️  DELETAR USUÁRIO', cores.vermelho);
    console.log(colorir('\n⚠️  ATENÇÃO: Esta ação não pode ser desfeita!\n', cores.vermelho + cores.bold));
    try {
        const usuarios = await api.get('/usuarios');
        console.table(usuarios.data.usuarios.map((u: any) => ({
            ID: u.id,
            Nome: u.nome,
            Email: u.email,
            Nível: u.nivel_acesso
        })));

        const id = await pergunta(colorir(`\n🔢 ID do usuário: `, cores.ciano));
        const confirma = await pergunta(colorir(`\n⚠️  Confirmar exclusão? (s/N): `, cores.vermelho + cores.bold));

        if (confirma.toLowerCase() === 's') {
            await api.delete(`/usuarios/${id}`);
            sucesso('Usuário deletado!');
        } else {
            info('Operação cancelada.');
        }
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || e.message}`);
    }
    await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
}

// ===== MENUS PRINCIPAIS =====
// Menu principal do cliente
async function menuCliente() {
    while (true) {
        limpar();
        console.log(colorir(`\n  ${emoji.cliente} ${user.nome} | CLIENTE`, cores.ciano + cores.bold));
        console.log('');
        divisor();
        caixaOpcao('1', 'Meus Pedidos', emoji.pedido);
        caixaOpcao('2', 'Meu Perfil', emoji.usuario);
        console.log('');
        divisor(cores.vermelho);
        caixaOpcao('0', 'Sair', emoji.sair);
        divisor();

        const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));

        if (op === '0') {
            token = null;
            user = null;
            return start();
        }
        else if (op === '1') await submenuPedidosCliente();
        else if (op === '2') await verEditarPerfilCliente();
        else {
            erro('Opção inválida!');
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        }
    }
}

// Submenu de pedidos do cliente
async function submenuPedidosCliente() {
    while (true) {
        limpar();
        titulo('📋 MEUS PEDIDOS', cores.azul);
        console.log('');
        divisor();
        caixaOpcao('1', 'Criar novo pedido', emoji.adicionar);
        caixaOpcao('2', 'Ver pedidos em aberto', emoji.pendente);
        caixaOpcao('3', 'Ver pedidos finalizados', emoji.finalizado);
        console.log('');
        divisor(cores.amarelo);
        caixaOpcao('0', 'Voltar', emoji.voltar);
        divisor();

        const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));

        if (op === '0') break;
        else if (op === '1') await criarPedidoCliente();
        else if (op === '2') await verMeusPedidosAbertos();
        else if (op === '3') await verMeusPedidosFinalizados();
        else {
            erro('Opção inválida!');
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        }
    }
}

// Menu principal admin/colaborador
async function menuAdminColaborador() {
    while (true) {
        limpar();
        const icone = user.nivel_acesso === 'admin' ? emoji.admin : emoji.colaborador;
        const cor = user.nivel_acesso === 'admin' ? cores.magenta : cores.verde;

        console.log(colorir(`\n  ${icone} ${user.nome} | ${user.nivel_acesso.toUpperCase()}`, cor + cores.bold));
        console.log('');
        divisor();
        caixaOpcao('1', 'Dashboard', emoji.dashboard);
        caixaOpcao('2', 'Pedidos Pendentes', emoji.pedido);
        caixaOpcao('3', 'Minhas Demandas', emoji.demanda);

        if (user.nivel_acesso === 'admin') {
            caixaOpcao('4', 'Clientes', emoji.clientes);
            caixaOpcao('5', 'Usuários', emoji.config);
        }

        console.log('');
        divisor(cores.vermelho);
        caixaOpcao('0', 'Sair', emoji.sair);
        divisor();

        const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));

        if (op === '0') {
            token = null;
            user = null;
            return start();
        }
        else if (op === '1') await verDashboard();
        else if (op === '2') await verPedidosPendentes();
        else if (op === '3') await verMinhasDemandas();
        else if (op === '4' && user.nivel_acesso === 'admin') await listarClientes();
        else if (op === '5' && user.nivel_acesso === 'admin') await submenuAdministracao();
        else {
            erro('Opção inválida!');
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        }
    }
}

// Submenu de administração (apenas admin)
async function submenuAdministracao() {
    while (true) {
        limpar();
        titulo('⚙️  ADMINISTRAÇÃO', cores.magenta);
        console.log('');
        divisor();
        caixaOpcao('1', 'Listar usuários', emoji.usuario);
        caixaOpcao('2', 'Criar usuário', emoji.adicionar);
        caixaOpcao('3', 'Atualizar usuário', emoji.editar);
        caixaOpcao('4', 'Deletar usuário', emoji.deletar);
        console.log('');
        divisor(cores.amarelo);
        caixaOpcao('0', 'Voltar', emoji.voltar);
        divisor();

        const op = await pergunta(colorir('\nOpção: ', cores.amarelo + cores.bold));

        if (op === '0') break;
        else if (op === '1') await listarUsuarios();
        else if (op === '2') await criarUsuario();
        else if (op === '3') await atualizarUsuario();
        else if (op === '4') await deletarUsuario();
        else {
            erro('Opção inválida!');
            await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        }
    }
}

// ===== AUTENTICAÇÃO =====
// Tela inicial de login/cadastro
async function start() {
    limpar();
    mostrarBanner();
    console.log('');
    divisor();
    caixaOpcao('1', 'Login', '🔐');
    caixaOpcao('2', 'Cadastro', '✍️');
    caixaOpcao('0', 'Sair', emoji.sair);
    divisor();

    const op = await pergunta(colorir('\n> ', cores.amarelo + cores.bold));

    if (op === '0') {
        console.log(colorir('\n👋 Até logo!\n', cores.ciano));
        process.exit(0);
    }

    if (op !== '1' && op !== '2') {
        erro('Opção inválida!');
        await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        return start();
    }

    console.log('');
    const email = await pergunta(colorir(`${emoji.email} Email: `, cores.ciano));
    const senha = await pergunta(colorir(`${emoji.senha} Senha: `, cores.ciano));

    try {
        if (op === '2') {
            const nome = await pergunta(colorir(`${emoji.usuario} Nome: `, cores.ciano));
            const res = await api.post('/auth/registrar', { nome, email, senha });
            token = res.data.token;
            user = res.data.usuario;
            sucesso('Cadastro realizado como cliente!');
        }
        else if (op === '1') {
            const res = await api.post('/auth/login', { email, senha });
            token = res.data.token;
            user = res.data.usuario;
            sucesso('Login realizado!');
        }

        await pergunta(colorir(`\n${emoji.voltar} Pressione Enter para acessar...`, cores.verde));
        user.nivel_acesso === 'cliente' ? menuCliente() : menuAdminColaborador();
    } catch (e: any) {
        erro(`Erro: ${e.response?.data?.erro || 'Servidor offline'}`);
        await pergunta(colorir(`\n${emoji.voltar} Pressione Enter...`, cores.dim));
        start();
    }
}

start();
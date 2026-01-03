import { db } from '../database';
import bcrypt from 'bcrypt';

export const UsuarioService = {
    async listar() {
        return await db('usuarios')
            .select('id', 'nome', 'email', 'nivel_acesso', 'ativo', 'ultimo_login', 'created_at', 'updated_at')
            .orderBy('created_at', 'desc');
    },

    async obter(id: number) {
        const usuario = await db('usuarios')
            .select('id', 'nome', 'email', 'nivel_acesso', 'ativo', 'ultimo_login', 'created_at', 'updated_at')
            .where({ id })
            .first();

        if (!usuario) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        return usuario;
    },

    async criar(nome: string, email: string, senha: string, nivel_acesso: string) {
        const niveisValidos = ['admin', 'colaborador', 'cliente'];
        if (!niveisValidos.includes(nivel_acesso)) {
            throw new Error('NIVEL_INVALIDO');
        }

        const emailExiste = await db('usuarios').where({ email }).first();
        if (emailExiste) {
            throw new Error('EMAIL_JA_CADASTRADO');
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const [id] = await db('usuarios').insert({
            nome,
            email,
            senha: senhaHash,
            nivel_acesso,
            ativo: true
        });

        return await this.obter(id);
    },

    async atualizar(id: number, dados: any, usuarioLogadoId: number, usuarioLogadoNivel: string) {
        const usuarioExistente = await db('usuarios').where({ id }).first();

        if (!usuarioExistente) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        // Verifica permissões
        const podeAtualizar = usuarioLogadoNivel === 'admin' || id === usuarioLogadoId;
        if (!podeAtualizar) {
            throw new Error('SEM_PERMISSAO');
        }

        // Não pode alterar próprio nível
        if (id === usuarioLogadoId && dados.nivel_acesso !== undefined) {
            throw new Error('NAO_PODE_ALTERAR_PROPRIO_NIVEL');
        }

        // Não pode desativar a si mesmo
        if (id === usuarioLogadoId && dados.ativo === false) {
            throw new Error('NAO_PODE_DESATIVAR_SI_MESMO');
        }

        const updateData: any = { updated_at: db.fn.now() };

        if (dados.nome) updateData.nome = dados.nome;

        if (dados.email) {
            const emailEmUso = await db('usuarios')
                .where({ email: dados.email })
                .whereNot({ id })
                .first();

            if (emailEmUso) {
                throw new Error('EMAIL_JA_CADASTRADO');
            }

            updateData.email = dados.email;
        }

        if (dados.senha) {
            updateData.senha = await bcrypt.hash(dados.senha, 10);
        }

        // Apenas admin altera nível e status
        if (usuarioLogadoNivel === 'admin') {
            if (dados.nivel_acesso) {
                const niveisValidos = ['admin', 'colaborador', 'cliente'];
                if (!niveisValidos.includes(dados.nivel_acesso)) {
                    throw new Error('NIVEL_INVALIDO');
                }
                updateData.nivel_acesso = dados.nivel_acesso;
            }

            if (dados.ativo !== undefined) {
                updateData.ativo = dados.ativo;
            }
        } else {
            // Usuário comum tentando alterar nível/status
            if (dados.nivel_acesso !== undefined || dados.ativo !== undefined) {
                throw new Error('APENAS_ADMIN_ALTERA_NIVEL_STATUS');
            }
        }

        await db('usuarios').where({ id }).update(updateData);

        return await this.obter(id);
    },

    async deletar(id: number, usuarioLogadoId: number) {
        const usuario = await db('usuarios').where({ id }).first();

        if (!usuario) {
            throw new Error('USUARIO_NAO_ENCONTRADO');
        }

        // Não deleta a si mesmo
        if (id === usuarioLogadoId) {
            throw new Error('NAO_PODE_DELETAR_SI_MESMO');
        }

        // Não deleta se tiver pedidos vinculados
        const temPedidos = await db('pedidos')
            .where('cliente_id', id)
            .orWhere('responsavel_id', id)
            .first();

        if (temPedidos) {
            throw new Error('USUARIO_COM_PEDIDOS_VINCULADOS');
        }

        await db('usuarios').where({ id }).del();

        return usuario.nome;
    }
};
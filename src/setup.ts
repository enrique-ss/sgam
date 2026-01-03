import knex from 'knex';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const dbName = process.env.DB_NAME || 'sgam';

async function setupDatabase() {
    const connection = knex({
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        }
    });

    try {
        console.log('🚀 Iniciando setup do banco de dados...\n');

        await connection.raw(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Banco "${dbName}" criado/verificado!`);
        await connection.destroy();

        const db = knex({
            client: 'mysql2',
            connection: {
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: dbName
            }
        });

        console.log('\n📋 Criando tabelas...\n');

        // Deletar na ordem correta
        if (await db.schema.hasTable('demandas')) {
            await db.schema.dropTable('demandas');
            console.log('🗑️  Tabela demandas removida');
        }

        if (await db.schema.hasTable('pedidos')) {
            await db.schema.dropTable('pedidos');
            console.log('🗑️  Tabela pedidos removida');
        }

        if (await db.schema.hasTable('usuarios')) {
            await db.schema.dropTable('usuarios');
            console.log('🗑️  Tabela usuarios removida');
        }

        console.log('');

        // 1. Tabela de Usuários
        await db.schema.createTable('usuarios', (table) => {
            table.increments('id').primary();
            table.string('nome', 255).notNullable();
            table.string('email', 255).notNullable().unique();
            table.string('senha', 255).notNullable();
            table.enum('nivel_acesso', ['admin', 'colaborador', 'cliente']).defaultTo('cliente');
            table.boolean('ativo').defaultTo(true);
            table.timestamp('ultimo_login').nullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
            table.timestamp('updated_at').defaultTo(db.fn.now());
        });
        console.log('✅ Tabela usuarios criada');

        // 2. Tabela de Pedidos
        await db.schema.createTable('pedidos', (table) => {
            table.increments('id').primary();
            table.integer('cliente_id').unsigned().notNullable();
            table.string('titulo', 255).notNullable();
            table.string('tipo_servico', 100).nullable();
            table.text('descricao');
            table.decimal('orcamento', 10, 2).nullable();
            table.date('prazo_entrega').nullable();
            table.enum('status', ['pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado']).defaultTo('pendente');
            table.enum('prioridade', ['baixa', 'media', 'alta', 'urgente']).nullable();
            table.integer('responsavel_id').unsigned().nullable();
            table.timestamp('data_conclusao').nullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.foreign('cliente_id').references('usuarios.id').onDelete('CASCADE');
            table.foreign('responsavel_id').references('usuarios.id').onDelete('SET NULL');
        });
        console.log('✅ Tabela pedidos criada');

        // 3. Tabela de Demandas
        await db.schema.createTable('demandas', (table) => {
            table.increments('id').primary();
            table.integer('pedido_id').unsigned().notNullable();
            table.string('titulo', 255).notNullable();
            table.text('descricao');
            table.integer('responsavel_id').unsigned().nullable();
            table.enum('status', ['aberta', 'em_progresso', 'concluida']).defaultTo('aberta');
            table.timestamp('created_at').defaultTo(db.fn.now());
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.foreign('pedido_id').references('pedidos.id').onDelete('CASCADE');
            table.foreign('responsavel_id').references('usuarios.id').onDelete('SET NULL');
        });
        console.log('✅ Tabela demandas criada');

        // Criar admin padrão
        console.log('\n👤 Criando admin padrão...');
        const senhaHash = await bcrypt.hash('Admin@123', 10);
        await db('usuarios').insert({
            nome: 'Administrador',
            email: 'admin@sgam.com',
            senha: senhaHash,
            nivel_acesso: 'admin'
        });
        console.log('✅ Admin criado: admin@sgam.com / Admin@123');

        console.log('\n🎉 Setup concluído!\n');

        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

setupDatabase();
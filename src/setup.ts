import { setupDatabase } from './database';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setup() {
  try {
    console.log('🔧 Configurando banco de dados...\n');

    // Criar banco e tabelas
    await setupDatabase();

    // Conectar ao banco
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sgam'
    });

    // Criar usuário admin padrão
    console.log('\n👤 Criando usuário administrador padrão...');
    
    const senhaAdmin = await bcrypt.hash('admin123', 10);
    
    await connection.query(
      `INSERT INTO usuarios (nome, email, senha, nivel_acesso, ativo) 
       VALUES ('Administrador', 'admin@sgam.com', ?, 'admin', true)
       ON DUPLICATE KEY UPDATE id=id`,
      [senhaAdmin]
    );

    console.log('✅ Usuário admin criado:');
    console.log('   Email: admin@sgam.com');
    console.log('   Senha: admin123\n');

    // Criar alguns usuários de exemplo
    console.log('👥 Criando usuários de exemplo...\n');

    const senhaColaborador = await bcrypt.hash('senha123', 10);
    const senhaCliente = await bcrypt.hash('senha123', 10);

    // Colaborador
    await connection.query(
      `INSERT INTO usuarios (nome, email, senha, nivel_acesso, ativo) 
       VALUES ('Maria Silva', 'maria@sgam.com', ?, 'colaborador', true)
       ON DUPLICATE KEY UPDATE id=id`,
      [senhaColaborador]
    );

    await connection.query(
      `INSERT INTO usuarios (nome, email, senha, nivel_acesso, ativo) 
       VALUES ('João Costa', 'joao@sgam.com', ?, 'colaborador', true)
       ON DUPLICATE KEY UPDATE id=id`,
      [senhaColaborador]
    );

    // Clientes
    await connection.query(
      `INSERT INTO usuarios (nome, email, senha, nivel_acesso, ativo) 
       VALUES ('Pedro Santos', 'pedro@cliente.com', ?, 'cliente', true)
       ON DUPLICATE KEY UPDATE id=id`,
      [senhaCliente]
    );

    await connection.query(
      `INSERT INTO usuarios (nome, email, senha, nivel_acesso, ativo) 
       VALUES ('Ana Oliveira', 'ana@cliente.com', ?, 'cliente', true)
       ON DUPLICATE KEY UPDATE id=id`,
      [senhaCliente]
    );

    console.log('✅ Usuários de exemplo criados:');
    console.log('   Colaboradores: maria@sgam.com, joao@sgam.com');
    console.log('   Clientes: pedro@cliente.com, ana@cliente.com');
    console.log('   Senha para todos: senha123\n');

    // Criar alguns pedidos de exemplo
    console.log('📋 Criando pedidos de exemplo...\n');

    // Pedido pendente
    await connection.query(
      `INSERT INTO pedidos 
       (cliente_id, titulo, tipo_servico, descricao, orcamento, prazo_entrega, status) 
       VALUES (4, 'Logo para Pet Shop', 'Design', 'Criar uma logo moderna para pet shop', 1500.00, '2026-02-15', 'pendente')
       ON DUPLICATE KEY UPDATE id=id`
    );

    // Pedido em andamento
    await connection.query(
      `INSERT INTO pedidos 
       (cliente_id, responsavel_id, titulo, tipo_servico, descricao, orcamento, prazo_entrega, status, prioridade) 
       VALUES (4, 2, 'Site Institucional', 'Desenvolvimento Web', 'Desenvolver site institucional responsivo', 5000.00, '2026-02-20', 'em_andamento', 'alta')
       ON DUPLICATE KEY UPDATE id=id`
    );

    // Pedido entregue
    await connection.query(
      `INSERT INTO pedidos 
       (cliente_id, responsavel_id, titulo, tipo_servico, descricao, orcamento, prazo_entrega, status, prioridade, data_conclusao) 
       VALUES (5, 2, 'Campanha Social Media', 'Social Media', 'Criar campanha para redes sociais', 2000.00, '2026-01-10', 'entregue', 'media', '2026-01-09 14:30:00')
       ON DUPLICATE KEY UPDATE id=id`
    );

    console.log('✅ Pedidos de exemplo criados\n');

    await connection.end();

    console.log('🎉 Configuração concluída com sucesso!');
    console.log('🚀 Execute "npm run dev" para iniciar o servidor\n');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

setup();
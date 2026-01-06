import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sgam',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    // Criar banco se não existir
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'sgam'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'sgam'}`);

    // Criar tabela USUARIOS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nivel_acesso ENUM('admin', 'colaborador', 'cliente') DEFAULT 'cliente',
        ativo BOOLEAN DEFAULT true,
        ultimo_login TIMESTAMP NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela PEDIDOS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        cliente_id INT NOT NULL,
        responsavel_id INT NULL,
        titulo VARCHAR(255) NOT NULL,
        tipo_servico VARCHAR(100) NOT NULL,
        descricao TEXT NOT NULL,
        orcamento DECIMAL(10,2) NOT NULL,
        prazo_entrega DATE NOT NULL,
        status ENUM('pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado') DEFAULT 'pendente',
        prioridade ENUM('baixa', 'media', 'alta', 'urgente') NULL,
        data_conclusao TIMESTAMP NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

export default pool;
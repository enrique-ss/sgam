CREATE DATABASE rsti_final;
USE rsti_final;

-- Usuários do sistema (admin, colaboradores e clientes)
CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(100) NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, 
    nivel_acesso ENUM('admin', 'colaborador', 'cliente') NOT NULL DEFAULT 'cliente',
    status ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- Tipos de serviço
CREATE TABLE tipo_servico (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE 
);

-- Demandas/Projetos
CREATE TABLE demandas (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL, 
    tipo_servico_id INT NOT NULL,
    descricao TEXT NOT NULL,
    cliente_id INT NOT NULL,
    orcamento DECIMAL(10,2) NOT NULL,
    prazo_entrega DATE NOT NULL,
    data_conclusao DATE NULL,
    status_servico ENUM('EM ANDAMENTO', 'ATRASADO', 'CONCLUÍDO', 'CANCELADO') NOT NULL DEFAULT 'EM ANDAMENTO',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tipo_servico_id) REFERENCES tipo_servico(id),
    FOREIGN KEY (cliente_id) REFERENCES usuario(id)
);
CREATE DATABASE rsti_final;
USE rsti_final;


CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(100) NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE, 
    senha_hash VARCHAR(255) NOT NULL, 
    telefone VARCHAR(20) UNIQUE, 
    nivel_acesso ENUM('admin', 'colaborador', 'cliente') NOT NULL DEFAULT 'cliente' 
); 


CREATE TABLE tipo_servico (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE 
);

CREATE TABLE demandas (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT NOT NULL,
    tipo_servico_id INT NOT NULL,
    cliente_id INT NOT NULL,
    orcamento DECIMAL(8,2) NOT NULL,
    data_solicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prazo DATE NOT NULL,
    prioridade VARCHAR(20) NOT NULL, 
    status_servico ENUM('Em andamento', 'Em revisão', 'Finalizado') NOT NULL DEFAULT 'Em andamento', 
    
    FOREIGN KEY (tipo_servico_id) REFERENCES tipo_servico(id),
    FOREIGN KEY (cliente_id) REFERENCES usuario(id)
);


CREATE TABLE relatorio(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    demanda_id INT NOT NULL UNIQUE,            
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    conteudo TEXT,
    usuario_responsavel_id INT,

    FOREIGN KEY (demanda_id) REFERENCES demandas(id),
    FOREIGN KEY (usuario_responsavel_id) REFERENCES usuario(id)
);

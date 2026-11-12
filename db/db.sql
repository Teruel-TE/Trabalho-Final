DROP DATABASE IF EXISTS chemlab_projeto;


CREATE DATABASE chemlab_projeto
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;


USE chemlab_projeto;


-- 1. Tabela CLIENTE_USUARIO
CREATE TABLE cliente_usuario (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    instituicao_laboratorio VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- 2. Tabela CATEGORIA (Nova tabela solicitada pelo professor)
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);


-- 3. Tabela PRODUTO (Agora ligada à CATEGORIA via id_categoria)
CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    volume_capacidade VARCHAR(50),
    material_pureza VARCHAR(100),
    formula_quimica VARCHAR(50),
    grau_risco VARCHAR(50),
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);


-- 4. Tabela CARRINHO
CREATE TABLE carrinho (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'ativo',
    CONSTRAINT fk_carrinho_cliente FOREIGN KEY (id_cliente) REFERENCES cliente_usuario(id_cliente)
);


-- 5. Tabela ITEM_CARRINHO
CREATE TABLE item_carrinho (
    id_item_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_carrinho INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_item_carrinho_carrinho FOREIGN KEY (id_carrinho) REFERENCES carrinho(id_carrinho) ON DELETE CASCADE,
    CONSTRAINT fk_item_carrinho_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);


-- 6. Tabela COMPRA_VENDA
CREATE TABLE compra_venda (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10, 2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'concluida',
    CONSTRAINT fk_compra_cliente FOREIGN KEY (id_cliente) REFERENCES cliente_usuario(id_cliente)
);


-- 7. Tabela ITEM_COMPRA
CREATE TABLE item_compra (
    id_item_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_item_compra_compra FOREIGN KEY (id_compra) REFERENCES compra_venda(id_compra) ON DELETE CASCADE,
    CONSTRAINT fk_item_compra_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);


-- 8. Tabela NOTA_FISCAL
CREATE TABLE nota_fiscal (
    id_nota_fiscal INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    numero_nota VARCHAR(50) NOT NULL UNIQUE,
    data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10, 2) NOT NULL,
    chave_acesso VARCHAR(60) NOT NULL UNIQUE,
    CONSTRAINT fk_nf_compra FOREIGN KEY (id_compra) REFERENCES compra_venda(id_compra),
    CONSTRAINT fk_nf_cliente FOREIGN KEY (id_cliente) REFERENCES cliente_usuario(id_cliente)
);
CREATE DATABASE IF NOT EXISTS projeto_integrador;
USE projeto_integrador;

-- 1. Tabela CLIENTE
CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_nascimento_fundacao DATE
);

-- 2. Tabela CADASTRO (Relacionamento 1:1 com cliente)
CREATE TABLE cadastro (
    id_cadastro INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT UNIQUE NOT NULL,
    cep VARCHAR(10) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(50),
    cidade VARCHAR(50) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE
);

-- 3. Tabela LOGIN (Relacionamento 1:1 com cliente)
CREATE TABLE login (
    id_login INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(80) NOT NULL,
    ultimo_acesso DATETIME,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE
);

-- 4. Tabela CONSULTA (Relacionamento 1:N com cliente)
CREATE TABLE consulta (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
    consumo_kwh_mes DECIMAL(10,2) NOT NULL,
    tipo_telhado VARCHAR(50),
    descricao_necessidade TEXT,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- 5. Tabela CARRINHO_DE_COMPRA (Relacionamento 1:N com cliente)
CREATE TABLE carrinho_de_compra (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- 6. Tabela VENDA (Relacionamento 1:1 com carrinho_de_compra e N:1 com cliente)
CREATE TABLE venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_carrinho INT UNIQUE NOT NULL,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    status_pagamento VARCHAR(30) DEFAULT 'Pendente',
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_carrinho) REFERENCES carrinho_de_compra(id_carrinho)
);

-- 7. Tabela NOTA_FISCAL (Relacionamento 1:1 com venda)
CREATE TABLE nota_fiscal (
    id_nota_fiscal INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT UNIQUE NOT NULL,
    data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_nota DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venda) REFERENCES venda(id_venda)
);

-- 8. Tabela COMPRA (Armazena aquisições de estoque de kits/componentes solares junto a fornecedores)
CREATE TABLE compra (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    fornecedor VARCHAR(100) NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor_total_compra DECIMAL(10,2) NOT NULL
);

-- Itens persistidos de cada carrinho antes da finalização da venda
CREATE TABLE carrinho_has_compra (
    id_carrinho INT NOT NULL,
    id_compra INT NOT NULL,
    qtd_item INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_carrinho, id_compra),
    FOREIGN KEY (id_carrinho)
        REFERENCES carrinho_de_compra(id_carrinho)
        ON DELETE CASCADE,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
);

-- TABELA ASSOCIATIVA (N:N entre VENDA e COMPRA)
CREATE TABLE venda_has_compra (
    id_venda INT NOT NULL,
    id_compra INT NOT NULL,
    qtd_item INT DEFAULT 1,
    PRIMARY KEY (id_venda, id_compra),
    FOREIGN KEY (id_venda) REFERENCES venda(id_venda),
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
);
USE projeto_integrador;

SELECT 
    c.id_cliente,
    c.nome AS nome_cliente,
    c.cpf_cnpj,
    car.id_carrinho,
    car.status_carrinho,
    v.id_venda,
    v.data_venda,
    v.forma_pagamento,
    v.valor_total AS valor_venda,
    nf.numero_nf,
    nf.chave_acesso_nfe,
    nf.data_emissao AS data_emissao_nf,
    nf.valor_nota
FROM cliente c
INNER JOIN carrinho_de_compra car ON c.id_cliente = car.id_cliente
INNER JOIN venda v ON car.id_carrinho = v.id_carrinho AND c.id_cliente = v.id_cliente
INNER JOIN nota_fiscal nf ON v.id_venda = nf.id_venda
ORDER BY v.data_venda DESC;
USE projeto_integrador;

SELECT 
    c.id_cliente,
    c.nome AS nome_cliente,
    c.tipo_cliente,
    COUNT(DISTINCT v.id_venda) AS total_vendas_realizadas,
    COUNT(DISTINCT nf.id_nota_fiscal) AS total_notas_emitidas,
    SUM(v.valor_total) AS faturamento_total_cliente
FROM cliente c
INNER JOIN carrinho_de_compra car ON c.id_cliente = car.id_cliente
INNER JOIN venda v ON car.id_carrinho = v.id_carrinho
INNER JOIN nota_fiscal nf ON v.id_venda = nf.id_venda
WHERE v.status_pagamento = 'Aprovado' -- Filtra apenas vendas finalizadas/aprovadas
GROUP BY 
    c.id_cliente, 
    c.nome, 
    c.tipo_cliente
ORDER BY faturamento_total_cliente DESC;
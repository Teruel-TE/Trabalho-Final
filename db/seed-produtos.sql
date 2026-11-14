USE chemlab_projeto;

INSERT INTO categoria (nome, descricao)
VALUES
    ('Vidraria', 'Vidrarias para uso em laboratórios.'),
    ('Amostragem', 'Materiais para coleta e análise de amostras.'),
    ('Kit de Laboratório', 'Conjuntos de materiais para atividades laboratoriais.')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO produto (
    id_categoria,
    nome,
    descricao,
    volume_capacidade,
    material_pureza,
    preco,
    estoque
)
SELECT
    categoria.id_categoria,
    produto.nome,
    produto.descricao,
    produto.volume_capacidade,
    produto.material_pureza,
    produto.preco,
    produto.estoque
FROM (
    SELECT
        'Vidraria' AS categoria,
        'Bequer de Vidro Borossilicato 250 mL' AS nome,
        'Bequer de alta resistência para aquecimento, mistura e preparo de soluções.' AS descricao,
        '250 mL' AS volume_capacidade,
        'Vidro borossilicato' AS material_pureza,
        39.90 AS preco,
        62 AS estoque
    UNION ALL
    SELECT
        'Vidraria',
        'Frasco Erlenmeyer 500 mL',
        'Frasco cônico para titulações, aquecimento e mistura controlada.',
        '500 mL',
        'Vidro borossilicato',
        52.40,
        59
    UNION ALL
    SELECT
        'Amostragem',
        'Tiras de pH Universais',
        'Tiras para aferição rápida de pH em soluções aquosas.',
        NULL,
        'Papel indicador',
        18.75,
        75
    UNION ALL
    SELECT
        'Kit de Laboratório',
        'Kit de Vidraria Básica',
        'Conjunto de vidrarias para aulas práticas e laboratórios de química.',
        NULL,
        'Composição variada',
        189.00,
        54
) AS produto
INNER JOIN categoria ON categoria.nome = produto.categoria
WHERE NOT EXISTS (
    SELECT 1
    FROM produto AS produto_existente
    WHERE produto_existente.nome = produto.nome
);

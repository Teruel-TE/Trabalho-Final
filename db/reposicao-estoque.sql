USE chemlab_projeto;

START TRANSACTION;

UPDATE produto AS p
JOIN (
    SELECT 'Bequer de Vidro Borossilicato 250 mL' AS nome, 50 AS quantidade
    UNION ALL
    SELECT 'Frasco Erlenmeyer 500 mL', 75
    UNION ALL
    SELECT 'Tiras de pH Universais', 40
    UNION ALL
    SELECT 'Kit de Vidraria Básica', 43
) AS reposicao ON reposicao.nome = p.nome
SET p.estoque = p.estoque + reposicao.quantidade;

SELECT nome, estoque
FROM produto
WHERE nome IN (
    'Bequer de Vidro Borossilicato 250 mL',
    'Frasco Erlenmeyer 500 mL',
    'Tiras de pH Universais',
    'Kit de Vidraria Básica'
);

COMMIT;

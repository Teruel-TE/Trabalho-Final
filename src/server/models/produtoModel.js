import pool from "../db.js";

export async function listarProdutos() {
  const [rows] = await pool.execute(
    `SELECT p.id_produto, p.id_categoria, p.nome, p.descricao,
            p.volume_capacidade, p.material_pureza, p.formula_quimica,
            p.grau_risco, p.preco, p.estoque,
            c.nome AS categoria
     FROM produto p
     INNER JOIN categoria c ON c.id_categoria = p.id_categoria
     ORDER BY c.nome, p.nome`,
  );
  return rows;
}

import pool from "../db.js";

export async function listarProdutos() {
  const [rows] = await pool.execute(
    `SELECT id_compra, fornecedor, data_compra, valor_total_compra
     FROM compra
     ORDER BY data_compra DESC, id_compra DESC`,
  );
  return rows;
}

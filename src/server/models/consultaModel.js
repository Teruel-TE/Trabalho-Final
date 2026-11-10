import pool from "../db.js";

export async function criar({
  id_cliente,
  consumo_kwh_mes,
  tipo_telhado,
  descricao_necessidade,
}) {
  const [clients] = await pool.execute(
    "SELECT id_cliente FROM cliente WHERE id_cliente = ?",
    [id_cliente],
  );
  if (clients.length === 0) {
    const error = new Error("Cliente não encontrado.");
    error.status = 404;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO consulta
       (id_cliente, consumo_kwh_mes, tipo_telhado, descricao_necessidade)
     VALUES (?, ?, ?, ?)`,
    [
      id_cliente,
      consumo_kwh_mes,
      tipo_telhado || null,
      descricao_necessidade || null,
    ],
  );
  return result.insertId;
}

export async function listarPorCliente(idCliente) {
  const [rows] = await pool.execute(
    `SELECT id_consulta, id_cliente, data_consulta, consumo_kwh_mes,
            tipo_telhado, descricao_necessidade
     FROM consulta
     WHERE id_cliente = ?
     ORDER BY data_consulta DESC, id_consulta DESC`,
    [idCliente],
  );
  return rows;
}

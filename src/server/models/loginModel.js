import pool from "../db.js";

export async function autenticar(email, senha) {
  const [rows] = await pool.execute(
    `SELECT l.id_login, l.id_cliente, l.email, l.senha, c.nome
     FROM login l
     INNER JOIN cliente c ON c.id_cliente = l.id_cliente
     WHERE l.email = ?
     LIMIT 1`,
    [email],
  );
  const login = rows[0];

  if (!login || login.senha !== senha) return null;

  await pool.execute(
    "UPDATE login SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id_login = ?",
    [login.id_login],
  );
  delete login.senha;
  return login;
}

export async function excluir(idLogin) {
  const [result] = await pool.execute(
    "DELETE FROM login WHERE id_login = ?",
    [idLogin],
  );
  return result.affectedRows > 0;
}

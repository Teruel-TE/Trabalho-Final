import pool from "../db.js";
import { gerarHashSenha, verificarSenha } from "../utils/senha.js";

export async function criar(dados) {
  const senhaHash = await gerarHashSenha(dados.senha);
  try {
    const [result] = await pool.execute(
      `INSERT INTO cliente_usuario
         (nome, cnpj_cpf, instituicao_laboratorio, email, senha_hash, telefone, endereco)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.cnpj_cpf,
        dados.instituicao_laboratorio,
        dados.email,
        senhaHash,
        dados.telefone,
        dados.endereco,
      ],
    );
    return result.insertId;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const conflict = new Error("E-mail ou CPF/CNPJ já cadastrado.");
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  }
}

export async function autenticar(email, senha) {
  const [rows] = await pool.execute(
    `SELECT id_cliente, nome, email, senha_hash
     FROM cliente_usuario
     WHERE email = ?
     LIMIT 1`,
    [email],
  );
  const usuario = rows[0];
  if (!usuario || !(await verificarSenha(senha, usuario.senha_hash))) return null;

  delete usuario.senha_hash;
  return usuario;
}

export async function buscarPorId(idCliente) {
  const [rows] = await pool.execute(
    `SELECT id_cliente, nome, cnpj_cpf, instituicao_laboratorio, email,
            telefone, endereco, data_cadastro
     FROM cliente_usuario
     WHERE id_cliente = ?
     LIMIT 1`,
    [idCliente],
  );
  return rows[0] ?? null;
}

export async function atualizar(idCliente, dados) {
  const parametros = [
    dados.nome,
    dados.cnpj_cpf,
    dados.instituicao_laboratorio,
    dados.email,
    dados.telefone,
    dados.endereco,
  ];
  let sql = `UPDATE cliente_usuario
             SET nome = ?, cnpj_cpf = ?, instituicao_laboratorio = ?,
                 email = ?, telefone = ?, endereco = ?`;

  if (dados.senha) {
    sql += ", senha_hash = ?";
    parametros.push(await gerarHashSenha(dados.senha));
  }

  sql += " WHERE id_cliente = ?";
  parametros.push(idCliente);

  try {
    const [result] = await pool.execute(sql, parametros);
    return result.affectedRows > 0;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const conflict = new Error("E-mail ou CPF/CNPJ já cadastrado.");
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  }
}

export async function excluir(idCliente) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "DELETE FROM carrinho WHERE id_cliente = ?",
      [idCliente],
    );
    const [result] = await connection.execute(
      "DELETE FROM cliente_usuario WHERE id_cliente = ?",
      [idCliente],
    );
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      const conflict = new Error(
        "Não é possível excluir uma conta com compras registradas.",
      );
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  } finally {
    connection.release();
  }
}

import pool from "../db.js";
import { randomBytes } from "node:crypto";

export async function criar(connection, dados) {
  const numeroNota = `CL-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const chaveAcesso = randomBytes(30).toString("hex");
  const [result] = await connection.execute(
    `INSERT INTO nota_fiscal
       (id_compra, id_cliente, numero_nota, valor_total, chave_acesso)
     VALUES (?, ?, ?, ?, ?)`,
    [
      dados.idCompra,
      dados.idCliente,
      numeroNota,
      dados.valorTotal,
      chaveAcesso,
    ],
  );
  return {
    idNotaFiscal: result.insertId,
    numeroNota,
    chaveAcesso,
  };
}

export async function listarPorCliente(idCliente) {
  const [rows] = await pool.execute(
    `SELECT nf.id_nota_fiscal, nf.id_compra, nf.numero_nota,
            nf.data_emissao, nf.valor_total, nf.chave_acesso,
            cv.forma_pagamento, cv.status
     FROM nota_fiscal nf
     INNER JOIN compra_venda cv ON cv.id_compra = nf.id_compra
     WHERE nf.id_cliente = ? AND cv.id_cliente = ?
     ORDER BY nf.data_emissao DESC, nf.id_nota_fiscal DESC`,
    [idCliente, idCliente],
  );
  return rows;
}

export async function buscarPorId(idCliente, idNotaFiscal) {
  const [notas] = await pool.execute(
    `SELECT nf.id_nota_fiscal, nf.id_compra, nf.numero_nota,
            nf.data_emissao, nf.valor_total, nf.chave_acesso,
            cv.forma_pagamento, cv.status
     FROM nota_fiscal nf
     INNER JOIN compra_venda cv ON cv.id_compra = nf.id_compra
     WHERE nf.id_nota_fiscal = ? AND nf.id_cliente = ? AND cv.id_cliente = ?
     LIMIT 1`,
    [idNotaFiscal, idCliente, idCliente],
  );
  if (!notas[0]) return null;

  const [itens] = await pool.execute(
    `SELECT ic.id_produto, p.nome, ic.quantidade, ic.preco_unitario,
            (ic.quantidade * ic.preco_unitario) AS subtotal
     FROM item_compra ic
     INNER JOIN produto p ON p.id_produto = ic.id_produto
     WHERE ic.id_compra = ?
     ORDER BY p.nome`,
    [notas[0].id_compra],
  );
  return { ...notas[0], itens };
}

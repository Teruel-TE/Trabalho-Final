import pool from "../db.js";
import * as notaFiscalModel from "./nota_fiscalModel.js";

function erro(status, mensagem) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

export async function criar(idCliente, formaPagamento) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [clientes] = await connection.execute(
      "SELECT id_cliente FROM cliente_usuario WHERE id_cliente = ? FOR UPDATE",
      [idCliente],
    );
    if (clientes.length === 0) throw erro(404, "Cliente não encontrado.");

    const [carrinhos] = await connection.execute(
      `SELECT id_carrinho
       FROM carrinho
       WHERE id_cliente = ? AND status = 'ativo'
       ORDER BY id_carrinho DESC
       LIMIT 1
       FOR UPDATE`,
      [idCliente],
    );
    const idCarrinho = carrinhos[0]?.id_carrinho;
    if (!idCarrinho) throw erro(404, "O cliente não possui um carrinho ativo.");

    const [itens] = await connection.execute(
      `SELECT ic.id_produto, ic.quantidade, ic.preco_unitario,
              p.nome, p.estoque
       FROM item_carrinho ic
       INNER JOIN produto p ON p.id_produto = ic.id_produto
       WHERE ic.id_carrinho = ?
       ORDER BY ic.id_produto
       FOR UPDATE`,
      [idCarrinho],
    );
    if (itens.length === 0) {
      throw erro(400, "Adicione ao menos um item antes de finalizar.");
    }

    const totalCentavos = itens.reduce(
      (soma, item) =>
        soma + Math.round(Number(item.preco_unitario) * 100) * item.quantidade,
      0,
    );
    if (
      !Number.isSafeInteger(totalCentavos) ||
      totalCentavos <= 0 ||
      totalCentavos > 9999999999
    ) {
      throw erro(400, "O valor total da venda é inválido.");
    }
    const total = (totalCentavos / 100).toFixed(2);

    for (const item of itens) {
      if (item.estoque < item.quantidade) {
        throw erro(409, `Estoque insuficiente para ${item.nome}.`);
      }
    }

    const [venda] = await connection.execute(
      `INSERT INTO compra_venda
         (id_cliente, valor_total, forma_pagamento, status)
       VALUES (?, ?, ?, 'concluida')`,
      [idCliente, total, formaPagamento],
    );

    for (const item of itens) {
      await connection.execute(
        `INSERT INTO item_compra
           (id_compra, id_produto, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?)`,
        [
          venda.insertId,
          item.id_produto,
          item.quantidade,
          item.preco_unitario,
        ],
      );
      const [estoque] = await connection.execute(
        `UPDATE produto
         SET estoque = estoque - ?
         WHERE id_produto = ? AND estoque >= ?`,
        [item.quantidade, item.id_produto, item.quantidade],
      );
      if (estoque.affectedRows !== 1) {
        throw erro(409, `Estoque insuficiente para ${item.nome}.`);
      }
    }

    const notaFiscal = await notaFiscalModel.criar(connection, {
      idCompra: venda.insertId,
      idCliente,
      valorTotal: total,
    });
    await connection.execute(
      "UPDATE carrinho SET status = 'finalizado' WHERE id_carrinho = ?",
      [idCarrinho],
    );
    await connection.commit();

    return {
      id_compra: venda.insertId,
      id_nota_fiscal: notaFiscal.idNotaFiscal,
      numero_nota: notaFiscal.numeroNota,
      chave_acesso: notaFiscal.chaveAcesso,
      valor_total: total,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listar(idCliente) {
  const [rows] = await pool.execute(
    `SELECT v.id_compra, v.data_compra, v.valor_total,
            v.forma_pagamento, v.status, nf.numero_nota
     FROM compra_venda v
     LEFT JOIN nota_fiscal nf ON nf.id_compra = v.id_compra
     WHERE v.id_cliente = ?
     ORDER BY v.data_compra DESC, v.id_compra DESC`,
    [idCliente],
  );
  return rows;
}

export async function buscarPorId(idCliente, idVenda) {
  const [vendas] = await pool.execute(
    `SELECT v.id_compra, v.id_cliente, v.data_compra, v.valor_total,
            v.forma_pagamento, v.status, nf.numero_nota, nf.chave_acesso
     FROM compra_venda v
     LEFT JOIN nota_fiscal nf ON nf.id_compra = v.id_compra
     WHERE v.id_cliente = ? AND v.id_compra = ?
     LIMIT 1`,
    [idCliente, idVenda],
  );
  if (!vendas[0]) return null;

  const [itens] = await pool.execute(
    `SELECT ic.id_produto, p.nome, ic.quantidade, ic.preco_unitario,
            (ic.quantidade * ic.preco_unitario) AS subtotal
     FROM item_compra ic
     INNER JOIN produto p ON p.id_produto = ic.id_produto
     WHERE ic.id_compra = ?
     ORDER BY p.nome`,
    [idVenda],
  );
  return { ...vendas[0], itens };
}
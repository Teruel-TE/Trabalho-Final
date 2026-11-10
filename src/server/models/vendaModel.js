import pool from "../db.js";

export async function finalizarCarrinho(idCliente, formaPagamento) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [carts] = await connection.execute(
      `SELECT c.id_carrinho
       FROM carrinho_de_compra c
       WHERE c.id_cliente = ?
         AND NOT EXISTS (
           SELECT 1 FROM venda v WHERE v.id_carrinho = c.id_carrinho
         )
       ORDER BY c.id_carrinho DESC
       LIMIT 1
       FOR UPDATE`,
      [idCliente],
    );
    const idCarrinho = carts[0]?.id_carrinho;
    if (!idCarrinho) {
      const error = new Error("O cliente não possui um carrinho aberto.");
      error.status = 404;
      throw error;
    }

    const [items] = await connection.execute(
      `SELECT ci.id_compra, ci.qtd_item,
              c.valor_total_compra
       FROM carrinho_has_compra ci
       INNER JOIN compra c ON c.id_compra = ci.id_compra
       WHERE ci.id_carrinho = ?
       FOR UPDATE`,
      [idCarrinho],
    );
    if (items.length === 0) {
      const error = new Error("Adicione ao menos um item antes de finalizar.");
      error.status = 400;
      throw error;
    }

    const totalCentavos = items.reduce(
      (sum, item) =>
        sum + Math.round(Number(item.valor_total_compra) * 100) * item.qtd_item,
      0,
    );
    if (!Number.isSafeInteger(totalCentavos) || totalCentavos <= 0 || totalCentavos > 9999999999) {
      const error = new Error("O valor total da venda é inválido.");
      error.status = 400;
      throw error;
    }
    const total = (totalCentavos / 100).toFixed(2);

    const [sale] = await connection.execute(
      `INSERT INTO venda
         (id_cliente, id_carrinho, valor_total, forma_pagamento)
       VALUES (?, ?, ?, ?)`,
      [idCliente, idCarrinho, total, formaPagamento],
    );

    for (const item of items) {
      await connection.execute(
        `INSERT INTO venda_has_compra (id_venda, id_compra, qtd_item)
         VALUES (?, ?, ?)`,
        [sale.insertId, item.id_compra, item.qtd_item],
      );
    }

    const [invoice] = await connection.execute(
      "INSERT INTO nota_fiscal (id_venda, valor_nota) VALUES (?, ?)",
      [sale.insertId, total],
    );
    await connection.commit();
    return {
      id_venda: sale.insertId,
      id_nota_fiscal: invoice.insertId,
      valor_total: total,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

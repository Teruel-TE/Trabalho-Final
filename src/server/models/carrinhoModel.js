import pool from "../db.js";

export async function buscarCarrinhoAberto(idCliente) {
  const [rows] = await pool.execute(
    `SELECT c.id_carrinho
     FROM carrinho_de_compra c
     WHERE c.id_cliente = ?
       AND NOT EXISTS (
         SELECT 1 FROM venda v WHERE v.id_carrinho = c.id_carrinho
       )
     ORDER BY c.id_carrinho DESC
     LIMIT 1`,
    [idCliente],
  );
  return rows[0]?.id_carrinho ?? null;
}

export async function listarItens(idCarrinho) {
  const [rows] = await pool.execute(
    `SELECT ci.id_compra, ci.qtd_item AS quantidade, c.fornecedor,
            c.data_compra, c.valor_total_compra AS valor_unitario,
            (ci.qtd_item * c.valor_total_compra) AS subtotal
     FROM carrinho_has_compra ci
     INNER JOIN compra c ON c.id_compra = ci.id_compra
     WHERE ci.id_carrinho = ?
     ORDER BY ci.id_compra`,
    [idCarrinho],
  );
  return rows;
}

export async function adicionarItem(idCliente, idCompra, quantidade) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [clients] = await connection.execute(
      "SELECT id_cliente FROM cliente WHERE id_cliente = ? FOR UPDATE",
      [idCliente],
    );
    if (clients.length === 0) {
      const error = new Error("Cliente não encontrado.");
      error.status = 404;
      throw error;
    }

    const [existingProducts] = await connection.execute(
      "SELECT id_compra FROM compra WHERE id_compra = ? FOR UPDATE",
      [idCompra],
    );
    if (existingProducts.length === 0) {
      const error = new Error("Produto não encontrado.");
      error.status = 404;
      throw error;
    }

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
    let idCarrinho = carts[0]?.id_carrinho;
    if (!idCarrinho) {
      const [newCart] = await connection.execute(
        "INSERT INTO carrinho_de_compra (id_cliente) VALUES (?)",
        [idCliente],
      );
      idCarrinho = newCart.insertId;
    }

    const [existingItems] = await connection.execute(
      `SELECT qtd_item
       FROM carrinho_has_compra
       WHERE id_carrinho = ? AND id_compra = ?
       FOR UPDATE`,
      [idCarrinho, idCompra],
    );
    if ((existingItems[0]?.qtd_item ?? 0) + quantidade > 1000) {
      const error = new Error("A quantidade máxima por produto é 1000.");
      error.status = 400;
      throw error;
    }

    await connection.execute(
      `INSERT INTO carrinho_has_compra (id_carrinho, id_compra, qtd_item)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE qtd_item = qtd_item + VALUES(qtd_item)`,
      [idCarrinho, idCompra, quantidade],
    );
    await connection.commit();
    return idCarrinho;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function obterCarrinhoDoCliente(connection, idCliente) {
  const [rows] = await connection.execute(
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
  return rows[0]?.id_carrinho ?? null;
}

export async function alterarItem(idCliente, idCompra, quantidade) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const idCarrinho = await obterCarrinhoDoCliente(connection, idCliente);
    if (!idCarrinho) {
      await connection.commit();
      return idCompra === null;
    }
    const [result] = await connection.execute(
      `SELECT 1
       FROM carrinho_has_compra
       WHERE id_carrinho = ? AND id_compra = ?`,
      [idCarrinho, idCompra],
    );
    if (result.length === 0) {
      await connection.commit();
      return false;
    }
    await connection.execute(
      `UPDATE carrinho_has_compra
       SET qtd_item = ?
       WHERE id_carrinho = ? AND id_compra = ?`,
      [quantidade, idCarrinho, idCompra],
    );
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function removerItem(idCliente, idCompra = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const idCarrinho = await obterCarrinhoDoCliente(connection, idCliente);
    if (!idCarrinho) {
      await connection.commit();
      return false;
    }
    const [result] = idCompra === null
      ? await connection.execute(
          "DELETE FROM carrinho_has_compra WHERE id_carrinho = ?",
          [idCarrinho],
        )
      : await connection.execute(
          "DELETE FROM carrinho_has_compra WHERE id_carrinho = ? AND id_compra = ?",
          [idCarrinho, idCompra],
        );
    await connection.commit();
    return idCompra === null || result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

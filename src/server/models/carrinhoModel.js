import pool from "../db.js";

function erro(status, mensagem) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

async function obterCarrinhoAtivo(connection, idCliente, bloquear = false) {
  const [rows] = await connection.execute(
    `SELECT id_carrinho
     FROM carrinho
     WHERE id_cliente = ? AND status = 'ativo'
     ORDER BY id_carrinho DESC
     LIMIT 1${bloquear ? " FOR UPDATE" : ""}`,
    [idCliente],
  );
  return rows[0]?.id_carrinho ?? null;
}

async function bloquearCliente(connection, idCliente) {
  const [rows] = await connection.execute(
    "SELECT id_cliente FROM cliente_usuario WHERE id_cliente = ? FOR UPDATE",
    [idCliente],
  );
  if (rows.length === 0) throw erro(404, "Cliente não encontrado.");
}

async function obterOuCriarCarrinhoAtivo(connection, idCliente) {
  let idCarrinho = await obterCarrinhoAtivo(connection, idCliente, true);
  if (idCarrinho) return idCarrinho;

  const [result] = await connection.execute(
    "INSERT INTO carrinho (id_cliente, status) VALUES (?, 'ativo')",
    [idCliente],
  );
  return result.insertId;
}

export async function buscarCarrinhoAtivo(idCliente) {
  return obterCarrinhoAtivo(pool, idCliente);
}

export async function listarItens(idCarrinho) {
  const [rows] = await pool.execute(
    `SELECT ic.id_produto, ic.quantidade, ic.preco_unitario,
            p.nome, p.descricao, p.estoque,
            (ic.quantidade * ic.preco_unitario) AS subtotal
     FROM item_carrinho ic
     INNER JOIN produto p ON p.id_produto = ic.id_produto
     WHERE ic.id_carrinho = ?
     ORDER BY p.nome`,
    [idCarrinho],
  );
  return rows;
}

export async function adicionarItem(idCliente, idProduto, quantidade) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await bloquearCliente(connection, idCliente);
    const idCarrinho = await obterOuCriarCarrinhoAtivo(connection, idCliente);

    const [products] = await connection.execute(
      `SELECT id_produto, preco, estoque
       FROM produto
       WHERE id_produto = ?
       FOR UPDATE`,
      [idProduto],
    );
    const produto = products[0];
    if (!produto) throw erro(404, "Produto não encontrado.");

    const [items] = await connection.execute(
      `SELECT id_item_carrinho, quantidade
       FROM item_carrinho
       WHERE id_carrinho = ? AND id_produto = ?
       LIMIT 1
       FOR UPDATE`,
      [idCarrinho, idProduto],
    );
    const quantidadeAtual = Number(items[0]?.quantidade ?? 0);
    const novaQuantidade = quantidadeAtual + quantidade;
    if (novaQuantidade > 1000) {
      throw erro(400, "A quantidade máxima por produto é 1000.");
    }
    if (novaQuantidade > Number(produto.estoque)) {
      throw erro(409, "Quantidade solicitada maior que o estoque disponível.");
    }

    if (items[0]) {
      await connection.execute(
        `UPDATE item_carrinho SET quantidade = ?
         WHERE id_item_carrinho = ?`,
        [novaQuantidade, items[0].id_item_carrinho],
      );
    } else {
      await connection.execute(
        `INSERT INTO item_carrinho
           (id_carrinho, id_produto, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?)`,
        [idCarrinho, idProduto, quantidade, produto.preco],
      );
    }

    await connection.commit();
    return idCarrinho;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function alterarItem(idCliente, idProduto, quantidade) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await bloquearCliente(connection, idCliente);
    const idCarrinho = await obterCarrinhoAtivo(connection, idCliente, true);
    if (!idCarrinho) throw erro(404, "Carrinho ativo não encontrado.");

    const [items] = await connection.execute(
      `SELECT id_item_carrinho
       FROM item_carrinho
       WHERE id_carrinho = ? AND id_produto = ?
       LIMIT 1
       FOR UPDATE`,
      [idCarrinho, idProduto],
    );
    if (!items[0]) throw erro(404, "Produto não encontrado no carrinho.");

    const [products] = await connection.execute(
      "SELECT estoque FROM produto WHERE id_produto = ? FOR UPDATE",
      [idProduto],
    );
    if (!products[0]) throw erro(404, "Produto não encontrado.");
    if (quantidade > Number(products[0].estoque)) {
      throw erro(409, "Quantidade solicitada maior que o estoque disponível.");
    }

    await connection.execute(
      `UPDATE item_carrinho SET quantidade = ?
       WHERE id_item_carrinho = ?`,
      [quantidade, items[0].id_item_carrinho],
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

export async function removerItem(idCliente, idProduto = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await bloquearCliente(connection, idCliente);
    const idCarrinho = await obterCarrinhoAtivo(connection, idCliente, true);
    if (!idCarrinho) throw erro(404, "Carrinho ativo não encontrado.");

    const [result] = idProduto === null
      ? await connection.execute(
          "DELETE FROM item_carrinho WHERE id_carrinho = ?",
          [idCarrinho],
        )
      : await connection.execute(
          `DELETE FROM item_carrinho
           WHERE id_carrinho = ? AND id_produto = ?`,
          [idCarrinho, idProduto],
        );
    if (idProduto !== null && result.affectedRows === 0) {
      throw erro(404, "Produto não encontrado no carrinho.");
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

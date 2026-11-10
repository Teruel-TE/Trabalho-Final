import * as vendaModel from "../models/vendaModel.js";

export async function finalizar(req, res) {
  const idCliente = Number(req.body.id_cliente);
  const formaPagamento = req.body.forma_pagamento;
  if (
    !Number.isSafeInteger(idCliente) ||
    idCliente <= 0 ||
    typeof formaPagamento !== "string" ||
    formaPagamento.trim().length === 0 ||
    formaPagamento.trim().length > 50
  ) {
    return res
      .status(400)
      .json({ erro: "Cliente ou forma de pagamento inválidos." });
  }

  const venda = await vendaModel.finalizarCarrinho(
    idCliente,
    formaPagamento.trim(),
  );
  return res.status(201).json({
    mensagem: "Venda finalizada e nota fiscal emitida.",
    ...venda,
  });
}

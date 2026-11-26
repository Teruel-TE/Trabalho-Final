import * as vendaModel from "../models/vendaModel.js";

const formasPagamento = [
  "Pix",
  "Cartão de crédito",
  "Cartão de débito",
  "Dinheiro",
];

// Converte um valor em identificador inteiro positivo.
function idPositivo(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Valida o pagamento, cria a venda e retorna o comprovante fiscal.
export async function criar(req, res) {
  const formaPagamento = req.body?.forma_pagamento;
  if (
    typeof formaPagamento !== "string" ||
    !formasPagamento.includes(formaPagamento.trim())
  ) {
    return res.status(400).json({ erro: "Forma de pagamento inválida." });
  }

  const venda = await vendaModel.criar(req.idCliente, formaPagamento.trim());
  return res.status(201).json({
    mensagem: "Venda finalizada e nota fiscal emitida.",
    ...venda,
  });
}

// Lista o histórico de compras do usuário autenticado.
export async function listar(req, res) {
  return res.json(await vendaModel.listar(req.idCliente));
}

export async function obter(req, res) {
  const idCompra = idPositivo(req.params.id_compra);
  if (!idCompra) return res.status(400).json({ erro: "ID da compra inválido." });

  const venda = await vendaModel.buscarPorId(req.idCliente, idCompra);
  if (!venda) return res.status(404).json({ erro: "Venda não encontrada." });
  return res.json(venda);
}
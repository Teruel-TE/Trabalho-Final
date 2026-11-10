import * as carrinhoModel from "../models/carrinhoModel.js";

function idPositivo(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function quantidadeValida(value) {
  return (
    Number.isSafeInteger(Number(value)) &&
    Number(value) >= 1 &&
    Number(value) <= 1000
  );
}

export async function obter(req, res) {
  const idCliente = idPositivo(req.params.id_cliente);
  if (!idCliente) return res.status(400).json({ erro: "id_cliente inválido." });

  const idCarrinho = await carrinhoModel.buscarCarrinhoAberto(idCliente);
  const itens = idCarrinho ? await carrinhoModel.listarItens(idCarrinho) : [];
  return res.json({ id_carrinho: idCarrinho, itens });
}

export async function adicionar(req, res) {
  const idCliente = idPositivo(req.params.id_cliente);
  const idCompra = idPositivo(req.body.id_compra);
  const quantidade = Number(req.body.quantidade ?? 1);
  if (!idCliente || !idCompra || !quantidadeValida(quantidade)) {
    return res
      .status(400)
      .json({ erro: "Cliente, produto ou quantidade inválidos." });
  }

  const idCarrinho = await carrinhoModel.adicionarItem(
    idCliente,
    idCompra,
    quantidade,
  );
  return res
    .status(201)
    .json({ id_carrinho: idCarrinho, mensagem: "Item adicionado." });
}

export async function alterarQuantidade(req, res) {
  const idCliente = idPositivo(req.params.id_cliente);
  const idCompra = idPositivo(req.params.id_compra);
  const quantidade = Number(req.body.quantidade);
  if (!idCliente || !idCompra || !quantidadeValida(quantidade)) {
    return res
      .status(400)
      .json({ erro: "Cliente, produto ou quantidade inválidos." });
  }
  const atualizado = await carrinhoModel.alterarItem(
    idCliente,
    idCompra,
    quantidade,
  );
  if (!atualizado)
    return res.status(404).json({ erro: "Item não encontrado no carrinho." });
  return res.json({ mensagem: "Quantidade atualizada." });
}

export async function remover(req, res) {
  const idCliente = idPositivo(req.params.id_cliente);
  const idCompra = req.params.id_compra
    ? idPositivo(req.params.id_compra)
    : null;
  if (!idCliente || (req.params.id_compra && !idCompra)) {
    return res.status(400).json({ erro: "Cliente ou produto inválido." });
  }
  const removido = await carrinhoModel.removerItem(idCliente, idCompra);
  if (!removido)
    return res
      .status(404)
      .json({ erro: "Nenhum item encontrado para remover." });
  return res.status(204).end();
}

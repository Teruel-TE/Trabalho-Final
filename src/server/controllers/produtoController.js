import * as produtoModel from "../models/produtoModel.js";

// Consulta e devolve todos os produtos disponíveis no catálogo.
export async function listarProdutos(req, res) {
  return res.json(await produtoModel.listarProdutos());
}

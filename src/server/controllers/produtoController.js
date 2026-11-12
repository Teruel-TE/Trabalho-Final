import * as produtoModel from "../models/produtoModel.js";

export async function listarProdutos(req, res) {
  return res.json(await produtoModel.listarProdutos());
}

import * as compraModel from "../models/compraModel.js";

export async function listarProdutos(req, res) {
  return res.json(await compraModel.listarProdutos());
}

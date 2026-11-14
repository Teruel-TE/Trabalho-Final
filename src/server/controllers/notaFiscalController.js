import * as notaFiscalModel from "../models/nota_fiscalModel.js";

function idPositivo(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function listar(req, res) {
  return res.json(await notaFiscalModel.listarPorCliente(req.idCliente));
}

export async function obter(req, res) {
  const idNotaFiscal = idPositivo(req.params.id_nota_fiscal);
  if (!idNotaFiscal) {
    return res.status(400).json({ erro: "ID da nota fiscal inválido." });
  }

  const nota = await notaFiscalModel.buscarPorId(req.idCliente, idNotaFiscal);
  if (!nota) return res.status(404).json({ erro: "Nota fiscal não encontrada." });
  return res.json(nota);
}

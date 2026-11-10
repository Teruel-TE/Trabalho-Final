import * as consultaModel from "../models/consultaModel.js";

function inteiroPositivo(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export async function criar(req, res) {
  const {
    id_cliente: rawIdCliente,
    consumo_kwh_mes: consumo,
    tipo_telhado: tipoTelhado,
    descricao_necessidade: descricao,
  } = req.body;
  const idCliente = inteiroPositivo(rawIdCliente);
  const consumoKwh = Number(consumo);

  if (
    !idCliente ||
    !Number.isFinite(consumoKwh) ||
    consumoKwh <= 0 ||
    consumoKwh > 99999999.99 ||
    (tipoTelhado != null && typeof tipoTelhado !== "string") ||
    (descricao != null && typeof descricao !== "string")
  ) {
    return res
      .status(400)
      .json({ erro: "Os dados da simulação são inválidos." });
  }

  const idConsulta = await consultaModel.criar({
    id_cliente: idCliente,
    consumo_kwh_mes: consumoKwh,
    tipo_telhado: tipoTelhado,
    descricao_necessidade: descricao,
  });
  return res.status(201).json({ id_consulta: idConsulta });
}

export async function historico(req, res) {
  const rawId = req.params.id_cliente ?? req.query.id_cliente;
  const idCliente = inteiroPositivo(rawId);
  if (!idCliente) {
    return res.status(400).json({ erro: "Informe um id_cliente válido." });
  }
  return res.json(await consultaModel.listarPorCliente(idCliente));
}

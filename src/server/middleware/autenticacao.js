import { buscarSessao } from "../utils/sessoes.js";

export function exigirSessao(req, res, next) {
  const autorizacao = req.get("authorization") ?? "";
  const correspondencia = /^Bearer ([a-f\d]{64})$/i.exec(autorizacao);
  const idCliente = correspondencia
    ? buscarSessao(correspondencia[1])
    : null;

  if (!idCliente) {
    return res.status(401).json({ erro: "Faça login para acessar sua conta." });
  }

  req.idCliente = idCliente;
  req.tokenSessao = correspondencia[1];
  return next();
}

import * as loginModel from "../models/loginModel.js";

export async function login(req, res) {
  const { email, senha } = req.body;
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof senha !== "string" ||
    senha.length === 0
  ) {
    return res
      .status(400)
      .json({ erro: "Informe um e-mail e uma senha válidos." });
  }

  const usuario = await loginModel.autenticar(email.trim(), senha);
  if (!usuario) {
    return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  }
  return res.json({ mensagem: "Login realizado com sucesso.", usuario });
}

export async function excluirLogin(req, res) {
  const idLogin = Number(req.params.id_login);
  if (!Number.isSafeInteger(idLogin) || idLogin <= 0) {
    return res.status(400).json({ erro: "id_login inválido." });
  }
  const removido = await loginModel.excluir(idLogin);
  if (!removido) return res.status(404).json({ erro: "Login não encontrado." });
  return res.status(204).end();
}

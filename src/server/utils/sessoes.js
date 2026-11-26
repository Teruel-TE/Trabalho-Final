import { randomBytes } from "node:crypto";

const duracaoSessao = 8 * 60 * 60 * 1000;
const sessoes = new Map();

// Cria um token aleatório associado ao identificador do cliente.
export function criarSessao(idCliente) {
  const token = randomBytes(32).toString("hex");
  sessoes.set(token, {
    idCliente,
    expiraEm: Date.now() + duracaoSessao,
  });
  return token;
}

// Recupera o cliente do token válido e remove sessões expiradas.
export function buscarSessao(token) {
  const sessao = sessoes.get(token);
  if (!sessao) return null;
  if (sessao.expiraEm <= Date.now()) {
    sessoes.delete(token);
    return null;
  }
  return sessao.idCliente;
}

// Remove uma única sessão pelo seu token.
export function revogarSessao(token) {
  sessoes.delete(token);
}

// Remove todas as sessões abertas por determinado usuário.
export function revogarSessoesUsuario(idCliente) {
  for (const [token, sessao] of sessoes) {
    if (sessao.idCliente === idCliente) sessoes.delete(token);
  }
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  buscarSessao,
  criarSessao,
  revogarSessao,
  revogarSessoesUsuario,
} from "../src/server/utils/sessoes.js";

test("sessão só autentica enquanto o token existir", () => {
  const token = criarSessao(42);

  assert.equal(buscarSessao(token), 42);
  revogarSessao(token);
  assert.equal(buscarSessao(token), null);
});

test("revoga todas as sessões da própria conta", () => {
  const tokenUsuarioAlvo = criarSessao(101);
  const tokenOutroUsuario = criarSessao(202);

  revogarSessoesUsuario(101);

  assert.equal(buscarSessao(tokenUsuarioAlvo), null);
  assert.equal(buscarSessao(tokenOutroUsuario), 202);
  revogarSessao(tokenOutroUsuario);
});

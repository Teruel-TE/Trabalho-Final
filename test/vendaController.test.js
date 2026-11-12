import assert from "node:assert/strict";
import test from "node:test";
import { criar } from "../src/server/controllers/vendaController.js";

test("venda rejeita forma de pagamento não permitida sem acessar o banco", async () => {
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  await criar({ body: { forma_pagamento: "Criptomoeda" }, idCliente: 1 }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.erro, "Forma de pagamento inválida.");
});

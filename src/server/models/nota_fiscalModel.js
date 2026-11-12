import { randomBytes } from "node:crypto";

export async function criar(connection, dados) {
  const numeroNota = `CL-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const chaveAcesso = randomBytes(30).toString("hex");
  const [result] = await connection.execute(
    `INSERT INTO nota_fiscal
       (id_compra, id_cliente, numero_nota, valor_total, chave_acesso)
     VALUES (?, ?, ?, ?, ?)`,
    [
      dados.idCompra,
      dados.idCliente,
      numeroNota,
      dados.valorTotal,
      chaveAcesso,
    ],
  );
  return {
    idNotaFiscal: result.insertId,
    numeroNota,
    chaveAcesso,
  };
}

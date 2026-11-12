import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const SALT_BYTES = 16;
const KEY_BYTES = 64;

export async function gerarHashSenha(senha) {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scrypt(senha, salt, KEY_BYTES);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verificarSenha(senha, senhaHash) {
  const [algoritmo, saltHex, hashHex] = senhaHash.split(":");
  if (
    algoritmo !== "scrypt" ||
    !/^[0-9a-f]{32}$/i.test(saltHex ?? "") ||
    !/^[0-9a-f]{128}$/i.test(hashHex ?? "")
  ) {
    return false;
  }

  const hashEsperado = Buffer.from(hashHex, "hex");
  const hashRecebido = await scrypt(senha, Buffer.from(saltHex, "hex"), KEY_BYTES);
  return timingSafeEqual(hashEsperado, hashRecebido);
}

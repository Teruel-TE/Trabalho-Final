export default function validarId(req, res, next) {
  const id = Number(req.params.id);

  if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(id) || id <= 0) {
    return res
      .status(400)
      .json({ erro: "O ID deve ser um número inteiro positivo" });
  }

  req.id = id;
  next();
}

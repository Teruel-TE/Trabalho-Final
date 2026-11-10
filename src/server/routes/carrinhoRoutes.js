import { Router } from "express";
import * as carrinhoController from "../controllers/carrinhoController.js";
import * as compraController from "../controllers/compraController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.get("/produtos", asyncHandler(compraController.listarProdutos));
router.get("/:id_cliente", asyncHandler(carrinhoController.obter));
router.post("/:id_cliente/itens", asyncHandler(carrinhoController.adicionar));
router.put(
  "/:id_cliente/itens/:id_compra",
  asyncHandler(carrinhoController.alterarQuantidade),
);
router.delete(
  "/:id_cliente/itens/:id_compra",
  asyncHandler(carrinhoController.remover),
);
router.delete("/:id_cliente/itens", asyncHandler(carrinhoController.remover));

export default router;

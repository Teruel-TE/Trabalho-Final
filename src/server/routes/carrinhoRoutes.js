import { Router } from "express";
import * as carrinhoController from "../controllers/carrinhoController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
// Opera o carrinho por cliente usando os métodos HTTP padrão.
router.get("/:id_cliente", asyncHandler(carrinhoController.obter));
router.post("/:id_cliente", asyncHandler(carrinhoController.adicionar));
router.put("/:id_cliente", asyncHandler(carrinhoController.alterarQuantidade));
router.delete("/:id_cliente", asyncHandler(carrinhoController.remover));

export default router;

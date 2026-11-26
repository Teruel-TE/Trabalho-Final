import { Router } from "express";
import * as controller from "../controllers/produtoController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
// Disponibiliza a consulta pública do catálogo.
router.get("/", asyncHandler(controller.listarProdutos));

export default router;

import { Router } from "express";
import * as compraController from "../controllers/compraController.js";
import * as vendaController from "../controllers/vendaController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.get("/produtos", asyncHandler(compraController.listarProdutos));
router.post("/", asyncHandler(vendaController.finalizar));

export default router;

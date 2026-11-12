import { Router } from "express";
import * as controller from "../controllers/produtoController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(controller.listarProdutos));

export default router;

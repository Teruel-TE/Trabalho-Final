import { Router } from "express";
import { exigirSessao } from "../middleware/autenticacao.js";
import * as controller from "../controllers/vendaController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.use(exigirSessao);
router.get("/", asyncHandler(controller.listar));
router.get("/:id_venda", asyncHandler(controller.obter));
router.post("/", asyncHandler(controller.criar));

export default router;
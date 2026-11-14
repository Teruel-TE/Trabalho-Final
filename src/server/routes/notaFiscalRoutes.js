import { Router } from "express";
import { exigirSessao } from "../middleware/autenticacao.js";
import * as controller from "../controllers/notaFiscalController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.use(exigirSessao);
router.get("/", asyncHandler(controller.listar));
router.get("/:id_nota_fiscal", asyncHandler(controller.obter));

export default router;

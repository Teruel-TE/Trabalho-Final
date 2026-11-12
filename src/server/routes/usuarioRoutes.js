import { Router } from "express";
import * as controller from "../controllers/usuarioController.js";
import { exigirSessao } from "../middleware/autenticacao.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.post("/usuarios/cadastrar", asyncHandler(controller.cadastrar));
router.post("/login", asyncHandler(controller.login));
router.get("/usuarios/me", exigirSessao, asyncHandler(controller.obter));
router.put("/usuarios/me", exigirSessao, asyncHandler(controller.atualizar));
router.delete("/usuarios/me", exigirSessao, asyncHandler(controller.excluir));
router.post("/logout", exigirSessao, asyncHandler(controller.sair));

export default router;

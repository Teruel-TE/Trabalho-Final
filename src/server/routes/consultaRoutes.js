import { Router } from "express";
import * as controller from "../controllers/consultaController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.post("/", asyncHandler(controller.criar));
router.get("/", asyncHandler(controller.historico));
router.get("/:id_cliente", asyncHandler(controller.historico));

export default router;

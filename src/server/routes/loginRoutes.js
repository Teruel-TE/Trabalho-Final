import { Router } from "express";
import * as controller from "../controllers/loginController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.post("/", asyncHandler(controller.login));
router.delete("/:id_login", asyncHandler(controller.excluirLogin));

export default router;

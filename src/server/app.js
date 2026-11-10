import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import carrinhoRoutes from "./routes/carrinhoRoutes.js";
import consultaRoutes from "./routes/consultaRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import vendaRoutes from "./routes/vendaRoutes.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(currentDirectory, "../public");

const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins?.length ? { origin: allowedOrigins } : {}));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/login", loginRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/vendas", vendaRoutes);
app.use(express.static(publicDirectory));

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  return res.status(status).json({
    erro: status >= 500 ? "Erro interno do servidor." : error.message,
  });
});

export default app;

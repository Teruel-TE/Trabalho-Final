import cors from "cors";
import express from "express";
import "dotenv/config";
import abrirConexao from "./server/db.js";


import carrinhoRoute from "./src/server/routes/carrinhoRoutes.js";
import consultaRoute from "./src/server/routes/consultaRoutes.js";
import loginRoutes from "./src/server/routes/loginRoutes.js";
import vendaRoutes from "./src/server/routes/vendaRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/login", loginRoutes);

app.use("/carrinho", carrinhoRoute);

app.use("/consulta", consultaRoute);

app.use("/venda", vendaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
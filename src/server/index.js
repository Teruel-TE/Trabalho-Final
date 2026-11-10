import "dotenv/config";
import app from "./app.js";
import pool from "./db.js";

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`ChemLab disponível em http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`\n${signal}: encerrando servidor...`);
  server.close(async (serverError) => {
    if (serverError) console.error("Erro ao encerrar o servidor:", serverError);
    try {
      await pool.end();
      process.exit(serverError ? 1 : 0);
    } catch (error) {
      console.error("Erro ao encerrar o pool de conexões:", error);
      process.exit(1);
    }
  });
}

import express from "express";
import "reflect-metadata";
import cors from "cors";
import receitaRoutes from "./routes/receitaRoutes";
import despesaRoutes from "./routes/despesaRoutes";
import relatorioRoutes from "./routes/relatorioRoutes";
import routes from "./routes/routes"

const app = express();

// Middleware para permitir requisições CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Permite apenas requisições do frontend na porta 5173
  })
);

// Middleware para processar JSON
app.use(express.json());



// Rotas da API com prefixo "/api"
app.use("/api",routes)
app.use("/api", receitaRoutes);
app.use("/api", despesaRoutes);
app.use("/api", relatorioRoutes);

// Exporta o app para uso em outros arquivos
export default app;
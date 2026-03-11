import express from "express";
import "reflect-metadata";
import cors from "cors";
import receitaRoutes from "./routes/receitaRoutes";
import despesaRoutes from "./routes/despesaRoutes";
import relatorioRoutes from "./routes/relatorioRoutes";
import routes from "./routes/routes"
import user from "./routes/user"
const app = express();

// Middleware para permitir requisições CORS
app.use(
  cors({
    origin: "*"
  })
);

// Middleware para processar JSON
app.use(express.json());

app.use("/api",routes)

// Rotas da API com prefixo "/api"
app.use("/api",user)
app.use("/api", receitaRoutes);
app.use("/api", despesaRoutes);
app.use("/api", relatorioRoutes);

// Exporta o app para uso em outros arquivos
export default app;
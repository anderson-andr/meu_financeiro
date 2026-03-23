import express from "express";
import "reflect-metadata";
import cors from "cors";
import receitaRoutes from "./routes/receitaRoutes";
import despesaRoutes from "./routes/despesaRoutes";
import relatorioRoutes from "./routes/relatorioRoutes";
import routes from "./routes/routes";
import user from "./routes/user";
import metaRoutes from "./routes/metaRoutes";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use("/api", routes);
app.use("/api", user);
app.use("/api", receitaRoutes);
app.use("/api", despesaRoutes);
app.use("/api", relatorioRoutes);
app.use("/api", metaRoutes);

export default app;

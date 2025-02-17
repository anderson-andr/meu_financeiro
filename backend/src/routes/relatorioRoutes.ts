import { Router, Request, Response } from "express";
import { RelatorioController } from "../controllers/RelatorioController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const relatorioController = new RelatorioController();



// Aplica o middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para obter o relatório geral mensal com opção de filtro por status
router.get("/relatorios/geral/:mes/:status?", (req: Request, res: Response) => {
    relatorioController.getRelatorioMensal(req, res);
});

// Rota para obter o relatório mensal por categoria
router.get("/relatorios/categoria/:mes", (req: Request, res: Response) => {
    relatorioController.getRelatorioMensalPorCategoria(req, res);
});

// Nova rota para obter o relatório mensal filtrado por mês e categoria
router.get("/relatorios/mesCategoria/:mes&:categoria", (req: Request, res: Response) => {
    relatorioController.getRelatorioPorMesECategoria(req, res);
});

// Rota para obter o relatório de receitas por categoria e mês
router.get("/relatorios/mesCategoria/receitas/:mes&:categoria", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioReceitasPorCategoria(req, res);
});

// Rota para obter o relatório de despesas por categoria e mês
router.get("/relatorios/mesCategoria/despesas/:mes&:categoria", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioDespesasPorCategoria(req, res);
});

// Rota para obter o relatório geral de receitas por mês
router.get("/relatorios/receitas/:mes", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioGeralReceitas(req, res);
});

// Rota para obter o relatório geral de despesas por mês
router.get("/relatorios/despesas/:mes", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioGeralDespesas(req, res);
});

// Rota para obter o relatório geral de despesas por mês
router.get("/relatorios/consolidado", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioConsolidado(req, res);
});


// Rota para obter o relatório geral de despesas por mês
router.get("/relatorios/analitico", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioAnalitico(req, res);
});

// Rota para obter o relatório geral de despesas por mês
router.get("/relatorios/consolidado2", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioConsolidado2(req, res);
});


// Rota para obter o relatório geral de despesas por mês
router.get("/relatorios/analitico2", async (req: Request, res: Response) => {
    await relatorioController.getRelatorioAnalitico2(req, res);
});

export default router;

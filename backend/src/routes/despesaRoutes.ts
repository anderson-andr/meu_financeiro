import { Router, Request, Response } from "express";
import { DespesaController } from "../controllers/DespesaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const despesaController = new DespesaController();

// Aplica o middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para obter todas as despesas
router.get("/despesas", async (req: Request, res: Response) => {
    despesaController.getAll(req, res);
});

// Rota para obter uma despesa específica pelo ID
router.get("/despesas/:id", async (req: Request, res: Response) => {
    despesaController.getById(req, res);
});

// Rota para criar uma nova despesa
router.post("/despesas", async (req: Request, res: Response) => {
    despesaController.create(req, res);
});

// Rota para atualizar uma despesa existente
router.put("/despesas/:id", async (req: Request, res: Response) => {
    despesaController.update(req, res);
});

// Rota para deletar uma despesa existente
router.delete("/despesas/:id", async (req: Request, res: Response) => {
    despesaController.delete(req, res);
});

// Rota para duplicar despesas de um mês para outro
router.post("/despesas/duplicar", async (req: Request, res: Response) => {
    despesaController.duplicar(req, res);
});

export default router;

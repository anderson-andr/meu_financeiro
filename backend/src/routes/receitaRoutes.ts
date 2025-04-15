import { Router, Request, Response } from "express";
import { ReceitaController } from "../controllers/ReceitaController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const receitaController = new ReceitaController();

// Aplica o middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para obter todas as receitas
router.get("/receitas", async (req: Request, res: Response) => {
    receitaController.getAll(req, res);
});

// Rota para obter uma receita específica pelo ID
router.get("/receitas/:id", async (req: Request, res: Response) => {
    receitaController.getById(req, res);
});

// Rota para criar uma nova receita
router.post("/receitas", async (req: Request, res: Response) => {
    receitaController.create(req, res);
});

// Rota para atualizar uma receita existente
router.put("/receitas/:id", async (req: Request, res: Response) => {
    receitaController.update(req, res);
});

// Rota para deletar uma receita existente
router.delete("/receitas/:id", async (req: Request, res: Response) => {
    receitaController.delete(req, res);
});

// ✅ Rota para duplicar receitas de um mês para outro
router.post("/receitas/duplicar", async (req: Request, res: Response) => {
    receitaController.duplicarReceitas(req, res);
});

export default router;

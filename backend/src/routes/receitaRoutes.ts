import { Router, Request, Response } from "express";
import { ReceitaController } from "../controllers/ReceitaController";


const router = Router();
const receitaController = new ReceitaController();

// Rota para obter todas as receitas
router.get("/receitas", async (req: Request, res: Response) => {
    receitaController.getAll(req, res);
});

// Rota para obter uma despesa específica pelo ID
router.get("/receitas/:id", async (req: Request, res: Response) => {
    receitaController.getById(req, res);
});

// Rota para criar uma nova despesa
router.post("/receitas", async (req: Request, res: Response) => {
    receitaController.create(req, res);
});

// Rota para atualizar uma despesa existente
router.put("/receitas/:id", async (req: Request, res: Response) => {
    receitaController.update(req, res);
});

// Rota para deletar uma despesa existente
router.delete("/receitas/:id", async (req: Request, res: Response) => {
    receitaController.delete(req, res);
});




export default router;

import { Router } from "express";
import { DespesaController } from "../controllers/DespesaController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AuthUser } from "../types";

// Criar instância do controller
const despesaController = new DespesaController();

const router = Router();

// Aplica o middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para obter todas as despesas
router.get("/despesas", async (req, res) => {
    const user = req.user as AuthUser; 
    despesaController.getAll(req, res, user);
});

router.get("/despesas/:id", async (req, res) => {
    const user = req.user as AuthUser; 
    // Passando req e res para o controlador
    await despesaController.getById(req, res, user);
});

router.post("/despesas", async (req, res,) => {
    const user = req.user as AuthUser; 
    // Passando req e res para o controlador
    await despesaController.create(req, res);
});

router.put("/despesas/:id", async (req, res) => {
    const user = req.user as AuthUser; 
    // Passando req e res para o controlador
    await despesaController.update(req, res);
});

router.delete("/despesas/:id", async (req, res) => {
    const user = req.user as AuthUser; 
    // Passando req e res para o controlador
    await despesaController.delete(req, res);
});

export default router;  // Exportando o roteador corretamente


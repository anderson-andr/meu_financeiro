import { Router } from "express";
import { DespesaController } from "../controllers/DespesaController";
import { authMiddleware } from "../middlewares/authMiddleware";

// Criar instância do controller
const despesaController = new DespesaController();

const router = Router();

// Aplica o middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para obter todas as despesas
router.get("/despesas", async (req, res) => {
    despesaController.getAll(req, res);
});

router.get("/despesas/:id", async (req, res) => {
    // Passando req e res para o controlador
    await despesaController.getById(req, res);
});

router.post("/despesas", async (req, res) => {
    // Passando req e res para o controlador
    await despesaController.create(req, res);
});

router.put("/despesas/:id", async (req, res) => {
    // Passando req e res para o controlador
    await despesaController.update(req, res);
});

router.delete("/despesas/:id", async (req, res) => {
    // Passando req e res para o controlador
    await despesaController.delete(req, res);
});

export default router;  // Exportando o roteador corretamente


import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AuthUser } from "../types";

const router = Router();

// Aplica o middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para obter os dados do usuário autenticado
router.get("/user/me",  (req, res) => {
    const user = req.user as AuthUser;
    res.json({ user }); // Retorna os dados do usuário
});

export default router;
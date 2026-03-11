import express, { NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";


const router = express.Router();
const authController = new AuthController();

// 🔓 Ping aberto para testar API
router.get("/ping", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "API online",
        timestamp: new Date()
    });
});


// Garante que o contexto de `this` não seja perdido
router.post("/register", (req, res, next) => {
    authController.register(req, res).catch(next); // Usando catch para passar erros para o next
});
router.post("/login", (req, res, next) => {
    authController.login(req, res).catch(next); // Usando catch para passar erros para o next
});

export default router;

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }
            const user = await AuthService.register(username, password); // Chamada correta
            res.status(201).json({ message: "Usuário registrado com sucesso", user });
        } catch (error) {
            res.status(500).json({ message: "Erro ao registrar usuário", error: error });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }
            const { token } = await AuthService.login(username, password); // Chamada correta
            res.json({ message: "Login bem-sucedido", token });
        } catch (error) {
            res.status(401).json({ message: "Credenciais inválidas", error: error });
        }
    }
}

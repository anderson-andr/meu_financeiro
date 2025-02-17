import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types"; // Certifique-se de definir o tipo AuthUser

// Definição de uma interface para estender o objeto Request e incluir o usuário autenticado
interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Obtém o token do cabeçalho 'Authorization' exatamente como enviado pelo frontend
  const token = req.headers["authorization"] as string | undefined;
  console.log("Headers recebidos:", req.headers);


  if (!token) {
    res.status(403).json({ message: "Token não fornecido" });
    return;
  }

  jwt.verify(token, "segredo-do-token", (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Token inválido" });
      return;
    }
    
    req.user = decoded as AuthUser;
    next();
  });
};

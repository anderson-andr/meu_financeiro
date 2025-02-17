// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types"; // Certifique-se de definir o tipo AuthUser

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Procura pelo header 'token'
  const token = req.headers["token"] as string | undefined;  

  if (!token) {
    res.status(403).json({ message: "Token não fornecido" });
    return;
  }

  jwt.verify(token, "segredo-do-token", (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ message: "Token inválido" });
      return;
    }
    req.user = decoded as AuthUser;
    next();
  });
};

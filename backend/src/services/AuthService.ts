// src/services/AuthService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

export class AuthService {
    static async register(username: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({ username, password: hashedPassword });
        await userRepository.save(user);
        return user;
    }

    static async login(username: string, password: string) {
        const user = await userRepository.findOne({ where: { username } });
        if (!user) {
            throw new Error("Usuário não encontrado");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Senha incorreta");
        }
        const token = jwt.sign({ userId: user.id }, "segredo-do-token", { expiresIn: "1h" });
        return { token };
    }
}
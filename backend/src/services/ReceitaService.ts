// src/services/ReceitaService.ts
import { Repository } from "typeorm";
import { Receita } from "../entities/Receita";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";

export class ReceitaService {
    private receitaRepository: Repository<Receita>;
    private userRepository: Repository<User>;

    constructor(receitaRepository: Repository<Receita>) {
        this.receitaRepository = receitaRepository;
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Método para obter todas as receitas de um usuário específico
    async getAllByUser(userId: number) {
        return await this.receitaRepository.find({
            where: { user: { id: userId } }, // Filtra por usuário
            relations: ["mesReferencia"], // Inclui a relação com MesReferencia
        });
    }

    // Método para obter uma receita por ID (associada ao usuário)
    async getById(id: number, userId: number) {
        return await this.receitaRepository.findOne({
            where: { id, user: { id: userId } }, // Filtra por ID e usuário
            relations: ["mesReferencia"],
        });
    }

    // Método para criar uma nova receita associada a um usuário
    async create(data: Partial<Receita>, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const receita = this.receitaRepository.create({
            ...data,
            user, // Associa a receita ao usuário
        });

        return await this.receitaRepository.save(receita);
    }

    // Método para atualizar uma receita existente (associada ao usuário)
    async update(id: number, data: Partial<Receita>, userId: number) {
        const receita = await this.receitaRepository.findOne({
            where: { id, user: { id: userId } }, // Filtra por ID e usuário
        });
        if (!receita) {
            throw new Error("Receita não encontrada ou não pertence ao usuário");
        }

        this.receitaRepository.merge(receita, data);
        return await this.receitaRepository.save(receita);
    }

    // Método para deletar uma receita (associada ao usuário)
    async delete(id: number, userId: number) {
        const receita = await this.receitaRepository.findOne({
            where: { id, user: { id: userId } }, // Filtra por ID e usuário
        });
        if (!receita) {
            throw new Error("Receita não encontrada ou não pertence ao usuário");
        }

        await this.receitaRepository.remove(receita);
    }
}
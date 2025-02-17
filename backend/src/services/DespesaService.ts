// src/services/DespesaService.ts
import { Repository } from "typeorm";
import { Despesa } from "../entities/Despesa";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";

export class DespesaService {
    private despesaRepository: Repository<Despesa>;
    private userRepository: Repository<User>;

    constructor(despesaRepository: Repository<Despesa>) {
        this.despesaRepository = despesaRepository;
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Método para obter todas as despesas de um usuário específico
    async getAllByUser(userId: number) {
        return await this.despesaRepository.find({
            where: { user: { id: userId } }, // Filtra por usuário
        });
    }

    // Método para obter uma despesa por ID (associada ao usuário)
    async getById(id: number, userId: number) {
        return await this.despesaRepository.findOne({
            where: { id, user: { id: userId } }, // Filtra por ID e usuário
        });
    }

    // Método para criar uma nova despesa associada a um usuário
    async create(data: Partial<Despesa>, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const despesa = this.despesaRepository.create({
            ...data,
            user, // Associa a despesa ao usuário
        });

        return await this.despesaRepository.save(despesa);
    }

    // Método para atualizar uma despesa existente (associada ao usuário)
    async update(id: number, data: Partial<Despesa>, userId: number) {
        const despesa = await this.despesaRepository.findOne({
            where: { id, user: { id: userId } }, // Filtra por ID e usuário
        });
        if (!despesa) {
            throw new Error("Despesa não encontrada ou não pertence ao usuário");
        }

        this.despesaRepository.merge(despesa, data);
        return await this.despesaRepository.save(despesa);
    }

    // Método para deletar uma despesa (associada ao usuário)
    async delete(id: number, userId: number) {
        const despesa = await this.despesaRepository.findOne({
            where: { id, user: { id: userId } }, // Filtra por ID e usuário
        });
        if (!despesa) {
            throw new Error("Despesa não encontrada ou não pertence ao usuário");
        }

        await this.despesaRepository.remove(despesa);
    }
}
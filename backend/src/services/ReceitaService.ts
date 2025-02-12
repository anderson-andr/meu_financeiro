import { Repository } from "typeorm";
import { Receita } from "../entities/Receita";
import { AppDataSource } from "../data-source"; // Certifique-se de ajustar o caminho do arquivo de configuração

export  class ReceitaService  {
    constructor(private receitaRepository: Repository<Receita>) {}

    // Método para obter todas as receitas
    async getAll() {
        return await this.receitaRepository.find();
    }

    // Método para obter uma receita por ID
    async getById(id: number) {
        return await this.receitaRepository.findOne({ where: { id } });
    }

    // Método para criar uma nova receita
    async create(data: Partial<Receita>) {
        const receita = this.receitaRepository.create(data);
        return await this.receitaRepository.save(receita);
    }

    // Método para atualizar uma receita existente
    async update(id: number, data: Partial<Receita>) {
        const receita = await this.receitaRepository.findOne({ where: { id } });
        if (!receita) {
            throw new Error("Receita não encontrada");
        }
        this.receitaRepository.merge(receita, data);
        return await this.receitaRepository.save(receita);
    }

    // Método para deletar uma receita
    async delete(id: number) {
        const receita = await this.receitaRepository.findOne({ where: { id } });
        if (!receita) {
            throw new Error("Receita não encontrada");
        }
        await this.receitaRepository.remove(receita);
    }
}

import { Repository } from "typeorm";
import { Despesa } from "../entities/Despesa";
import { AppDataSource } from "../data-source";  // Certifique-se de ajustar o caminho do arquivo de configuração

export class DespesaService {
    constructor(private despesaRepository: Repository<Despesa>) {}

    // Método para obter todas as despesas
    async getAll() {
        return await this.despesaRepository.find();
    }

    // Método para obter uma despesa por ID
    async getById(id: number) {
        return await this.despesaRepository.findOne({ where: { id } });
    }

    // Método para criar uma nova despesa
    async create(data: Partial<Despesa>) {
        const despesa = this.despesaRepository.create(data);
        return await this.despesaRepository.save(despesa);
    }

    // Método para atualizar uma despesa existente
    async update(id: number, data: Partial<Despesa>) {
        const despesa = await this.despesaRepository.findOne({ where: { id } });
        if (!despesa) {
            throw new Error("Despesa não encontrada");
        }
        this.despesaRepository.merge(despesa, data);
        return await this.despesaRepository.save(despesa);
    }

    // Método para deletar uma despesa
    async delete(id: number) {
        const despesa = await this.despesaRepository.findOne({ where: { id } });
        if (!despesa) {
            throw new Error("Despesa não encontrada");
        }
        await this.despesaRepository.remove(despesa);
    }
}

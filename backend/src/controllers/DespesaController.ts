import { Request, Response } from "express";
import { DespesaService } from "../services/DespesaService";
import { AppDataSource } from "../data-source";
import { Despesa } from "../entities/Despesa";
import { MesReferencia } from "../entities/MesReferencia";

// Repositórios
const despesaRepository = AppDataSource.getRepository(Despesa);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);

// Instanciando o serviço
const despesaService = new DespesaService(despesaRepository);

export class DespesaController {
    async getAll(req: Request, res: Response) {
        try {
            // Buscando todas as despesas com a relação de mesReferencia
            const despesas = await AppDataSource.getRepository(Despesa)
                .createQueryBuilder("despesa")
                .leftJoinAndSelect("despesa.mesReferencia", "mesReferencia") // Relaciona as despesas com mesReferencia
                .getMany();
    
            // Formatando as despesas para incluir o mês de referência no retorno
            const despesasComMesReferencia = despesas.map(despesa => ({
                ...despesa,
                mesReferencia: despesa.mesReferencia ? despesa.mesReferencia.referencia : null
            }));
    
            res.json(despesasComMesReferencia);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar despesas", error });
        }
    }
    // Método para pegar uma despesa por ID
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const despesa = await despesaService.getById(Number(id)); // Converte para número
            if (!despesa) {
                return res.status(404).json({ message: "Despesa não encontrada" });
            }
            res.json(despesa);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar despesa", error });
        }
    }

    // Método para criar uma nova despesa
    async create(req: Request, res: Response) {
        try {
            const { mesReferencia, descricao,categoria, status, valor, data } = req.body;
            if (!mesReferencia || !descricao || !categoria || !status || !valor || !data) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }

            // Buscar o mesReferencia usando a propriedade "referencia"
            let mesReferenciaEntity = await mesReferenciaRepository.findOne({
                where: { referencia: mesReferencia }  // Verifica se o mês já existe
            });

            if (!mesReferenciaEntity) {
                mesReferenciaEntity = mesReferenciaRepository.create({ referencia: mesReferencia });
                await mesReferenciaRepository.save(mesReferenciaEntity);  // Salva o novo MesReferencia
            }

            const despesa = await despesaService.create({
                descricao,
                categoria,
                status,
                valor,
                data,
                mesReferencia: mesReferenciaEntity // Associa a entidade MesReferencia
            });

            res.status(201).json(despesa);
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar despesa", error });
        }
    }

    // Método para atualizar uma despesa existente
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { mesReferencia, descricao,categoria, status, valor, data } = req.body;

            if (!mesReferencia || !descricao || !categoria || !status || !valor || !data) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }

            const despesa = await despesaService.getById(Number(id)); // Converte para número
            if (!despesa) {
                return res.status(404).json({ message: "Despesa não encontrada" });
            }

            // Buscar ou criar a entidade MesReferencia
            let mesReferenciaEntity = await mesReferenciaRepository.findOne({
                where: { referencia: mesReferencia }
            });

            if (!mesReferenciaEntity) {
                mesReferenciaEntity = mesReferenciaRepository.create({ referencia: mesReferencia });
                await mesReferenciaRepository.save(mesReferenciaEntity);  // Salva o novo MesReferencia
            }

            const updatedDespesa = await despesaService.update(Number(id), {
                descricao,
                categoria,
                status,
                valor,
                data,
                mesReferencia: mesReferenciaEntity
            });

            res.json(updatedDespesa);
        } catch (error) {
            res.status(500).json({ message: "Erro ao atualizar despesa", error });
        }
    }

    // Método para deletar uma despesa
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const despesa = await despesaService.getById(Number(id)); // Converte para número
            if (!despesa) {
                return res.status(404).json({ message: "Despesa não encontrada" });
            }

            await despesaService.delete(Number(id));
            res.status(200).json({ message: "Despesa deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar despesa", error });
        }
    }
}

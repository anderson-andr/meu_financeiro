// src/controllers/DespesaController.ts
import { Request, Response } from "express";
import { DespesaService } from "../services/DespesaService";
import { AppDataSource } from "../data-source";
import { Despesa } from "../entities/Despesa";
import { MesReferencia } from "../entities/MesReferencia";

const despesaRepository = AppDataSource.getRepository(Despesa);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
const despesaService = new DespesaService(despesaRepository);

export class DespesaController {
    // Método para pegar todas as despesas do usuário logado
// Método para pegar todas as despesas do usuário logado
async getAll(req: any, res: Response) {
    try {
        // Extrai o userId do objeto req.user (inserido pelo middleware de autenticação)
        const { userId } = req.user; 
        const despesas = await despesaService.getAllByUser(userId);
        
        // Formata as despesas para incluir o mês de referência no retorno
        const despesasComMesReferencia = despesas.map((despesa) => ({
            ...despesa,
            mesReferencia: despesa.mesReferencia ? despesa.mesReferencia.referencia : null,
        }));
        
        res.json(despesasComMesReferencia);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar despesas", error });
    }
}


    // Método para pegar uma despesa por ID (do usuário logado)
    async getById(req: any, res: Response) {
        try {
            const userId = req.userId; // Obtém o ID do usuário do token
            const { id } = req.params;

            const despesa = await despesaService.getById(Number(id), userId);
            if (!despesa) {
                return res.status(404).json({ message: "Despesa não encontrada ou não pertence ao usuário" });
            }

            res.json(despesa);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar despesa", error });
        }
    }

    // Método para criar uma nova despesa (associada ao usuário logado)
    async create(req: any, res: Response) {
        try {
            const userId = req.userId; // Obtém o ID do usuário do token
            const { mesReferencia, descricao, categoria, status, valor, data } = req.body;

            if (!mesReferencia || !descricao || !categoria || !status || !valor || !data) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }

            // Buscar ou criar a entidade MesReferencia
            let mesReferenciaEntity = await mesReferenciaRepository.findOne({
                where: { referencia: mesReferencia },
            });
            if (!mesReferenciaEntity) {
                mesReferenciaEntity = mesReferenciaRepository.create({ referencia: mesReferencia });
                await mesReferenciaRepository.save(mesReferenciaEntity);
            }

            const despesa = await despesaService.create(
                {
                    descricao,
                    categoria,
                    status,
                    valor,
                    data,
                    mesReferencia: mesReferenciaEntity,
                },
                userId
            );

            res.status(201).json(despesa);
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar despesa", error });
        }
    }

    // Método para atualizar uma despesa existente (do usuário logado)
    async update(req: any, res: Response) {
        try {
            const userId = req.userId; // Obtém o ID do usuário do token
            const { id } = req.params;
            const { mesReferencia, descricao, categoria, status, valor, data } = req.body;

            if (!mesReferencia || !descricao || !categoria || !status || !valor || !data) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }

            // Buscar ou criar a entidade MesReferencia
            let mesReferenciaEntity = await mesReferenciaRepository.findOne({
                where: { referencia: mesReferencia },
            });
            if (!mesReferenciaEntity) {
                mesReferenciaEntity = mesReferenciaRepository.create({ referencia: mesReferencia });
                await mesReferenciaRepository.save(mesReferenciaEntity);
            }

            const updatedDespesa = await despesaService.update(
                Number(id),
                {
                    descricao,
                    categoria,
                    status,
                    valor,
                    data,
                    mesReferencia: mesReferenciaEntity,
                },
                userId
            );

            res.json(updatedDespesa);
        } catch (error) {
            res.status(500).json({ message: "Erro ao atualizar despesa", error });
        }
    }

    // Método para deletar uma despesa (do usuário logado)
    async delete(req: any, res: Response) {
        try {
            const userId = req.userId; // Obtém o ID do usuário do token
            const { id } = req.params;

            await despesaService.delete(Number(id), userId);

            res.status(200).json({ message: "Despesa deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar despesa", error });
        }
    }
}
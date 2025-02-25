// src/controllers/ReceitaController.ts
import { Request, Response } from "express";
import { ReceitaService } from "../services/ReceitaService";
import { AppDataSource } from "../data-source";
import { Receita } from "../entities/Receita";
import { MesReferencia } from "../entities/MesReferencia";

const receitaRepository = AppDataSource.getRepository(Receita);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
const receitaService = new ReceitaService(receitaRepository);

export class ReceitaController {
    // Método para pegar todas as receitas do usuário logado
async getAll(req: any, res: Response) {
    try {
        // Extraia o userId do objeto req.user
        const userId = req.user.userId;
        const receitas = await receitaService.getAllByUser(userId);
        console.log(userId)

        // Formata as receitas para incluir o mês de referência no retorno
        const receitasComMesReferencia = receitas.map((receita) => ({
            ...receita,
            mesReferencia: receita.mesReferencia ? receita.mesReferencia.referencia : null,
        }));

        res.json(receitasComMesReferencia);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar receitas", error });
    }
}


    // Método para pegar uma receita por ID (do usuário logado)
    async getById(req: any, res: Response) {
        try {
            const userId = req.userId; // Obtém o ID do usuário do token
            const { id } = req.params;

            const receita = await receitaService.getById(Number(id), userId);
            if (!receita) {
                return res.status(404).json({ message: "Receita não encontrada ou não pertence ao usuário" });
            }

            res.json(receita);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar receita", error });
        }
    }

    // Método para criar uma nova receita (associada ao usuário logado)
    async create(req: any, res: Response) {
        console.log("Create", req.userId)

        try {
            const userId = req.user.userId; // Obtém o ID do usuário do token
            const { mesReferencia, descricao, categoria, status, valorPrevisto,valorRealizado, data } = req.body;
            console.log("Create", userId)

            if (!mesReferencia || !descricao || !categoria || !status || !valorPrevisto || !valorRealizado || !data) {
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

            const receita = await receitaService.create(
                {
                    descricao,
                    categoria,
                    status,
                    valorPrevisto,
                    valorRealizado,
                    data,
                    mesReferencia: mesReferenciaEntity,
                },
                userId
            );

            res.status(201).json(receita);
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar receita", error });
        }
    }

    // Método para atualizar uma receita existente (do usuário logado)
    async update(req: any, res: Response) {
        try {
            const userId = req.user.userId;// Obtém o ID do usuário do token
            const { id } = req.params;
            const { mesReferencia, descricao, categoria, status, valorPrevisto,valorRealizado,data } = req.body;

            if (!mesReferencia || !descricao || !categoria || !status || !valorPrevisto || !valorRealizado|| !data) {
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

            const updatedReceita = await receitaService.update(
                Number(id),
                {
                    descricao,
                    categoria,
                    status,
                    valorPrevisto,
                    valorRealizado,
                    data,
                    mesReferencia: mesReferenciaEntity,
                },
                userId
            );

            res.json(updatedReceita);
        } catch (error) {
            res.status(500).json({ message: "Erro ao atualizar receita", error });
        }
    }

    // Método para deletar uma receita (do usuário logado)
    async delete(req: any, res: Response) {
        try {
            const userId = req.user.userId; // Obtém o ID do usuário do token
            const { id } = req.params;

            await receitaService.delete(Number(id), userId);

            res.status(200).json({ message: "Receita deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar receita", error });
        }
    }
}
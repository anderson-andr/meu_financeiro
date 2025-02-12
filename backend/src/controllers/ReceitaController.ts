import { Request, Response } from "express";

import {ReceitaService} from "../services/ReceitaService"
import { AppDataSource } from "../data-source";
import { Receita } from "../entities/Receita";
import { MesReferencia } from "../entities/MesReferencia";
const receitaRepository = AppDataSource.getRepository(Receita);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);

const receitaService = new ReceitaService(receitaRepository);

export class ReceitaController {
   
    // Método para pegar todas as receitas com o mês de referência
async getAll(req: Request, res: Response) {
    try {
        // Buscando todas as receitas com a relação de mesReferencia
        const receitas = await AppDataSource.getRepository(Receita)
            .createQueryBuilder("receita")
            .leftJoinAndSelect("receita.mesReferencia", "mesReferencia") // Relaciona as receitas com mesReferencia
            .getMany();

        // Formatando as receitas para incluir o mês de referência no retorno
        const receitasComMesReferencia = receitas.map(receita => ({
            ...receita,
            mesReferencia: receita.mesReferencia ? receita.mesReferencia.referencia : null
        }));

        res.json(receitasComMesReferencia);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar receitas", error });
    }
}

    // Método para pegar uma receita por ID
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const receita = await receitaService.getById(Number(id)); // Converte para número
            if (!receita) {
                return res.status(404).json({ message: "Receita não encontrada" });
            }
            res.json(receita);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar receita", error });
        }
    }

    // Método para criar uma nova receita
    async create(req: Request, res: Response) {
        try {
            const { mesReferencia, descricao,categoria, status, valor, data } = req.body;
            if (!mesReferencia || !descricao  || !categoria || !status|| !valor || !data) {
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

            const receita = await receitaService.create({
                descricao,
                categoria,
                status,
                valor,
                data,
                mesReferencia: mesReferenciaEntity // Associa a entidade MesReferencia
            });

            res.status(201).json(receita);
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar receita", error });
        }
    }

    // Método para atualizar uma receita existente
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { mesReferencia, descricao,categoria,status, valor, data } = req.body;

            if (!mesReferencia || !descricao || !categoria || !status|| !valor || !data) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }

            const receita = await receitaService.getById(Number(id)); // Converte para número
            if (!receita) {
                return res.status(404).json({ message: "Receita não encontrada" });
            }

            // Buscar ou criar a entidade MesReferencia
            let mesReferenciaEntity = await mesReferenciaRepository.findOne({
                where: { referencia: mesReferencia }
            });

            if (!mesReferenciaEntity) {
                mesReferenciaEntity = mesReferenciaRepository.create({ referencia: mesReferencia });
                await mesReferenciaRepository.save(mesReferenciaEntity);  // Salva o novo MesReferencia
            }

            const updatedReceita = await receitaService.update(Number(id), {
                descricao,
                categoria,
                status,
                valor,
                data,
                mesReferencia: mesReferenciaEntity
            });

            res.json(updatedReceita);
        } catch (error) {
            res.status(500).json({ message: "Erro ao atualizar receita", error });
        }
    }

    // Método para deletar uma receita
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const receita = await receitaService.getById(Number(id)); // Converte para número
            if (!receita) {
                return res.status(404).json({ message: "Receita não encontrada" });
            }

            await receitaService.delete(Number(id));
            res.status(200).json({ message: "Receita deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar receita", error });
        }
    }
}

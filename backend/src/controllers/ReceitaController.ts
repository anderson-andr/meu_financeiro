// src/controllers/ReceitaController.ts
import { Request, Response } from "express";
import { ReceitaService } from "../services/ReceitaService";
import { AppDataSource } from "../data-source";
import { Receita } from "../entities/Receita";
import { MesReferencia } from "../entities/MesReferencia";
import { In } from "typeorm";


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

   
    async duplicarReceitas(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { mesDestino, receitaIds } = req.body;
    
            console.log("🔎 Recebido:", { mesDestino, receitaIds });
    
            if (!mesDestino || !Array.isArray(receitaIds) || receitaIds.length === 0) {
                return res.status(400).json({ message: "Informe o mês de destino e ao menos uma receita para duplicar" });
            }
    
            // Conversão e validação
            const receitaIdsNumericos = receitaIds
                .map((id: any) => {
                    const parsed = parseInt(id);
                    if (isNaN(parsed)) console.warn("⚠️ ID inválido detectado:", id);
                    return parsed;
                })
                .filter((id: number) => !isNaN(id));
    
            console.log("✅ IDs numéricos filtrados:", receitaIdsNumericos);
    
            if (receitaIdsNumericos.length === 0) {
                return res.status(400).json({ message: "IDs de receita inválidos" });
            }
    
            // Buscar ou criar mês destino
            let mesDestinoEntity = await mesReferenciaRepository.findOne({ where: { referencia: mesDestino } });
            if (!mesDestinoEntity) {
                mesDestinoEntity = mesReferenciaRepository.create({ referencia: mesDestino });
                await mesReferenciaRepository.save(mesDestinoEntity);
            }
    
            console.log("📅 Mês de destino:", mesDestinoEntity);
    
            // Buscar receitas válidas
            const receitasSelecionadas = await receitaRepository.find({
                where: {
                    id: In(receitaIdsNumericos),
                    user: { id: userId },
                },
                relations: ["mesReferencia", "user"],
            });
    
            console.log("📄 Receitas encontradas:", receitasSelecionadas.length);
    
            if (receitasSelecionadas.length === 0) {
                return res.status(404).json({ message: "Nenhuma receita encontrada com os IDs fornecidos" });
            }
    
            // Duplicar receitas
            const receitasDuplicadas = receitasSelecionadas.map((r) => {
             
    
                const duplicada = receitaRepository.create({
                    descricao: r.descricao,
                    categoria: r.categoria,
                    status: r.status,
                    valorPrevisto: r.valorPrevisto,
                    valorRealizado: r.valorRealizado,
                    data: r.data,
                    mesReferencia: mesDestinoEntity,
                    user: r.user,
                });
    
                console.log("🆕 Receita duplicada:", duplicada);
                return duplicada;
            });
    
            await receitaRepository.save(receitasDuplicadas);
    
            return res.status(201).json({ message: "Receitas duplicadas com sucesso", receitas: receitasDuplicadas });
    
        } catch (error) {
            console.error("❌ Erro ao duplicar receitas:", error);
            return res.status(500).json({ message: "Erro ao duplicar receitas", error });
        }
    }
    

    
}
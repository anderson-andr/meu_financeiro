// src/controllers/DespesaController.ts
import { Request, Response } from "express";
import { DespesaService } from "../services/DespesaService";
import { AppDataSource } from "../data-source";
import { Despesa } from "../entities/Despesa";
import { MesReferencia } from "../entities/MesReferencia";
import { AuthUser } from "../types";

const despesaRepository = AppDataSource.getRepository(Despesa);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
const despesaService = new DespesaService(despesaRepository);

export class DespesaController {
    // Método para pegar todas as despesas do usuário logado
// Método para pegar todas as despesas do usuário logado
async getAll(req: any, res: Response, user: AuthUser) {
    try {
        // Extrai o userId do objeto req.user (inserido pelo middleware de autenticação)
        const userId = req.user.userId;
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
    async getById(req: any, res: Response, user: AuthUser) {
        try {
            const userId = req.user.userId;// Obtém o ID do usuário do token
            const { id } = req.params;
            console.log("ID do usuário autenticado:", userId);            

            const despesa = await despesaService.getById(Number(id), userId);
            if (!despesa) {
                return res.status(404).json({ message: "Despesa não encontrada ou não pertence ao usuário" });
            }

            res.json(despesa);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar despesa", error });
        }
    }

    async create(req: any, res: Response) {
        try {
            // Obtém o ID do usuário do token, já presente em req.user pelo authMiddleware
            const user = req.user   // Atribui corretamente o usuário
            if (!user || !user.userId) {
                return res.status(401).json({ message: "Usuário não autenticado ou ID não encontrado" });
            }
    
            const userId = user.userId;  // Pega o ID do usuário do token
            console.log("ID do usuário autenticado:", userId);   // Verificação no console
    
            const { mesReferencia, descricao, categoria, status, valor, data } = req.body;
    
            // Verificação de campos obrigatórios
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
    
            // Criar a despesa e associar ao usuário autenticado (userId)
            const despesa = await despesaService.create(
                {
                    descricao,
                    categoria,
                    status,
                    valor,
                    data,
                    mesReferencia: mesReferenciaEntity,
                },
                userId  // Passa o ID do usuário para o serviço de criação
            );
    
            res.status(201).json(despesa);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao criar despesa", error });
        }
    }
    

    // Método para atualizar uma despesa existente (do usuário logado)
    async update(req: any, res: Response) {
        try {
            const user = req.user
            const { id } = req.params;
            const userId = user.userId // Pegue apenas o ID
            console.log("ID do usuário autenticado:", userId);  
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
            const user = req.user as AuthUser;// Obtém o ID do usuário do token
            const { id } = req.params;
            const userId = user.userId; // Pegue apenas o ID
            console.log("ID do usuário autenticado:", userId);  
            await despesaService.delete(Number(id), userId);

            res.status(200).json({ message: "Despesa deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar despesa", error });
        }
    }
}
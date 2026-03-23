import { Request, Response } from "express";
import { ReceitaService } from "../services/ReceitaService";
import { AppDataSource } from "../data-source";
import { Receita } from "../entities/Receita";
import { MesReferencia } from "../entities/MesReferencia";
import { In } from "typeorm";
import { parseMonthReference } from "../utils/monthReference";

const receitaRepository = AppDataSource.getRepository(Receita);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
const receitaService = new ReceitaService(receitaRepository);

const formatReceita = (receita: any) => ({
    ...receita,
    mes: receita.mesReferencia?.mes ?? null,
    ano: receita.mesReferencia?.ano ?? null,
    mesReferencia: receita.mesReferencia?.referencia ?? null,
});

const resolveMesReferencia = async (input: { mes?: unknown; ano?: unknown; mesReferencia?: unknown }) => {
    const parsed = parseMonthReference(input);

    let entity = await mesReferenciaRepository.findOne({
        where: [
            { referencia: parsed.referencia },
            { mes: parsed.mes, ano: parsed.ano },
        ],
    });

    if (!entity) {
        entity = mesReferenciaRepository.create({
            referencia: parsed.referencia,
            mes: parsed.mes,
            ano: parsed.ano,
        });
        await mesReferenciaRepository.save(entity);
        return entity;
    }

    if (entity.referencia !== parsed.referencia || entity.mes !== parsed.mes || entity.ano !== parsed.ano) {
        entity.referencia = parsed.referencia;
        entity.mes = parsed.mes;
        entity.ano = parsed.ano;
        await mesReferenciaRepository.save(entity);
    }

    return entity;
};

export class ReceitaController {
async getAll(req: any, res: Response) {
    try {
        const userId = req.user.userId;
        const receitas = await receitaService.getAllByUser(userId);
        res.json(receitas.map(formatReceita));
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar receitas", error });
    }
}

    async getById(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const receita = await receitaService.getById(Number(id), userId);
            if (!receita) {
                return res.status(404).json({ message: "Receita não encontrada ou não pertence ao usuário" });
            }

            return res.json(formatReceita(receita));
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar receita", error });
        }
    }

    async create(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { mes, ano, mesReferencia, descricao, categoria, status, valorPrevisto, valorRealizado, data } = req.body;

            if (!descricao || !categoria || !status || valorPrevisto === undefined || valorRealizado === undefined || !data) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }

            const mesReferenciaEntity = await resolveMesReferencia({ mes, ano, mesReferencia });

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

            return res.status(201).json(formatReceita(receita));
        } catch (error) {
            return res.status(500).json({ message: "Erro ao criar receita", error });
        }
    }

    async update(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const { mes, ano, mesReferencia, descricao, categoria, status, valorPrevisto, valorRealizado, data } = req.body;

            if (!descricao || !categoria || !status || valorPrevisto === undefined || valorRealizado === undefined || !data) {
                return res.status(400).json({ message: "Todos os campos são obrigatórios" });
            }

            const mesReferenciaEntity = await resolveMesReferencia({ mes, ano, mesReferencia });

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

            return res.json(formatReceita(updatedReceita));
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar receita", error });
        }
    }

    async delete(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            await receitaService.delete(Number(id), userId);

            return res.status(200).json({ message: "Receita deletada com sucesso" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao deletar receita", error });
        }
    }

    async duplicarReceitas(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { mesDestinoMes, mesDestinoAno, mesDestino, receitaIds } = req.body;

            if ((!mesDestino && (mesDestinoMes === undefined || mesDestinoAno === undefined)) || !Array.isArray(receitaIds) || receitaIds.length === 0) {
                return res.status(400).json({ message: "Informe o mês de destino e ao menos uma receita para duplicar" });
            }

            const receitaIdsNumericos = receitaIds
                .map((id: any) => {
                    const parsed = parseInt(id);
                    return Number.isNaN(parsed) ? null : parsed;
                })
                .filter((id: number | null): id is number => id !== null);

            if (receitaIdsNumericos.length === 0) {
                return res.status(400).json({ message: "IDs de receita inválidos" });
            }

            const mesDestinoEntity = await resolveMesReferencia({
                mes: mesDestinoMes,
                ano: mesDestinoAno,
                mesReferencia: mesDestino,
            });

            const receitasSelecionadas = await receitaRepository.find({
                where: {
                    id: In(receitaIdsNumericos),
                    user: { id: userId },
                },
                relations: ["mesReferencia", "user"],
            });

            if (receitasSelecionadas.length === 0) {
                return res.status(404).json({ message: "Nenhuma receita encontrada com os IDs fornecidos" });
            }

            const receitasDuplicadas = receitasSelecionadas.map((r) =>
                receitaRepository.create({
                    descricao: r.descricao,
                    categoria: r.categoria,
                    status: r.status,
                    valorPrevisto: r.valorPrevisto,
                    valorRealizado: r.valorRealizado,
                    data: r.data,
                    mesReferencia: mesDestinoEntity,
                    user: r.user,
                })
            );

            await receitaRepository.save(receitasDuplicadas);

            return res.status(201).json({
                message: "Receitas duplicadas com sucesso",
                receitas: receitasDuplicadas.map(formatReceita),
            });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao duplicar receitas", error });
        }
    }
}

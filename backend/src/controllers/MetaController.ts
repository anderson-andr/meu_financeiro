import { Response } from "express";
import { AppDataSource } from "../data-source";
import { MetaFinanceira, MetaFinanceiraStatus } from "../entities/MetaFinanceira";
import { MetaService } from "../services/MetaService";

const metaRepository = AppDataSource.getRepository(MetaFinanceira);
const metaService = new MetaService(metaRepository);

const isValidStatus = (status: unknown): status is MetaFinanceiraStatus =>
    typeof status === "string" && Object.values(MetaFinanceiraStatus).includes(status as MetaFinanceiraStatus);

const parseNumber = (value: unknown, fallback?: number): number => {
    if (value === undefined || value === null || value === "") {
        return fallback ?? Number.NaN;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const isValidDate = (value: unknown): value is string => {
    return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
};

export class MetaController {
    async getAll(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const metas = await metaService.getAllByUser(userId);
            res.json(metas);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar metas", error });
        }
    }

    async getById(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const meta = await metaService.getById(Number(req.params.id), userId);

            if (!meta) {
                return res.status(404).json({ message: "Meta não encontrada" });
            }

            return res.json(meta);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar meta", error });
        }
    }

    async create(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { nome, descricao, valorObjetivo, valorInicial, dataInicio, dataLimite, status } = req.body;

            const parsedObjetivo = parseNumber(valorObjetivo);
            const parsedInicial = parseNumber(valorInicial, 0);

            if (!nome || Number.isNaN(parsedObjetivo) || parsedObjetivo <= 0 || Number.isNaN(parsedInicial) || parsedInicial < 0) {
                return res.status(400).json({
                    message: "Informe nome, valor objetivo válido e valor inicial maior ou igual a zero",
                });
            }

            if (!isValidDate(dataInicio) || !isValidDate(dataLimite)) {
                return res.status(400).json({ message: "Informe data de início e data limite válidas" });
            }

            if (new Date(dataLimite).getTime() < new Date(dataInicio).getTime()) {
                return res.status(400).json({ message: "A data limite não pode ser menor que a data de início" });
            }

            if (status !== undefined && !isValidStatus(status)) {
                return res.status(400).json({ message: "Status da meta inválido" });
            }

            const meta = await metaService.create(
                {
                    nome: String(nome),
                    descricao: descricao ? String(descricao) : null,
                    valorObjetivo: parsedObjetivo,
                    valorInicial: parsedInicial,
                    dataInicio,
                    dataLimite,
                    status: status ?? MetaFinanceiraStatus.EM_ANDAMENTO,
                },
                userId
            );

            return res.status(201).json(meta);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao criar meta", error });
        }
    }

    async update(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const { nome, descricao, valorObjetivo, valorInicial, dataInicio, dataLimite, status } = req.body;
            const payload: Partial<MetaFinanceira> = {};

            if (nome !== undefined) {
                if (!String(nome).trim()) {
                    return res.status(400).json({ message: "Nome da meta é obrigatório" });
                }
                payload.nome = String(nome);
            }

            if (descricao !== undefined) {
                payload.descricao = descricao ? String(descricao) : null;
            }

            if (valorObjetivo !== undefined) {
                const parsedObjetivo = parseNumber(valorObjetivo);
                if (Number.isNaN(parsedObjetivo) || parsedObjetivo <= 0) {
                    return res.status(400).json({ message: "Valor objetivo inválido" });
                }
                payload.valorObjetivo = parsedObjetivo;
            }

            if (valorInicial !== undefined) {
                const parsedInicial = parseNumber(valorInicial, 0);
                if (Number.isNaN(parsedInicial) || parsedInicial < 0) {
                    return res.status(400).json({ message: "Valor inicial inválido" });
                }
                payload.valorInicial = parsedInicial;
            }

            if (dataInicio !== undefined) {
                if (!isValidDate(dataInicio)) {
                    return res.status(400).json({ message: "Data de início inválida" });
                }
                payload.dataInicio = dataInicio;
            }

            if (dataLimite !== undefined) {
                if (!isValidDate(dataLimite)) {
                    return res.status(400).json({ message: "Data limite inválida" });
                }
                payload.dataLimite = dataLimite;
            }

            if (status !== undefined) {
                if (!isValidStatus(status)) {
                    return res.status(400).json({ message: "Status da meta inválido" });
                }
                payload.status = status;
            }

            const metaAtual = await metaService.getById(Number(id), userId);
            if (!metaAtual) {
                return res.status(404).json({ message: "Meta não encontrada" });
            }

            const nextStart = payload.dataInicio ?? metaAtual.dataInicio;
            const nextLimit = payload.dataLimite ?? metaAtual.dataLimite;
            if (new Date(nextLimit).getTime() < new Date(nextStart).getTime()) {
                return res.status(400).json({ message: "A data limite não pode ser menor que a data de início" });
            }

            const updatedMeta = await metaService.update(Number(id), payload, userId);
            return res.json(updatedMeta);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar meta", error });
        }
    }

    async delete(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            await metaService.delete(Number(req.params.id), userId);
            return res.status(200).json({ message: "Meta deletada com sucesso" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao deletar meta", error });
        }
    }

    async listAportes(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const meta = await metaService.getById(Number(req.params.id), userId);

            if (!meta) {
                return res.status(404).json({ message: "Meta não encontrada" });
            }

            return res.json(meta.aportes);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar aportes", error });
        }
    }

    async addAporte(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const { valor, data, observacao } = req.body;
            const parsedValor = parseNumber(valor);
            const dataAporte = data ?? new Date().toISOString().slice(0, 10);

            if (Number.isNaN(parsedValor) || parsedValor <= 0) {
                return res.status(400).json({ message: "Informe um valor de aporte válido" });
            }

            if (!isValidDate(dataAporte)) {
                return res.status(400).json({ message: "Informe uma data de aporte válida" });
            }

            const meta = await metaService.addAporte(
                Number(req.params.id),
                {
                    valor: parsedValor,
                    data: dataAporte,
                    observacao: observacao ? String(observacao) : null,
                },
                userId
            );

            return res.status(201).json(meta);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao adicionar aporte", error });
        }
    }

    async removeAporte(req: any, res: Response) {
        try {
            const userId = req.user.userId;
            const meta = await metaService.removeAporte(
                Number(req.params.id),
                Number(req.params.aporteId),
                userId
            );

            return res.json(meta);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao remover aporte", error });
        }
    }
}

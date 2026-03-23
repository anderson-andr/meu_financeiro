import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { MetaAporte } from "../entities/MetaAporte";
import { MetaFinanceira, MetaFinanceiraStatus } from "../entities/MetaFinanceira";
import { User } from "../entities/User";

export interface MetaDetalhada {
    id: number;
    nome: string;
    descricao: string | null;
    valorObjetivo: number;
    valorInicial: number;
    totalAportado: number;
    valorAtual: number;
    valorFaltante: number;
    percentualConcluido: number;
    mesesRestantes: number;
    aporteMensalNecessario: number;
    dataInicio: string;
    dataLimite: string;
    status: MetaFinanceiraStatus;
    aportes: {
        id: number;
        valor: number;
        data: string;
        observacao: string | null;
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export class MetaService {
    private metaRepository: Repository<MetaFinanceira>;
    private aporteRepository: Repository<MetaAporte>;
    private userRepository: Repository<User>;

    constructor(metaRepository: Repository<MetaFinanceira>) {
        this.metaRepository = metaRepository;
        this.aporteRepository = AppDataSource.getRepository(MetaAporte);
        this.userRepository = AppDataSource.getRepository(User);
    }

    async getAllByUser(userId: number): Promise<MetaDetalhada[]> {
        const metas = await this.metaRepository.find({
            where: { user: { id: userId } },
            relations: ["aportes"],
            order: { dataLimite: "ASC", createdAt: "DESC" },
        });

        return Promise.all(metas.map((meta) => this.serializeMeta(meta)));
    }

    async getById(id: number, userId: number): Promise<MetaDetalhada | null> {
        const meta = await this.metaRepository.findOne({
            where: { id, user: { id: userId } },
            relations: ["aportes"],
        });

        if (!meta) {
            return null;
        }

        return this.serializeMeta(meta);
    }

    async create(data: Partial<MetaFinanceira>, userId: number): Promise<MetaDetalhada> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const meta = this.metaRepository.create({
            ...data,
            user,
        });

        const savedMeta = await this.metaRepository.save(meta);
        await this.syncStatus(savedMeta.id, userId);

        const saved = await this.findMetaOrFail(savedMeta.id, userId);
        return this.serializeMeta(saved);
    }

    async update(id: number, data: Partial<MetaFinanceira>, userId: number): Promise<MetaDetalhada> {
        const meta = await this.findMetaOrFail(id, userId);

        this.metaRepository.merge(meta, data);
        await this.metaRepository.save(meta);
        await this.syncStatus(id, userId);

        const updated = await this.findMetaOrFail(id, userId);
        return this.serializeMeta(updated);
    }

    async delete(id: number, userId: number): Promise<void> {
        const meta = await this.findMetaOrFail(id, userId);
        await this.metaRepository.remove(meta);
    }

    async addAporte(
        metaId: number,
        aporteData: { valor: number; data: string; observacao?: string | null },
        userId: number
    ): Promise<MetaDetalhada> {
        const meta = await this.findMetaOrFail(metaId, userId);

        const aporte = this.aporteRepository.create({
            meta,
            valor: aporteData.valor,
            data: aporteData.data,
            observacao: aporteData.observacao ?? null,
        });

        await this.aporteRepository.save(aporte);
        await this.syncStatus(metaId, userId);

        const updated = await this.findMetaOrFail(metaId, userId);
        return this.serializeMeta(updated);
    }

    async removeAporte(metaId: number, aporteId: number, userId: number): Promise<MetaDetalhada> {
        const meta = await this.findMetaOrFail(metaId, userId);
        const aporte = await this.aporteRepository.findOne({
            where: { id: aporteId, meta: { id: meta.id } },
            relations: ["meta"],
        });

        if (!aporte) {
            throw new Error("Aporte não encontrado para esta meta");
        }

        await this.aporteRepository.remove(aporte);
        await this.syncStatus(metaId, userId);

        const updated = await this.findMetaOrFail(metaId, userId);
        return this.serializeMeta(updated);
    }

    private async findMetaOrFail(id: number, userId: number): Promise<MetaFinanceira> {
        const meta = await this.metaRepository.findOne({
            where: { id, user: { id: userId } },
            relations: ["aportes"],
        });

        if (!meta) {
            throw new Error("Meta não encontrada ou não pertence ao usuário");
        }

        return meta;
    }

    private async syncStatus(metaId: number, userId: number): Promise<void> {
        const meta = await this.findMetaOrFail(metaId, userId);
        if (meta.status === MetaFinanceiraStatus.CANCELADA) {
            return;
        }

        const { valorAtual, valorObjetivo } = this.calculateNumbers(meta);
        const nextStatus = valorAtual >= valorObjetivo
            ? MetaFinanceiraStatus.CONCLUIDA
            : MetaFinanceiraStatus.EM_ANDAMENTO;

        if (meta.status !== nextStatus) {
            meta.status = nextStatus;
            await this.metaRepository.save(meta);
        }
    }

    private async serializeMeta(meta: MetaFinanceira): Promise<MetaDetalhada> {
        const { valorObjetivo, valorInicial, totalAportado, valorAtual, valorFaltante, percentualConcluido } =
            this.calculateNumbers(meta);

        const mesesRestantes = this.calculateRemainingMonths(meta.dataLimite);
        const aporteMensalNecessario = valorFaltante <= 0 ? 0 : this.roundCurrency(valorFaltante / mesesRestantes);
        const status = meta.status === MetaFinanceiraStatus.CANCELADA
            ? MetaFinanceiraStatus.CANCELADA
            : valorAtual >= valorObjetivo
                ? MetaFinanceiraStatus.CONCLUIDA
                : MetaFinanceiraStatus.EM_ANDAMENTO;

        const aportes = [...(meta.aportes ?? [])]
            .sort((a, b) => {
                const first = new Date(b.data).getTime() - new Date(a.data).getTime();
                if (first !== 0) {
                    return first;
                }

                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((aporte) => ({
                id: aporte.id,
                valor: this.toNumber(aporte.valor),
                data: aporte.data,
                observacao: aporte.observacao ?? null,
                createdAt: aporte.createdAt,
            }));

        return {
            id: meta.id,
            nome: meta.nome,
            descricao: meta.descricao ?? null,
            valorObjetivo,
            valorInicial,
            totalAportado,
            valorAtual,
            valorFaltante,
            percentualConcluido,
            mesesRestantes,
            aporteMensalNecessario,
            dataInicio: meta.dataInicio,
            dataLimite: meta.dataLimite,
            status,
            aportes,
            createdAt: meta.createdAt,
            updatedAt: meta.updatedAt,
        };
    }

    private calculateNumbers(meta: MetaFinanceira) {
        const valorObjetivo = this.toNumber(meta.valorObjetivo);
        const valorInicial = this.toNumber(meta.valorInicial);
        const totalAportado = this.roundCurrency(
            (meta.aportes ?? []).reduce((total, aporte) => total + this.toNumber(aporte.valor), 0)
        );
        const valorAtual = this.roundCurrency(valorInicial + totalAportado);
        const valorFaltante = this.roundCurrency(Math.max(valorObjetivo - valorAtual, 0));
        const percentualConcluido = valorObjetivo <= 0
            ? 0
            : this.roundCurrency(Math.min((valorAtual / valorObjetivo) * 100, 100));

        return {
            valorObjetivo,
            valorInicial,
            totalAportado,
            valorAtual,
            valorFaltante,
            percentualConcluido,
        };
    }

    private calculateRemainingMonths(dataLimite: string): number {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const targetDate = new Date(dataLimite);
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
        const diff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth) + 1;

        return Math.max(diff, 1);
    }

    private toNumber(value: unknown): number {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private roundCurrency(value: number): number {
        return Math.round(value * 100) / 100;
    }
}

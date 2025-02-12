// ReportService.ts
import { Repository } from "typeorm";
import { Receita } from "../entities/Receita";
import { Despesa } from "../entities/Despesa";
import { MonthlyReport, AnalyticalMonthlyReport } from "../entities/Report";

export class ReportService {
    constructor(
        private receitaRepository: Repository<Receita>,
        private despesaRepository: Repository<Despesa>
    ) {}

    // Método para gerar relatórios consolidados mensais
    public async generateMonthlyReports(): Promise<MonthlyReport[]> {
        // Buscar todas as receitas e despesas ordenadas pelo mês de referência
        const allReceitas = await this.receitaRepository.find({
            order: { mesReferencia: { referencia: "ASC" } },
            relations: ["mesReferencia"]
        });

        const allDespesas = await this.despesaRepository.find({
            order: { mesReferencia: { referencia: "ASC" } },
            relations: ["mesReferencia"]
        });

        // Obter todos os meses únicos (de receitas e despesas)
        const uniqueMeses = Array.from(
            new Set([
                ...allReceitas.map((r) => r.mesReferencia.referencia),
                ...allDespesas.map((d) => d.mesReferencia.referencia)
            ])
        );

        // Ordenar os meses em ordem crescente (do mais antigo para o mais recente)
        const sortedMeses = uniqueMeses.sort((a, b) => {
            const [mesA, anoA] = a.split("-").map(Number);
            const [mesB, anoB] = b.split("-").map(Number);
            const dataA = anoA * 100 + mesA; // Converte MM-YYYY para YYYYMM
            const dataB = anoB * 100 + mesB; // Converte MM-YYYY para YYYYMM
            return dataA - dataB; // Ordenação crescente
        });

        const reports: MonthlyReport[] = [];
        let saldoAcumulado = 0;

        // Gerar relatórios para cada mês
        for (const mesReferencia of sortedMeses) {
            const receitasDoMes = allReceitas.filter(
                (r) => r.mesReferencia.referencia === mesReferencia
            );
            const despesasDoMes = allDespesas.filter(
                (d) => d.mesReferencia.referencia === mesReferencia
            );

            // Converter valores para números antes de somar
            const receitasTotais = receitasDoMes.reduce((sum, r) => sum + Number(r.valor), 0);
            const despesasTotais = despesasDoMes.reduce((sum, d) => sum + Number(d.valor), 0);

            const saldoInicial = saldoAcumulado;
            const saldoFinal = saldoInicial + receitasTotais - despesasTotais;

            saldoAcumulado = saldoFinal;

            reports.push({
                mesReferencia,
                saldoInicial,
                receitasTotais,
                despesasTotais,
                saldoFinal
            });
        }

        return reports;
    }

    // Método para gerar relatórios analíticos mensais
    public async generateAnalyticalMonthlyReports(): Promise<AnalyticalMonthlyReport[]> {
        // Buscar todas as receitas e despesas ordenadas pelo mês de referência
        const allReceitas = await this.receitaRepository.find({
            order: { mesReferencia: { referencia: "ASC" } },
            relations: ["mesReferencia"]
        });

        const allDespesas = await this.despesaRepository.find({
            order: { mesReferencia: { referencia: "ASC" } },
            relations: ["mesReferencia"]
        });

        // Obter todos os meses únicos (de receitas e despesas)
        const uniqueMeses = Array.from(
            new Set([
                ...allReceitas.map((r) => r.mesReferencia.referencia),
                ...allDespesas.map((d) => d.mesReferencia.referencia)
            ])
        );

        // Ordenar os meses em ordem crescente (do mais antigo para o mais recente)
        const sortedMeses = uniqueMeses.sort((a, b) => {
            const [mesA, anoA] = a.split("-").map(Number);
            const [mesB, anoB] = b.split("-").map(Number);
            const dataA = anoA * 100 + mesA; // Converte MM-YYYY para YYYYMM
            const dataB = anoB * 100 + mesB; // Converte MM-YYYY para YYYYMM
            return dataA - dataB; // Ordenação crescente
        });

        const reports: AnalyticalMonthlyReport[] = [];
        let saldoAcumulado = 0;

        // Gerar relatórios para cada mês
        for (const mesReferencia of sortedMeses) {
            const receitasDoMes = allReceitas.filter(
                (r) => r.mesReferencia.referencia === mesReferencia
            );
            const despesasDoMes = allDespesas.filter(
                (d) => d.mesReferencia.referencia === mesReferencia
            );

            // Calcular totais de receitas e despesas
            const receitasTotais = receitasDoMes.reduce((sum, r) => sum + Number(r.valor), 0);
            const despesasTotais = despesasDoMes.reduce((sum, d) => sum + Number(d.valor), 0);

            // Calcular saldo inicial e final
            const saldoInicial = saldoAcumulado;
            const saldoFinal = saldoInicial + receitasTotais - despesasTotais;

            // Atualizar saldo acumulado
            saldoAcumulado = saldoFinal;

            // Adicionar relatório analítico ao array
            reports.push({
                mesReferencia,
                saldoInicial,
                saldoFinal,
                receitas: receitasDoMes,
                despesas: despesasDoMes
            });
        }

        return reports;
    }
}
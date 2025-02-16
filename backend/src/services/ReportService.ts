import { AnalyticalMonthlyReport2 } from './../entities/Report';
// ReportService.ts
import { Repository } from "typeorm";
import { Receita } from "../entities/Receita";
import { Despesa } from "../entities/Despesa";
import { MonthlyReport, MonthlyReport2, AnalyticalMonthlyReport,AnalyticalItem} from "../entities/Report";

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

    // Método para gerar relatórios consolidados mensais com previsto e realizado
    public async generateMonthlyReports2(): Promise<MonthlyReport2[]> {
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

        const reports: MonthlyReport2[] = [];
        let saldoAcumulado = 0;

        // Gerar relatórios para cada mês
        for (const mesReferencia of sortedMeses) {
            const receitasDoMes = allReceitas.filter(
                (r) => r.mesReferencia.referencia === mesReferencia
            );
            const despesasDoMes = allDespesas.filter(
                (d) => d.mesReferencia.referencia === mesReferencia
            );

            // Separar valores previstos e realizados
            const receitasPrevistas = receitasDoMes.filter((r) => r.status === "previsto");
            const receitasRealizadas = receitasDoMes.filter((r) => r.status === "realizado");
            const despesasPrevistas = despesasDoMes.filter((d) => d.status === "previsto");
            const despesasRealizadas = despesasDoMes.filter((d) => d.status === "realizado");

            // Calcular totais previstos e realizados
            const receitasTotaisPrevistas = receitasPrevistas.reduce((sum, r) => sum + Number(r.valor), 0);
            const receitasTotaisRealizadas = receitasRealizadas.reduce((sum, r) => sum + Number(r.valor), 0);
            const despesasTotaisPrevistas = despesasPrevistas.reduce((sum, d) => sum + Number(d.valor), 0);
            const despesasTotaisRealizadas = despesasRealizadas.reduce((sum, d) => sum + Number(d.valor), 0);

            // Calcular saldo inicial, final e acumulado
            const saldoInicial = saldoAcumulado;
            const saldoFinal = saldoInicial + receitasTotaisRealizadas - despesasTotaisRealizadas;
            saldoAcumulado = saldoFinal;

            // Adicionar o relatório consolidado ao array
            reports.push({
                mesReferencia,
                saldoInicial,
                receitasTotaisPrevistas,
                receitasTotaisRealizadas,
                despesasTotaisPrevistas,
                despesasTotaisRealizadas,
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

    // Método para gerar relatórios analíticos mensais
public async generateAnalyticalMonthlyReports2(): Promise<AnalyticalMonthlyReport2[]> {
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

    const reports: AnalyticalMonthlyReport2[] = [];
    let saldoAcumulado = 0;

    // Gerar relatórios para cada mês
    for (const mesReferencia of sortedMeses) {
        const receitasDoMes = allReceitas.filter(
            (r) => r.mesReferencia.referencia === mesReferencia
        );
        const despesasDoMes = allDespesas.filter(
            (d) => d.mesReferencia.referencia === mesReferencia
        );

        // Processar receitas
        const receitasAnaliticas: AnalyticalItem[] = receitasDoMes.map((receita) => {
            const valorPrevisto = receita.status === "previsto" ? Number(receita.valor) : 0;
            const valorRealizado = receita.status === "realizado" ? Number(receita.valor) : 0;
            const diferenca = valorRealizado - valorPrevisto;

            return {
                id: receita.id,
                descricao: receita.descricao,
                categoria: receita.categoria,
                valorPrevisto,
                valorRealizado,
                diferenca
            };
        });

        // Processar despesas
        const despesasAnaliticas: AnalyticalItem[] = despesasDoMes.map((despesa) => {
            const valorPrevisto = despesa.status === "previsto" ? Number(despesa.valor) : 0;
            const valorRealizado = despesa.status === "realizado" ? Number(despesa.valor) : 0;
            const diferenca = valorRealizado - valorPrevisto;

            return {
                id: despesa.id,
                descricao: despesa.descricao,
                categoria: despesa.categoria,
                valorPrevisto,
                valorRealizado,
                diferenca
            };
        });

        // Calcular totais de receitas e despesas
        const receitasTotais = receitasAnaliticas.reduce((sum, r) => sum + r.valorRealizado, 0);
        const despesasTotais = despesasAnaliticas.reduce((sum, d) => sum + d.valorRealizado, 0);

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
            receitas: receitasAnaliticas,
            despesas: despesasAnaliticas
        });
    }

    return reports;
}

    
}
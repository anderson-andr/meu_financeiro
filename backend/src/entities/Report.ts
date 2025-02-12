import { Despesa } from "./Despesa";
import { Receita } from "./Receita";

// Report.ts
export interface MonthlyReport {
    mesReferencia: string; // Mês de referência (MM-YYYY)
    saldoInicial: number;  // Saldo inicial do mês
    receitasTotais: number; // Total de receitas no mês
    despesasTotais: number; // Total de despesas no mês
    saldoFinal: number;     // Saldo final do mês
}

export interface AnalyticalMonthlyReport {
    mesReferencia: string;
    saldoInicial: number;
    saldoFinal: number;
    receitas: Receita[];
    despesas: Despesa[];
  }
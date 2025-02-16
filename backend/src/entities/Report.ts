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

export interface MonthlyReport2 {
    mesReferencia: string;
    saldoInicial: number;
    receitasTotaisPrevistas: number;
    receitasTotaisRealizadas: number;
    despesasTotaisPrevistas: number;
    despesasTotaisRealizadas: number;
    saldoFinal: number;
}

export interface AnalyticalMonthlyReport {
    mesReferencia: string;
    saldoInicial: number;
    saldoFinal: number;
    receitas: Receita[];
    despesas: Despesa[];
  }


  export interface AnalyticalMonthlyReport2 {
    mesReferencia: string;
    saldoInicial: number;
    saldoFinal: number;
    receitas: AnalyticalItem[]; // Lista de receitas do mês (tipo AnalyticalItem)
    despesas: AnalyticalItem[];
  }

// Definição da interface AnalyticalItem
export interface AnalyticalItem {
    id: number; // ID do item
    descricao: string; // Descrição do item
    categoria: string; // Categoria do item
    valorPrevisto: number; // Valor previsto
    valorRealizado: number; // Valor realizado
    diferenca: number; // Diferença entre o valor realizado e o previsto
}

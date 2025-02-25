import { Repository } from "typeorm";
import { Receita } from "../entities/Receita";
import { Despesa } from "../entities/Despesa";
import {
  MonthlyReport,
  MonthlyReport2,
  AnalyticalMonthlyReport,
  AnalyticalMonthlyReport2,
  AnalyticalItem,
} from "../entities/Report";

export class ReportService {
  constructor(
    private receitaRepository: Repository<Receita>,
    private despesaRepository: Repository<Despesa>
  ) {}
  // Método para gerar relatórios consolidados mensais (ajustado para o usuário logado)
public async generateMonthlyReports(userId: number): Promise<MonthlyReport[]> {
  // Buscar todas as receitas e despesas ordenadas pelo mês de referência
  const allReceitas = await this.receitaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  const allDespesas = await this.despesaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  // Obter todos os meses únicos (de receitas e despesas)
  const uniqueMeses = Array.from(
      new Set([
          ...allReceitas.map((r) => r.mesReferencia.referencia),
          ...allDespesas.map((d) => d.mesReferencia.referencia),
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
      const receitasDoMes = allReceitas.filter((r) => r.mesReferencia.referencia === mesReferencia);
      const despesasDoMes = allDespesas.filter((d) => d.mesReferencia.referencia === mesReferencia);

      // Calcular totais previstos e realizados usando os novos campos
      const receitasTotaisPrevistas = receitasDoMes.reduce((sum, r) => sum + Number(r.valorPrevisto || 0), 0);
      const receitasTotaisRealizadas = receitasDoMes.reduce((sum, r) => sum + Number(r.valorRealizado || 0), 0);
      const despesasTotaisPrevistas = despesasDoMes.reduce((sum, d) => sum + Number(d.valorPrevisto || 0), 0);
      const despesasTotaisRealizadas = despesasDoMes.reduce((sum, d) => sum + Number(d.valorRealizado || 0), 0);

      // Calcular saldo inicial, final e acumulado com base nos valores realizados
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
          saldoFinal,
      });
  }

  return reports;
}

// Método para gerar relatórios consolidados mensais com previsto e realizado (ajustado para o usuário logado)
public async generateMonthlyReports2(userId: number): Promise<MonthlyReport2[]> {
  // Buscar todas as receitas e despesas ordenadas pelo mês de referência
  const allReceitas = await this.receitaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  const allDespesas = await this.despesaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  // Obter todos os meses únicos (de receitas e despesas)
  const uniqueMeses = Array.from(
      new Set([
          ...allReceitas.map((r) => r.mesReferencia.referencia),
          ...allDespesas.map((d) => d.mesReferencia.referencia),
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
      const receitasDoMes = allReceitas.filter((r) => r.mesReferencia.referencia === mesReferencia);
      const despesasDoMes = allDespesas.filter((d) => d.mesReferencia.referencia === mesReferencia);

      // Calcular totais previstos e realizados usando os novos campos
      const receitasTotaisPrevistas = receitasDoMes.reduce((sum, r) => sum + Number(r.valorPrevisto || 0), 0);
      const receitasTotaisRealizadas = receitasDoMes.reduce((sum, r) => sum + Number(r.valorRealizado || 0), 0);
      const despesasTotaisPrevistas = despesasDoMes.reduce((sum, d) => sum + Number(d.valorPrevisto || 0), 0);
      const despesasTotaisRealizadas = despesasDoMes.reduce((sum, d) => sum + Number(d.valorRealizado || 0), 0);

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
          saldoFinal,
      });
  }

  return reports;
}

// Método para gerar relatórios analíticos mensais (ajustado para o usuário logado)
public async generateAnalyticalMonthlyReports(userId: number): Promise<AnalyticalMonthlyReport[]> {
  // Buscar todas as receitas e despesas ordenadas pelo mês de referência
  const allReceitas = await this.receitaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  const allDespesas = await this.despesaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  // Obter todos os meses únicos (de receitas e despesas)
  const uniqueMeses = Array.from(
      new Set([
          ...allReceitas.map((r) => r.mesReferencia.referencia),
          ...allDespesas.map((d) => d.mesReferencia.referencia),
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
      const receitasDoMes = allReceitas.filter((r) => r.mesReferencia.referencia === mesReferencia);
      const despesasDoMes = allDespesas.filter((d) => d.mesReferencia.referencia === mesReferencia);

      // Calcular totais previstos e realizados usando os novos campos
      const receitasTotaisPrevistas = receitasDoMes.reduce((sum, r) => sum + Number(r.valorPrevisto || 0), 0);
      const receitasTotaisRealizadas = receitasDoMes.reduce((sum, r) => sum + Number(r.valorRealizado || 0), 0);
      const despesasTotaisPrevistas = despesasDoMes.reduce((sum, d) => sum + Number(d.valorPrevisto || 0), 0);
      const despesasTotaisRealizadas = despesasDoMes.reduce((sum, d) => sum + Number(d.valorRealizado || 0), 0);

      // Calcular saldo inicial, final e acumulado com base nos valores realizados
      const saldoInicial = saldoAcumulado;
      const saldoFinal = saldoInicial + receitasTotaisRealizadas - despesasTotaisRealizadas;
      saldoAcumulado = saldoFinal;

      // Adicionar relatório analítico ao array
      reports.push({
          mesReferencia,
          saldoInicial,
          saldoFinal,
          receitas: receitasDoMes,
          despesas: despesasDoMes,
          receitasTotaisPrevistas,
          receitasTotaisRealizadas,
          despesasTotaisPrevistas,
          despesasTotaisRealizadas,
      });
  }

  return reports;
}
// Método para gerar relatórios analíticos mensais (ajustado para o usuário logado)
public async generateAnalyticalMonthlyReports2(userId: number): Promise<AnalyticalMonthlyReport2[]> {
  // Buscar todas as receitas e despesas ordenadas pelo mês de referência
  const allReceitas = await this.receitaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  const allDespesas = await this.despesaRepository.find({
      where: { user: { id: userId } },
      order: { mesReferencia: { referencia: "ASC" } },
      relations: ["mesReferencia", "user"],
  });

  // Obter todos os meses únicos (de receitas e despesas)
  const uniqueMeses = Array.from(
      new Set([
          ...allReceitas.map((r) => r.mesReferencia.referencia),
          ...allDespesas.map((d) => d.mesReferencia.referencia),
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
      const receitasDoMes = allReceitas.filter((r) => r.mesReferencia.referencia === mesReferencia);
      const despesasDoMes = allDespesas.filter((d) => d.mesReferencia.referencia === mesReferencia);

      // Processar receitas
      const receitasAnaliticas: AnalyticalItem[] = receitasDoMes.map((receita) => ({
          id: receita.id,
          descricao: receita.descricao,
          categoria: receita.categoria,
          valorPrevisto: Number(receita.valorPrevisto || 0),
          valorRealizado: Number(receita.valorRealizado || 0),
          diferenca: (Number(receita.valorRealizado || 0) - Number(receita.valorPrevisto || 0)),
      }));

      // Processar despesas
      const despesasAnaliticas: AnalyticalItem[] = despesasDoMes.map((despesa) => ({
          id: despesa.id,
          descricao: despesa.descricao,
          categoria: despesa.categoria,
          valorPrevisto: Number(despesa.valorPrevisto || 0),
          valorRealizado: Number(despesa.valorRealizado || 0),
          diferenca: (Number(despesa.valorRealizado || 0) - Number(despesa.valorPrevisto || 0)),
      }));

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
          despesas: despesasAnaliticas,
      });
  }

  return reports;
}

}
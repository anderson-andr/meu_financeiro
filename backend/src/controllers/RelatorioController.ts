import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { MesReferencia } from "../entities/MesReferencia";
import { Receita, ReceitaStatus } from "../entities/Receita";
import { Despesa, DespesaStatus } from "../entities/Despesa";

import { ReportService } from "../services/ReportService";


const receitaRepository = AppDataSource.getRepository(Receita);
const despesaRepository = AppDataSource.getRepository(Despesa);

const reportService = new ReportService(receitaRepository, despesaRepository);

export class RelatorioController {
    // Método para gerar o relatório geral mensal
   /* async getRelatorioMensal(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;

        try {
            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "despesas"]
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            const totalReceitas = mesReferencia.receitas.reduce((acc, receita) => acc + (Number(receita.valor) || 0), 0);
            const totalDespesas = mesReferencia.despesas.reduce((acc, despesa) => acc + (Number(despesa.valor) || 0), 0);
            const saldo = totalReceitas - totalDespesas;

            res.json({
                mesReferencia: mesReferencia.referencia,
                totalReceitas,
                totalDespesas,
                saldo,
                receitas: mesReferencia.receitas,
                despesas: mesReferencia.despesas
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório", error });
        }
    }
*/
    // Método para gerar o relatório mensal por categoria
    async getRelatorioMensalPorCategoria(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes; // Parâmetro "mes" da rota

        try {
            // Busca o mês de referência com suas receitas e despesas associadas
            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "despesas"]
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            // Agrupando receitas e despesas por categoria
            const receitasPorCategoria = mesReferencia.receitas.reduce((acc, receita) => {
                const categoria = receita.categoria || "Sem categoria";
                if (!acc[categoria]) {
                    acc[categoria] = 0;
                }
                acc[categoria] += Number(receita.valor) || 0;
                return acc;
            }, {} as Record<string, number>);

            const despesasPorCategoria = mesReferencia.despesas.reduce((acc, despesa) => {
                const categoria = despesa.categoria || "Sem categoria";
                if (!acc[categoria]) {
                    acc[categoria] = 0;
                }
                acc[categoria] += Number(despesa.valor) || 0;
                return acc;
            }, {} as Record<string, number>);

            // Retornando o relatório por categoria
            res.json({
                mesReferencia: mesReferencia.referencia,
                receitasPorCategoria,
                despesasPorCategoria
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório por categoria", error });
        }
    }



    // Método para gerar o relatório filtrado por mês e categoria
    async getRelatorioPorMesECategoria(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const categoria = req.params.categoria;

        try {
            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "despesas"]
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "do" });
            }

            // Filtrando as receitas e despesas pela categoria
            const receitasPorCategoria = mesReferencia.receitas.filter((receita) => receita.categoria === categoria);
            const despesasPorCategoria = mesReferencia.despesas.filter((despesa) => despesa.categoria === categoria);

            const totalReceitas = receitasPorCategoria.reduce((acc, receita) => acc + (Number(receita.valor) || 0), 0);
            const totalDespesas = despesasPorCategoria.reduce((acc, despesa) => acc + (Number(despesa.valor) || 0), 0);
            const saldo = totalReceitas - totalDespesas;

            res.json({
                mesReferencia: mesReferencia.referencia,
                categoria,
                totalReceitas,
                totalDespesas,
                saldo,
                receitas: receitasPorCategoria,
                despesas: despesasPorCategoria
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório por mês e categoria", error });
        }
    }

// Método para gerar o relatório de receitas por categoria e mês
async getRelatorioReceitasPorCategoria(req: Request, res: Response) {
    const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
    const mes = req.params.mes;
    const categoria = req.params.categoria.toLowerCase(); // Garantir a comparação case-insensitive
    try {
        const mesReferencia = await mesReferenciaRepository.findOne({
            where: { referencia: mes },
            relations: ["receitas"]
        });
        if (!mesReferencia) {
            return res.status(404).json({ message: "dcontrado" });
        }
        // Filtrando as receitas pela categoria
        const receitasPorCategoria = mesReferencia.receitas.filter(
            (receita) => receita.categoria?.toLowerCase() === categoria
        );
        const totalReceitas = receitasPorCategoria.reduce(
            (acc, receita) => acc + (Number(receita.valor) || 0),
            0
        );
        res.json({
            mesReferencia: mesReferencia.referencia,
            categoria,
            totalReceitas,
            receitas: receitasPorCategoria
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao gerar relatório de receitas por categoria", error });
    }
}

// Método para gerar o relatório de despesas por categoria e mês
async getRelatorioDespesasPorCategoria(req: Request, res: Response) {
    const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
    const mes = req.params.mes;
    const categoria = req.params.categoria.toLowerCase(); // Garantir a comparação case-insensitive
    try {
        const mesReferencia = await mesReferenciaRepository.findOne({
            where: { referencia: mes },
            relations: ["despesas"]
        });
        if (!mesReferencia) {
            return res.status(404).json({ message: "Mês de rdencontrado" });
        }
        // Filtrando as despesas pela categoria
        const despesasPorCategoria = mesReferencia.despesas.filter(
            (despesa) => despesa.categoria?.toLowerCase() === categoria
        );
        const totalDespesas = despesasPorCategoria.reduce(
            (acc, despesa) => acc + (Number(despesa.valor) || 0),
            0
        );
        res.json({
            mesReferencia: mesReferencia.referencia,
            categoria,
            totalDespesas,
            despesas: despesasPorCategoria
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao gerar relatório de despesas por categoria", error });
    }
}

// Método para gerar o relatório geral de receitas por mês
async getRelatorioGeralReceitas(req: Request, res: Response) {
    const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
    const mes = req.params.mes;
    try {
        const mesReferencia = await mesReferenciaRepository.findOne({
            where: { referencia: mes },
            relations: ["receitas"]
        });
        if (!mesReferencia) {
            return res.status(404).json({ message: "Mês de refdão encontrado" });
        }
        // Calculando o total de receitas
        const totalReceitas = mesReferencia.receitas.reduce(
            (acc, receita) => acc + (Number(receita.valor) || 0),
            0
        );
        res.json({
            mesReferencia: mesReferencia.referencia,
            totalReceitas,
            receitas: mesReferencia.receitas
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao gerar relatório de receitas", error });
    }
}

async getRelatorioGeralDespesas(req: Request, res: Response) {
    const despesaRepository = AppDataSource.getRepository(Despesa); // Usando o repositório de Despesa
    const mes = req.params.mes;

    try {
        console.log("Mês recebido:", mes); // Log para depurar o parâmetro recebido

        // Busca todas as despesas associadas ao mês de referência
        const despesas = await despesaRepository.find({
            where: { mesReferencia: { referencia: mes } }, // Faz o JOIN com MesReferencia
            relations: ["mesReferencia"] // Carrega os dados do mês de referência
        });

        console.log("Despesas encontradas:", despesas); // Log para depurar as despesas retornadas

        if (despesas.length === 0) {
            return res.status(404).json({ message: "Nenhuma despesa encontrada para o mês especificado" });
        }

        // Calcula o total de despesas
        const totalDespesas = despesas.reduce(
            (acc, despesa) => acc + (Number(despesa.valor) || 0),
            0
        );

        console.log("Total de despesas calculado:", totalDespesas); // Log para depurar o cálculo do total

        // Retorna o relatório formatado
        res.json({
            mesReferencia: mes,
            totalDespesas,
            despesas: despesas.map((despesa) => ({
                id: despesa.id,
                descricao: despesa.descricao,
                valor: Number(despesa.valor), // Garante que o valor seja um número
                status: despesa.status,
                categoria: despesa.categoria,
                mesReferencia: despesa.mesReferencia?.referencia || "Não informado" // Inclui o mês de referência
            }))
        });
    } catch (error) {
        console.error("Erro ao gerar relatório de despesas:", error); // Log para depurar erros
        res.status(500).json({ message: "Erro ao gerar relatório de despesas", error });
    }
}

async getRelatorioMensal(req: Request, res: Response) {
    const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
    const mes = req.params.mes; 
    const status = req.params.status; // Pode ser "previsto" ou "realizado"

    try {
        // Busca o mês de referência com receitas e despesas
        const mesReferencia = await mesReferenciaRepository.findOne({
            where: { referencia: mes },
            relations: ["receitas", "despesas"]
        });

        if (!mesReferencia) {
            return res.status(404).json({ message: "Mês dedão encontrado" });
        }

        // Filtros por status
        const receitasFiltradas = status
            ? mesReferencia.receitas.filter(r => r.status === status)
            : mesReferencia.receitas;

        const despesasFiltradas = status
            ? mesReferencia.despesas.filter(d => d.status === status)
            : mesReferencia.despesas;

        // Totais previsto e realizado
        const totalReceitasPrevisto = mesReferencia.receitas
            .filter(r => r.status === "previsto")
            .reduce((acc, r) => acc + Number(r.valor), 0);

        const totalDespesasPrevisto = mesReferencia.despesas
            .filter(d => d.status === "previsto")
            .reduce((acc, d) => acc + Number(d.valor), 0);

        const totalReceitasRealizado = mesReferencia.receitas
            .filter(r => r.status === "realizado")
            .reduce((acc, r) => acc + Number(r.valor), 0);

        const totalDespesasRealizado = mesReferencia.despesas
            .filter(d => d.status === "realizado")
            .reduce((acc, d) => acc + Number(d.valor), 0);

        // Cálculo do saldo: só considera os valores realizados
        const saldo = totalReceitasRealizado - totalDespesasRealizado;

        // Retorno formatado
        res.json({
            mesReferencia: mesReferencia.referencia,
            totalReceitasPrevisto,
            totalDespesasPrevisto,
            totalReceitasRealizado,
            totalDespesasRealizado,
            saldo,
            receitas: receitasFiltradas,
            despesas: despesasFiltradas
        });

    } catch (error) {
        res.status(500).json({ message: "Erro ao gerar relatório", error });
    }
}

async getRelatorioAnalitico(req: Request, res: Response) {
    try {
        const relatorios = await reportService.generateAnalyticalMonthlyReports();
        res.json(relatorios);
    } catch (error) {
        res.status(500).json({ message: "Erro ao gerar relatório analítico", error });
    }
}

async getRelatorioConsolidado(req: Request, res: Response) {
    try {
        const reports = await reportService.generateMonthlyReports(); // Chama o método
        res.status(200).json(reports);
    } catch (error) {
        console.error("Erro ao gerar relatório consolidado:", error);
        res.status(500).json({ message: "Erro ao gerar relatório consolidado" });
    }
}




}




import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { MesReferencia } from "../entities/MesReferencia";
import { Receita, ReceitaStatus } from "../entities/Receita";
import { Despesa, DespesaStatus } from "../entities/Despesa";
import { ReportService } from "../services/ReportService";

// Repositórios para acessar as entidades Receita e Despesa
const receitaRepository = AppDataSource.getRepository(Receita);
const despesaRepository = AppDataSource.getRepository(Despesa);

// Instância do serviço de relatórios
const reportService = new ReportService(receitaRepository, despesaRepository);

export class RelatorioController {
    // Método para gerar o relatório geral mensal (ajustado para o usuário logado)
    async getRelatorioMensal(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const status = req.params.status; // Pode ser "previsto" ou "realizado"
        const userId = req.user?.userId; // Obtém o ID do usuário logado

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            console.log("Buscando mês de referência...");
            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "despesas", "receitas.user", "despesas.user"],
            });

            if (!mesReferencia) {
                console.error("Mês de referência não encontrado.");
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            console.log("Filtrando receitas e despesas pelo usuário logado...");
            const receitasFiltradas = mesReferencia.receitas.filter((r) => r.user && r.user.id === numericUserId);
            const despesasFiltradas = mesReferencia.despesas.filter((d) => d.user && d.user.id === numericUserId);

            console.log("Aplicando filtro por status...");
            const receitasPorStatus = status
                ? receitasFiltradas.filter((r) => r.status === status)
                : receitasFiltradas;

            const despesasPorStatus = status
                ? despesasFiltradas.filter((d) => d.status === status)
                : despesasFiltradas;

            console.log("Calculando totais previstos e realizados...");
            const totalReceitasPrevisto = receitasFiltradas
                .filter((r) => r.status === "previsto")
                .reduce((acc, r) => acc + Number(r.valor), 0);

            const totalDespesasPrevisto = despesasFiltradas
                .filter((d) => d.status === "previsto")
                .reduce((acc, d) => acc + Number(d.valor), 0);

            const totalReceitasRealizado = receitasFiltradas
                .filter((r) => r.status === "realizado")
                .reduce((acc, r) => acc + Number(r.valor), 0);

            const totalDespesasRealizado = despesasFiltradas
                .filter((d) => d.status === "realizado")
                .reduce((acc, d) => acc + Number(d.valor), 0);

            const saldo = totalReceitasRealizado - totalDespesasRealizado;

            console.log("Retornando relatório formatado...");
            res.json({
                mesReferencia: mesReferencia.referencia,
                totalReceitasPrevisto,
                totalDespesasPrevisto,
                totalReceitasRealizado,
                totalDespesasRealizado,
                saldo,
                receitas: receitasPorStatus,
                despesas: despesasPorStatus,
            });
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            res.status(500).json({ message: "Erro ao gerar relatório", error });
        }
    }

    // Método para gerar o relatório mensal por categoria (ajustado para o usuário logado)
    async getRelatorioMensalPorCategoria(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "despesas", "receitas.user", "despesas.user"],
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            const receitasFiltradas = mesReferencia.receitas.filter((r) => r.user && r.user.id === numericUserId);
            const despesasFiltradas = mesReferencia.despesas.filter((d) => d.user && d.user.id === numericUserId);

            const receitasPorCategoria = receitasFiltradas.reduce((acc, receita) => {
                const categoria = receita.categoria || "Sem categoria";
                acc[categoria] = (acc[categoria] || 0) + Number(receita.valor);
                return acc;
            }, {} as Record<string, number>);

            const despesasPorCategoria = despesasFiltradas.reduce((acc, despesa) => {
                const categoria = despesa.categoria || "Sem categoria";
                acc[categoria] = (acc[categoria] || 0) + Number(despesa.valor);
                return acc;
            }, {} as Record<string, number>);

            res.json({
                mesReferencia: mesReferencia.referencia,
                receitasPorCategoria,
                despesasPorCategoria,
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório por categoria", error });
        }
    }

    // Método para gerar o relatório filtrado por mês e categoria (ajustado para o usuário logado)
    async getRelatorioPorMesECategoria(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const categoria = req.params.categoria;
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "despesas", "receitas.user", "despesas.user"],
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            const receitasFiltradas = mesReferencia.receitas.filter(
                (r) => r.user && r.user.id === numericUserId && r.categoria === categoria
            );
            const despesasFiltradas = mesReferencia.despesas.filter(
                (d) => d.user && d.user.id === numericUserId && d.categoria === categoria
            );

            const totalReceitas = receitasFiltradas.reduce((acc, receita) => acc + Number(receita.valor), 0);
            const totalDespesas = despesasFiltradas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);
            const saldo = totalReceitas - totalDespesas;

            res.json({
                mesReferencia: mesReferencia.referencia,
                categoria,
                totalReceitas,
                totalDespesas,
                saldo,
                receitas: receitasFiltradas,
                despesas: despesasFiltradas,
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório por mês e categoria", error });
        }
    }

    // Método para gerar o relatório de receitas por categoria e mês (ajustado para o usuário logado)
    async getRelatorioReceitasPorCategoria(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const categoria = req.params.categoria.toLowerCase();
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "receitas.user"],
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            const receitasFiltradas = mesReferencia.receitas.filter(
                (r) => r.user && r.user.id === numericUserId && r.categoria?.toLowerCase() === categoria
            );

            const totalReceitas = receitasFiltradas.reduce((acc, receita) => acc + Number(receita.valor), 0);

            res.json({
                mesReferencia: mesReferencia.referencia,
                categoria,
                totalReceitas,
                receitas: receitasFiltradas,
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório de receitas por categoria", error });
        }
    }

    // Método para gerar o relatório de despesas por categoria e mês (ajustado para o usuário logado)
    async getRelatorioDespesasPorCategoria(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const categoria = req.params.categoria.toLowerCase();
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["despesas", "despesas.user"],
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            const despesasFiltradas = mesReferencia.despesas.filter(
                (d) => d.user && d.user.id === numericUserId && d.categoria?.toLowerCase() === categoria
            );

            const totalDespesas = despesasFiltradas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);

            res.json({
                mesReferencia: mesReferencia.referencia,
                categoria,
                totalDespesas,
                despesas: despesasFiltradas,
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório de despesas por categoria", error });
        }
    }

    // Método para gerar o relatório geral de receitas por mês (ajustado para o usuário logado)
    async getRelatorioGeralReceitas(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["receitas", "receitas.user"],
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            const receitasFiltradas = mesReferencia.receitas.filter((r) => r.user && r.user.id === numericUserId);

            const totalReceitas = receitasFiltradas.reduce((acc, receita) => acc + Number(receita.valor), 0);

            res.json({
                mesReferencia: mesReferencia.referencia,
                totalReceitas,
                receitas: receitasFiltradas,
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório de receitas", error });
        }
    }

    // Método para gerar o relatório geral de despesas por mês (ajustado para o usuário logado)
    async getRelatorioGeralDespesas(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes;
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const mesReferencia = await mesReferenciaRepository.findOne({
                where: { referencia: mes },
                relations: ["despesas", "despesas.user"],
            });

            if (!mesReferencia) {
                return res.status(404).json({ message: "Mês de referência não encontrado" });
            }

            const despesasFiltradas = mesReferencia.despesas.filter((d) => d.user && d.user.id === numericUserId);

            const totalDespesas = despesasFiltradas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);

            res.json({
                mesReferencia: mesReferencia.referencia,
                totalDespesas,
                despesas: despesasFiltradas,
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório de despesas", error });
        }
    }

    // Método para gerar o relatório analítico (ajustado para o usuário logado)
    async getRelatorioAnalitico(req: Request, res: Response) {
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const relatorios = await reportService.generateAnalyticalMonthlyReports(numericUserId);
            res.json(relatorios);
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório analítico", error });
        }
    }

    // Método para gerar o relatório consolidado (ajustado para o usuário logado)
    async getRelatorioConsolidado(req: Request, res: Response) {
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const reports = await reportService.generateMonthlyReports(numericUserId);
            res.status(200).json(reports);
        } catch (error) {
            console.error("Erro ao gerar relatório consolidado:", error);
            res.status(500).json({ message: "Erro ao gerar relatório consolidado" });
        }
    }

    // Método para gerar o relatório analítico 2 (ajustado para o usuário logado)
    async getRelatorioAnalitico2(req: Request, res: Response) {
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const relatorios = await reportService.generateAnalyticalMonthlyReports2(numericUserId);
            res.json(relatorios);
        } catch (error) {
            res.status(500).json({ message: "Erro ao gerar relatório analítico", error });
        }
    }

    // Método para gerar o relatório consolidado 2 (ajustado para o usuário logado)
    async getRelatorioConsolidado2(req: Request, res: Response) {
        const userId = req.user?.userId;

        try {
            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }

            const numericUserId = Number(userId);

            const reports = await reportService.generateMonthlyReports2(numericUserId);
            res.status(200).json(reports);
        } catch (error) {
            console.error("Erro ao gerar relatório consolidado:", error);
            res.status(500).json({ message: "Erro ao gerar relatório consolidado" });
        }
    }
}
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { MesReferencia } from "../entities/MesReferencia";
import { Receita, ReceitaStatus } from "../entities/Receita";
import { Despesa, DespesaStatus } from "../entities/Despesa";
import { ReportService } from "../services/ReportService";
import { AuthUser } from "../types";
import { User } from "../entities/User";
import { LessThan } from "typeorm";
// Repositórios para acessar as entidades Receita e Despesa
const receitaRepository = AppDataSource.getRepository(Receita);
const despesaRepository = AppDataSource.getRepository(Despesa);

// Instância do serviço de relatórios
const reportService = new ReportService(receitaRepository, despesaRepository);

export class RelatorioController {
    // Método para gerar o relatório geral mensal (ajustado para o usuário logado)
    async getRelatorioMensal(req: Request, res: Response) {
        const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
        const mes = req.params.mes; // Mês de referência
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
                .reduce((acc, r) => acc + Number(r.valorPrevisto || 0), 0);

            const totalDespesasPrevisto = despesasFiltradas
                .filter((d) => d.status === "previsto")
                .reduce((acc, d) => acc + Number(d.valorPrevisto || 0), 0);

            const totalReceitasRealizado = receitasFiltradas
                .filter((r) => r.status === "realizado")
                .reduce((acc, r) => acc + Number(r.valorRealizado || 0), 0);

            const totalDespesasRealizado = despesasFiltradas
                .filter((d) => d.status === "realizado")
                .reduce((acc, d) => acc + Number(d.valorRealizado || 0), 0);

            // Buscar o saldo acumulado até o mês anterior
            const mesesAnteriores = await mesReferenciaRepository.find({
                where: { referencia: LessThan(mes) }, // Meses anteriores ao mês de referência
                order: { referencia: "ASC" },
                relations: ["receitas", "despesas", "receitas.user", "despesas.user"],
            });

            let saldoInicial = 0;
            for (const mesAnterior of mesesAnteriores) {
                const receitasAnteriores = mesAnterior.receitas.filter((r) => r.user && r.user.id === numericUserId);
                const despesasAnteriores = mesAnterior.despesas.filter((d) => d.user && d.user.id === numericUserId);

                const receitasRealizadasAnteriores = receitasAnteriores
                    .filter((r) => r.status === "realizado")
                    .reduce((acc, r) => acc + Number(r.valorRealizado || 0), 0);

                const despesasRealizadasAnteriores = despesasAnteriores
                    .filter((d) => d.status === "realizado")
                    .reduce((acc, d) => acc + Number(d.valorRealizado || 0), 0);

                saldoInicial += receitasRealizadasAnteriores - despesasRealizadasAnteriores;
            }

            // Calcular o saldo final do mês atual
            const saldoFinal = saldoInicial + totalReceitasRealizado - totalDespesasRealizado;

            console.log("Retornando relatório formatado...");
            res.json({
                mesReferencia: mesReferencia.referencia,
                saldoInicial,
                saldoFinal,
                totalReceitasPrevisto,
                totalDespesasPrevisto,
                totalReceitasRealizado,
                totalDespesasRealizado,
                saldoAtual: saldoFinal, // Saldo final também pode ser chamado de saldoAtual
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

        // Filtra receitas e despesas pelo usuário logado
        const receitasFiltradas = mesReferencia.receitas.filter((r) => r.user && r.user.id === numericUserId);
        const despesasFiltradas = mesReferencia.despesas.filter((d) => d.user && d.user.id === numericUserId);

        // Calcula totais previstos e realizados para receitas por categoria
        const receitasPorCategoria = receitasFiltradas.reduce(
            (acc, receita) => {
                const categoria = receita.categoria || "Sem categoria";
                acc[categoria] = acc[categoria] || { previsto: 0, realizado: 0 };
                acc[categoria].previsto += Number(receita.valorPrevisto || 0);
                acc[categoria].realizado += Number(receita.valorRealizado || 0);
                return acc;
            },
            {} as Record<string, { previsto: number; realizado: number }>
        );

        // Calcula totais previstos e realizados para despesas por categoria
        const despesasPorCategoria = despesasFiltradas.reduce(
            (acc, despesa) => {
                const categoria = despesa.categoria || "Sem categoria";
                acc[categoria] = acc[categoria] || { previsto: 0, realizado: 0 };
                acc[categoria].previsto += Number(despesa.valorPrevisto || 0);
                acc[categoria].realizado += Number(despesa.valorRealizado || 0);
                return acc;
            },
            {} as Record<string, { previsto: number; realizado: number }>
        );

        // Retorna o relatório formatado
        res.json({
            mesReferencia: mesReferencia.referencia,
            receitasPorCategoria,
            despesasPorCategoria,
        });
    } catch (error) {
        console.error("Erro ao gerar relatório por categoria:", error);
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

        // Filtra receitas e despesas pelo usuário logado e pela categoria
        const receitasFiltradas = mesReferencia.receitas.filter(
            (r) => r.user && r.user.id === numericUserId && r.categoria === categoria
        );
        const despesasFiltradas = mesReferencia.despesas.filter(
            (d) => d.user && d.user.id === numericUserId && d.categoria === categoria
        );

        // Calcula totais previstos e realizados para receitas
        const totalReceitasPrevisto = receitasFiltradas.reduce(
            (acc, receita) => acc + Number(receita.valorPrevisto || 0),
            0
        );
        const totalReceitasRealizado = receitasFiltradas.reduce(
            (acc, receita) => acc + Number(receita.valorRealizado || 0),
            0
        );

        // Calcula totais previstos e realizados para despesas
        const totalDespesasPrevisto = despesasFiltradas.reduce(
            (acc, despesa) => acc + Number(despesa.valorPrevisto || 0),
            0
        );
        const totalDespesasRealizado = despesasFiltradas.reduce(
            (acc, despesa) => acc + Number(despesa.valorRealizado || 0),
            0
        );

        // Calcula o saldo com base nos valores realizados
        const saldo = totalReceitasRealizado - totalDespesasRealizado;

        // Retorna o relatório formatado
        res.json({
            mesReferencia: mesReferencia.referencia,
            categoria,
            totalReceitasPrevisto,
            totalReceitasRealizado,
            totalDespesasPrevisto,
            totalDespesasRealizado,
            saldo,
            receitas: receitasFiltradas,
            despesas: despesasFiltradas,
        });
    } catch (error) {
        console.error("Erro ao gerar relatório por mês e categoria:", error);
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

            const totalReceitasPrevistas = receitasFiltradas.reduce((acc, receita) => acc + Number(receita.valorPrevisto), 0);
            const totalReceitasRealizadas = receitasFiltradas.reduce((acc, receita) => acc + Number(receita.valorRealizado), 0);

            res.json({
                mesReferencia: mesReferencia.referencia,
                categoria,
                totalReceitasPrevistas,
                totalReceitasRealizadas,
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

            
            const totalDespesasPrevistas = despesasFiltradas.reduce((acc, despesa) => acc + Number(despesa.valorPrevisto), 0);
            const totalDespesasRealizadas = despesasFiltradas.reduce((acc, despesa) => acc + Number(despesa.valorRealizado), 0);


            res.json({
                mesReferencia: mesReferencia.referencia,
                categoria,
                totalDespesasPrevistas,
                totalDespesasRealizadas,
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
    const userId = req.user?.userId; // Obtém o ID do usuário logado

    console.log("Usuário logado:", req.user);
    console.log("Mês de referência recebido:", mes);

    try {
        // Verifica se o usuário está autenticado
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }

        const numericUserId = Number(userId); // Converte o userId para número

        // Busca o mês de referência com as receitas associadas
        const mesReferencia = await mesReferenciaRepository.findOne({
            where: { referencia: mes },
            relations: ["receitas", "receitas.user"], // Inclui a relação com usuários
        });

        console.log("Mês de referência encontrado:", mesReferencia);

        if (!mesReferencia) {
            return res.status(404).json({ message: "Mês de referência não encontrado" });
        }

        // Filtra as receitas pelo ID do usuário logado, garantindo que `receita.user` exista
        const receitasFiltradas = mesReferencia.receitas.filter(
            (receita) => receita.user && receita.user.id === numericUserId
        );

        console.log("Receitas filtradas:", receitasFiltradas);

        // Calcula o total de receitas
        const totalReceitasPrevistas = receitasFiltradas.reduce(
            (acc, receita) => acc + Number(receita.valorPrevisto), 0
        );

        const totalReceitasRealizadas= receitasFiltradas.reduce(
            (acc, receita) => acc + Number(receita.valorRealizado), 0
        );

        return res.json({
            mesReferencia: mesReferencia.referencia,
            totalReceitasRealizadas,
            totalReceitasPrevistas,
            receitas: receitasFiltradas.length > 0 ? receitasFiltradas : [], // Garante que não retorne `undefined`
        });

    } catch (error) {
        console.error("Erro ao gerar relatório de receitas:", error, );
        return res.status(500).json({ message: "Erro ao gerar relatório de receitas", error: error });
    }
}

    

// Método para gerar o relatório geral de despesas por mês (ajustado para o usuário logado)
async getRelatorioGeralDespesas(req: Request, res: Response) {
    const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
    const mes = req.params.mes;
    const userId = req.user?.userId;  // Verifique se userId está sendo recuperado corretamente

    try {
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }

        const numericUserId = Number(userId);  // Garante que o userId seja um número

        // Verifica se o userId é um número válido
        if (isNaN(numericUserId)) {
            return res.status(400).json({ message: "ID do usuário inválido" });
        }

        const mesReferencia = await mesReferenciaRepository.findOne({
            where: { referencia: mes },
            relations: ["despesas", "despesas.user"],
        });

        if (!mesReferencia) {
            return res.status(404).json({ message: "Mês de referência não encontrado" });
        }

        const despesasFiltradas = mesReferencia.despesas.filter((d) => d.user && d.user.id === numericUserId);

        const totalDespesasPrevista  = despesasFiltradas.reduce((acc, despesa) => acc + Number(despesa.valorPrevisto), 0);
        const totalDespesasRealizado = despesasFiltradas.reduce((acc, despesa) => acc + Number(despesa.valorRealizado), 0);

        res.json({
            mesReferencia: mesReferencia.referencia,
            totalDespesasPrevista,
            totalDespesasRealizado,

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
            res.status(500).json({ message: "Erro ao gerar relatório consolidado  " });
        }
    }
}
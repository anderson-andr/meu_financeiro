import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Despesa } from "../entities/Despesa";
import { MesReferencia } from "../entities/MesReferencia";
import { DespesaService } from "../services/DespesaService";
import { In } from "typeorm";
import { parseMonthReference } from "../utils/monthReference";

const despesaRepository = AppDataSource.getRepository(Despesa);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
const despesaService = new DespesaService(despesaRepository);

const formatDespesa = (despesa: any) => ({
  ...despesa,
  mes: despesa.mesReferencia?.mes ?? null,
  ano: despesa.mesReferencia?.ano ?? null,
  mesReferencia: despesa.mesReferencia?.referencia ?? null,
});

const resolveMesReferencia = async (input: { mes?: unknown; ano?: unknown; mesReferencia?: unknown }) => {
  const parsed = parseMonthReference(input);

  let entity = await mesReferenciaRepository.findOne({
    where: [
      { referencia: parsed.referencia },
      { mes: parsed.mes, ano: parsed.ano },
    ],
  });

  if (!entity) {
    entity = mesReferenciaRepository.create({
      referencia: parsed.referencia,
      mes: parsed.mes,
      ano: parsed.ano,
    });
    await mesReferenciaRepository.save(entity);
    return entity;
  }

  if (entity.referencia !== parsed.referencia || entity.mes !== parsed.mes || entity.ano !== parsed.ano) {
    entity.referencia = parsed.referencia;
    entity.mes = parsed.mes;
    entity.ano = parsed.ano;
    await mesReferenciaRepository.save(entity);
  }

  return entity;
};

export class DespesaController {
  async getAll(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const despesas = await despesaService.getAllByUser(userId);
      res.json(despesas.map(formatDespesa));
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar despesas", error });
    }
  }

  async getById(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const despesa = await despesaService.getById(Number(id), userId);
      if (!despesa) {
        return res.status(404).json({ message: "Despesa não encontrada ou não pertence ao usuário" });
      }

      return res.json(formatDespesa(despesa));
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar despesa", error });
    }
  }

  async create(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { mes, ano, mesReferencia, descricao, categoria, status, valorPrevisto, valorRealizado, data } = req.body;

      if (!descricao || !categoria || !status || valorPrevisto === undefined || valorRealizado === undefined || !data) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      const mesReferenciaEntity = await resolveMesReferencia({ mes, ano, mesReferencia });

      const despesa = await despesaService.create(
        { descricao, categoria, status, valorPrevisto, valorRealizado, data, mesReferencia: mesReferenciaEntity },
        userId
      );

      return res.status(201).json(formatDespesa(despesa));
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar despesa", error });
    }
  }

  async update(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const { mes, ano, mesReferencia, descricao, categoria, status, valorPrevisto, valorRealizado, data } = req.body;

      if (!descricao || !categoria || !status || valorPrevisto === undefined || valorRealizado === undefined || !data) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      const mesReferenciaEntity = await resolveMesReferencia({ mes, ano, mesReferencia });

      const updatedDespesa = await despesaService.update(
        Number(id),
        { descricao, categoria, status, valorPrevisto, valorRealizado, data, mesReferencia: mesReferenciaEntity },
        userId
      );

      return res.json(formatDespesa(updatedDespesa));
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar despesa", error });
    }
  }

  async delete(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      await despesaService.delete(Number(id), userId);

      return res.status(200).json({ message: "Despesa deletada com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao deletar despesa", error });
    }
  }

  async duplicar(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { mesDestinoMes, mesDestinoAno, mesDestino, despesaIds } = req.body;

      if ((!mesDestino && (mesDestinoMes === undefined || mesDestinoAno === undefined)) || !Array.isArray(despesaIds) || despesaIds.length === 0) {
        return res.status(400).json({ message: "Informe o mês de destino e ao menos uma despesa para duplicar" });
      }

      const despesaIdsNumericos = despesaIds
        .map((id: any) => {
          const parsed = parseInt(id);
          return Number.isNaN(parsed) ? null : parsed;
        })
        .filter((id: number | null): id is number => id !== null);

      if (despesaIdsNumericos.length === 0) {
        return res.status(400).json({ message: "IDs de despesa inválidos" });
      }

      const mesDestinoEntity = await resolveMesReferencia({
        mes: mesDestinoMes,
        ano: mesDestinoAno,
        mesReferencia: mesDestino,
      });

      const despesasSelecionadas = await despesaRepository.find({
        where: { id: In(despesaIdsNumericos), user: { id: userId } },
        relations: ["mesReferencia", "user"],
      });

      if (despesasSelecionadas.length === 0) {
        return res.status(404).json({ message: "Nenhuma despesa encontrada com os IDs fornecidos" });
      }

      const despesasDuplicadas = despesasSelecionadas.map((d) =>
        despesaRepository.create({
          descricao: d.descricao,
          categoria: d.categoria,
          status: d.status,
          valorPrevisto: d.valorPrevisto,
          valorRealizado: d.valorRealizado,
          data: d.data,
          mesReferencia: mesDestinoEntity,
          user: d.user,
        })
      );

      await despesaRepository.save(despesasDuplicadas);

      return res.status(201).json({
        message: "Despesas duplicadas com sucesso",
        despesas: despesasDuplicadas.map(formatDespesa),
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao duplicar despesas", error });
    }
  }
}

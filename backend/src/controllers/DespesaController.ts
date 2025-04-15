// src/controllers/DespesaController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Despesa } from "../entities/Despesa";
import { MesReferencia } from "../entities/MesReferencia";
import { DespesaService } from "../services/DespesaService";
import { In } from "typeorm";

const despesaRepository = AppDataSource.getRepository(Despesa);
const mesReferenciaRepository = AppDataSource.getRepository(MesReferencia);
const despesaService = new DespesaService(despesaRepository);

export class DespesaController {
  async getAll(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const despesas = await despesaService.getAllByUser(userId);

      const despesasComMesReferencia = despesas.map((despesa) => ({
        ...despesa,
        mesReferencia: despesa.mesReferencia ? despesa.mesReferencia.referencia : null,
      }));

      res.json(despesasComMesReferencia);
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

      res.json(despesa);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar despesa", error });
    }
  }

  async create(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { mesReferencia, descricao, categoria, status, valorPrevisto, valorRealizado, data } = req.body;

      if (!mesReferencia || !descricao || !categoria || !status || !valorPrevisto || !valorRealizado || !data) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      let mesReferenciaEntity = await mesReferenciaRepository.findOne({ where: { referencia: mesReferencia } });
      if (!mesReferenciaEntity) {
        mesReferenciaEntity = mesReferenciaRepository.create({ referencia: mesReferencia });
        await mesReferenciaRepository.save(mesReferenciaEntity);
      }

      const despesa = await despesaService.create(
        { descricao, categoria, status, valorPrevisto, valorRealizado, data, mesReferencia: mesReferenciaEntity },
        userId
      );

      res.status(201).json(despesa);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar despesa", error });
    }
  }

  async update(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const { mesReferencia, descricao, categoria, status, valorPrevisto, valorRealizado, data } = req.body;

      if (!mesReferencia || !descricao || !categoria || !status || !valorPrevisto || !valorRealizado || !data) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      let mesReferenciaEntity = await mesReferenciaRepository.findOne({ where: { referencia: mesReferencia } });
      if (!mesReferenciaEntity) {
        mesReferenciaEntity = mesReferenciaRepository.create({ referencia: mesReferencia });
        await mesReferenciaRepository.save(mesReferenciaEntity);
      }

      const updatedDespesa = await despesaService.update(
        Number(id),
        { descricao, categoria, status, valorPrevisto, valorRealizado, data, mesReferencia: mesReferenciaEntity },
        userId
      );

      res.json(updatedDespesa);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar despesa", error });
    }
  }

  async delete(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      await despesaService.delete(Number(id), userId);

      res.status(200).json({ message: "Despesa deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar despesa", error });
    }
  }

  async duplicar(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const {mesDestino, despesaIds } = req.body;

      if (!mesDestino || !Array.isArray(despesaIds) || despesaIds.length === 0) {
        return res.status(400).json({ message: "Informe o mês de destino e ao menos uma despesa para duplicar" });
      }

      const despesaIdsNumericos = despesaIds
        .map((id: any) => {
          const parsed = parseInt(id);
          return isNaN(parsed) ? null : parsed;
        })
        .filter((id: number | null): id is number => id !== null);

      if (despesaIdsNumericos.length === 0) {
        return res.status(400).json({ message: "IDs de despesa inválidos" });
      }

      let mesDestinoEntity = await mesReferenciaRepository.findOne({ where: { referencia: mesDestino } });
      if (!mesDestinoEntity) {
        mesDestinoEntity = mesReferenciaRepository.create({ referencia: mesDestino });
        await mesReferenciaRepository.save(mesDestinoEntity);
      }

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

      return res.status(201).json({ message: "Despesas duplicadas com sucesso", despesas: despesasDuplicadas });
    } catch (error) {
      console.error("❌ Erro ao duplicar despesas:", error);
      return res.status(500).json({ message: "Erro ao duplicar despesas", error });
    }
  }
}

// src/components/relatorios/RelatorioConsolidado2.jsx

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  TableContainer,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importando o plugin para tabelas

const RelatorioConsolidado2 = () => {
  const [relatorios, setRelatorios] = useState([]);

  // Função para buscar os dados do relatório consolidado
  const fetchRelatorios = async () => {
    try {
      const response = await api.get("/relatorios/consolidado2");
      setRelatorios(response.data);
    } catch (error) {
      console.error("Erro ao buscar relatórios consolidados:", error);
    }
  };

  // Carrega os dados quando o componente é montado
  useEffect(() => {
    fetchRelatorios();
  }, []);

  // Função para gerar o PDF
  const gerarPDF = () => {
    const doc = new jsPDF();

    // Configurações iniciais
    const tableHeaders = [
      "Mês de Referência",
      "Saldo Inicial",
      "Receitas Previstas",
      "Receitas Realizadas",
      "Despesas Previstas",
      "Despesas Realizadas",
      "Saldo Final",
    ];

    const tableData = relatorios.map((relatorio) => [
      relatorio.mesReferencia,
      Number(relatorio.saldoInicial).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      Number(relatorio.receitasTotaisPrevistas).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      Number(relatorio.receitasTotaisRealizadas).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      Number(relatorio.despesasTotaisPrevistas).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      Number(relatorio.despesasTotaisRealizadas).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      Number(relatorio.saldoFinal).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    ]);

    // Adiciona o título ao PDF
    doc.setFontSize(18);
    doc.text("Relatório Consolidado Mensal", 14, 10);

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 20, // Posição inicial da tabela
      theme: "grid", // Estilo da tabela
      styles: {
        fontSize: 10,
        cellPadding: 1.5,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Largura da coluna "Mês de Referência"
        1: { cellWidth: 30 }, // Largura da coluna "Saldo Inicial"
        2: { cellWidth: 30 }, // Largura da coluna "Receitas Previstas"
        3: { cellWidth: 30 }, // Largura da coluna "Receitas Realizadas"
        4: { cellWidth: 30 }, // Largura da coluna "Despesas Previstas"
        5: { cellWidth: 30 }, // Largura da coluna "Despesas Realizadas"
        6: { cellWidth: 30 }, // Largura da coluna "Saldo Final"
      },
    });

    // Abre o PDF em uma nova janela
    const pdfData = doc.output("bloburl");
    const pdfWindow = window.open(pdfData, "_blank");

    if (!pdfWindow) {
      alert("Por favor, permita pop-ups para visualizar o PDF.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relatório Consolidado Mensal
      </Typography>

      {/* Botão para gerar o PDF */}
      <Button
        variant="contained"
        color="primary"
        onClick={gerarPDF}
        sx={{ marginBottom: 3 }}
      >
        Gerar PDF
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mês de Referência</TableCell>
              <TableCell>Saldo Inicial</TableCell>
              <TableCell>Receitas Previstas</TableCell>
              <TableCell>Receitas Realizadas</TableCell>
              <TableCell>Despesas Previstas</TableCell>
              <TableCell>Despesas Realizadas</TableCell>
              <TableCell>Saldo Final</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relatorios.map((relatorio, index) => (
              <TableRow key={index}>
                <TableCell>{relatorio.mesReferencia}</TableCell>
                <TableCell>
                  {Number(relatorio.saldoInicial).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>
                  {Number(relatorio.receitasTotaisPrevistas).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </TableCell>
                <TableCell>
                  {Number(relatorio.receitasTotaisRealizadas).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </TableCell>
                <TableCell>
                  {Number(relatorio.despesasTotaisPrevistas).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </TableCell>
                <TableCell>
                  {Number(relatorio.despesasTotaisRealizadas).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}
                </TableCell>
                <TableCell
                  style={{
                    color: relatorio.saldoFinal < 0 ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  {Number(relatorio.saldoFinal).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RelatorioConsolidado2;
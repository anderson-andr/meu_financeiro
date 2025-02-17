// src/components/relatorios/RelatorioAnalitico.jsx

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
  Collapse,
  IconButton,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import jsPDF from "jspdf";
import "jspdf-autotable";

const RelatorioAnalitico2 = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  // Função para buscar os dados do relatório analítico
  const fetchRelatorios = async () => {
    try {
      const response = await api.get("/relatorios/analitico2");
      setRelatorios(response.data);
    } catch (error) {
      console.error("Erro ao buscar relatórios analíticos:", error);
    }
  };

  // Carrega os dados quando o componente é montado
  useEffect(() => {
    fetchRelatorios();
  }, []);

  // Função para expandir/colapsar as linhas
  const handleExpandRow = (mesReferencia) => {
    setExpandedRows((prev) => ({
      ...prev,
      [mesReferencia]: !prev[mesReferencia],
    }));
  };

  // Função para gerar o PDF com detalhes expandidos
  const gerarPDF = () => {
    const doc = new jsPDF();

    // Configurações iniciais
    doc.setFontSize(18);
    doc.text("Relatório Analítico Mensal", 14, 10);

    let startY = 20; // Posição inicial da tabela

    relatorios.forEach((relatorio) => {
      // Adiciona o cabeçalho do mês
      doc.setFontSize(14);
      doc.text(`Mês: ${relatorio.mesReferencia}`, 14, startY);
      startY += 10;

      // Adiciona os totais consolidados
      const tableHeaders = ["Saldo Inicial", "Receitas Totais", "Despesas Totais", "Saldo Final"];
      const tableData = [
        [
          Number(relatorio.saldoInicial).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          Number(relatorio.receitas.reduce((sum, r) => sum + r.valorRealizado, 0)).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          Number(relatorio.despesas.reduce((sum, d) => sum + d.valorRealizado, 0)).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          Number(relatorio.saldoFinal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        ],
      ];

      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: startY,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 1.5,
          halign: "center",
        },
      });

      startY = doc.lastAutoTable.finalY + 10; // Atualiza a posição Y após a tabela

      // Adiciona as receitas
      doc.setFontSize(12);
      doc.text("Receitas", 14, startY);
      startY += 5;

      const receitasHeaders = ["Descrição", "Valor", "Categoria", "Status"];
      const receitasData = relatorio.receitas.map((receita) => [
        receita.descricao,
        Number(receita.valorRealizado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        receita.categoria || "Sem categoria",
        receita.status,
      ]);

      doc.autoTable({
        head: [receitasHeaders],
        body: receitasData,
        startY: startY,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          halign: "center",
        },
      });

      startY = doc.lastAutoTable.finalY + 10; // Atualiza a posição Y após a tabela

      // Adiciona as despesas
      doc.setFontSize(12);
      doc.text("Despesas", 14, startY);
      startY += 5;

      const despesasHeaders = ["Descrição", "Valor", "Categoria", "Status"];
      const despesasData = relatorio.despesas.map((despesa) => [
        despesa.descricao,
        Number(despesa.valorRealizado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        despesa.categoria || "Sem categoria",
        despesa.status,
      ]);

      doc.autoTable({
        head: [despesasHeaders],
        body: despesasData,
        startY: startY,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          halign: "center",
        },
      });

      startY = doc.lastAutoTable.finalY + 20; // Espaço entre meses
    });

    // Salva ou abre o PDF
    const pdfData = doc.output("bloburl");
    const pdfWindow = window.open(pdfData, "_blank");

    if (!pdfWindow) {
      alert("Por favor, permita pop-ups para visualizar o PDF.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relatório Analítico Mensal
      </Typography>

      {/* Botão para gerar o PDF */}
      <Button variant="contained" color="primary" onClick={gerarPDF} sx={{ marginBottom: 3 }}>
        Gerar PDF
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mês de Referência</TableCell>
              <TableCell>Saldo Inicial</TableCell>
              <TableCell>Receitas Totais</TableCell>
              <TableCell>Despesas Totais</TableCell>
              <TableCell>Saldo Final</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relatorios.map((relatorio) => (
              <React.Fragment key={relatorio.mesReferencia}>
                {/* Linha principal */}
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleExpandRow(relatorio.mesReferencia)}
                    >
                      {expandedRows[relatorio.mesReferencia] ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                    {relatorio.mesReferencia}
                  </TableCell>
                  <TableCell>
                    {Number(relatorio.saldoInicial).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    {Number(
                      relatorio.receitas.reduce((sum, r) => sum + r.valorRealizado, 0)
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    {Number(
                      relatorio.despesas.reduce((sum, d) => sum + d.valorRealizado, 0)
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    {Number(relatorio.saldoFinal).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                </TableRow>

                {/* Detalhes expandidos */}
                <TableRow>
                  <TableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={expandedRows[relatorio.mesReferencia]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          Detalhes do Mês
                        </Typography>

                        {/* Tabela de Receitas */}
                        <Typography variant="subtitle1">Receitas</Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Descrição</TableCell>
                              <TableCell>Valor</TableCell>
                              <TableCell>Categoria</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {relatorio.receitas.map((receita) => (
                              <TableRow key={receita.id}>
                                <TableCell>{receita.descricao}</TableCell>
                                <TableCell>
                                  {Number(receita.valorRealizado).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </TableCell>
                                <TableCell>{receita.categoria}</TableCell>
                                <TableCell>{receita.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* Tabela de Despesas */}
                        <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                          Despesas
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Descrição</TableCell>
                              <TableCell>Valor</TableCell>
                              <TableCell>Categoria</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {relatorio.despesas.map((despesa) => (
                              <TableRow key={despesa.id}>
                                <TableCell>{despesa.descricao}</TableCell>
                                <TableCell>
                                  {Number(despesa.valorRealizado).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </TableCell>
                                <TableCell>{despesa.categoria}</TableCell>
                                <TableCell>{despesa.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RelatorioAnalitico2;
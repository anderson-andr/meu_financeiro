import React, { useEffect, useState } from "react";
import axios from "axios";
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
  TableContainer
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importando o plugin para tabelas

const RelatorioConsolidado = () => {
  const [relatorios, setRelatorios] = useState([]);

  // Função para buscar os dados do relatório consolidado
  const fetchRelatorios = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/relatorios/consolidado");
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
      "Receitas Totais",
      "Despesas Totais",
      "Saldo Final",
    ];

    const tableData = relatorios.map((relatorio) => [
      relatorio.mesReferencia,
      Number(relatorio.saldoInicial).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      Number(relatorio.receitasTotais).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      Number(relatorio.despesasTotais).toLocaleString("pt-BR", {
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
      startY: 15, // Posição inicial da tabela
      theme: "grid", // Estilo da tabela
      styles: {
        fontSize: 10,
        cellPadding: 1.5,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Largura da coluna "Mês de Referência"
        1: { cellWidth: 30 }, // Largura da coluna "Saldo Inicial"
        2: { cellWidth: 30 }, // Largura da coluna "Receitas Totais"
        3: { cellWidth: 30 }, // Largura da coluna "Despesas Totais"
        4: { cellWidth: 30 }, // Largura da coluna "Saldo Final"
      },
    });

    
        // Abre o PDF em uma nova janela
        const pdfData = doc.output('bloburl');
        const pdfWindow = window.open(pdfData, '_blank');
        
        if (!pdfWindow) {
            alert("Por favor, permita pop-ups para visualizar o PDF.");
        }

    // Salva o PDF
    //doc.save("relatorio_consolidado.pdf");
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Relatório Consolidado Mensal
      </Typography>

   
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
                  {Number(relatorio.receitasTotais).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>
                  {Number(relatorio.despesasTotais).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
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
         {/* Botão para gerar o PDF */}
         <Button variant="contained" color="primary" onClick={gerarPDF} style={{ marginTop: 20 }}>
        Gerar PDF
      </Button>

    </Box>
  );
};

export default RelatorioConsolidado;
import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RelatorioGeral from "../../components/relatorios/RelatorioGeral";
import RelatorioPorCategoria from "../../components/relatorios/RelatorioPorCategoria";
import RelatorioMesECategoria from "../../components/relatorios/RelatorioMesECategoria";
import ReceitasPorCategoria from "../../components/relatorios/ReceitasPorCategoria";
import DespesasPorCategoria from "../../components/relatorios/DespesasPorCategoria";
import ReceitasGerais from "../../components/relatorios/ReceitasGerais";
import DespesasGerais from "../../components/relatorios/DespesasGerais";
import RelatorioConsolidado from "../../components/relatorios/RelatorioConsolidado"; // Importando o novo componente

import RelatorioAnalitico from "../../components/relatorios/RelatorioAnalitico"; 

const Relatorios = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const relatoriosDisponiveis = [
    { nome: "Relatório Geral", componente: <RelatorioGeral /> },
    { nome: "Relatório por Categoria", componente: <RelatorioPorCategoria /> },
    { nome: "Relatório por Mês e Categoria", componente: <RelatorioMesECategoria /> },
    { nome: "Receitas por Categoria", componente: <ReceitasPorCategoria /> },
    { nome: "Despesas por Categoria", componente: <DespesasPorCategoria /> },
    { nome: "Receitas Gerais", componente: <ReceitasGerais /> },
    { nome: "Despesas Gerais", componente: <DespesasGerais /> },
    { nome: "Relatório Consolidado", componente: <RelatorioConsolidado /> },
    { nome: "Relatório Analitico", componente: <RelatorioAnalitico /> },
  ];

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" gutterBottom>
        Relatórios Financeiros
      </Typography>

      {/* Layout com duas colunas */}
      <Grid container spacing={4}>
        {/* Coluna da Esquerda: Lista de Relatórios */}
        <Grid item xs={12} md={4}>
          <Box>
            {relatoriosDisponiveis.map((relatorio, index) => (
              <Accordion
                key={index}
                expanded={selectedReport === relatorio.nome}
                onChange={() =>
                  setSelectedReport(
                    selectedReport === relatorio.nome ? null : relatorio.nome
                  )
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{relatorio.nome}</Typography>
                </AccordionSummary>
              </Accordion>
            ))}
          </Box>
        </Grid>

        {/* Coluna da Direita: Detalhes do Relatório Selecionado */}
        <Grid item xs={12} md={8}>
          {selectedReport && (
            <Box>
              {relatoriosDisponiveis.find(
                (relatorio) => relatorio.nome === selectedReport
              )?.componente}
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Relatorios;
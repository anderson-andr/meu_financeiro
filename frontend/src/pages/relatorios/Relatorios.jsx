import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Button,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import RelatorioGeral from "../../components/relatorios/RelatorioGeral";
import RelatorioPorCategoria from "../../components/relatorios/RelatorioPorCategoria";
import RelatorioMesECategoria from "../../components/relatorios/RelatorioMesECategoria";
import ReceitasPorCategoria from "../../components/relatorios/ReceitasPorCategoria";
import DespesasPorCategoria from "../../components/relatorios/DespesasPorCategoria";
import ReceitasGerais from "../../components/relatorios/ReceitasGerais";
import DespesasGerais from "../../components/relatorios/DespesasGerais";
import RelatorioConsolidado from "../../components/relatorios/RelatorioConsolidado";
import RelatorioAnalitico from "../../components/relatorios/RelatorioAnalitico";
import RelatorioConsolidado2 from "../../components/relatorios/RelatorioConsolidado2";
import RelatorioAnalitico2 from "../../components/relatorios/RelatorioAnalitico2";

const Relatorios = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showList, setShowList] = useState(false); // controla exibição da lista no mobile

  // Detecta se a tela é pequena (por exemplo, até 768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    { nome: "Relatório Consolidado Previsto  e Realizado", componente: <RelatorioConsolidado2 /> },
    { nome: "Relatório Analitico Previsto  e Realizado", componente: <RelatorioAnalitico2 /> },
  ];

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" gutterBottom>
        Relatórios Financeiros
      </Typography>

      {/** 
       * Botão que só aparece no mobile para 
       * mostrar/ocultar a lista de relatórios 
       */}
      {isMobile && (
        <Button 
          variant="contained" 
          onClick={() => setShowList((prev) => !prev)} 
          sx={{ marginBottom: 2 }}
        >
          {showList ? "Esconder Relatórios" : "Mostrar Relatórios"}
        </Button>
      )}

      <Grid container spacing={4}>
        {/* Coluna da Esquerda: Lista de Relatórios */}
        <Grid 
          item 
          xs={12} 
          md={4}
          // Se for mobile e "showList" for falso, escondemos a lista
          sx={{ display: isMobile && !showList ? "none" : "block" }}
        >
          <Box>
            {relatoriosDisponiveis.map((relatorio, index) => (
              <Accordion
                key={index}
                expanded={selectedReport === relatorio.nome}
                onChange={() => {
                  // Se o relatório clicado for o mesmo já selecionado, desmarca; senão marca o novo
                  setSelectedReport(
                    selectedReport === relatorio.nome ? null : relatorio.nome
                  );
              
                  // Se for mobile, esconde a lista automaticamente
                  if (isMobile) {
                    setShowList(false);
                  }
                }}
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
              {
                relatoriosDisponiveis.find(
                  (relatorio) => relatorio.nome === selectedReport
                )?.componente
              }
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Relatorios;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Grid, Paper, TextField, Button, Typography } from "@mui/material";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import RelatorioConsolidado from "../../components/relatorios/RelatorioConsolidado"; // Importando o componente RelatorioConsolidado

ChartJS.register(
  ArcElement,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
  Tooltip
);

const Home = () => {
  const [mesReferencia, setMesReferencia] = useState("01-2025");
  const [dataRelatorio, setDataRelatorio] = useState(null);
  const [error, setError] = useState("");

  const fetchRelatorioGeral = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/relatorios/geral/${mesReferencia}`
      );
      setDataRelatorio(response.data);
      setError("");
    } catch (error) {
      setError(
        "Erro ao buscar dados. Verifique sua conexão ou tente novamente."
      );
      setDataRelatorio(null);
    }
  };

  useEffect(() => {
    fetchRelatorioGeral();
  }, [mesReferencia]);

  const calculatePercent = (realizado, previsto) => {
    if (!previsto || previsto === 0) return 0;
    return ((realizado / previsto) * 100).toFixed(2);
  };

  const getTotalPrevistoRealizado = () => {
    if (!dataRelatorio) return null;
    return {
      labels: [
        "Receitas Previstas",
        "Receitas Realizadas",
        "Despesas Previstas",
        "Despesas Realizadas",
      ],
      datasets: [
        {
          label: "Totais",
          data: [
            dataRelatorio.totalReceitasPrevisto || 0,
            dataRelatorio.totalReceitasRealizado || 0,
            dataRelatorio.totalDespesasPrevisto || 0,
            dataRelatorio.totalDespesasRealizado || 0,
          ],
          backgroundColor: ["#28a745", "#20c997", "#dc3545", "#ff6384"],
        },
      ],
    };
  };

  const getDespesasPorcentagemOrcamento = () => {
    if (!dataRelatorio) return null;
    return {
      labels: ["Orçamento Restante", "Despesas Realizadas"],
      datasets: [
        {
          label: "Orçamento",
          data: [
            dataRelatorio.totalReceitasRealizado -
              dataRelatorio.totalDespesasRealizado,
            dataRelatorio.totalDespesasRealizado,
          ],
          backgroundColor: ["#17a2b8", "#dc3545"],
        },
      ],
    };
  };

  const getCategoriasMaisGastadoras = () => {
    if (!dataRelatorio) return null;
    const categoriasDespesas = {};
    dataRelatorio.despesas.forEach((despesa) => {
      const categoria = despesa.categoria?.toUpperCase() || "SEM CATEGORIA";
      categoriasDespesas[categoria] =
        (categoriasDespesas[categoria] || 0) + Number(despesa.valor);
    });

    const sortedCategorias = Object.entries(categoriasDespesas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sortedCategorias.map(([categoria]) => categoria),
      datasets: [
        {
          label: "Gastos por Categoria",
          data: sortedCategorias.map(([, valor]) => valor),
          backgroundColor: [
            "#007bff",
            "#6f42c1",
            "#ffc107",
            "#28a745",
            "#dc3545",
          ],
        },
      ],
    };
  };

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" gutterBottom>
        Dashboard Financeiro
      </Typography>

      <Typography variant="h5" gutterBottom>
        Análise Mensal
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            style={{ padding: "16px", height: "400px", background: "#f2f2f2" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Receitas e Despesas Previstas vs Realizadas
            </Typography>
            {dataRelatorio ? (
              <div style={{ width: "300px", height: "300px", margin: "auto" }}>
                <Doughnut data={getTotalPrevistoRealizado()} />
              </div>
            ) : (
              <Typography color="textSecondary">Carregando dados...</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            style={{ padding: "16px", height: "400px", background: "#f2f2f2" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Percentual de Despesas no Orçamento
            </Typography>
            {dataRelatorio ? (
              <div style={{ width: "300px", height: "300px", margin: "auto" }}>
                <Doughnut data={getDespesasPorcentagemOrcamento()} />
              </div>
            ) : (
              <Typography color="textSecondary">Carregando dados...</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            style={{ padding: "16px", height: "400px", background: "#f2f2f2" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Categorias com Maior Gasto
            </Typography>
            {dataRelatorio ? (
              <Bar data={getCategoriasMaisGastadoras()} />
            ) : (
              <Typography color="textSecondary">Carregando dados...</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            style={{ padding: "16px", height: "400px", background: "#f2f2f2" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Resumo Financeiro
            </Typography>
            {dataRelatorio ? (
              <div style={{ width: "70%", height: "300px", margin: "0 auto" }}>
                {/* Resumo Financeiro */}
                <Typography style={{ padding: "10px", fontSize: "20px" }}>
                  💰 Receitas Previstas:{" "}
                  {dataRelatorio.totalReceitasPrevisto?.toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}
                </Typography>
                <Typography style={{ padding: "10px", fontSize: "20px" }}>
                  ✅ Receitas Realizadas:{" "}
                  {dataRelatorio.totalReceitasRealizado?.toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}
                </Typography>
                <Typography style={{ padding: "10px", fontSize: "20px" }}>
                  💳 Despesas Previstas:{" "}
                  {dataRelatorio.totalDespesasPrevisto?.toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}
                </Typography>
                <Typography style={{ padding: "10px", fontSize: "20px" }}>
                  ❌ Despesas Realizadas:{" "}
                  {dataRelatorio.totalDespesasRealizado?.toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}
                </Typography>
                <Typography
                  style={{
                    padding: "10px",
                    fontSize: "20px",
                    color: dataRelatorio.saldo >= 0 ? "green" : "red",
                  }}
                >
                  💼 Saldo:{" "}
                  {dataRelatorio.saldo?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </Typography>
              </div>
            ) : (
              <Typography color="textSecondary">Carregando dados...</Typography>
            )}
          </Paper>
        </Grid>

        {error && (
          <Typography variant="body1" color="error" className="mt-4">
            {error}
          </Typography>
        )}
        <Box mt={4} style={{margin:" 20px auto"}}>
          <Typography variant="subtitle1" gutterBottom>
            Selecione o Mês:
          </Typography>
          <TextField
            label="Mês (MM-YYYY)"
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchRelatorioGeral}
            style={{ marginTop: "10px" }}
          >
            Atualizar Gráficos
          </Button>
        </Box>
        


      
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography
              variant="h6"
              gutterBottom
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Relatório Consolidado Geral todos os Meses
            </Typography>
            <RelatorioConsolidado />{" "}
            {/* Aqui você adiciona a tabela do relatório consolidado */}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;

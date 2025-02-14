import React, { useState } from "react";
import axios from "axios";
import api from "../../services/api";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  Box,
} from "@mui/material";

const RelatorioGeral = () => {
  const [mes, setMes] = useState("01-2025");
  const [status, setStatus] = useState(""); // Estado inicial vazio para mostrar tudo
  const [results, setResults] = useState({});
  const [error, setError] = useState("");

  const fetchRelatorio = async () => {
    if (!mes) {
      setError("Por favor, preencha o mês.");
      return;
    }

    try {
      let url = `/relatorios/geral/${mes}`;
      if (status) {
        url += `/${status}`; // Adiciona o status apenas se ele for especificado
      }

      console.log("URL da requisição:", url);

      const response = await api.get(url);
      setResults(response.data);
      setError("");
    } catch (error) {
      setError("Erro ao buscar relatório. Verifique sua conexão ou tente novamente mais tarde.");
      setResults({});
    }
  };

  return (
    <div>
      <Box marginBottom={2}>
        <TextField
          label="Mês (MM-YYYY)"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ margin: "10px 0" }}
        >
          <option value="">Todos</option> {/* Opção para mostrar tudo */}
          <option value="realizado">Realizado</option>
          <option value="previsto">Previsto</option>
        </select>
        <Button variant="contained" color="primary" onClick={fetchRelatorio}>
          Aplicar Filtros
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      {results.mesReferencia && (
        <>
          <Typography variant="subtitle1">
            💰 Receitas Previstas: R$ {results.totalReceitasPrevisto?.toFixed(2) || 0}
          </Typography>
          <Typography variant="subtitle1">
            💳 Despesas Previstas: R$ {results.totalDespesasPrevisto?.toFixed(2) || 0}
          </Typography>
          <Typography variant="subtitle1">
            ✅ Receitas Realizadas: R$ {results.totalReceitasRealizado?.toFixed(2) || 0}
          </Typography>
          <Typography variant="subtitle1">
            ❌ Despesas Realizadas: R$ {results.totalDespesasRealizado?.toFixed(2) || 0}
          </Typography>
          <Typography
            className={`font-bold ${
              results.saldo >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            💼 Saldo: R$ {results.saldo?.toFixed(2) || 0}
          </Typography>

          <Typography variant="h6">Receitas:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor (R$)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.receitas?.map((receita, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{receita.descricao}</TableCell>
                    <TableCell align="right">
                      R$ {parseFloat(receita.valor).toFixed(2)}
                    </TableCell>
                    <TableCell>{receita.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6">Despesas:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor (R$)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.despesas?.map((despesa, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{despesa.descricao}</TableCell>
                    <TableCell align="right">
                      R$ {parseFloat(despesa.valor).toFixed(2)}
                    </TableCell>
                    <TableCell>{despesa.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default RelatorioGeral;
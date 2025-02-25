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
} from "@mui/material";

const RelatorioPorCategoria = () => {
  const [mes, setMes] = useState("01-2025");
  const [results, setResults] = useState({});
  const [error, setError] = useState("");

  const fetchRelatorio = async () => {
    if (!mes) {
      setError("Por favor, preencha o mês.");
      return;
    }

    try {
      const response = await api.get( 
        `/relatorios/categoria/${mes}`
      );
      setResults(response.data);
      setError("");
    } catch (error) {
      setError("Erro ao buscar relatório. Verifique sua conexão ou tente novamente mais tarde.");
      setResults({});
    }
  };

  return (
    <div>
      <TextField
        label="Mês (MM-YYYY)"
        value={mes}
        onChange={(e) => setMes(e.target.value)}
        variant="outlined"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={fetchRelatorio}>
        Aplicar Filtros
      </Button>

      {error && <Typography color="error">{error}</Typography>}

      {results.mesReferencia && (
        <>
          <Typography variant="subtitle1">Receitas por Categoria:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Valor Previsto(R$)</TableCell>
                  <TableCell align="right">Valor Realizado(R$)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(results.receitasPorCategoria || {}).map(
                  ([categoria, valorPrevisto,valorRealizado], idx) => (
                    <TableRow key={idx}>
                      <TableCell>{categoria || "Sem categoria"}</TableCell>
                      <TableCell align="right">
                        R$ {parseFloat(valorPrevisto).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        R$ {parseFloat(valorRealizado).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1">Despesas por Categoria:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Valor Previsto(R$)</TableCell>
                  <TableCell align="right">Valor Realizado(R$)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(results.despesasPorCategoria || {}).map(
                  ([categoria, valorPrevisto, valorRealizado], idx) => (
                    <TableRow key={idx}>
                      <TableCell>{categoria || "Sem categoria"}</TableCell>
                      <TableCell align="right">
                        R$ {parseFloat(valorPrevisto).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        R$ {parseFloat(valorRealizado).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default RelatorioPorCategoria;
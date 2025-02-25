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

const ReceitasPorCategoria = () => {
  const [mes, setMes] = useState("01-2025");
  const [categoria, setCategoria] = useState("");
  const [results, setResults] = useState({});
  const [error, setError] = useState("");

  const fetchRelatorio = async () => {
    if (!mes || !categoria) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const response = await api.get( 
        `/relatorios/mesCategoria/receitas/${mes}&${categoria}`
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
      <TextField
        label="Categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        variant="outlined"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={fetchRelatorio}>
        Aplicar Filtros
      </Button>

      {error && <Typography color="error">{error}</Typography>}

      {results.mesReferencia && (
        <>
          <Typography variant="subtitle1">
            Total de Receitas: R$ {results.totalReceitas?.toFixed(2) || 0}
          </Typography>

          <Typography variant="h6">Receitas:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor Previsto(R$)</TableCell>
                  <TableCell align="right">Valor Realizado(R$)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.Receitas?.map((receita, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{receita.descricao}</TableCell>
                    <TableCell align="right">
                      R$ {parseFloat(receita.valorPrevisto).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      R$ {parseFloat(receita.valorRealizado).toFixed(2)}
                    </TableCell>
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

export default ReceitasPorCategoria;
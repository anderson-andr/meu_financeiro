import React, { useEffect, useState } from "react";
import axios from "axios";
import DespesaForm from "../../components/despesaForm/DespesaForm";
import api from "../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Pagination,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./despesas.css";

const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [filteredDespesas, setFilteredDespesas] = useState([]); // Estado para armazenar despesas filtradas
  const [openModal, setOpenModal] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Estados para os filtros
  const [mesReferenciaFilter, setMesReferenciaFilter] = useState("");
  const [valorFilter, setValorFilter] = useState("");

  useEffect(() => {
    fetchDespesas();
  }, []);

  // Função para buscar despesas
    const fetchDespesas = async () => {
        try {
          const response = await api.get(`/receitas`);
          
          const sortedDespesas = response.data.sort((a, b) => {
            const [mesA, anoA] = a.mesReferencia.split("-").map(Number);
            const [mesB, anoB] = b.mesReferencia.split("-").map(Number);
            
            return anoB - anoA || mesB - mesA; // Ordena primeiro pelo ano e depois pelo mês
          });
      
          setDespesas(sortedDespesas);
          setFilteredDespesas(sortedDespesas);
        } catch (error) {
          console.error("Erro ao buscar despesas:", error);
        }
      };
  

  // Função para adicionar ou editar uma despesa
  const handleDespesaAdicionada = async (novaDespesa) => {
    try {
      if (editingDespesa) {
        // Se estiver editando, atualiza a despesa existente
        await api.put(`/despesas/${editingDespesa.id}`, novaDespesa);
        setEditingDespesa(null);
      } else {
        // Se não estiver editando, adiciona uma nova despesa
        await api.post(`/despesas`, novaDespesa);
      }
      fetchDespesas(); // Atualiza a lista de despesas
    } catch (error) {
      console.error("Erro ao adicionar/editar despesa:", error);
    }
  };

  // Função para excluir uma despesa
  const handleDeleteDespesa = async (id) => {
    try {
      await api.delete(`/despesas/${id}`);
      fetchDespesas(); // Atualiza a lista de despesas após a exclusão
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
    }
  };

  // Função para aplicar os filtros
  const applyFilters = () => {
    let filtered = [...despesas];

    // Filtro por mês de referência
    if (mesReferenciaFilter) {
      filtered = filtered.filter((despesa) =>
        despesa.mesReferencia.includes(mesReferenciaFilter)
      );
    }

    // Filtro por valor (previsto ou realizado)
    if (valorFilter) {
      const valor = parseFloat(valorFilter);
      filtered = filtered.filter(
        (despesa) =>
          parseFloat(despesa.valorPrevisto) === valor ||
          parseFloat(despesa.valorRealizado) === valor
      );
    }

    setFilteredDespesas(filtered);
    setCurrentPage(1); // Redefine a página atual após aplicar os filtros
  };

  // Calcula os itens da página atual
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredDespesas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box>
      <Box className="despesas">
        <Typography className="despesas_texto" variant="h4" gutterBottom>
          Despesas
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
          {/* Filtro por Mês de Referência */}
          <TextField
            label="Mês de Referência"
            type="text"
            value={mesReferenciaFilter}
            onChange={(e) => setMesReferenciaFilter(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Filtro por Valor */}
          <TextField
            label="Valor"
            type="number"
            value={valorFilter}
            onChange={(e) => setValorFilter(e.target.value)}
            InputProps={{
              inputProps: { min: 0 },
            }}
          />

          {/* Botão para aplicar os filtros */}
          <Button variant="contained" color="primary" onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </Box>

        {/* Tabela de Despesas */}
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mês Referência</TableCell>
                <TableCell>Data Lançamento</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Valor Previsto(R$)</TableCell>
                <TableCell align="right">Valor Realizado(R$)</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell>{despesa.mesReferencia}</TableCell>
                  <TableCell>{despesa.data}</TableCell>
                  <TableCell>{despesa.categoria}</TableCell>
                  <TableCell>{despesa.descricao}</TableCell>
                  <TableCell>{despesa.status}</TableCell>
                  <TableCell align="right">
                    {Number(despesa.valorPrevisto).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {Number(despesa.valorRealizado).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {/* Botão de Editar */}
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingDespesa(despesa);
                          setOpenModal(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {/* Botão de Excluir */}
                    <Tooltip title="Excluir">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteDespesa(despesa.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginação */}
        <Pagination
          count={Math.ceil(filteredDespesas.length / rowsPerPage)}
          page={currentPage}
          onChange={(event, newPage) => setCurrentPage(newPage)}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}
        />

        {/* Botão para abrir o modal */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setEditingDespesa(null);
            setOpenModal(true);
          }}
          sx={{ marginBottom: 2 }}
        >
          Adicionar Despesa
        </Button>

        {/* Renderização condicional do modal */}
        <DespesaForm
          open={openModal}
          onClose={() => setOpenModal(false)}
          onDespesaAdicionada={handleDespesaAdicionada}
          editingDespesa={editingDespesa}
        />
      </Box>
    </Box>
  );
};

export default Despesas;
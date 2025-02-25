import React, { useEffect, useState } from "react";
import axios from "axios";
import ReceitaForm from "../../components/receitaForm/ReceitaForm"; // Importando o formulário
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
import "./receitas.css";
import api from "../../services/api";

const Receitas = () => {
  const [receitas, setReceitas] = useState([]);
  const [filteredReceitas, setFilteredReceitas] = useState([]); // Estado para armazenar receitas filtradas
  const [openModal, setOpenModal] = useState(false);
  const [editingReceita, setEditingReceita] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Estados para os filtros
  const [mesReferenciaFilter, setMesReferenciaFilter] = useState("");
  const [valorFilter, setValorFilter] = useState("");

  useEffect(() => {
    fetchReceitas();
  }, []);

  // Função para buscar receitas
  const fetchReceitas = async () => {
    try {
      const response = await api.get(`/receitas`);
      const sortedReceitas = response.data.sort(
        (a, b) => new Date(b.mesReferencia) - new Date(a.mesReferencia)
      );
      setReceitas(sortedReceitas);
      setFilteredReceitas(sortedReceitas); // Inicialmente, todas as receitas são exibidas
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
    }
  };

  // Função para adicionar ou editar uma receita
  const handleReceitaAdicionada = async (novaReceita) => {
    try {
      if (editingReceita) {
        // Se estiver editando, atualiza a receita existente
        await api.put(`/receitas/${editingReceita.id}`, novaReceita);
        setEditingReceita(null); // Limpa o estado de edição
      } else {
        // Se não estiver editando, adiciona uma nova receita
        await api.post(`/receitas`, novaReceita);
      }
      fetchReceitas(); // Atualiza a lista de receitas após a adição ou edição
    } catch (error) {
      console.error("Erro ao adicionar/editar receita:", error);
    }
  };

  // Função para excluir uma receita
  const handleDeleteReceita = async (id) => {
    try {
      await api.delete(`/receitas/${id}`);
      fetchReceitas(); // Atualiza a lista de receitas após a exclusão
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
    }
  };

  // Função para aplicar os filtros
  const applyFilters = () => {
    let filtered = [...receitas];

    // Filtro por mês de referência
    if (mesReferenciaFilter) {
      filtered = filtered.filter((receita) =>
        receita.mesReferencia.includes(mesReferenciaFilter)
      );
    }

    // Filtro por valor (previsto ou realizado)
    if (valorFilter) {
      const valor = parseFloat(valorFilter);
      filtered = filtered.filter(
        (receita) =>
          parseFloat(receita.valorPrevisto) === valor ||
          parseFloat(receita.valorRealizado) === valor
      );
    }

    setFilteredReceitas(filtered);
    setCurrentPage(1); // Redefine a página atual após aplicar os filtros
  };

  // Calcula os itens da página atual
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredReceitas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box>
      <Box className="receitas">
        <Typography className="receitas_texto" variant="h4" gutterBottom>
          Receitas
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

        {/* Tabela de Receitas */}
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
              {currentItems.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell>{receita.mesReferencia}</TableCell>
                  <TableCell>{receita.data}</TableCell>
                  <TableCell>{receita.categoria}</TableCell>
                  <TableCell>{receita.descricao}</TableCell>
                  <TableCell>{receita.status}</TableCell>
                  <TableCell align="right">
                    {Number(receita.valorPrevisto).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {Number(receita.valorRealizado).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingReceita(receita);
                          setOpenModal(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteReceita(receita.id)}
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
          count={Math.ceil(filteredReceitas.length / rowsPerPage)}
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
            setEditingReceita(null);
            setOpenModal(true);
          }}
          sx={{ marginBottom: 2 }}
        >
          Adicionar Receita
        </Button>

        {/* Renderização condicional do modal */}
        <ReceitaForm
          open={openModal}
          onClose={() => setOpenModal(false)}
          onReceitaAdicionada={handleReceitaAdicionada}
          editingReceita={editingReceita}
        />
      </Box>
    </Box>
  );
};

export default Receitas;
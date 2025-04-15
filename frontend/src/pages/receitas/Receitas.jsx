import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import ReceitaForm from "../../components/receitaForm/ReceitaForm";
import api from "../../services/api";
import "./receitas.css";

const Receitas = () => {
  const [receitas, setReceitas] = useState([]);
  const [filteredReceitas, setFilteredReceitas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingReceita, setEditingReceita] = useState(null);
  const [duplicarDialogOpen, setDuplicarDialogOpen] = useState(false);
  const [receitaParaDuplicar, setReceitaParaDuplicar] = useState(null);
  const [mesDestino, setMesDestino] = useState("");
  const [mesOrigem, setMesOrigem] = useState("");

  const [mesReferenciaFilter, setMesReferenciaFilter] = useState("");
  const [valorFilter, setValorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchReceitas();
  }, []);

<<<<<<< Updated upstream
  // Função para buscar receitas
    const fetchReceitas = async () => {
      try {
        const response = await api.get(`/receitas`);
        
        const sortedReceitas = response.data.sort((a, b) => {
          const [mesA, anoA] = a.mesReferencia.split("-").map(Number);
          const [mesB, anoB] = b.mesReferencia.split("-").map(Number);
          
          return anoB - anoA || mesB - mesA; // Ordena primeiro pelo ano e depois pelo mês
        });
    
        setReceitas(sortedReceitas);
        setFilteredReceitas(sortedReceitas);
      } catch (error) {
        console.error("Erro ao buscar receitas:", error);
      }
    };
=======
  const fetchReceitas = async () => {
    try {
      const response = await api.get("/receitas");
      const sorted = response.data.sort(
        (a, b) => new Date(b.mesReferencia) - new Date(a.mesReferencia)
      );
      setReceitas(sorted);
      setFilteredReceitas(sorted);
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
    }
  };
>>>>>>> Stashed changes

  const applyFilters = () => {
    let filtered = [...receitas];
    if (mesReferenciaFilter) {
      filtered = filtered.filter((r) =>
        r.mesReferencia.includes(mesReferenciaFilter)
      );
    }
    if (valorFilter) {
      const v = parseFloat(valorFilter);
      filtered = filtered.filter(
        (r) =>
          parseFloat(r.valorPrevisto) === v ||
          parseFloat(r.valorRealizado) === v
      );
    }
    setFilteredReceitas(filtered);
    setCurrentPage(1);
  };

  const handleDeleteReceita = async (id) => {
    if (window.confirm("Deseja realmente excluir?")) {
      try {
        await api.delete(`/receitas/${id}`);
        fetchReceitas();
      } catch (error) {
        console.error("Erro ao excluir receita:", error);
      }
    }
  };

  const handleReceitaAdicionada = async (novaReceita) => {
    try {
      if (novaReceita.id) {
        await api.put(`/receitas/${novaReceita.id}`, novaReceita);
      } else {
        await api.post("/receitas", novaReceita);
      }
      fetchReceitas();
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
    }
  };

  const abrirDuplicarModal = (receita) => {
    setMesOrigem(receita.mesReferencia)
    setReceitaParaDuplicar(receita);
    setMesDestino(""); // limpa o campo
    setDuplicarDialogOpen(true);
  };

  const confirmarDuplicacao = async () => {
    if (!mesDestino) {
      alert("Informe o mês de destino");
      return;
    }

    try {
      await api.post("/receitas/duplicar", {
        mesOrigem,
        mesDestino,
        receitaIds: [receitaParaDuplicar.id],
      });
      alert("Receita duplicada com sucesso!");
      setDuplicarDialogOpen(false);
      fetchReceitas();
    } catch (error) {
      console.error("Erro ao duplicar receita:", error);
      alert("Erro ao duplicar receita.");
    }
  };

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredReceitas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box className="receitas">
      <Typography variant="h4" gutterBottom>
        Receitas
      </Typography>

      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <TextField
          label="Mês de Referência"
          value={mesReferenciaFilter}
          onChange={(e) => setMesReferenciaFilter(e.target.value)}
        />
        <TextField
          label="Valor"
          type="number"
          value={valorFilter}
          onChange={(e) => setValorFilter(e.target.value)}
        />
        <Button variant="contained" onClick={applyFilters}>
          Aplicar Filtros
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mês Referência</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Previsto</TableCell>
              <TableCell align="right">Realizado</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.mesReferencia}</TableCell>
                <TableCell>{dayjs(r.data).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{r.categoria}</TableCell>
                <TableCell>{r.descricao}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell align="right">
                  {Number(r.valorPrevisto).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell align="right">
                  {Number(r.valorRealizado).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditingReceita(r);
                        setOpenModal(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteReceita(r.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicar">
                    <IconButton
                      color="secondary"
                      onClick={() => abrirDuplicarModal(r)}
                    >
                      <FileCopyIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={Math.ceil(filteredReceitas.length / rowsPerPage)}
        page={currentPage}
        onChange={(e, page) => setCurrentPage(page)}
        sx={{ my: 2, justifyContent: "center", display: "flex" }}
      />

      <Button
        variant="contained"
        onClick={() => {
          setEditingReceita(null);
          setOpenModal(true);
        }}
      >
        Adicionar Receita
      </Button>

      {/* Modal de Receita */}
      <ReceitaForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        onReceitaAdicionada={handleReceitaAdicionada}
        editingReceita={editingReceita}
      />

      {/* Modal Duplicação */}
      <Dialog open={duplicarDialogOpen} onClose={() => setDuplicarDialogOpen(false)}>
        <DialogTitle>Duplicar Receita</DialogTitle>
        <DialogContent>
          <Typography>Mês de origem: {mesOrigem}</Typography>
          <TextField
            label="Mês de destino"
            value={mesDestino}
            onChange={(e) => setMesDestino(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicarDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmarDuplicacao} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Receitas;

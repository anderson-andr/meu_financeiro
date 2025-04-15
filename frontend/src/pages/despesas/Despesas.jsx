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
import DespesaForm from "../../components/despesaForm/DespesaForm";
import api from "../../services/api";
import "./despesas.css";

const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [filteredDespesas, setFilteredDespesas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState(null);
  const [duplicarDialogOpen, setDuplicarDialogOpen] = useState(false);
  const [despesaParaDuplicar, setDespesaParaDuplicar] = useState(null);
  const [mesDestino, setMesDestino] = useState("");
  const [mesOrigem, setMesOrigem] = useState("");

  const [mesReferenciaFilter, setMesReferenciaFilter] = useState("");
  const [valorFilter, setValorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchDespesas();
  }, []);

<<<<<<< Updated upstream
  // Função para buscar despesas
    const fetchDespesas = async () => {
        try {
          const response = await api.get(`/despesas`);
          
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
  
=======
  const fetchDespesas = async () => {
    try {
      const response = await api.get("/despesas");
      const sorted = response.data.sort(
        (a, b) => new Date(b.mesReferencia) - new Date(a.mesReferencia)
      );
      setDespesas(sorted);
      setFilteredDespesas(sorted);
    } catch (error) {
      console.error("Erro ao buscar despesas:", error);
    }
  };
>>>>>>> Stashed changes

  const applyFilters = () => {
    let filtered = [...despesas];
    if (mesReferenciaFilter) {
      filtered = filtered.filter((d) =>
        d.mesReferencia.includes(mesReferenciaFilter)
      );
    }
    if (valorFilter) {
      const v = parseFloat(valorFilter);
      filtered = filtered.filter(
        (d) =>
          parseFloat(d.valorPrevisto) === v ||
          parseFloat(d.valorRealizado) === v
      );
    }
    setFilteredDespesas(filtered);
    setCurrentPage(1);
  };

  const handleDeleteDespesa = async (id) => {
    if (window.confirm("Deseja realmente excluir?")) {
      try {
        await api.delete(`/despesas/${id}`);
        fetchDespesas();
      } catch (error) {
        console.error("Erro ao excluir despesa:", error);
      }
    }
  };

  const handleDespesaAdicionada = async (novaDespesa) => {
    try {
      if (novaDespesa.id) {
        await api.put(`/despesas/${novaDespesa.id}`, novaDespesa);
      } else {
        await api.post("/despesas", novaDespesa);
      }
      fetchDespesas();
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
    }
  };

  const abrirDuplicarModal = (despesa) => {
    setMesOrigem(despesa.mesReferencia);
    setDespesaParaDuplicar(despesa);
    setMesDestino(""); // limpa o campo
    setDuplicarDialogOpen(true);
  };

  const confirmarDuplicacao = async () => {
    if (!mesDestino) {
      alert("Informe o mês de destino");
      return;
    }

    try {
      await api.post("/despesas/duplicar", {
        mesOrigem,
        mesDestino,
        despesaIds: [despesaParaDuplicar.id],
      });
      alert("Despesa duplicada com sucesso!");
      setDuplicarDialogOpen(false);
      fetchDespesas();
    } catch (error) {
      console.error("Erro ao duplicar despesa:", error);
      alert("Erro ao duplicar despesa.");
    }
  };

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredDespesas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Box className="despesas">
      <Typography variant="h4" gutterBottom>
        Despesas
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
            {currentItems.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.mesReferencia}</TableCell>
                <TableCell>{dayjs(d.data).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{d.categoria}</TableCell>
                <TableCell>{d.descricao}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell align="right">
                  {Number(d.valorPrevisto).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell align="right">
                  {Number(d.valorRealizado).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditingDespesa(d);
                        setOpenModal(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteDespesa(d.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicar">
                    <IconButton
                      color="secondary"
                      onClick={() => abrirDuplicarModal(d)}
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
        count={Math.ceil(filteredDespesas.length / rowsPerPage)}
        page={currentPage}
        onChange={(e, page) => setCurrentPage(page)}
        sx={{ my: 2, justifyContent: "center", display: "flex" }}
      />

      <Button
        variant="contained"
        onClick={() => {
          setEditingDespesa(null);
          setOpenModal(true);
        }}
      >
        Adicionar Despesa
      </Button>

      {/* Modal de Despesa */}
      <DespesaForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        onDespesaAdicionada={handleDespesaAdicionada}
        editingDespesa={editingDespesa}
      />

      {/* Modal Duplicação */}
      <Dialog open={duplicarDialogOpen} onClose={() => setDuplicarDialogOpen(false)}>
        <DialogTitle>Duplicar Despesa</DialogTitle>
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

export default Despesas;

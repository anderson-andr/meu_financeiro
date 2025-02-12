import React, { useEffect, useState } from "react";
import axios from "axios";
import DespesaForm from "../../components/despesaForm/DespesaForm"; // Importando o formulário
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import './despesas.css';

const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [openModal, setOpenModal] = useState(false); // Estado para controlar a visibilidade do modal
  const [editingDespesa, setEditingDespesa] = useState(null); // Estado para controlar a edição
  const [currentPage, setCurrentPage] = useState(1); // Estado para controlar a página atual
  const rowsPerPage = 5; // Número de itens por página

  useEffect(() => {
    fetchDespesas();
  }, []);

  // Função para buscar despesas
  const fetchDespesas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/despesas");
      // Ordena as despesas pelo mês de referência (decrescente)
      const sortedDespesas = response.data.sort((a, b) => {
        return new Date(b.mesReferencia) - new Date(a.mesReferencia);
      });
      setDespesas(sortedDespesas);
    } catch (error) {
      console.error("Erro ao buscar despesas:", error);
    }
  };

  // Função para adicionar ou editar uma despesa
  const handleDespesaAdicionada = async (novaDespesa) => {
    if (editingDespesa) {
      // Se estiver editando, atualiza a despesa existente
      await axios.put(`http://localhost:3000/api/despesas/${editingDespesa.id}`, novaDespesa);
      setEditingDespesa(null); // Limpa o estado de edição
    } else {
      // Se não estiver editando, adiciona uma nova despesa
      await axios.post("http://localhost:3000/api/despesas", novaDespesa);
    }
    fetchDespesas(); // Atualiza a lista de despesas
  };

  // Função para excluir uma despesa
  const handleDeleteDespesa = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/despesas/${id}`);
      fetchDespesas(); // Atualiza a lista de despesas após a exclusão
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
    }
  };

  // Calcula os itens da página atual
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = despesas.slice(indexOfFirstItem, indexOfLastItem);

  // Manipula a mudança de página
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Box>
      <Box className="despesas">
        <Typography className="despesas_texto" variant="h4" gutterBottom>
          Despesas
        </Typography>
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
                <TableCell align="right">Valor (R$)</TableCell>
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
                    {Number(despesa.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell align="center">
                    {/* Botão de Editar */}
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingDespesa(despesa); // Define a despesa em edição
                          setOpenModal(true); // Abre o modal
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
          count={Math.ceil(despesas.length / rowsPerPage)} // Número total de páginas
          page={currentPage}
          onChange={handleChangePage}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}
        />
        {/* Botão para abrir o modal */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setEditingDespesa(null); // Limpa o estado de edição
            setOpenModal(true); // Abre o modal
          }}
          sx={{ marginBottom: 2 }}
        >
          Adicionar Despesa
        </Button>
        {/* Renderização condicional do modal */}
        <DespesaForm
          open={openModal}
          onClose={() => setOpenModal(false)} // Fecha o modal
          onDespesaAdicionada={handleDespesaAdicionada}
          editingDespesa={editingDespesa} // Passa a despesa em edição
        />
      </Box>
    </Box>
  );
};

export default Despesas;
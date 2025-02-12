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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./receitas.css";

import api from "../../services/api";
const Receitas = () => {
  const [receitas, setReceitas] = useState([]);
  const [openModal, setOpenModal] = useState(false); // Estado para controlar a visibilidade do modal
  const [editingReceita, setEditingReceita] = useState(null); // Estado para controlar a edição
  const [currentPage, setCurrentPage] = useState(1); // Estado para controlar a página atual
  const rowsPerPage = 5; // Número de itens por página

  useEffect(() => {
    fetchReceitas();
  
   
  }, []);

  // Função para buscar receitas
  const fetchReceitas = async () => {
    try {
      const response = await api.get(  `/receitas`);
      // Ordena as receitas pelo mês de referência (decrescente)
      const sortedReceitas = response.data.sort((a, b) => {
        
        return new Date(b.mesReferencia) - new Date(a.mesReferencia);
      });
      setReceitas(sortedReceitas);
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
    }
  };

  // Função para adicionar ou editar uma receita
  const handleReceitaAdicionada = async (novaReceita) => {
    if (editingReceita) {
      // Se estiver editando, atualiza a receita existente
      await api.put( `/receitas/${editingReceita.id}`, novaReceita);
      setEditingReceita(null); // Limpa o estado de edição
    } else {
      // Se não estiver editando, adiciona uma nova receita
      await api.post( `/receitas`, novaReceita);
    }
    fetchReceitas(); // Atualiza a lista de receitas
  };

  // Função para excluir uma receita
  const handleDeleteReceita = async (id) => {
    try {
      await api.delete( `/receitas/${id}`);
      fetchReceitas(); // Atualiza a lista de receitas após a exclusão
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
    }
  };

  // Calcula os itens da página atual
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = receitas.slice(indexOfFirstItem, indexOfLastItem);

  // Manipula a mudança de página
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Box>
      <Box className="receitas">
        <Typography className="receitas_texto" variant="h4" gutterBottom>
          Receitas
        </Typography>
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
                <TableCell align="right">Valor (R$)</TableCell>
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
                    {Number(receita.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell align="center">
                    {/* Botão de Editar */}
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingReceita(receita); // Define a receita em edição
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
          count={Math.ceil(receitas.length / rowsPerPage)} // Número total de páginas
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
            setEditingReceita(null); // Limpa o estado de edição
            setOpenModal(true); // Abre o modal
          }}
          sx={{ marginBottom: 2 }}
        >
          Adicionar Receita
        </Button>
        {/* Renderização condicional do modal */}
        <ReceitaForm
          open={openModal}
          onClose={() => setOpenModal(false)} // Fecha o modal
          onReceitaAdicionada={handleReceitaAdicionada}
          editingReceita={editingReceita} // Passa a receita em edição
        />
      </Box>
    </Box>
  );
};

export default Receitas;
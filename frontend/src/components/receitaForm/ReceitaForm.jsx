import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  DialogActions,
} from "@mui/material";

const ReceitaForm = ({ open, onClose, onReceitaAdicionada, editingReceita }) => {
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [status, setStatus] = useState("previsto");
  const [mesReferencia, setMesReferencia] = useState("");
  const [data, setData] = useState("");

  // Função para resetar os campos do formulário
  const resetForm = () => {
    setDescricao("");
    setCategoria("");
    setValor("");
    setStatus("previsto");
    setMesReferencia("");
    setData("");
  };

  // Preenche os campos com os dados da receita em edição ou limpa os campos
  useEffect(() => {
    if (open) {
      if (editingReceita) {
        setDescricao(editingReceita.descricao || "");
        setCategoria(editingReceita.categoria || "");
        setValor(editingReceita.valor || "");
        setStatus(editingReceita.status || "previsto");
        setMesReferencia(editingReceita.mesReferencia || "");
        setData(editingReceita.data || "");
      } else {
        resetForm(); // Limpa os campos se não estiver editando
      }
    }
  }, [open, editingReceita]);

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    const novaReceita = {
      descricao,
      valor,
      categoria,
      status,
      mesReferencia,
      data,
    };
    try {
      await onReceitaAdicionada(novaReceita); // Passa a nova receita para o pai
      resetForm(); // Limpa os campos após salvar
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao adicionar/editar receita:", error);
    }
  };

  return (
    <Dialog open={open} onClose={() => { resetForm(); onClose(); }}>
      <DialogTitle>
        {editingReceita ? "Editar Receita" : "Adicionar Receita"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Mês Referência(MM-YYYY)"
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Data Lançamento"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Valor"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="previsto">Previsto</MenuItem>
              <MenuItem value="realizado">Realizado</MenuItem>
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { resetForm(); onClose(); }}>Cancelar</Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Validação de props
ReceitaForm.propTypes = {
  open: PropTypes.bool.isRequired, // Controla a visibilidade do modal
  onClose: PropTypes.func.isRequired, // Função para fechar o modal
  onReceitaAdicionada: PropTypes.func.isRequired, // Função para adicionar/editar receita
  editingReceita: PropTypes.object, // Receita em edição (opcional)
};

export default ReceitaForm;
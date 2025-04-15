import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

const DespesaForm = ({ open, onClose, onDespesaAdicionada, editingDespesa }) => {
  const [formData, setFormData] = useState({
    mesReferencia: "",
    data: "",
    categoria: "",
    descricao: "",
    status: "previsto",
    valorPrevisto: "",
    valorRealizado: "",
  });

  useEffect(() => {
    if (editingDespesa) {
      setFormData(editingDespesa);
    } else {
      setFormData({
        mesReferencia: "",
        data: "",
        categoria: "",
        descricao: "",
        status: "previsto",
        valorPrevisto: "",
        valorRealizado: "",
      });
    }
  }, [editingDespesa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onDespesaAdicionada(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editingDespesa ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Mês Referência"
          name="mesReferencia"
          value={formData.mesReferencia}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Data"
          name="data"
          type="date"
          value={formData.data}
          onChange={handleChange}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Descrição"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          fullWidth
          margin="dense"
        >
          <MenuItem value="previsto">Previsto</MenuItem>
          <MenuItem value="realizado">Realizado</MenuItem>
        </TextField>
        <TextField
          label="Valor Previsto"
          name="valorPrevisto"
          type="number"
          value={formData.valorPrevisto}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Valor Realizado"
          name="valorRealizado"
          type="number"
          value={formData.valorRealizado}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DespesaForm;

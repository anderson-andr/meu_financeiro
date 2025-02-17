// src/pages/Register.jsx

import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './register.css'; // Importa o CSS específico para o Register

const Register = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      // Envia os dados de registro para o backend
      await api.post('/register', { username, password });
      alert('Registro realizado com sucesso!');
      navigate('/login'); // Redireciona para a página de login após o registro
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setError('Erro ao registrar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="register-container">
      <h2>Registrar-se</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirme sua Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Registrar</button>
      </form>
      <div className="login-link">
        <p>
          Já tem uma conta?{' '}
          <span onClick={() => navigate('/login')}>Faça login aqui</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
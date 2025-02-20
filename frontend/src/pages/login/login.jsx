import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/context/AuthContext';
import './login.css'; // Importa o CSS específico para o Login
import { fetchUserData } from '../../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState("");  // Altere o estado para armazenar apenas o userId
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  // Use useEffect para verificar e carregar o userId do localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);  // Carrega o userId para o estado
      navigate('/home');  // Redireciona se o usuário já estiver logado
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { username, password });
      const token = response.data.token;

      // Salva o token e chama a função de login do contexto
      login(token);

      // Chama fetchUserData para armazenar o userId no localStorage
      const id = await fetchUserData();
      setUserId(id);  // Atualiza o estado com o userId

      // Redireciona para o home
      navigate('/home');
      console.log(token);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {userId && <p>Bem-vindo, usuário {userId}!</p>}  {/* Exibe o id do usuário se estiver logado */}
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <div className="register-link">
        <button onClick={() => navigate('/register')}>Registrar-se</button>
      </div>
    </div>
  );
};

export default Login;

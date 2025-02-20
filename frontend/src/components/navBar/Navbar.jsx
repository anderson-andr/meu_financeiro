// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '@mui/material/Button';
import './navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = React.useContext(AuthContext);

  return (
    <nav className="nav">
      <ul>
        {/* Links condicionais baseados no estado de autenticação */}
        {isAuthenticated ? (
          <>
            {/* Links visíveis apenas para usuários autenticados */}
            <li>
              <Button variant="text" onClick={() => navigate("/home")}>
                Início
              </Button>
            </li>
            <li>
              <Button variant="text" onClick={() => navigate("/relatorios")}>
                Relatórios
              </Button>
            </li>
            <li>
              <Button variant="text" onClick={() => navigate("/receitas")}>
                Receitas
              </Button>
            </li>
            <li>
              <Button variant="text" onClick={() => navigate("/despesas")}>
                Despesas
              </Button>
            </li>
            <li>
              <Button
                variant="text"
                color="error"
                onClick={() => {
                  logout(); // Chama a função de logout do contexto
                  navigate("/login"); // Redireciona para a página de login
                }}
              >
                Sair
              </Button>
            </li>
          </>
        ) : (
          <>
            {/* Links visíveis apenas para usuários não autenticados */}
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

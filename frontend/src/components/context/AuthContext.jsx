// src/context/AuthContext.jsx

import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types'; // Importa PropTypes
import { saveToken, getToken, removeToken } from '../../utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  const login = (token) => {
    saveToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Validação de PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, // Garante que `children` seja um nó React válido
};
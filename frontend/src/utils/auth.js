// src/utils/auth.js

// Salva o token no localStorage
export const saveToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  // Obtém o token do localStorage
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Remove o token do localStorage
  export const removeToken = () => {
    localStorage.removeItem('token');
  };
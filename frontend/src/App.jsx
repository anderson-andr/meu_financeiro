// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/navBar/Navbar';
import Login from './pages/login/login';
import Home from './pages/home/Home';
import Relatorios from './pages/relatorios/Relatorios';
import Receitas from './pages/receitas/Receitas';
import Despesas from './pages/despesas/Despesas';
import './App.css';
import Register from './pages/register/register';

// Componente para verificar se deve exibir a Navbar
const LayoutWithNavbar = ({ children }) => {
  const location = useLocation();

  // Lista de rotas públicas onde a Navbar não deve ser exibida
  const publicRoutes = ['/login'];

  // Verifica se a rota atual é pública
  const shouldShowNavbar = !publicRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas */}
          <Route
            path="/home"
            element={
              <LayoutWithNavbar>
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              </LayoutWithNavbar>
            }
          />
          <Route
            path="/"
            element={
              <LayoutWithNavbar>
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              </LayoutWithNavbar>
            }
          />
          <Route
            path="/relatorios"
            element={
              <LayoutWithNavbar>
                <ProtectedRoute>
                  <Relatorios />
                </ProtectedRoute>
              </LayoutWithNavbar>
            }
          />
          <Route
            path="/receitas"
            element={
              <LayoutWithNavbar>
                <ProtectedRoute>
                  <Receitas />
                </ProtectedRoute>
              </LayoutWithNavbar>
            }
          />
          <Route
            path="/despesas"
            element={
              <LayoutWithNavbar>
                <ProtectedRoute>
                  <Despesas />
                </ProtectedRoute>
              </LayoutWithNavbar>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
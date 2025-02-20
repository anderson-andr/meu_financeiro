import axios from 'axios';
import { getToken } from '../utils/auth';

// Criação da instância do Axios
const api = axios.create({
  baseURL: 'https://api.minhas-financias.online/api', // Substitua pela URL do seu back-end
});

// Interceptador para adicionar o token nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = getToken(); // Recupera o token atualizado
    if (token) {
      // Adiciona o token ao cabeçalho Authorization
      config.headers['Authorization'] = token;
      console.log("Token adicionado ao cabeçalho:", config.headers['Authorization']);
    } else {
      console.warn("Nenhum token encontrado.");
    }
    return config;
  },
  (error) => {
    console.error("Erro ao configurar o interceptador:", error);
    return Promise.reject(error);
  }
);

// Função para buscar os dados do usuário autenticado
export const fetchUserData = async () => {
  // Verificar se os dados do usuário já estão no localStorage
  const storedUser = sessionStorage.getItem('userData');
  if (storedUser) {
    console.log("Dados do usuário já encontrados no localStorage:", JSON.parse(storedUser));
    return JSON.parse(storedUser); // Retorna os dados do usuário do localStorage
  }

  try {
    const response = await api.get("/user/me"); // Chama o endpoint /user/me
    console.log("Resposta completa da API:", response); // Log para depuração
    console.log("Usuário autenticado (API):", response.data.user); // Log para depuração

    // Salva os dados do usuário no localStorage
    const userId = response.data.user.userId; 
    sessionStorage.setItem('userData',userId);
    console.log("Dados do usuário salvos no localStorage:", userId);

    return response.data.user; // Retorna os dados do usuário
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    throw error;
  }
};

// Função para limpar os dados do usuário do localStorage
export const clearUserData = () => {
  localStorage.removeItem('userData');
  console.log("Dados do usuário removidos do localStorage.");
};

// Função para obter os dados do usuário do localStorage
export const getUserDataFromLocalStorage = () => {
  const userData = sessionStorage.getItem('userData');
  if (userData) {
    console.log("Dados do usuário recuperados do localStorage:", JSON.parse(userData));
    return JSON.parse(userData);
  }
  console.warn("Nenhum dado de usuário encontrado no localStorage.");
  return null;
};

// Função para atualizar o token nas configurações do Axios
export const updateAuthHeader = () => {
  const token = getToken();
  if (token) {
    // Atualiza o cabeçalho Authorization globalmente
    api.defaults.headers['Authorization'] = token;
    console.log("Token atualizado nas configurações globais do Axios.");
  } else {
    console.warn("Nenhum token disponível para atualização.");
  }
};

// Exporte a instância para ser usada nas requisições
export default api;

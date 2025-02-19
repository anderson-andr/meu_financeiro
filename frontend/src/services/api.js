import axios from 'axios';
import { getToken } from '../utils/auth';

// Criação da instância do Axios
const api = axios.create({
  baseURL: 'https://api.minhas-financias.online/api', // Substitua pela URL do seu back-end
});

// Interceptador para adicionar o token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // Recupera o token atualizado

    if (token) {
      // Adiciona o token ao cabeçalho Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
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

// Função para atualizar o token nas configurações do Axios
export const updateAuthHeader = () => {
  const token = getToken();
  if (token) {
    // Atualiza o cabeçalho Authorization globalmente
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
    console.log("Token atualizado nas configurações globais do Axios.");
  } else {
    console.warn("Nenhum token disponível para atualização.");
  }
};

// Exporte a instância para ser usada nas requisições
export default api;

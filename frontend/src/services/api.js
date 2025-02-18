import axios from 'axios';
import jwt_decode from 'jwt_decode';

import { getToken } from '../utils/auth';

// Criação da instância do Axios
const api = axios.create({
  baseURL: 'https://api.minhas-financias.online/api', // Substitua pela URL do seu back-end
});

// Interceptador para adicionar o token e o userId nas requisições
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // Recupera o token atualizado

    if (token) {
      try {
        // Decodifica o token para extrair o userId
        const decodedToken = jwt_decode(token); // Usa jwtDecode para decodificar o token
        const userId = decodedToken.userId;

        // Adiciona o token ao cabeçalho Authorization
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log("Token adicionado ao cabeçalho:", config.headers['Authorization']);

        // Adiciona o userId a um cabeçalho personalizado, se necessário
        config.headers['X-User-Id'] = userId; // Exemplo de cabeçalho personalizado
        console.log("User ID adicionado ao cabeçalho:", userId);
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
      }
    } else {
      console.warn("Nenhum token encontrado.");
    }

    return config; // Retorna a configuração com os headers modificados
  },
  (error) => {
    console.error("Erro ao configurar o interceptador:", error);
    return Promise.reject(error); // Caso haja erro, rejeita a requisição
  }
);

// Função para atualizar o token nas configurações do Axios
export const updateAuthHeader = () => {
  const token = getToken();
  if (token) {
    try {
      // Decodifica o token para extrair o userId
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;

      // Atualiza o cabeçalho Authorization globalmente
      api.defaults.headers['Authorization'] = `Bearer ${token}`;
      console.log("Token atualizado nas configurações globais do Axios.");

      // Atualiza o cabeçalho personalizado com o userId
      api.defaults.headers['X-User-Id'] = userId;
      console.log("User ID atualizado nas configurações globais do Axios.");
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  } else {
    console.warn("Nenhum token disponível para atualização.");
  }
};

// Exporte a instância para ser usada nas requisições
export default api;
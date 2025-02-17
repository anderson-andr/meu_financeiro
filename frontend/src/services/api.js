import axios from 'axios';
import { getToken } from '../utils/auth';

const api = axios.create({
  baseURL: 'https://api.minhas-financias.online/api', // Substitua pela URL do seu back-end
});

// Interceptador para adicionar o token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = getToken(); // Recupera o token

    if (token) {
      config.headers['Authorization'] = `${token}`; // Adiciona o token ao cabeçalho

    } else {
      console.log("Nenhum token encontrado.");
    }
    
    return config; // Retorna a configuração com o header modificado
  },
  (error) => {
    return Promise.reject(error); // Caso haja erro, rejeita
  }
);

export default api;

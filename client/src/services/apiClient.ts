// src/services/apiClient.ts
import axios, { AxiosError } from 'axios';

// Interface para estrutura de erro esperada da API (opcional)
export interface ApiErrorResponse {
  message: string;
  success?: boolean;
  // Adicione outros campos de erro que sua API possa retornar
}

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Sua URL base do backend
});

// Interceptor de RESPOSTA para tratar erros globais como 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response && error.response.status === 401) {
      // Se receber 401 (Não Autorizado), significa que o token é inválido ou expirou.
      // Limpa o localStorage e redireciona para login.
      // Esta lógica é uma forma de deslogar globalmente.
      // O AuthContext também terá uma função logout para ser chamada explicitamente.
      console.error("API Client: Erro 401 - Não autorizado. Deslogando...");
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Evita loop de redirecionamento se já estiver no login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'; // Força o reload para a página de login
      }
    }
    // Rejeita o erro para que o local da chamada possa tratá-lo também
    return Promise.reject(error);
  }
);

export default apiClient;
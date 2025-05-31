import apiClient from './apiClient';
import type { ApiErrorResponse } from './apiClient'; // <--- MUDANÇA AQUI
import type { AuthUser } from '../context/AuthContext'; // <--- MUDANÇA AQUI

interface LoginSuccessResponse {
  success: boolean;
  token: string;
  usuario: AuthUser;
}

// Tipagem para o erro de login da API
interface LoginErrorResponse extends ApiErrorResponse {}


export const realizarLogin = async (email: string, senha: string): Promise<LoginSuccessResponse> => {
  try {
    const response = await apiClient.post<LoginSuccessResponse>('/login', { email, senha });
    return response.data;
  } catch (error: any) {
    // O interceptor do apiClient já pode ter lidado com 401,
    // mas aqui podemos customizar a mensagem de erro para a tela de login.
    const errorData = error.response?.data as LoginErrorResponse;
    throw new Error(errorData?.message || 'Email ou senha inválidos.');
  }
};

// Você pode adicionar a função de cadastro aqui também
// export const realizarCadastro = async (dadosCadastro: any) => { ... }
// src/services/professorService.ts
import apiClient from './apiClient';
import type { Curso } from '../types/Curso/curso'; // Ajuste o caminho

interface MeusCursosResponse {
  success: boolean;
  data: Curso[];
  message?: string;
}

// Função para buscar os cursos do professor LOGADO (o backend identifica pelo token)
export const fetchMeusCursos = async (): Promise<Curso[]> => {
  try {
    // O token já é adicionado pelo apiClient (configurado pelo AuthContext)
    const response = await apiClient.get<MeusCursosResponse>('/professores/meus-cursos');
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      // Se success for false mas não houve erro HTTP, lança erro com a mensagem da API
      throw new Error(response.data.message || "Falha ao buscar os cursos do professor.");
    }
  } catch (error: any) {
    // Se for um erro do Axios, a mensagem já pode ter sido tratada pelo interceptor
    // ou podemos relançar uma mensagem mais específica.
    console.error("Erro no serviço fetchMeusCursos:", error);
    throw new Error(error.response?.data?.message || error.message || "Não foi possível carregar os cursos.");
  }
};
// src/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react'; // <--- MUDANÇA AQUI
import apiClient from '../services/apiClient';

// Ajuste este tipo para o que sua API retorna no objeto 'usuario' do login
// É importante ter 'tipo' e 'id_usuario'.
// Se o backend já retorna id_professor ou id_aluno no login, adicione aqui.
export interface AuthUser {
  id_usuario: number;
  nome: string;
  email: string;
  tipo: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
  id_professor?: number; // Se o backend retornar isso para professores
  id_aluno?: number;     // Se o backend retornar isso para alunos
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loginContext: (token: string, userData: AuthUser) => void; // Renomeado para evitar conflito
  logoutContext: () => void; // Renomeado para evitar conflito
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserString = localStorage.getItem('authUser');
    if (storedToken && storedUserString) {
      try {
        const storedUser: AuthUser = JSON.parse(storedUserString);
        setToken(storedToken);
        setUser(storedUser);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error("AuthContext: Erro ao parsear dados do localStorage", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const loginContext = useCallback((newToken: string, userData: AuthUser) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }, []);

  const logoutContext = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    // O redirecionamento pode ser feito no componente que chama logout, usando useNavigate
    // ou window.location.href = '/login'; se preferir recarregar
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, loginContext, logoutContext, isLoading }}>
      {!isLoading && children} {/* Renderiza children apenas quando isLoading é false */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
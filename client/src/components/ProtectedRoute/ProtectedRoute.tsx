// src/components/ProtectedRoute/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importe o hook useAuth
import type { Usuario } from '../../types/Clientes/usuario';

interface ProtectedRouteProps {
  allowedTypes?: Usuario['tipo'][];
  redirectPath?: string; // Renomeado para ser mais genérico que só /login
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedTypes,
  redirectPath = '/login', // Redireciona para /login por padrão se não autenticado
}) => {
  const { isAuthenticated, user, isLoading } = useAuth(); // Pega do contexto
  const location = useLocation();

  if (isLoading) {
    // Mostra um loader enquanto o AuthContext verifica o token no localStorage
    return <div>Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login (ou redirectPath)
    // Passa a localização atual para que possa voltar após o login
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Se 'allowedTypes' for fornecido, verifica se o usuário tem o perfil necessário
  if (allowedTypes && allowedTypes.length > 0) {
    if (!user || !allowedTypes.includes(user.tipo)) {
      // Se não tiver o perfil, redireciona para uma página de "Não Autorizado"
      // ou para a home se preferir.
      return <Navigate to="/nao-autorizado" replace />; // Crie uma página /nao-autorizado
    }
  }

  // Usuário autenticado e autorizado, renderiza o conteúdo da rota
  return <Outlet />;
};
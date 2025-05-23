import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Usuario } from '../../types/Clientes/usuario'; // Importe o tipo Usuario

interface ProtectedRouteProps {

  allowedTypes?: Usuario['tipo'][]; 
  
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedTypes, redirectPath = '/' }) => {
  // const isAuthenticated = !!localStorage.getItem('authToken'); 
  // if (!isAuthenticated) {
  //   return <Navigate to={redirectPath} replace />;
  // }


  // if (allowedTypes && allowedTypes.length > 0) {
  //   const userDataString = localStorage.getItem('userData');
  //   let userType: Usuario['tipo'] | null = null;

  //   if (userDataString) {
  //     try {
  //       const userData = JSON.parse(userDataString);
  //       userType = userData.tipo;
  //     } catch (e) {
  //       console.error("Erro ao parsear dados do usuário do localStorage:", e);
  //     }
  //   }

  //   // Se o tipo do usuário não estiver na lista de tipos permitidos
  //   if (!userType || !allowedTypes.includes(userType)) {
  //     return <Navigate to={redirectPath} replace />;
  //   }
  // }

  // Usuário autenticado e autorizado (se allowedTypes foi especificado), renderiza o conteúdo
  return <Outlet />;
};
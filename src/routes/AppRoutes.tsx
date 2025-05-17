import { Navigate, useRoutes } from "react-router-dom";
import {LoginPage} from "../pages/Login/LoginPage";
import { CadastroPage } from "../pages/Cadastro/CadstroPage";
import { PlataformaPage } from "../pages/Plataforma/PlataformaPage";
import { CursoLayout } from "../pages/Curso/CursoLayout";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage";
import AulaPage from "../pages/Curso/AulaPage";

export default function AppRoutes() {
  return useRoutes([

    { path: '/',       element: <LoginPage /> },
    { path: '/cadastro', element: <CadastroPage /> },
    { path: '/home',     element: <PlataformaPage /> },

    {
      path: '/curso/:cursoId',
      element: <CursoLayout />,
      children: [
        { path: 'aula/:aulaId', element: <AulaPage /> },
        { index: true, element: <Navigate to="aula/1" replace /> }
        //essa rota será acionada quando o usuário acessar exatamente o caminho da rota pai
      ]
    },

    { path: '*', element: <NotFoundPage /> }
  ]);
}
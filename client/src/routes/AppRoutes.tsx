import { Navigate, useRoutes } from "react-router-dom";
import { LoginPage } from "../pages/Login/LoginPage";
import { CadastroPage } from "../pages/Cadastro/CadstroPage";
import { PlataformaPage } from "../pages/Plataforma/PlataformaPage";
import { CursoLayout } from "../pages/Curso/CursoLayout";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage";
import { AulaPage } from "../pages/Curso/AulaPage";
import { ProfArea } from "../pages/ProfArea/ProfArea";
import { ProfessorEditPage } from "../pages/ProfessorEditPage/ProfessorEditPage";
import { ProtectedRoute } from "../components/ProtectedRoute/ProtectedRoute";
import { AdminArea } from "../pages/AdminArea/AdminArea";

export default function AppRoutes() {
  return useRoutes([
    // --- Rotas Públicas ---
    { path: '/login', element: <LoginPage /> }, // <-- CORRIGIDO: Agora a rota é /login
    { path: '/cadastro', element: <CadastroPage /> },
    
    // --- Redirecionamento da Raiz ---
    // Se alguém acessar a raiz do site, será redirecionado para a página de login.
    { path: '/', element: <Navigate to="/login" replace /> },

    // --- Rotas Protegidas ---
    // Rotas protegidas para qualquer usuário autenticado
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/home', element: <PlataformaPage /> },
        {
          path: '/curso/:cursoId',
          element: <CursoLayout />,
          children: [
            { path: 'aula/:aulaId', element: <AulaPage /> },
            // Opcional: Se quiser que ao entrar no curso já vá para a primeira aula, ajuste o :aulaId
            // { index: true, element: <Navigate to="aula/1" replace /> }, 
          ],
        },
      ],
    },

    // Rotas protegidas especificamente para PROFESSORES
    {
      element: <ProtectedRoute allowedTypes={['PROFESSOR']} />,
      children: [
        { path: '/professor', element: <ProfArea /> },
        { path: '/professor/curso/:cursoId', element: <ProfessorEditPage /> }, // Ajuste o param para :cursoId se for o padrão
      ],
    },

    // Rotas protegidas especificamente para ADMINS
    {
      element: <ProtectedRoute allowedTypes={['ADMIN']} />,
      children: [
        { path: '/admin', element: <AdminArea /> },
        { path: '/admin/curso/:cursoId', element: <ProfessorEditPage /> }, // Ajuste o param para :cursoId se for o padrão
      ],
    },
 
    // Rota "Catch-All" para páginas não encontradas
    { path: '*', element: <NotFoundPage /> }
  ]);
}
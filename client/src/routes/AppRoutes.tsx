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
// import { useUser } from "../hooks/userUser";
// import { ProfessorCursosPage } from "../pages/Professor/ProfessorCursosPage";
// import { ProfessorCursoPage } from "../pages/Professor/ProfessorCursoPage";

export default function AppRoutes() {
  return useRoutes([
    { path: '/', element: <LoginPage /> },
    { path: '/cadastro', element: <CadastroPage /> },

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
            { index: true, element: <Navigate to="aula/1" replace /> },
          ],
        },
        // Adicione outras rotas aqui que devem ser acessíveis
        // por qualquer usuário autenticado.
      ],
    },

    // Rotas protegidas especificamente para PROFESSORES
    {
      element: <ProtectedRoute allowedTypes={['PROFESSOR']} />,
      children: [
        { path: '/professor', element: <ProfArea /> },
        { path: '/professor/curso/:id', element: <ProfessorEditPage /> },
        // Adicione outras rotas específicas de professor aqui, se houver.
        // Exemplo:
        // {
        //   path: '/professor/cursos',
        //   element: <ProfessorCursosPage /> // Certifique-se de importar este componente
        // },
      ],
    },
    {
      element: <ProtectedRoute allowedTypes={['ADMIN']} />,
      children: [
        { path: '/admin', element: <ProfArea /> },
        { path: '/admin/curso/:id', element: <ProfessorEditPage /> },
        // Adicione outras rotas específicas de professor aqui, se houver.
        // Exemplo:
        // {
        //   path: '/professor/cursos',
        //   element: <ProfessorCursosPage /> // Certifique-se de importar este componente
        // },
      ],
    },

    // Você pode adicionar mais blocos de ProtectedRoute para outros tipos de usuário,
    // como 'ADMIN', se necessário.
    // Exemplo:
    // { element: <ProtectedRoute allowedTypes={['ADMIN']} />, children: [...] },
 
     { path: '*', element: <NotFoundPage /> }
  ]);
}
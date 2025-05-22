import { Navigate, useRoutes } from "react-router-dom";
import { LoginPage } from "../pages/Login/LoginPage";
import { CadastroPage } from "../pages/Cadastro/CadstroPage";
import { PlataformaPage } from "../pages/Plataforma/PlataformaPage";
import { CursoLayout } from "../pages/Curso/CursoLayout";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage";
import { AulaPage } from "../pages/Curso/AulaPage";
import { ProfArea } from "../pages/ProfArea/ProfArea";
import { ProfessorEditPage } from "../pages/ProfessorEditPage/ProfessorEditPage";
// import { useUser } from "../hooks/userUser";
// import { ProfessorCursosPage } from "../pages/Professor/ProfessorCursosPage";
// import { ProfessorCursoPage } from "../pages/Professor/ProfessorCursoPage";

export default function AppRoutes() {
  // const user = useUser();

  return useRoutes([
    { path: '/', element: <LoginPage /> },
    { path: '/cadastro', element: <CadastroPage /> },
    { path: '/home', element: <PlataformaPage /> },

    {
      path: '/curso/:cursoId',
      element: <CursoLayout />,
      children: [
        { path: 'aula/:aulaId', element: <AulaPage /> },
        { index: true, element: <Navigate to="aula/1" replace /> },
      ]
    },
    {
      path: '/professor',
      element: <ProfArea />
    },
       {
      path: '/professor/curso/:id',
      element: <ProfessorEditPage />
    },
    // {
    //   path: '/professor/curso/:id',
    //   element: <ProfessorEditPage />
    // },

    // Rota protegida do professor
    // {
    //   path: '/professor/cursos',
    //   element: user?.tipo === 'PROFESSOR' ? <ProfessorCursosPage /> : <Navigate to="/" replace />,
    // },
    // {
    //   path: '/professor/curso/:id',
    //   element: user?.tipo === 'PROFESSOR' ? <ProfessorCursoPage /> : <Navigate to="/" replace />,
    // },

    { path: '*', element: <NotFoundPage /> }
  ]);
}
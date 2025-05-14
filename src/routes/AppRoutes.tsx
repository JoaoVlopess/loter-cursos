import { useRoutes } from "react-router-dom";
import {LoginPage} from "../pages/Login/LoginPage";
import { CadastroPage } from "../pages/Cadastro/CadstroPage";
import { PlataformaPage } from "../pages/Plataforma/PlataformaPage";
import { CursoLayout } from "../pages/Curso/CursoLayout";

export const AppRoutes = () => {
return useRoutes([
{path:"/", element: <LoginPage />},
{path:"/cadastro", element:  <CadastroPage />},
{path:"/home", element: <PlataformaPage />},
{path:"/curso/:cursoId/aula/:aulaId", element: <CursoLayout />},
{/* {path="*", element: <Error>}, */}
]);
}
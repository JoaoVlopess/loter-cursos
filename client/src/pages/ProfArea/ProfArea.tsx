import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios"; // Import AxiosError
import { CursoGrid } from "../../components/Curso/CursoGrid/CursoGrid";
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import { ProfessorCard } from "../../components/Professor/ProfessorCard/ProfessorCard";
import type { Curso } from "../../types/Curso/curso";
import type { Usuario } from "../../types/Clientes/usuario"; // For userData type
import { useAuth } from "../../context/AuthContext";         // <--- USE AUTH
import { fetchMeusCursos } from "../../services/professorService"; // <--- USE SERVICE

import styles from "../ProfArea/ProfArea.module.css";

export const ProfArea = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Pode ser gerenciado pelo isLoading do useAuth para a verificação inicial
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth(); // Pega o usuário e status de autenticação

  useEffect(() => {
    const carregarCursos = async () => {
      if (!isAuthenticated || !user || user.tipo !== 'PROFESSOR') {
        setError("Acesso negado. Esta área é apenas para professores.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true); // Loading para a busca dos cursos
      setError(null);
      try {
        // A rota /professores/meus-cursos no backend usa o token para identificar o professor
        const cursosData = await fetchMeusCursos();
        setCursos(cursosData);
      } catch (err: any) {
        console.error("Erro ao buscar cursos do professor em ProfArea:", err);
        setError(err.message || "Não foi possível carregar os cursos.");
      } finally {
        setIsLoading(false);
      }
    };

    // Só busca os cursos se a autenticação não estiver carregando E o usuário estiver autenticado
    if (!authIsLoading) {
      if (isAuthenticated && user?.tipo === 'PROFESSOR') {
        carregarCursos();
      } else if (isAuthenticated && user?.tipo !== 'PROFESSOR') {
        setError("Acesso negado. Esta área é apenas para professores.");
        setIsLoading(false);
      } else { // Não autenticado
         setError("Você precisa estar logado como professor para ver esta página.");
         setIsLoading(false);
      }
    }
  }, [user, isAuthenticated, authIsLoading]);

  // Se a autenticação ainda está carregando, mostre um loader
  if (authIsLoading) {
    return <div>Verificando autenticação...</div>;
  }

  // Se não estiver autenticado ou não for professor (APÓS authIsLoading ser false)
  // e não houver erro já setado que indique isso.
  if (!isAuthenticated || (user && user.tipo !== 'PROFESSOR' && !error) ) {
     // O ProtectedRoute já deve ter redirecionado, mas como uma segunda barreira
     // ou se esta página for acessada de forma inesperada.
    return <div>Acesso negado ou você não está logado como professor.</div>;
  }

  return (
    <div className={styles.profArea_page}>
      <NavBar />
      <div className={styles.main_content}>
        {isLoading && <p>Carregando seus cursos...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {!isLoading && !error && cursos.length === 0 && (
          <p>Você ainda não possui cursos cadastrados ou associados.</p>
        )}
        {!isLoading && !error && cursos.length > 0 && (
          <CursoGrid cursos={cursos} CardComponent={ProfessorCard} titulo="Meus Cursos" />
        )}
      </div>
      <Footer />
    </div>
  );
};
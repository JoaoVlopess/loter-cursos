import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios"; // Import AxiosError
import { CursoGrid } from "../../components/Curso/CursoGrid/CursoGrid";
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import { ProfessorCard } from "../../components/Professor/ProfessorCard/ProfessorCard";
import type { Curso } from "../../types/Curso/curso";
import type { Usuario } from "../../types/Clientes/usuario"; // For userData type

import styles from "../ProfArea/ProfArea.module.css";

// Define a more specific type for userData expected from localStorage for a professor
type ProfessorUserData = Usuario & {
  id_professor?: number; // This is the key field we need
};

// Interface for expected API error data structure
interface ApiErrorData {
  message: string;
  success?: boolean;
};

export const ProfArea = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCursosDoProfessor = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
          throw new Error("Dados do usuário não encontrados. Faça o login.");
        }

        const userData: ProfessorUserData = JSON.parse(userDataString);

        if (userData.tipo !== 'PROFESSOR' || !userData.id_professor) {
          throw new Error("Usuário não é um professor ou ID do professor não encontrado.");
        }

        const API_URL_BASE = 'http://localhost:3000';
        const response = await axios.get<{ success: boolean, data: Curso[] }>(
          `${API_URL_BASE}/professores/${userData.id_professor}/cursos`
        );

        if (response.data && response.data.success) {
          setCursos(response.data.data);
        } else {
          throw new Error( "Falha ao buscar cursos do professor.");
        }
      } catch (error: unknown) {
        let errorMessage = "Não foi possível carregar os cursos. Tente novamente mais tarde.";
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiErrorData>;
          errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao buscar cursos.";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("Erro ao buscar cursos do professor:", error);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCursosDoProfessor();
  }, []);

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
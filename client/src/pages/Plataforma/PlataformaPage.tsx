import  { useEffect, useState } from 'react';
import axios from 'axios';
import { CursoGrid } from "../../components/Curso/CursoGrid/CursoGrid";
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import type { Curso } from "../../types/Curso/curso";
import { CardCurso } from '../../components/Curso/CardCurso/CardCurso';
import styles from "./PlataformaPage.module.css";

export const PlataformaPage = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCursos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Certifique-se de que a URL base da API está correta
        // Pode ser uma variável de ambiente em um projeto maior
        const API_URL_BASE = 'http://localhost:3000';
        // A API retorna um objeto { success: boolean, data: Curso[] }
        const response = await axios.get<{ success: boolean, data: Curso[] }>(`${API_URL_BASE}/cursos`);

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setCursos(response.data.data);
        } else {
          console.error("Resposta da API de cursos não está no formato esperado:", response.data);
          setError("Não foi possível carregar os cursos devido a um formato de resposta inesperado.");
        }
      } catch (err) {
        console.error("Erro ao buscar cursos:", err);
        setError("Não foi possível carregar os cursos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCursos();
  }, []); // Array de dependências vazio para rodar apenas na montagem

  return (
    <div className={styles.plataforma_page}>
      <NavBar />
      <div className={styles.main_content}>
        {isLoading && <p>Carregando cursos...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {!isLoading && !error && cursos.length === 0 && (
          <p>Nenhum curso encontrado.</p>
        )}
        {!isLoading && !error && cursos.length > 0 && (
          <CursoGrid
            cursos={cursos}
            CardComponent={CardCurso}
            titulo="Cursos Disponíveis" // Ou "Meus Cursos" se for o caso
          />
        )}
      </div>
      <Footer />
    </div>
  );
};
// CursoLayout.tsx
import  { useEffect, useState } from 'react';
import axios from 'axios';
import { SidebarCurso } from "../../components/Curso/SidebarCurso/SidebarCurso";
import { Outlet, useParams } from "react-router-dom";
import { NavBar } from "../../components/NavBar/Navbar";
import styles from "../Curso/CursoLayout.module.css";
import type { Curso as CursoDetalhado } from '../../types/Curso/curso'; // Usaremos o tipo Curso que já inclui módulos

export const CursoLayout = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const [cursoDetalhes, setCursoDetalhes] = useState<CursoDetalhado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cursoId) {
      setError("ID do curso não fornecido.");
      setIsLoading(false);
      return;
    }

    const fetchCursoDetalhes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_URL_BASE = 'http://localhost:3000';
        // Endpoint para buscar detalhes do curso, incluindo módulos e aulas
        const response = await axios.get<{ success: boolean, data: CursoDetalhado }>(
          `${API_URL_BASE}/cursos/${cursoId}/detalhes`
        );
        if (response.data && response.data.success) {
          setCursoDetalhes(response.data.data);
        } else {
          setError( "Não foi possível carregar os detalhes do curso.");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do curso:", err);
        setError("Erro ao buscar detalhes do curso. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCursoDetalhes();
  }, [cursoId]);

  return (
    <div className={styles.cursolayout}>
      <NavBar /> 
      <div className={styles.layout}>
        <main className={styles.content}>
          {isLoading && <p>Carregando conteúdo do curso...</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {!isLoading && !error && cursoDetalhes && <Outlet context={{ cursoDetalhes }} />}
          {!isLoading && !error && !cursoDetalhes && <p>Detalhes do curso não encontrados.</p>}
        </main>
        <SidebarCurso cursoId={cursoId!} modulos={cursoDetalhes?.modulos} isLoading={isLoading} />
      </div>
    </div>
  );
};
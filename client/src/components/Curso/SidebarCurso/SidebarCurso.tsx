import { useState, useEffect } from "react"; // Import useEffect
import { FaChevronDown, FaChevronRight, FaRegPlayCircle  } from "react-icons/fa";
import { Link, useParams } from "react-router-dom"; // useParams pode ser útil para destacar a aula ativa
import styles from "../SidebarCurso/SidebarCurso.module.css";
import type { Modulo } from "../../../types/Curso/modulo";

// Helper para formatar duração (se suas aulas tiverem duração em segundos)
const formatDuracao = (segundos: number) => {
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

// const modulos: Modulo[] = []; // This line is unused and can be removed

interface SidebarCursoProps {
  cursoId: string;
  modulos?: Modulo[]; // Receberá os módulos do CursoLayout
  isLoading: boolean; // Para mostrar um estado de carregamento
}

export function SidebarCurso({ cursoId, modulos: fetchedModulos, isLoading }: SidebarCursoProps) {
  const [moduloAberto, setModuloAberto] = useState<number | null>(null);
  const { aulaId: activeAulaId } = useParams<{ aulaId?: string }>();

  // Define o primeiro módulo como aberto por padrão quando os módulos são carregados
  // e nenhum módulo está aberto ainda.
  useEffect(() => { // Changed useState to useEffect
    if (fetchedModulos && fetchedModulos.length > 0 && moduloAberto === null) {
      setModuloAberto(fetchedModulos[0].id_modulo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedModulos]); // Executa quando fetchedModulos muda
  
  const toggleModulo = (id: number) => {
    setModuloAberto(moduloAberto === id ? null : id);
  };

  if (isLoading) {
    return <aside className={styles.sidebar}><p>Carregando módulos...</p></aside>;
  }

  if (!fetchedModulos || fetchedModulos.length === 0) {
    return <aside className={styles.sidebar}><p>Nenhum módulo disponível para este curso.</p></aside>;
  }

  return (
    <aside className={styles.sidebar}>
      {fetchedModulos.map((modulo) => (
        <div key={modulo.id_modulo} className={styles.modulo}>
          <button onClick={() => toggleModulo(modulo.id_modulo)} className={styles.moduloButton}>
            <span className={styles.moduloNumero}>{modulo.ordem}. </span>
            <span className={styles.moduloTitulo}>{modulo.titulo} </span>
            {moduloAberto === modulo.id_modulo ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {moduloAberto === modulo.id_modulo && (
            <ul className={styles.aulaLista}>
              {modulo.aulas?.map((aula) => (
                <li key={aula.id_aula} className={styles.aulaItem}>
                  <Link
                    to={`/curso/${cursoId}/aula/${aula.id_aula}`}
                    className={`${styles.aulaLink} ${aula.id_aula.toString() === activeAulaId ? styles.activeAula : ''}`}
                  >
                    <FaRegPlayCircle  className={styles.playIcon} />
                    <span>{aula.titulo}</span>
                    {/* Verifica se duracao existe e é um número antes de formatar */}
                    {typeof aula.duracao === 'number' && (
                       <span className={styles.duracao}>{formatDuracao(aula.duracao)}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </aside>
  );
}
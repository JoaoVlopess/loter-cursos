// CursoGrid.tsx
import styles from '../CursoGrid/CursoGrid.module.css';
import type { Curso } from '../../../types/Curso/curso';


interface CursoGridProps {
  cursos: Curso[];
  CardComponent: React.ComponentType<{ curso: Curso }>;
  titulo?: string;
   className?: string; // Adiciona a prop className opcional
}

export const CursoGrid = ({ cursos, CardComponent, titulo, className }: CursoGridProps) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{titulo}</h2>
        <div className={styles.course_grid}>
          {cursos.map((curso) => (
            <CardComponent key={curso.id_curso} curso={curso} />
          ))}
        </div>
      </div>
    </div>
  );
};
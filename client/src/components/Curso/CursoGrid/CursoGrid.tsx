// CursoGrid.tsx
import styles from '../CursoGrid/CursoGrid.module.css';
import { Curso } from '../../../types/Curso/curso';


interface CursoGridProps {
  cursos: Curso[];
  CardComponent: React.ComponentType<{ curso: Curso }>;
  titulo?: string;
}

export const CursoGrid = ({ cursos, CardComponent, titulo = 'Meus Cursos' }: CursoGridProps) => {
  return (
    <div className={styles.container}>
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
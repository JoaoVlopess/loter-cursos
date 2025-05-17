import type { Curso } from "../../types/Curso/curso";
import styles from "./CardCurso.module.css";

type Props = {
  curso: Curso;
};

export const CardCurso = ({ curso }: Props) => {
  return (
    <div className={styles.course_card}>
      <div className={styles.course_content}>
        <h2 className={styles.course_title}>{curso.titulo}</h2>
        <p className={styles.course_description}>{curso.descricao}</p>
        <div className={styles.course_hours}>
          Carga horária: {curso.carga_horaria}h
        </div>
      </div>
    </div>
  );
};
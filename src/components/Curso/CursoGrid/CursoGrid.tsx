import { CardCurso } from "../../Curso/CardCurso/CardCurso";
import type { Curso } from "../../../types/Curso/curso";
import styles from "./CursoGrid.module.css";

const cursos: Curso[] = [
  {
    id_curso: 1,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  },
  {
    id_curso: 1,
    titulo: "Fundamentos de pyton",
    descricao: "Aprenda os conceitos básicos do pyton, como IA.",
    carga_horaria: 5,
    id_professor: 3,
    modulos: 10
  },
  {
    id_curso: 1,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  },
  {
    id_curso: 1,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  },{
    id_curso: 1,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  },
];

export const CursoGrid = () => {
  return (
    <div className={styles.course_grid}>
      {cursos.map((curso) => (
        <CardCurso key={curso.id_curso} curso={curso} />
      ))}
    </div>
  );
};
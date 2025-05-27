import { CursoGrid } from "../../components/Curso/CursoGrid/CursoGrid";
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import { ProfessorCard } from "../../components/Professor/ProfessorCard/ProfessorCard";
import { Curso } from "../../types/Curso/curso";

import styles from "../ProfArea/ProfArea.module.css";

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
    id_curso: 2,
    titulo: "Fundamentos de pyton",
    descricao: "Aprenda os conceitos básicos do pyton, como IA.",
    carga_horaria: 5,
    id_professor: 3,
    modulos: 10
  },
  {
    id_curso: 3,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  },
];

export const ProfArea = () => {

  return (
    <div className={styles.profArea_page}>
      <NavBar />
      <div className={styles.main_content}>
        <CursoGrid cursos={cursos} CardComponent={ProfessorCard} titulo="Cursos do Professor" />
      </div>
      <Footer />
    </div>
  );
};
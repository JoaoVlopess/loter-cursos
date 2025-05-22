import { CursoGrid } from "../../components/Curso/CursoGrid/CursoGrid";
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import { Curso } from "../../types/Curso/curso";
import { CardCurso } from '../../components/Curso/CardCurso/CardCurso';

import styles from "./PlataformaPage.module.css";


// PlataformaPage.tsx (arquivo separado)
export const PlataformaPage = () => {
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
  {
    id_curso: 4,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  }, {
    id_curso: 5,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  },
];
  return (
    <div className={styles.plataforma_page}>
      <NavBar />
      <div className={styles.main_content}>
        <CursoGrid cursos={cursos} CardComponent={CardCurso} />
      </div>
      <Footer />
    </div>
  );
};
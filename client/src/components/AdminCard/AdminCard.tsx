import type { Curso } from "../../types/Curso/curso";
import styles from "../ProfessorCard/ProfessorCard.module.css";
import { IoTime } from "react-icons/io5";
import { FaBook } from "react-icons/fa";
import { Link } from 'react-router-dom';

type Props = {
  curso: Curso;
};

export const AdminCard = ({ curso }: Props) => {
  return (
    <div className={styles.course_card}>
      <div className={styles.course_plus}>

      </div>

      <div className={styles.course_img}>
        <Link to={`/professor/curso/${curso.id_curso}`}>
          <img src="/img/comingSoon.jpg" alt="Editar curso" />
        </Link>
      </div>

      <div className={styles.course_info_1}>
        <p className={styles.course_info_1_titulo}>{curso.titulo}</p>
        <div className={styles.course_info_1_text}>
          <div className={styles.info_1_text_item}>
            <IoTime />
            <p>{curso.carga_horaria} Horas</p>
          </div>
          <div className={styles.info_1_text_item}>
            <FaBook />
            <p>{curso.modulos} Módulos</p>
          </div>

        </div>
      </div>
    </div>

  );
};
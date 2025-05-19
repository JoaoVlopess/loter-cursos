import type { Curso } from "../../../types/Curso/curso";
import styles from "./CardCurso.module.css";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import { IoTime } from "react-icons/io5";
import { FaBook } from "react-icons/fa";

type Props = {
  curso: Curso;
};

export const CardCurso = ({ curso }: Props) => {
  return (
    <div className={styles.course_card}>
      <div className={styles.course_plus}>
        <IoMdInformationCircleOutline />
        <SlOptionsVertical />
      </div>

      <div className={styles.course_img}>
        <img src="/img/comingSoon.jpg" />
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

      <div className={styles.course_info_2}>
        <div className={styles.line}></div>
        <div className={styles.info_2_text}>
          <p>Professor: {curso.id_professor}</p>
        </div>
      </div>
    </div>

  );
};
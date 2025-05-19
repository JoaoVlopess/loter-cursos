import type { Curso } from "../../../types/Curso/curso";
import styles from "./CardCurso.module.css";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";

type Props = {
  curso: Curso;
};

export const CardCurso = ({ curso }: Props) => {
  return (
    <div className={styles.course_card}>
      <div className={styles.course_info}>
        <IoMdInformationCircleOutline />
        <SlOptionsVertical />
      </div>
      <div className={styles.course_img}>
        <img src="/img/comingSoon.jpg" />
      </div>
      <div className={styles.course_card}>
        
      </div>
      <div className={styles.course_card}></div>
    </div>

  );
};
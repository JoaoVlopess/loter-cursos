// CursoLayout.tsx
import { SidebarCurso } from "../../components/Curso/SidebarCurso/SidebarCurso";
import { Outlet, useParams } from "react-router-dom";
import styles from "./CursoLayout.module.css";

export const CursoLayout = () => {
  const { cursoId } = useParams();

  return (
    <div className={styles.layout}>
      <main className={styles.content}>
        <Outlet />
      </main>
      <SidebarCurso cursoId={cursoId!} />
    </div>
  );
};
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import { CursoGrid } from "../../components/CursoGrid/CursoGrid";
import styles from "./PlataformaPage.module.css";

export const PlataformaPage = () => {
  return (
    <div className={styles.plataforma_page}>
      <NavBar />
      
      <div className={styles.main_content}>
        <CursoGrid />
      </div>

      <Footer />
    </div>
  );
};
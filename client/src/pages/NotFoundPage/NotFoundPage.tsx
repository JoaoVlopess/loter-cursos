import styles from '../NotFoundPage/NotFoundPage.module.css';
import { TbXboxX } from "react-icons/tb";
import { RedirectMessage } from '../../components/RedirectMessage/RedirectMessage';


export const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <TbXboxX className={styles.icon}/>
        <h1>Ops! Página não encontrada</h1>
        <RedirectMessage question="Deseja retornar para a página de login?" linkText="Clique aqui!" linkTo="/" />
  
      </div>
    </div>
  );
};
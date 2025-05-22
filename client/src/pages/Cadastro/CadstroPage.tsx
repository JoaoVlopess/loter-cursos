import styles from './CadastroPage.module.css';
import { Logo } from '../../components/Logo/Logo';
import { CadastroForm } from '../../components/CadastroForm/CadastroForm';
import { RedirectMessage } from '../../components/RedirectMessage/RedirectMessage';

export const CadastroPage = () => {
  return (
    <div className={styles.container}>
      <Logo />
      <h1>Crie sua conta</h1>
      <RedirectMessage question="Já tem uma conta?" linkText="Entrar" linkTo="/" />
      <CadastroForm />
    </div>
  );
};
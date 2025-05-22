import styles from './LoginPage.module.css';
import { Logo } from '../../components/Logo/Logo';

import { RedirectMessage } from '../../components/RedirectMessage/RedirectMessage';
import { LoginForm } from '../../components/LoginForm/LoginForm';
// import { LoginInvalido } from '../../components/LoginInvalido/LoginInvalido';

export const LoginPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Logo />
        <h1>Bem vindo de volta, dev!</h1>
        <RedirectMessage question="Chegando pela primeira vez?" linkText="Cadastre-se!" linkTo="/cadastro" />
        {/* <LoginInvalido/> */}
        <LoginForm />
      </div>
    </div>
  );
};
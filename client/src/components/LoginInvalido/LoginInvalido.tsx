import styles from './LoginInvalido.module.css';
import { VscError } from "react-icons/vsc";

export const LoginInvalido = () => (
  <div className={styles.loginInvalido}>
    <VscError />
    <p>Usuário ou senha inválidos</p>
  </div>
);
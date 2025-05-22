import styles from '../LoginForm/LoginForm.module.css';
import { InputField } from '../InputField/InputField';
import { FormButton } from '../FormButton/FormButton';
import { Link } from 'react-router-dom';

export const LoginForm = () => (
  <div className={styles.form}>
    <InputField type="email" placeholder="Seu email" />
    <InputField type="password" placeholder="********" />
    <FormButton>
      <Link to="/home">Entrar</Link>
    </FormButton>
  </div>
);
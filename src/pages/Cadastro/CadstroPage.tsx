import styles from './CadastroPage.module.css';
import { Link } from 'react-router-dom';

export function CadastroPage() {
  return (
    <div className={styles.container}>
      <img src="/img/loter_Logo.png" alt="Logo Loter" />

      <h1>Crie sua conta</h1>
      <p>
        Já tem uma conta? <Link to="/">Entrar</Link>
      </p>

      <form className={styles.form}>
        <input type="text" placeholder="Seu nome" />
        <input type="email" placeholder="Seu email" />
        <input type="password" placeholder="Senha" />
        <input type="number" placeholder="Idade" />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
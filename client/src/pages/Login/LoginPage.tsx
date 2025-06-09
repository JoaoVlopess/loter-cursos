import styles from './LoginPage.module.css';
import { Logo } from '../../components/Logo/Logo';
import { RedirectMessage } from '../../components/RedirectMessage/RedirectMessage';
import { LoginForm } from '../../components/LoginForm/LoginForm';
import { useState, useEffect } from 'react';



export const LoginPage = () => {
    const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // Tenta ler o token do localStorage quando o componente monta
    // Isso seria útil se o login acontecesse e o token fosse salvo antes desta página ser totalmente recarregada
    // ou se você voltasse para esta página após o login.
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setUserToken(storedToken);
  }, []); // Executa apenas uma vez na montagem

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Logo />
        <h1>Bem vindo de volta, dev!</h1>
        <RedirectMessage question="Chegando pela primeira vez?" linkText="Cadastre-se!" linkTo="/cadastro" />
        {/* <LoginInvalido/> */}
        <LoginForm />

         {/* Exibição do Token (APENAS PARA DEBUG) */}
        {userToken && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#eee', border: '1px solid #ccc', fontSize: '12px', wordBreak: 'break-all' }}>
            <h4 style={{ marginTop: 0 }}>Token Atual (Debug):</h4>
            <p>{userToken}</p>
          </div>
        )}
      </div>
    </div>
  );
};
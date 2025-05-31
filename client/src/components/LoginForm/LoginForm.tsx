import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import { InputField } from '../InputField/InputField';
import { FormButton } from '../FormButton/FormButton';
import { useAuth } from '../../context/AuthContext';
import { realizarLogin } from '../../services/authService';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !senha) {
      setError('Por favor, preencha seu email e senha.');
      setIsLoading(false);
      return;
    }

    // =================================================
    // == CONSOLE.LOG ADICIONADO AQUI PARA VER OS DADOS ==
    // =================================================
    console.log('Tentando fazer login com:', { email, senha });
    // =================================================

    try {
      const loginData = await realizarLogin(email, senha);

      loginContext(loginData.token, loginData.usuario);

      const userType = loginData.usuario.tipo;
      switch (userType) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'PROFESSOR':
          navigate('/professor');
          break;
        case 'ALUNO':
          navigate('/home');
          break;
        default:
          console.warn(`Tipo de usuário desconhecido: ${userType}. Redirecionando para /home.`);
          navigate('/home');
          break;
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao tentar fazer login. Tente novamente.');
      console.error('Erro no handleSubmit (login):', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <InputField
          type="email"
          placeholder="Seu email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          disabled={isLoading}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="senha" className={styles.label}>Senha</label>
        <InputField
          type="password"
          placeholder="********"
          id="senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          name="senha"
          disabled={isLoading}
          required
        />
      </div>

      <FormButton type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </FormButton>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
};
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../LoginForm/LoginForm.module.css';
import { InputField } from '../InputField/InputField';
import { FormButton } from '../FormButton/FormButton';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !senha) {
      setError('Por favor, preencha seu email e senha.');
      setIsLoading(false);
      return;
    }




    try {
      const API_URL_BASE = 'http://localhost:3000';
      const ENDPOINT_LOGIN = '/login';

      const response = await axios.post(`${API_URL_BASE}${ENDPOINT_LOGIN}`, {
        email,
        senha,
      });

      if (response.data.success && response.data.token && response.data.user && response.data.user.tipo) {
        localStorage.setItem('authToken', response.data.token);

        localStorage.setItem('userData', JSON.stringify(response.data.user));


        setIsLoading(false);
        const userType = response.data.user.tipo;

        // Redireciona com base no tipo de usuário
        switch (userType) {
          case 'ADMIN':
            navigate('/admin'); // Rota para a área administrativa
            break;
          case 'PROFESSOR':
            navigate('/professor'); // Rota para a área do professor
            break;
          case 'ALUNO':
            navigate('/home'); // Rota para a área do aluno/plataforma
            break;
          default:
            // Fallback para um tipo desconhecido ou se /home for uma página geral pós-login
            console.warn(`Tipo de usuário desconhecido: ${userType}. Redirecionando para /home.`);
            navigate('/home');
            break;
        }
      } else {
        // Caso a resposta não seja o esperado, mesmo com status 200
        setError(response.data.message || 'Falha no login. Verifique suas credenciais.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Erro ao tentar fazer login. Tente novamente.');
        console.error('Erro na resposta do servidor (login):', err.response.data);
      } else {
        setError('Erro de conexão ou ao processar a requisição de login.');
        console.error('Erro no handleSubmit (login):', err);
      }
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
        />
      </div>

      {/* O botão e a mensagem de erro não precisam estar em um inputGroup,
          pois o gap do form já os espaçará corretamente dos inputGroups. */}

      <FormButton type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </FormButton>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
};



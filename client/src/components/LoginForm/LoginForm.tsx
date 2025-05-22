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

      if (response.data.success && response.data.token) {
  
        localStorage.setItem('authToken', response.data.token);
       
        
        setIsLoading(false);
        navigate('/home'); // Redireciona para a página principal após o login
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
      {/* Label e Input para Email */}
      <label htmlFor="email" className={styles.label}>Email</label>
      <InputField
        type="email"
        placeholder="Seu email"
        id="email" // Adicione um ID que corresponda ao htmlFor do label
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        name="email" 
      />

      {/* Label e Input para Senha */}
      <label htmlFor="senha" className={styles.label}>Senha</label>
      <InputField
        type="password"
        placeholder="********"
        id="senha" // Adicione um ID que corresponda ao htmlFor do label
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        name="senha" // Adicionado para consistência

      />

      <FormButton type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </FormButton>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
};


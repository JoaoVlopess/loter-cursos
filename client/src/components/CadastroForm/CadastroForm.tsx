// src/components/CadastroForm/CadastroForm.tsx
import React, { useState } from 'react';
import axios from 'axios'; // Importe o axios
import styles from './CadastroForm.module.css';
import { InputField } from '../InputField/InputField';
import { FormButton } from '../FormButton/FormButton';
import type { Usuario } from '../../types/Clientes/usuario';



// Tipo para o estado do nosso formulário, baseado no seu tipo Usuario
type CadastroFormState = Pick<Usuario, 'nome' | 'cpf' | 'email' | 'senha'> & {
  idade: string;
};

export const CadastroForm = () => {

  const [formData, setFormData] = useState<CadastroFormState>({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    idade: '',
  });


  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Função para lidar com a mudança nos campos de input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);


    if (!formData.nome || !formData.cpf || !formData.email || !formData.senha || !formData.idade) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }

    // Convertendo idade para data_nascimento (string 'YYYY-MM-DD')
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(formData.idade, 10);
    const data_nascimento_str = `${birthYear}-01-01`;

    // Montando o payload para o backend
    const userDataToSubmit = {
      nome: formData.nome,
      cpf: formData.cpf,
      email: formData.email,
      senha: formData.senha,
      data_nascimento: data_nascimento_str,
      tipo: 'ALUNO' as Usuario['tipo'], // Definido como ALUNO por padrão
      especialidade: null, // Não relevante para ALUNO
      cargo: null,         // Não relevante para ALUNO
    };

    try {
      const API_URL_BASE = 'http://localhost:3000';

      const ENDPOINT_CADASTRO = '/cadastro';

      // Assign to _ if response data is not used, or simply await without assignment.
      await axios.post(`${API_URL_BASE}${ENDPOINT_CADASTRO}`, userDataToSubmit);

      setMessage(`Aluno cadastrado com sucesso!`);
      setIsLoading(false);
      // Limpar formulário 
      setFormData({ nome: '', cpf: '', email: '', senha: '', idade: '' });

    } catch (err: unknown) {
      // Tratamento de erro
      setIsLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        // O backend respondeu com um status de erro (4xx, 5xx)
        setError(err.response.data.message || 'Erro ao cadastrar. Tente novamente.');
        console.error('Erro na resposta do servidor:', err.response.data);
      } else {
        setError('Erro de conexão ou ao processar a requisição.');
        console.error('Erro no handleSubmit:', err);
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Linha 1: Nome e CPF */}
      <div className={styles.inputRow}>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="nome" className={styles.label}>Nome Completo</label>
          <InputField
            type="text"
            placeholder="Seu nome"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
          />
        </div>
         <div className={styles.inputFieldWrapper}>
          <label htmlFor="idade" className={styles.label}>Idade</label>
          <InputField
            type="number"
            placeholder="Idade"
            id="idade"
            name="idade"
            value={formData.idade}
            onChange={handleChange}
          />
        </div>
        
      </div>

      {/* Linha 2: Email e Senha */}
      <div className={styles.inputRow}>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <InputField
            type="email"
            placeholder="Seu email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="senha" className={styles.label}>Senha</label>
          <InputField
            type="password"
            placeholder="Senha"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Linha 3: Idade (ocupará a linha inteira ou metade, dependendo do estilo) */}
      <div className={styles.inputRow}>
        <div className={styles.inputFieldWrapper}>
          <label htmlFor="cpf" className={styles.label}>CPF</label>
          <InputField
            type="text"
            placeholder="Seu CPF (somente números)"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
          />
        </div>

      </div>
      <div className={styles.buttonRow}>
      <FormButton type="submit" disabled={isLoading}>
        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
      </FormButton>

      {/* Feedback para o usuário */}
      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </form>
  );
}

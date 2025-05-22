import styles from './CadastroForm.module.css';
import { InputField } from '../InputField/InputField';
import { FormButton } from '../FormButton/FormButton';

export const CadastroForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // lógica de cadastro
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <InputField type="text" placeholder="Seu nome" />
      <InputField type="email" placeholder="Seu email" />
      <InputField type="password" placeholder="Senha" />
      <InputField type="number" placeholder="Idade" />
      <FormButton type="submit">Cadastrar</FormButton>
    </form>
  );
};
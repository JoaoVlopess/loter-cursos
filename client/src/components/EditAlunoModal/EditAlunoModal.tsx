import React, { useState, useEffect } from 'react';
import type { Usuario } from '../../types/Clientes/usuario';
import styles from '../EditAlunoModal/EditAlunoModal.module.css'; // Ajuste o caminho conforme necessário

type AlunoFormData = {
  nome: string;
  email: string;
  cpf?: string; // Adicionado CPF
  data_nascimento?: string; // Formato YYYY-MM-DD
  senha?: string; // Apenas para criação
  ativo: boolean;
};
// CPF adicionado ao tipo Aluno para props, pois o backend o utiliza
type Aluno = Usuario & { matricula?: string; data_nascimento?: string; cpf?: string; };

interface EditAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: Aluno | null;
  onSave: (updatedData: AlunoFormData, alunoId?: number) => void;
  onDelete?: (idUsuario: number) => void;
}

export const EditAlunoModal: React.FC<EditAlunoModalProps> = ({ isOpen, onClose, aluno, onSave, onDelete }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState(''); // Estado para CPF
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (aluno) {
      setNome(aluno.nome);
      setEmail(aluno.email);
      setCpf(aluno.cpf || ''); // Popular CPF
      setDataNascimento(aluno.data_nascimento || '');
      setSenha(''); // Senha não é preenchida na edição
      setAtivo(aluno.ativo);
    } else {
      setNome('');
      setEmail('');
      setCpf(''); // Limpar CPF
      setDataNascimento('');
      setSenha('');
      setAtivo(true);
    }
  }, [aluno, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      alert("Nome e Email são obrigatórios.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Formato de email inválido.");
      return;
    }
    // Validação básica para CPF (pode ser mais robusta)
    if (!aluno && (!cpf || cpf.trim().length === 0)) { // CPF obrigatório para novo aluno
        alert("CPF é obrigatório para novos alunos.");
        return;
    }

    if (!aluno && !senha) { // Senha obrigatória apenas para novo aluno
        alert("Senha é obrigatória para novos alunos.");
        return;
    }
    onSave(
      { nome, email,
        ativo,
        cpf: cpf || undefined, // Incluir CPF
        data_nascimento: dataNascimento || undefined,
        senha: senha || undefined, // Enviar senha apenas se preenchida (para criação)
      },
      aluno?.id_usuario
    );
  };

  const handleDeleteClick = () => {
    if (aluno && onDelete && window.confirm(`Tem certeza que deseja excluir o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`)) {
      onDelete(aluno.id_usuario);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{aluno ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label htmlFor="aluno-nome">Nome:</label><input type="text" id="aluno-nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
          <div className={styles.formGroup}><label htmlFor="aluno-email">Email:</label><input type="email" id="aluno-email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          {!aluno && <div className={styles.formGroup}><label htmlFor="aluno-senha">Senha:</label><input type="password" id="aluno-senha" value={senha} onChange={(e) => setSenha(e.target.value)} required={!aluno} /></div>}
          <div className={styles.formGroup}><label htmlFor="aluno-cpf">CPF:</label><input type="text" id="aluno-cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required={!aluno} /></div>
          <div className={styles.formGroup}><label htmlFor="aluno-dataNascimento">Data de Nascimento:</label><input type="date" id="aluno-dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} /></div>
          <div className={styles.formGroup}>
            <label htmlFor="aluno-ativo">Ativo:</label>
            <select id="aluno-ativo" value={ativo ? 'true' : 'false'} onChange={(e) => setAtivo(e.target.value === 'true')}>
              <option value="true">Sim</option><option value="false">Não</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            {aluno && onDelete && (<button type="button" onClick={handleDeleteClick} className={styles.deleteButton}>Excluir Aluno</button>)}
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
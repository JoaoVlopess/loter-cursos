import React, { useState, useEffect } from 'react';
import type { Usuario } from '../../types/Clientes/usuario';
import styles from './EditProfessorModal.module.css';

type ProfessorFormData = {
  nome: string;
  email: string;
  especialidade?: string;  
  data_nascimento?: string; // Formato YYYY-MM-DD
  senha?: string; // Apenas para criação
  ativo: boolean;
};


interface EditProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Professor pode ter cpf e data_nascimento vindos do tipo Usuario
  professor: (Usuario & { especialidade?: string; data_nascimento?: string; }) | null;
  onSave: (updatedData: ProfessorFormData, professorId?: number) => void;
  onDelete?: (idUsuario: number) => void;
}

export const EditProfessorModal: React.FC<EditProfessorModalProps> = ({ isOpen, onClose, professor, onSave, onDelete }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (professor) {
      setNome(professor.nome);
      setEmail(professor.email);
      setEspecialidade(professor.especialidade || '');
      setDataNascimento(professor.data_nascimento || '');
      setSenha(''); // Senha não é preenchida na edição
      setAtivo(professor.ativo);
    } else {
      // Reset para Adicionar Novo
      setNome('');
      setEmail('');
      setEspecialidade('');
      setDataNascimento('');
      setSenha('');
      setAtivo(true);
    }
  }, [professor, isOpen]);

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
    // Validações para CPF e Data de Nascimento podem ser adicionadas aqui se necessário

    if (!professor && !senha) { // Senha obrigatória apenas para novo professor
        alert("Senha é obrigatória para novos professores.");
        return;
    }

    onSave(
      { nome, email, especialidade: especialidade || undefined, ativo,
        data_nascimento: dataNascimento || undefined,
        senha: senha || undefined, // Enviar senha apenas se preenchida (para criação)
      },
      professor?.id_usuario
    );
  };

  const handleDeleteClick = () => {
    if (professor && onDelete && window.confirm(`Tem certeza que deseja excluir o professor "${professor.nome}"? Esta ação não pode ser desfeita.`)) {
      onDelete(professor.id_usuario);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{professor ? 'Editar Professor' : 'Adicionar Novo Professor'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label htmlFor="prof-nome">Nome:</label><input type="text" id="prof-nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
          <div className={styles.formGroup}><label htmlFor="prof-email">Email:</label><input type="email" id="prof-email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          {!professor && <div className={styles.formGroup}><label htmlFor="prof-senha">Senha:</label><input type="password" id="prof-senha" value={senha} onChange={(e) => setSenha(e.target.value)} required={!professor} /></div>}
          <div className={styles.formGroup}><label htmlFor="prof-especialidade">Especialidade:</label><input type="text" id="prof-especialidade" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} /></div>
          <div className={styles.formGroup}><label htmlFor="prof-dataNascimento">Data de Nascimento:</label><input type="date" id="prof-dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} /></div>
          <div className={styles.formGroup}>
            <label htmlFor="prof-ativo">Ativo:</label>
            <select id="prof-ativo" value={ativo ? 'true' : 'false'} onChange={(e) => setAtivo(e.target.value === 'true')}>
              <option value="true">Sim</option><option value="false">Não</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            {professor && onDelete && (<button type="button" onClick={handleDeleteClick} className={styles.deleteButton}>Excluir Professor</button>)}
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
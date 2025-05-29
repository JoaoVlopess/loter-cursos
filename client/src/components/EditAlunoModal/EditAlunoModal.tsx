import React, { useState, useEffect } from 'react';
import type { Usuario } from '../../types/Clientes/usuario';
import styles from '../EditAlunoModal/EditAlunoModal.module.css'; // Ajuste o caminho conforme necessário

type AlunoFormData = {
  nome: string;
  email: string;
  matricula?: string;
  ativo: boolean;
};
type Aluno = Usuario & { matricula?: string };

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
  const [matricula, setMatricula] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (aluno) {
      setNome(aluno.nome);
      setEmail(aluno.email);
      setMatricula(aluno.matricula || '');
      setAtivo(aluno.ativo);
    } else {
      setNome('');
      setEmail('');
      setMatricula('');
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
    onSave(
      { nome, email, matricula: matricula || undefined, ativo },
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
          <div className={styles.formGroup}><label htmlFor="aluno-matricula">Matrícula:</label><input type="text" id="aluno-matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} /></div>
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
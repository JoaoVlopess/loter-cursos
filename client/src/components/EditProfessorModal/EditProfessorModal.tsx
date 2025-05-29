import React, { useState, useEffect } from 'react';
import type { Usuario } from '../../types/Clientes/usuario';
import styles from './EditProfessorModal.module.css';

type ProfessorFormData = {
  nome: string;
  email: string;
  especialidade?: string;
  ativo: boolean;
};


interface EditProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  professor: (Usuario & { especialidade?: string }) | null; // Usar tipo combinado aqui
  onSave: (updatedData: ProfessorFormData, professorId?: number) => void;
  onDelete?: (idUsuario: number) => void;
}

export const EditProfessorModal: React.FC<EditProfessorModalProps> = ({ isOpen, onClose, professor, onSave, onDelete }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (professor) {
      setNome(professor.nome);
      setEmail(professor.email);
      setEspecialidade(professor.especialidade || '');
      setAtivo(professor.ativo);
    } else {
      setNome('');
      setEmail('');
      setEspecialidade('');
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
    onSave(
      { nome, email, especialidade: especialidade || undefined, ativo },
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
          <div className={styles.formGroup}><label htmlFor="prof-especialidade">Especialidade:</label><input type="text" id="prof-especialidade" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} /></div>
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
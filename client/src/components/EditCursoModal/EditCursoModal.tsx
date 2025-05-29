import React, { useState, useEffect } from 'react';
import type { Curso } from '../../types/Curso/curso';
import styles from './EditCursoModal.module.css';

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  // Apenas titulo, descricao, id_professor são salvos
  onSave: (updatedData: Pick<Curso, 'titulo' | 'descricao' | 'id_professor'>, cursoId?: number) => void;
  onDelete?: (idCurso: number) => void;
}

export const EditCursoModal: React.FC<EditCursoModalProps> = ({ isOpen, onClose, curso, onSave, onDelete }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  // const [cargaHoraria, setCargaHoraria] = useState<number | string>(''); // Removido
  const [idProfessor, setIdProfessor] = useState<number | string>('');
  // const [modulos, setModulos] = useState<number | string>(''); // Removido

  useEffect(() => {
    if (curso) {
      setTitulo(curso.titulo);
      setDescricao(curso.descricao || '');
      setIdProfessor(curso.id_professor);
      // setCargaHoraria(curso.carga_horaria); // Removido
      // setModulos(curso.modulos?.length || 0); // Removido
    } else { // Modo Adição
      setTitulo('');
      setDescricao('');
      setIdProfessor('');
    }
  }, [curso, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idProfessorNum = parseInt(String(idProfessor), 10);

    if (isNaN(idProfessorNum) || idProfessorNum <= 0) {
      alert("ID do Professor deve ser um número válido e positivo.");
      return;
    }

    onSave(
      {
        titulo,
        descricao,
        id_professor: idProfessorNum,
      },
      curso?.id_curso
    );
  };

  const handleDeleteClick = () => {
    if (curso && onDelete && window.confirm(`Tem certeza que deseja excluir o curso "${curso.titulo}"? Esta ação não pode ser desfeita.`)) {
      onDelete(curso.id_curso);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{curso ? 'Editar Curso' : 'Adicionar Novo Curso'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label htmlFor="curso-titulo">Título:</label><input type="text" id="curso-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required /></div>
          <div className={styles.formGroup}><label htmlFor="curso-descricao">Descrição:</label><textarea id="curso-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
          <div className={styles.formGroup}><label htmlFor="curso-id-professor">ID do Professor:</label><input type="number" id="curso-id-professor" value={idProfessor} onChange={(e) => setIdProfessor(e.target.value)} required min="1"/></div>
          <div className={styles.modalActions}>
            {curso && onDelete && (<button type="button" onClick={handleDeleteClick} className={styles.deleteButton}>Excluir Curso</button>)}
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
            <button type="submit" className={styles.saveButton}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
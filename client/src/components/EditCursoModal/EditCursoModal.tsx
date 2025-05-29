import React, { useState, useEffect } from 'react';
import type { Curso } from '../../types/Curso/curso';
import styles from './EditCursoModal.module.css';

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  onSave: (updatedData: Omit<Curso, 'id_curso'>, cursoId?: number) => void;
  onDelete?: (idCurso: number) => void;
}

export const EditCursoModal: React.FC<EditCursoModalProps> = ({ isOpen, onClose, curso, onSave, onDelete }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState<number | string>('');
  const [idProfessor, setIdProfessor] = useState<number | string>('');
  const [modulos, setModulos] = useState<number | string>('');

  useEffect(() => {
    if (curso) {
      setTitulo(curso.titulo);
      setDescricao(curso.descricao || '');
      setIdProfessor(curso.id_professor);
      setModulos(curso.modulos);
    } else { // Modo Adição
      setTitulo('');
      setDescricao('');
      setCargaHoraria('');
      setIdProfessor('');
      setModulos('');
    }
  }, [curso, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cargaHorariaNum = parseInt(String(cargaHoraria), 10);
    const idProfessorNum = parseInt(String(idProfessor), 10);
    const modulosNum = parseInt(String(modulos), 10);

    if (isNaN(cargaHorariaNum) || cargaHorariaNum <= 0) {
      alert("Carga horária deve ser um número positivo.");
      return;
    }
    if (isNaN(idProfessorNum)) {
      alert("ID do Professor deve ser um número.");
      return;
    }
    if (isNaN(modulosNum) || modulosNum < 0) {
      alert("Número de módulos deve ser um número não negativo.");
      return;
    }

    onSave(
      {
        titulo,
        descricao,
        carga_horaria: cargaHorariaNum,
        id_professor: idProfessorNum,
        modulos: modulosNum,
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
          <div className={styles.formGroup}><label htmlFor="curso-carga-horaria">Carga Horária (horas):</label><input type="number" id="curso-carga-horaria" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} required min="1" /></div>
          <div className={styles.formGroup}><label htmlFor="curso-id-professor">ID do Professor:</label><input type="number" id="curso-id-professor" value={idProfessor} onChange={(e) => setIdProfessor(e.target.value)} required /></div>
          <div className={styles.formGroup}><label htmlFor="curso-modulos">Nº de Módulos:</label><input type="number" id="curso-modulos" value={modulos} onChange={(e) => setModulos(e.target.value)} required min="0" /></div>
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
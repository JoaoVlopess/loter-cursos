import React, { useState, useEffect } from 'react';
import type { Curso } from '../../types/Curso/curso';
import type { Usuario } from '../../types/Clientes/usuario'; // Importar Usuario
import styles from './EditCursoModal.module.css';

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  // Adicionamos professores para o dropdown
  professores: (Usuario & { id_professor?: number; nome: string })[];
  onSave: (updatedData: Pick<Curso, 'titulo' | 'descricao' | 'id_professor' | 'carga_horaria'>, cursoId?: number) => void;
  onDelete?: (idCurso: number) => void;
}

export const EditCursoModal: React.FC<EditCursoModalProps> = ({ isOpen, onClose, curso, professores, onSave, onDelete }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState<number | string>(''); // Readicionado
  const [idProfessor, setIdProfessor] = useState<number | string>('');

  useEffect(() => {
    if (curso) {
      setTitulo(curso.titulo);
      setDescricao(curso.descricao || '');
      setIdProfessor(curso.id_professor ?? ''); // Ensure value is string or number
      setCargaHoraria(curso.carga_horaria ?? ''); // Ensure value is string or number
    } else { // Modo Adição
      setTitulo('');
      setDescricao('');
      setCargaHoraria(''); // Readicionado
      setIdProfessor('');
    }
  }, [curso, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idProfessorNum = parseInt(String(idProfessor), 10);
    const cargaHorariaNum = parseInt(String(cargaHoraria), 10);

    if (isNaN(idProfessorNum) || idProfessorNum <= 0) {
      alert("ID do Professor deve ser um número válido e positivo.");
      return;
    }
    if (isNaN(cargaHorariaNum) || cargaHorariaNum <= 0) {
      alert("Carga horária deve ser um número positivo.");
      return;
    }

    onSave(
      {
        titulo,
        descricao,
        id_professor: idProfessorNum,
        carga_horaria: cargaHorariaNum, // Readicionado
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
          <div className={styles.formGroup}>
            <label htmlFor="curso-id-professor">Professor Responsável:</label>
            <select id="curso-id-professor" value={idProfessor} onChange={(e) => setIdProfessor(e.target.value)} required className={styles.selectField}>
              <option value="" disabled>Selecione um professor</option>
              {professores.map(prof => (
                <option key={prof.id_professor || prof.id_usuario} value={prof.id_professor || prof.id_usuario}>{prof.nome} (ID: {prof.id_professor || prof.id_usuario})</option>
              ))}
            </select>
          </div>
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
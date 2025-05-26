import React, { useState, useEffect } from 'react';
import { Modulo } from '../../types/Curso/modulo';
import styles from './EditModuloModal.module.css';

interface EditModuloModalProps {
  isOpen: boolean;
  onClose: () => void;
  modulo: Modulo | null;
  onSave: (updatedData: { titulo: string; ordem: number; descricao: string }) => void;
}

export const EditModuloModal: React.FC<EditModuloModalProps> = ({ isOpen, onClose, modulo, onSave }) => {
  const [titulo, setTitulo] = useState('');
  const [ordem, setOrdem] = useState<number | string>(''); // Usar string para o input e converter
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (modulo) {
      setTitulo(modulo.titulo);
      setOrdem(modulo.ordem);
      setDescricao(modulo.descricao || '');
    }
  }, [modulo]);

  if (!isOpen || !modulo) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ordemNumerica = parseInt(String(ordem), 10);
    if (isNaN(ordemNumerica)) {
        alert("A ordem deve ser um número.");
        return;
    }
    onSave({
      titulo,
      ordem: ordemNumerica,
      descricao,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Editar Módulo</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo">Título:</label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="ordem">Ordem:</label>
            <input
              type="number"
              id="ordem"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="descricao">Descrição:</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>Salvar</button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

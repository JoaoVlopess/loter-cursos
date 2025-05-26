import React, { useState, useEffect } from 'react';
import { Modulo } from '../../types/Curso/modulo';
import styles from './EditModuloModal.module.css';

interface EditModuloModalProps {
  isOpen: boolean;
  onClose: () => void;
  modulo: Modulo | null;
  onSave: (updatedData: { titulo: string; ordem: number; descricao: string }) => void;
  nextOrdem?: number; // Ordem sugerida para um novo módulo
  onDelete?: (idModulo: number) => void; // Função para deletar o módulo
}

export const EditModuloModal: React.FC<EditModuloModalProps> = ({ isOpen, onClose, modulo, onSave, nextOrdem, onDelete }) => {
  const [titulo, setTitulo] = useState('');
  const [ordem, setOrdem] = useState<number | string>(''); // Usar string para o input e converter
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (modulo) {
      setTitulo(modulo.titulo);
      setOrdem(modulo.ordem);
      setDescricao(modulo.descricao || '');
    } else if (isOpen) { // Modo Adição e modal está abrindo
      setTitulo('');
      setOrdem(nextOrdem || 1); // Usa a ordem sugerida ou 1 como padrão
      setDescricao('');
    }
  },  [modulo, isOpen, nextOrdem]);

  if (!isOpen) {
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

  const handleDeleteClick = () => {
    if (modulo && onDelete && window.confirm(`Tem certeza que deseja excluir o módulo "${modulo.titulo}"? Esta ação não pode ser desfeita.`)) {
      onDelete(modulo.id_modulo);
    }
  };


  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
                <h2>{modulo ? 'Editar Módulo' : 'Adicionar Novo Módulo'}</h2>

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
            {modulo && onDelete && ( // Mostrar botão de excluir apenas se estiver editando e onDelete for fornecido
              <button type="button" onClick={handleDeleteClick} className={styles.deleteButton}>Excluir Módulo</button>
            )}
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

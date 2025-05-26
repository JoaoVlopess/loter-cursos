import React, { useState, useEffect } from 'react';
import { Aula } from '../../types/Curso/aula'; // Certifique-se que o caminho está correto
import styles from './EditAulaModal.module.css';

interface EditAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (aulaData: Omit<Aula, 'id_aula' | 'id_modulo'>, aulaId?: number) => void;
  aula?: Aula | null; // Aula existente para edição
  idModulo: number; // Necessário para saber a qual módulo adicionar/editar
  nextOrdem?: number; // Sugestão para a ordem da nova aula
}

export const EditAulaModal: React.FC<EditAulaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  aula,
  nextOrdem
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ordem, setOrdem] = useState<number | string>('');
  const [conteudo, setConteudo] = useState(''); // URL do vídeo
  const [duracao, setDuracao] = useState<number | string>('');

  useEffect(() => {
    if (aula) { // Modo Edição
      setTitulo(aula.titulo);
      setDescricao(aula.descricao || '');
      setOrdem(aula.ordem);
      setConteudo(aula.conteudo || '');
      setDuracao(aula.duracao || '');
    } else { // Modo Adição
      setTitulo('');
      setDescricao('');
      setOrdem(nextOrdem || 1); // Usa a sugestão de ordem ou 1
      setConteudo('');
      setDuracao('');
    }
  }, [aula, isOpen, nextOrdem]); // Adicionado nextOrdem à dependência

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ordemNumerica = parseInt(String(ordem), 10);
    const duracaoNumerica = duracao ? parseInt(String(duracao), 10) : null;

    if (isNaN(ordemNumerica)) {
      alert("A ordem deve ser um número.");
      return;
    }
    if (duracao && duracaoNumerica === null) {
        alert("A duração, se preenchida, deve ser um número.");
        return;
    }

    onSave(
      {
        titulo,
        descricao: descricao || null,
        ordem: ordemNumerica,
        conteudo: conteudo || null,
        duracao: duracaoNumerica,
      },
      aula?.id_aula // Passa o id_aula se estiver editando
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{aula ? 'Editar Aula' : 'Adicionar Nova Aula'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="aula-titulo">Título:</label>
            <input
              type="text"
              id="aula-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="aula-ordem">Ordem:</label>
            <input
              type="number"
              id="aula-ordem"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              required
              min="1"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="aula-conteudo">Conteúdo (URL do Vídeo):</label>
            <input
              type="url"
              id="aula-conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="https://exemplo.com/video"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="aula-duracao">Duração (minutos):</label>
            <input
              type="number"
              id="aula-duracao"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="aula-descricao">Descrição:</label>
            <textarea
              id="aula-descricao"
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

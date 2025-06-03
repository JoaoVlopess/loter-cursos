// src/components/ModuloCursoCard/ModuloCursoCard.tsx
import React from 'react';
import type { Modulo } from '../../types/Curso/modulo';
import type { Aula } from '../../types/Curso/aula';
import styles from './ModuloCursoCard.module.css'; // Corrigi o caminho, assumindo que está na mesma pasta

interface ModuloCursoCardProps {
  modulo: Modulo;
  onEdit: (modulo: Modulo) => void;
  onAddAula: (idModulo: number) => void;
  onEditAula: (aula: Aula, idModulo: number) => void;
}

export const ModuloCursoCard: React.FC<ModuloCursoCardProps> = ({ modulo, onEdit, onAddAula, onEditAula }) => {
  return (
    <div className={styles.moduloCard}>
      <div className={styles.moduloHeader}>
        <h3>{modulo.titulo}</h3>
        <div className={styles.moduloActions}>
          <button onClick={() => onEdit(modulo)}>Editar Módulo</button> {/* Corrigido: onEdit(modulo) */}
          <button onClick={() => onAddAula(modulo.id_modulo)}>+ Aula</button>
        </div>
      </div>
      
      <div className={styles.moduloDescription}>
        {modulo.descricao}
      </div>

      {/* Esta parte é crucial para exibir as aulas */}
      {modulo.aulas && modulo.aulas.length > 0 ? ( // Boa verificação!
        <div className={styles.aulasList}>
          <h4>Aulas:</h4> {/* Adicionei um título para a lista de aulas */}
          {modulo.aulas.map(aula => ( // Correto: usa modulo.aulas.map
            <div key={aula.id_aula} className={styles.aulaItem}>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaTitle}>{aula.titulo}</span>
                <span className={styles.aulaDuration}>{aula.duracao} min</span>
              </div>
              <button className={styles.editAulaButton} onClick={() => onEditAula(aula, modulo.id_modulo)}>Editar Aula</button> {/* Corrigido: onEditAula(aula, modulo.id_modulo) */}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noAulasMessage}>Nenhuma aula cadastrada para este módulo ainda.</p> // Mensagem se não houver aulas
      )}
    </div>
  );
};
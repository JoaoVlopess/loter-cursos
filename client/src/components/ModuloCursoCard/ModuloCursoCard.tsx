import React from 'react';
import { Modulo } from '../../types/Curso/modulo';
import styles from '../ModuloCursoCard/ModuloCursoCard.module.css'; // Importa o CSS do componente


interface ModuloCursoCardProps {
  modulo: Modulo;
  onEdit: (modulo: Modulo) => void; // Função para chamar ao clicar em editar
}

export const ModuloCursoCard: React.FC<ModuloCursoCardProps> = ({ modulo, onEdit }) => {
  return (
    <div className={styles.moduloCard}>
      <div className={styles.moduloHeader}>
        <h3>{modulo.titulo}</h3>
        <div className={styles.moduloActions}>
          <button onClick={() => onEdit(modulo)}>Editar</button>
          <button>+ Aula</button>
        </div>
      </div>
      
      <div className={styles.moduloDescription}>
        {modulo.descricao}
      </div>

      {modulo.aulas && modulo.aulas.length > 0 && (
        <div className={styles.aulasList}>
          {modulo.aulas.map(aula => (
            <div key={aula.id_aula} className={styles.aulaItem}>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaTitle}>{aula.titulo}</span>
                <span className={styles.aulaDuration}>{aula.duracao} min</span>
              </div>
              <button className={styles.editAulaButton}>Editar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
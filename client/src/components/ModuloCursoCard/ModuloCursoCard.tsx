import React from 'react';
import type { Modulo } from '../../types/Curso/modulo';
import type { Aula } from '../../types/Curso/aula';
import styles from './ModuloCursoCard.module.css';

// 1. ADICIONE AS PROPS DE EXCLUSÃO NA INTERFACE
interface ModuloCursoCardProps {
  modulo: Modulo;
  onEdit: (modulo: Modulo) => void;
  onAddAula: (idModulo: number) => void;
  onEditAula: (aula: Aula, idModulo: number) => void;
  onDeleteModulo: (idModulo: number) => void;
  onDeleteAula: (idAula: number, idModulo: number) => void;
}

export const ModuloCursoCard: React.FC<ModuloCursoCardProps> = ({ 
  modulo, 
  onEdit, 
  onAddAula, 
  onEditAula,
  onDeleteModulo, // 2. RECEBA A NOVA PROP
  onDeleteAula    // 2. RECEBA A NOVA PROP
}) => {
  return (
    <div className={styles.moduloCard}>
      <div className={styles.moduloHeader}>
        <h3>{modulo.titulo}</h3>
        <div className={styles.moduloActions}>
          <button onClick={() => onEdit(modulo)}>Editar Módulo</button>
          {/* ✅ 3. BOTÃO PARA EXCLUIR O MÓDULO */}
          <button className={styles.deleteButton} onClick={() => onDeleteModulo(modulo.id_modulo)}>Excluir Módulo</button>
          <button onClick={() => onAddAula(modulo.id_modulo)}>+ Aula</button>
        </div>
      </div>
      
      <div className={styles.moduloDescription}>
        {modulo.descricao}
      </div>

      {modulo.aulas && modulo.aulas.length > 0 ? (
        <div className={styles.aulasList}>
          <h4>Aulas:</h4>
          {modulo.aulas.map(aula => (
            <div key={aula.id_aula} className={styles.aulaItem}>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaTitle}>{aula.titulo}</span>
                <span className={styles.aulaDuration}>{aula.duracao} min</span>
              </div>
              <div className={styles.aulaActions}> {/* Criei um container para os botões da aula */}
                <button className={styles.editAulaButton} onClick={() => onEditAula(aula, modulo.id_modulo)}>Editar</button>
                {/* ✅ 4. BOTÃO PARA EXCLUIR A AULA */}
                <button className={styles.deleteButton} onClick={() => onDeleteAula(aula.id_aula, modulo.id_modulo)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noAulasMessage}>Nenhuma aula cadastrada para este módulo ainda.</p>
      )}
    </div>
  );
};
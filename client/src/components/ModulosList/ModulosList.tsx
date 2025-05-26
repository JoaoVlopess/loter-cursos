import React from 'react';
import { Modulo } from '../../types/Curso/modulo';
import { ModuloCursoCard } from '../ModuloCursoCard/ModuloCursoCard';
import styles from '../../components/ModulosList/ModulosList.module.css';

interface ModulosListProps {
  modulos: Modulo[];
   onEditModulo: (modulo: Modulo) => void;
}

export const ModulosList: React.FC<ModulosListProps> = ({ modulos, onEditModulo }) => {
  return (
    <div className={styles.modulosContainer}>
      {modulos.map(modulo => (
        <ModuloCursoCard
          key={modulo.id_modulo}
          modulo={modulo}
          onEdit={onEditModulo} // Passando a função onEditModulo para a prop onEdit
        />
      ))}
    </div>
  );
};
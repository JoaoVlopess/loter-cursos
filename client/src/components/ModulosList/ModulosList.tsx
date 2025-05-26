import React from 'react';
import { Modulo } from '../../types/Curso/modulo';
import { ModuloCursoCard } from '../ModuloCursoCard/ModuloCursoCard';
import styles from '../../components/ModulosList/ModulosList.module.css';

interface ModulosListProps {
  modulos: Modulo[];
}

export const ModulosList: React.FC<ModulosListProps> = ({ modulos }) => {
  return (
    <div className={styles.modulosContainer}>
      {modulos.map(modulo => (
        <ModuloCursoCard key={modulo.id_modulo} modulo={modulo} />
      ))}
    </div>
  );
};
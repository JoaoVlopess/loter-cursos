import React from 'react';
import type { Modulo } from '../../types/Curso/modulo';
import type { Aula } from '../../types/Curso/aula';
import { ModuloCursoCard } from '../ModuloCursoCard/ModuloCursoCard';
import styles from './ModulosList.module.css'; // Corrigido para o caminho do seu projeto

// 1. ADICIONE AS PROPS DE EXCLUSÃO NA INTERFACE
interface ModulosListProps {
  modulos: Modulo[];
  onEditModulo: (modulo: Modulo) => void;
  onAddAula: (idModulo: number) => void;
  onEditAula: (aula: Aula, idModulo: number) => void;
  onDeleteModulo: (idModulo: number) => void;
  onDeleteAula: (idAula: number, idModulo: number) => void;
}

export const ModulosList: React.FC<ModulosListProps> = ({ 
  modulos, 
  onEditModulo, 
  onAddAula, 
  onEditAula,
  onDeleteModulo, // 2. RECEBA A NOVA PROP
  onDeleteAula    // 2. RECEBA A NOVA PROP
}) => {
  return (
    <div className={styles.modulosContainer}>
      {modulos.map(modulo => (
        <ModuloCursoCard
          key={modulo.id_modulo}
          modulo={modulo}
          onEdit={onEditModulo}
          onAddAula={onAddAula}
          onEditAula={onEditAula}
          onDeleteModulo={onDeleteModulo} // 3. PASSE A PROP PARA O FILHO
          onDeleteAula={onDeleteAula}       // 3. PASSE A PROP PARA O FILHO
        />
      ))}
    </div>
  );
};
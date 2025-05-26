import React from 'react';
import { Modulo } from '../../types/Curso/modulo'; // Importar 
import { Aula } from '../../types/Curso/aula'; // Importar Aula também
import { ModuloCursoCard } from '../ModuloCursoCard/ModuloCursoCard';
import styles from '../../components/ModulosList/ModulosList.module.css';

interface ModulosListProps {
  modulos: Modulo[];
   onEditModulo: (modulo: Modulo) => void;
   onAddAula: (idModulo: number) => void;
  onEditAula: (aula: Aula, idModulo: number) => void;
}

export const ModulosList: React.FC<ModulosListProps> = ({ modulos, onEditModulo, onAddAula, onEditAula }) => {
  return (
    <div className={styles.modulosContainer}>
      {modulos.map(modulo => (
        <ModuloCursoCard
          key={modulo.id_modulo}
          modulo={modulo}
          onEdit={onEditModulo}
          onAddAula={onAddAula}
          onEditAula={onEditAula} // Passando a função onEditModulo para a prop onEdit
        />
      ))}
    </div>
  );
};
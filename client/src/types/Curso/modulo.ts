import type { Aula } from "./aula";

/**
 * Representa um Módulo dentro de um Curso.
 */
export type Modulo = {
  id_modulo: number;
  id_curso: number;
  titulo: string;
  descricao?: string | null;
  ordem: number;
   aulas?: Aula[];
};
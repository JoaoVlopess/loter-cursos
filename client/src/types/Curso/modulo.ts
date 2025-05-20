import type { Aula } from "./aula";
import type { Curso } from "./curso";

export type Modulo = {
  id_modulo: number;
  id_curso: number;
  titulo: string;
  ordem: number;
  descricao: string;
  aulas: Aula[];
  curso?: Curso;
};
import type { Professor } from "../Clientes/professor";

export type Curso = {
  id_curso: number;
  titulo: string;
  descricao: string;
  carga_horaria: number;
  id_professor: number;
  professor?: Professor;
};
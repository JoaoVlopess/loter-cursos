import type { Aluno } from "../Clientes/aluno";
import type { Curso } from "../Curso/curso";

export type AvaliacaoCurso = {
  id_avaliacao_curso: number;
  id_aluno: number;
  id_curso: number;
  nota: number;
  feedback: string;
  data_avaliacao: string;
  aluno?: Aluno;
  curso?: Curso;
};
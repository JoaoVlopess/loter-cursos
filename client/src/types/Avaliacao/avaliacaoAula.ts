import type { Aluno } from "../Clientes/aluno";
import type { Aula } from "../Curso/aula";

export type AvaliacaoAula = {
  id_avaliacao_aula: number;
  id_aluno: number;
  id_aula: number;
  nota: number;
  feedback: string;
  data_avaliacao: string;
  aluno?: Aluno;
  aula?: Aula;
};
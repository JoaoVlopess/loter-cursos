import type { Aluno } from "../Clientes/aluno";

export type Avaliacao = {
  id_avaliacao: number;
  id_aluno: number;
  nota: number;
  feedback: string;
  data_avaliacao: string;
  aluno?: Aluno;
};
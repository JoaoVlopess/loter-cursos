import type { Aluno } from "../Clientes/aluno";
import type { Modulo } from "../Curso/modulo";

export type AvaliacaoModulo = {
  id_avaliacao_modulo: number;
  id_aluno: number;
  id_modulo: number;
  nota: number;
  feedback: string;
  data_avaliacao: string;
  aluno?: Aluno;
  modulo?: Modulo;
};

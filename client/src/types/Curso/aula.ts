import type { Modulo } from "./modulo";

export type Aula = {
  id_aula: number;
  id_modulo: number;
  titulo: string;
  ordem: number;
  conteudo: string;
  duracao: number;
  modulo?: Modulo;
};
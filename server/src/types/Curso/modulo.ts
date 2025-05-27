// Importa o tipo Aula
import { Aula } from './aula';

export type Modulo = {
  id_modulo: number;
  id_curso: number;
  titulo: string;
  descricao?: string | null; // Pode ser nulo/opcional
  ordem: number;
  aulas?: Aula[];           // <-- Aulas como array opcional
};
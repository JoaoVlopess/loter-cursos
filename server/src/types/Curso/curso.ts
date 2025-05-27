// Importa o tipo Modulo
import { Modulo } from './modulo';

export type Curso = {
  id_curso: number;
  id_professor: number;
  titulo: string;
  descricao?: string | null;     // Pode ser nulo/opcional
  carga_horaria?: number | null; // Pode ser nulo/opcional
  nome_professor?: string;       // Veio do JOIN, então é opcional
  modulos?: Modulo[];          // <-- Módulos como array opcional
};
/**
 * Representa um Curso oferecido na plataforma.
 */
import type { Modulo } from "./modulo"; // Importa o tipo Modulo

export type Curso = {
  id_curso: number;
  id_professor: number;
  titulo: string;
  descricao?: string | null; // Descrições podem ser opcionais
  carga_horaria?: number | null; // Pode ser opcional
  nome_professor?: string; // Adicionado pelo JOIN no backend
  modulos?: Modulo[]; // Array de módulos, opcional
  // Adicione aqui campos como 'imagem_url', 'preco', etc., se necessário.
};
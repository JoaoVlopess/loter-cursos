import type { Usuario } from "./usuario";

export type Professor = {
  id_professor: number;
  id_usuario: number;
  especialidade: string;
  usuario?: Usuario;
};
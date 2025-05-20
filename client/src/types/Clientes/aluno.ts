import type { Usuario } from "./usuario";

export type Aluno = {
  id_aluno: number;
  id_usuario: number;
  usuario?: Usuario;
};
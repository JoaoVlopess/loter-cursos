import type { Usuario } from "./usuario";

export type Admin = {
  id_admin: number;
  id_usuario: number;
  cargo: string;
  usuario?: Usuario;
};
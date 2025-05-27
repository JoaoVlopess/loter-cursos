export type Aula = {
  id_aula: number;
  id_modulo: number;
  titulo: string;
  descricao?: string | null; // Pode ser nulo/opcional
  conteudo?: string | null; // Pode ser nulo/opcional
  duracao?: number | null;  // Pode ser nulo/opcional
  ordem: number;
};
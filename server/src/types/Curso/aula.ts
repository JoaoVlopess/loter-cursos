/**
 * Representa uma Aula dentro de um Módulo.
 */
export type Aula = {
  id_aula: number;
  id_modulo: number;
  titulo: string;
  conteudo?: string | null; // Agora armazena o URL/ID/Embed Code
  duracao?: number | null; // Duração em minutos
};
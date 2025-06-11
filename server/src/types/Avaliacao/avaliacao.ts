// src/types/Avaliacao/avaliacao.ts

export type Avaliacao = {
  id_avaliacao: number;
  id_aluno: number;
  id_curso?: number | null;     // Opcional, se a avaliação for de um curso
  id_modulo?: number | null;    // Opcional, se a avaliação for de um módulo
  id_aula?: number | null;      // Opcional, se a avaliação for de uma aula
  nota: number;
  feedback?: string | null;
  data_avaliacao: string | Date;
  // Opcional: Adicione outros campos se a sua API os retornar, como nome_aluno
  nome_aluno?: string;
};
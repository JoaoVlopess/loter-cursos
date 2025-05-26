/**
 * Representa o progresso de um Aluno em um Curso.
 */
export type ProgressoCurso = {
  id_progresso_curso: number;
  id_aluno: number;
  id_curso: number;
  data_inicio?: Date | string | null;
  status: 'NÃO INICIADO' | 'EM ANDAMENTO' | 'CONCLUÍDO';
};
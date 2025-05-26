/**
 * Representa o progresso de um Aluno em uma Aula específica.
 */
export type ProgressoAula = {
    id_progresso_aula: number;
    id_progresso_curso: number; // Linka ao progresso geral do curso
    id_aula: number;
    concluida: boolean;
    data_conclusao?: Date | string | null;
};
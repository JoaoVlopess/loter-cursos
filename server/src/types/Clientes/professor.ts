/**
 * Representa o perfil de Professor, vinculado a um Usuário.
 */
export type Professor = {
  id_professor: number;
  id_usuario: number;
  especialidade?: string | null; // Pode ser opcional ou nulo
  // Adicione aqui outros campos específicos de Professor, se houver no futuro.
};
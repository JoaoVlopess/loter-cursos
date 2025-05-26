/**
 * Representa um usuário genérico no sistema.
 */
export type Usuario = {
  id_usuario: number;
  nome: string;
  cpf?: string | null; // O CPF pode ser opcional ou nulo
  email: string;
  senha?: string; // Geralmente, a senha não é exposta, mas incluída para o backend
  ativo: boolean;
  data_nascimento?: Date | string | null; // Datas podem ser opcionais e vir como string ou Date
  tipo: 'ALUNO' | 'PROFESSOR' | 'ADMIN'; // Usando maiúsculas para refletir o ENUM do DB
};
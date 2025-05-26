
export type Usuario = {
  id_usuario: number;
  nome: string;
  cpf?: string | null; // O CPF pode ser opcional ou nulo
  email: string;
  senha?: string; 
  ativo: boolean;
  data_nascimento?: Date | string | null; 
  tipo: 'ALUNO' | 'PROFESSOR' | 'ADMIN'; 
};
export type Usuario = {
  id_usuario: number;
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  ativo: boolean;
  data_nascimento: Date;
  tipo: 'ALUNO' | 'PROFESSOR' | 'ADMIN';

};
export type Usuario = {
  id_usuario: number;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  tipo: 'aluno' | 'professor' | 'admin';
};
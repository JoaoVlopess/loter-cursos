/**
 * Representa um Curso oferecido na plataforma.
 */
export type Curso = {
  id_curso: number;
  id_professor: number;
  titulo: string;
  descricao?: string | null; // Descrições podem ser opcionais
  carga_horaria?: number | null; // Pode ser opcional
   modulos: number; // Número de módulos no curso
  // Adicione aqui campos como 'imagem_url', 'preco', etc., se necessário.
};
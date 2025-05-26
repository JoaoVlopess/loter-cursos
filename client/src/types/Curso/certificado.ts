/**
 * Representa um Certificado emitido para um Aluno em um Curso.
 */
export type Certificado = {
  id_certificado: number;
  id_aluno: number;
  id_curso: number;
  data_conclusao: Date | string;
  caminho_arquivo?: string | null; // URL ou caminho para o PDF/imagem
};
import type { Aluno } from "../Clientes/aluno";
import type { Curso } from "./curso";

export type Certificado = {
  id_certificado: number;
  id_aluno: number;
  id_curso: number;
  data_conclusao: string;
  carga_horaria: number;
  caminho_arquivo: string;
  aluno?: Aluno;
  curso?: Curso;
};
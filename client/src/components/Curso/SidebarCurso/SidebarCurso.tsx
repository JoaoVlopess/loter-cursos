import { useState } from "react";
import { FaChevronDown, FaChevronRight, FaRegPlayCircle  } from "react-icons/fa";
import { Link,  } from "react-router-dom";
import styles from "../SidebarCurso/SidebarCurso.module.css";
import type { Modulo } from "../../../types/Curso/modulo";

// Formata segundos para "mm:ss"
const formatDuracao = (segundos: number) => {
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

 const modulos: Modulo[] = [
  {
    id_modulo: 1,
    id_curso: 101,
    titulo: "Introdução ao Backend",
    ordem: 1,
    descricao: "Entenda os fundamentos do backend e como funciona a comunicação cliente-servidor.",
    aulas: [
      {
        id_aula: 1,
        id_modulo: 1,
        titulo: "O que é backend?",
        ordem: 1,
        conteudo: "Conceitos básicos sobre o que é backend e seu papel no desenvolvimento web.",
        duracao: 451
      },
      {
        id_aula: 2,
        id_modulo: 1,
        titulo: "O que é cliente e servidor?",
        ordem: 2,
        conteudo: "Diferença entre cliente e servidor, como se comunicam e exemplos práticos.",
        duracao: 788
      },
      {
        id_aula: 3,
        id_modulo: 1,
        titulo: "Entendendo o protocolo HTTP 1",
        ordem: 3,
        conteudo: "Visão geral do HTTP 1, cabeçalhos, métodos e exemplos de requisições.",
        duracao: 704
      },
    ]
  },
  {
    id_modulo: 2,
    id_curso: 101,
    titulo: "Introdução ao Node.js",
    ordem: 2,
    descricao: "Aprenda sobre o ambiente Node.js e como criar suas primeiras aplicações.",
    aulas: [
      {
        id_aula: 4,
        id_modulo: 2,
        titulo: "O que é Node.js?",
        ordem: 1,
        conteudo: "Definição, propósito e vantagens do uso do Node.js.",
        duracao: 723
      },
      {
        id_aula: 5,
        id_modulo: 2,
        titulo: "Configurando o ambiente",
        ordem: 2,
        conteudo: "Como instalar o Node.js, npm e configurar o VSCode.",
        duracao: 615
      }
    ]
  }
];

type Props = {
  cursoId: string;
}

export function SidebarCurso({ cursoId }: Props) {
  const [moduloAberto, setModuloAberto] = useState<number | null>(1);


  const toggleModulo = (id: number) => {
    setModuloAberto(moduloAberto === id ? null : id);
  };

  return (
    <aside className={styles.sidebar}>
      {modulos.map((modulo) => (
        <div key={modulo.id_modulo} className={styles.modulo}>
          <button onClick={() => toggleModulo(modulo.id_modulo)} className={styles.moduloButton}>
            <span className={styles.moduloNumero}>{modulo.ordem}. </span>
            <span className={styles.moduloTitulo}>{modulo.titulo} </span>
            {moduloAberto === modulo.id_modulo ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {moduloAberto === modulo.id_modulo && (
            <ul className={styles.aulaLista}>
              {modulo.aulas.map((aula) => (
                <li key={aula.id_aula} className={styles.aulaItem}>
                  <Link
                    to={`/curso/${cursoId}/aula/${aula.id_aula}`}
                    className={styles.aulaLink}
                  >
                    <FaRegPlayCircle  className={styles.playIcon} />
                    <span>{aula.titulo}</span>
                    <span className={styles.duracao}>{formatDuracao(aula.duracao)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </aside>
  );
}
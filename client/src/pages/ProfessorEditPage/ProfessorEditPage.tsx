import styles from '../ProfessorEditPage/ProfessorEditPage.module.css';
import { Modulo } from '../../types/Curso/modulo';
import { FormButton } from '../../components/FormButton/FormButton';
import { Link } from 'react-router-dom';


export const ProfessorEditPage = () => {
  // Dados de exemplo - substitua pelos seus dados reais
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
        duracao: 17
      },
      {
        id_aula: 2,
        id_modulo: 1,
        titulo: "O que é cliente e servidor?",
        ordem: 2,
        conteudo: "Diferença entre cliente e servidor, como se comunicam e exemplos práticos.",
        duracao: 27
      },
      {
        id_aula: 3,
        id_modulo: 1,
        titulo: "Entendendo o protocolo HTTP 1",
        ordem: 3,
        conteudo: "Visão geral do HTTP 1, cabeçalhos, métodos e exemplo s de requisições.",
        duracao: 25
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
        duracao: 12
      },
      {
        id_aula: 5,
        id_modulo: 2,
        titulo: "Configurando o ambiente",
        ordem: 2,
        conteudo: "Como instalar o Node.js, npm e configurar o VSCode.",
        duracao: 19
      }
    ]
  }
];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gerenciamento do Curso "nome do curso"</h1>
      
      <div className={styles.header}>
        <FormButton>
            <Link to="/home"> + Adicionar Módulo</Link>
        </FormButton>
      </div>

      <div className={styles.modulosContainer}>
        {modulos.map(modulo => (
          <div key={modulo.id_modulo} className={styles.moduloCard}>
            <div className={styles.moduloHeader}>
              <h3>{modulo.titulo}</h3>
              <div className={styles.moduloActions}>
                <button>Editar</button>
                <button>+ Aula</button>
              </div>
            </div>
            
            <div className={styles.moduloDescription}>
              {modulo.descricao}
            </div>

            <div className={styles.aulasList}>
              {modulo.aulas.map(aula => (
                <div key={aula.id_aula} className={styles.aulaItem}>
                  <div className={styles.aulaInfo}>
                    <span className={styles.aulaTitle}>{aula.titulo}</span>
                    <span className={styles.aulaDuration}>{aula.duracao} min</span>
                  </div>
                  <button className={styles.editAulaButton}>Editar</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// import { AdminCard } from "../../components/AdminCard/AdminCard"; // Removido se não for usado diretamente aqui
// import { CursoGrid } from "../../components/Curso/CursoGrid/CursoGrid"; // Removido pois estamos listando cursos de outra forma
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import { Curso } from "../../types/Curso/curso";
import { Link } from "react-router-dom";
import { useState } from "react"; // Importar useState
import styles from "./AdminArea.module.css";
import { AdminList } from "../../components/AdminList/AdminList"; // Importar AdminList
import { Aluno } from "../../types/Clientes/aluno"; // Importar tipo Aluno
import { Professor } from "../../types/Clientes/professor"; // Importar tipo Aluno
import { Usuario } from "../../types/Clientes/usuario";


const cursos: Curso[] = [
  {
    id_curso: 1,
    titulo: "Fundamentos de React",
    descricao: "Aprenda os conceitos básicos do React, como componentes, props e estado.",
    carga_horaria: 12,
    id_professor: 1,
    modulos: 5
  },
  {
    id_curso: 2,
    titulo: "Fundamentos de pyton",
    descricao: "Aprenda os conceitos básicos do pyton, como IA.",
    carga_horaria: 5,
    id_professor: 3,
    modulos: 10
  },
  {
    id_curso: 3,
    titulo: "Desenvolvimento Web Avançado",
    descricao: "Explore tópicos avançados em desenvolvimento web.",
    carga_horaria: 20,
    id_professor: 2, // Professor diferente para exemplo
    modulos: 8
  },
  {
    id_curso: 4, // ID único
    titulo: "Introdução à Análise de Dados",
    descricao: "Conceitos iniciais sobre análise e visualização de dados.",
    carga_horaria: 10,
    id_professor: 3,
    modulos: 6
  },
  {
    id_curso: 5, // ID único
    titulo: "Machine Learning Básico",
    descricao: "Primeiros passos no mundo do Machine Learning.",
    carga_horaria: 15,
    id_professor: 2,
    modulos: 7
  },
  {
    id_curso: 6, // ID único
    titulo: "Segurança da Informação Essencial",
    descricao: "Proteja seus dados e sistemas.",
    carga_horaria: 8,
    id_professor: 1,
    modulos: 4
  },
  {
    id_curso: 6, // ID único
    titulo: "Segurança da Informação Essencial",
    descricao: "Proteja seus dados e sistemas.",
    carga_horaria: 8,
    id_professor: 1,
    modulos: 4
  },
  {
    id_curso: 6, // ID único
    titulo: "Segurança da Informação Essencial",
    descricao: "Proteja seus dados e sistemas.",
    carga_horaria: 8,
    id_professor: 1,
    modulos: 4
  },
];
const professoresData: (Usuario & { especialidade?: string })[] = [
  { id_usuario: 1, nome: "Dr. Ana Silva", email: "ana.silva@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "React, Frontend" },
  { id_usuario: 2, nome: "Prof. Carlos Lima", email: "carlos.lima@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "Python, Inteligência Artificial" },
  { id_usuario: 3, nome: "Msc. Beatriz Costa", email: "beatriz.costa@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "Banco de Dados, Web Avançado" },
  { id_usuario: 4, nome: "Dr. João Mendes", email: "joao.mendes@example.com", ativo: false, tipo: 'PROFESSOR', especialidade: "Análise de Dados" },
];

const alunosData: (Usuario & { matricula?: string })[] = [
  { id_usuario: 101, nome: "João Pereira Silva", email: "joao.p@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023001" },
  { id_usuario: 102, nome: "Maria Oliveira Santos", email: "maria.o@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023002" },
  { id_usuario: 103, nome: "Pedro Santos Souza", email: "pedro.s@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023003" },
  { id_usuario: 104, nome: "Sofia Almeida Lima", email: "sofia.a@example.com", ativo: false, tipo: 'ALUNO', matricula: "2023004" },
  { id_usuario: 105, nome: "Lucas Ferreira Costa", email: "lucas.f@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023005" },
];

type AdminView = 'cursos' | 'professores' | 'alunos';

interface ViewConfig {
  title: string;
  addItemLabel: string;
  addItemLink: string;
  data: Curso[] | (Usuario & { especialidade?: string })[] | (Usuario & { matricula?: string })[];
  nameKey: string; // Chave para buscar pelo nome/título
}

export const AdminArea = () => {
  // Declarar o estado para controlar a visibilidade da lista de cursos
  // Inicializado como true para que a lista seja exibida por padrão.
  // Você pode mudar para false se quiser que comece oculta e seja exibida por um botão, por exemplo.
  const [mostrarCursos, setMostrarCursos] = useState(true);

  // TODO: No futuro, você provavelmente vai querer buscar os dados dos professores
  // para exibir o nome deles em vez do ID.
  return (
    <div className={styles.AdminArea_page}>
      <NavBar />
      <div className={styles.main_content}>
        <h1>Painel Administrativo</h1>
        <div className={styles.admin_navigation}>
          <Link to="/admin/professores" className={styles.nav_button_admin}>Gerenciar Cursos</Link>
          <Link to="/admin/alunos" className={styles.nav_button_admin}>Gerenciar Alunos</Link>
          <Link to="/admin/cursos/novo" className={styles.nav_button_admin}>Gerenciar Professores</Link>
          {/* Exemplo de botão para alternar a visibilidade, se necessário */}
          {/* <button onClick={() => setMostrarCursos(!mostrarCursos)} className={styles.nav_button_admin}>
            {mostrarCursos ? "Ocultar Cursos" : "Mostrar Cursos"}
          </button> */}
        </div>
       {mostrarCursos && (
  <div className={styles.admin_list_container}>
    <h2 className={styles.admin_list_title}>Cursos Cadastrados</h2>
    {cursos && cursos.length > 0 ? (
      <ul className={styles.admin_list}>
        {cursos.map((curso) => ( // Certifique-se que curso.id_curso é único para a key
          <li key={curso.id_curso} className={styles.admin_list_item}>
            <div className={styles.admin_list_item_content}>
              <strong>{curso.titulo}</strong>
              <span>Professor ID: {curso.id_professor} {/* Idealmente, aqui viria o nome do professor */}</span>
            </div>
            {/* Opcional: Adicionar botões de ação (Editar, Excluir) */}
            <div className={styles.admin_list_item_actions}>
              <button>Editar</button>
              <button>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p style={{ color: '#ccc', textAlign: 'center' }}>Nenhum curso para exibir.</p>
    )}
  </div>
)}
      </div>
      <Footer />
    </div>
  );
};
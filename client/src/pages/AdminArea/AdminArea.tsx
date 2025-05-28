import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import type { Curso } from "../../types/Curso/curso";
import { Link } from "react-router-dom";
import { useState } from "react"; // Importar useState
import styles from "./AdminArea.module.css";
import type { Usuario } from "../../types/Clientes/usuario";
import { AdminList } from "../../components/AdminList/AdminList";


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
    titulo: "Segurança da Informação Essencial - Nível 1",
    descricao: "Proteja seus dados e sistemas.",
    carga_horaria: 8,
    id_professor: 1,
    modulos: 4
  },
  {
    id_curso: 7, // ID único corrigido
    titulo: "Segurança da Informação Essencial - Nível 2",
    descricao: "Proteja seus dados e sistemas.",
    carga_horaria: 8,
    id_professor: 1,
    modulos: 4
  },
  {
    id_curso: 8, // ID único corrigido
    titulo: "Segurança da Informação Essencial - Nível 3",
    descricao: "Proteja seus dados e sistemas.",
    carga_horaria: 8,
    id_professor: 1,
    modulos: 4
  },
];

// Dados de exemplo para Professores (baseados no tipo Usuario)
const professoresData: (Usuario & { especialidade?: string })[] = [
  { id_usuario: 1, nome: "Dr. Ana Silva", email: "ana.silva@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "React, Frontend" },
  { id_usuario: 2, nome: "Prof. Carlos Lima", email: "carlos.lima@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "Python, Inteligência Artificial" },
  { id_usuario: 3, nome: "Msc. Beatriz Costa", email: "beatriz.costa@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "Banco de Dados, Web Avançado" },
  { id_usuario: 4, nome: "Dr. João Mendes", email: "joao.mendes@example.com", ativo: false, tipo: 'PROFESSOR', especialidade: "Análise de Dados" },
];

// Dados de exemplo para Alunos (baseados no tipo Usuario)
const alunosData: (Usuario & { matricula?: string })[] = [
  { id_usuario: 101, nome: "João Pereira Silva", email: "joao.p@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023001" },
  { id_usuario: 102, nome: "Maria Oliveira Santos", email: "maria.o@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023002" },
  { id_usuario: 103, nome: "Pedro Santos Souza", email: "pedro.s@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023003" },
  { id_usuario: 104, nome: "Sofia Almeida Lima", email: "sofia.a@example.com", ativo: false, tipo: 'ALUNO', matricula: "2023004" },
  { id_usuario: 105, nome: "Lucas Ferreira Costa", email: "lucas.f@example.com", ativo: true, tipo: 'ALUNO', matricula: "2023005" },
];

type AdminView = 'cursos' | 'professores' | 'alunos';

// Define um tipo união para os itens que podem estar na lista
type ListItemType = Curso | (Usuario & { especialidade?: string }) | (Usuario & { matricula?: string });

interface ViewConfig {
  title: string;
  addItemLabel: string;
  addItemLink: string;
  data: ListItemType[]; // Usa ListItemType[] para os dados
  nameKey: "titulo" | "nome"; // Torna nameKey mais específico
}

export const AdminArea = () => {
  const [activeView, setActiveView] = useState<AdminView>('cursos');
  const [searchTerm, setSearchTerm] = useState('');

  const viewConfigs: Record<AdminView, ViewConfig> = {
    cursos: {
      title: "Cursos Cadastrados",
      addItemLabel: "Adicionar Novo Curso",
      addItemLink: "/admin/cursos/novo",
      data: cursos,
      nameKey: "titulo",
    },
    professores: {
      title: "Professores Cadastrados",
      addItemLabel: "Adicionar Novo Professor",
      addItemLink: "/admin/professores/novo",
      data: professoresData,
      nameKey: "nome",
    },
    alunos: {
      title: "Alunos Cadastrados",
      addItemLabel: "Adicionar Novo Aluno",
      addItemLink: "/admin/alunos/novo",
      data: alunosData,
      nameKey: "nome",
    },
  };

  const currentConfig = viewConfigs[activeView];

  const filteredData: ListItemType[] = currentConfig.data.filter((item: ListItemType) => {
    let valueToCompare: string = "";
    // Usa type guards para acessar a propriedade correta de forma segura
    if (currentConfig.nameKey === "titulo" && "titulo" in item) {
      valueToCompare = item.titulo;
    } else if (currentConfig.nameKey === "nome" && "nome" in item) {
      // Este branch será usado para itens baseados em Usuario
      valueToCompare = item.nome;
    }
    return valueToCompare.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderItemContent = (item: ListItemType): React.ReactNode => {
    switch (activeView) {
      case 'cursos':
        {
          const curso = item as Curso;
          return (
            <>
              <strong>{curso.titulo}</strong>
              <span style={{ fontSize: '0.85em', color: '#aaa', display: 'block' }}>
                Professor ID: {curso.id_professor} | Carga Horária: {curso.carga_horaria}h | Módulos: {curso.modulos}
              </span>
            </>
          );
        }
      case 'professores':
        {
          const professor = item as Usuario & { especialidade?: string };
          return (
            <>
              <strong>{professor.nome}</strong>
              <span style={{ fontSize: '0.85em', color: '#aaa', display: 'block' }}>
                Email: {professor.email} {professor.especialidade && `| Especialidade: ${professor.especialidade}`}
              </span>
            </>
          );
        }
      case 'alunos':
        {
          const aluno = item as Usuario & { matricula?: string };
          return (
            <>
              <strong>{aluno.nome}</strong>
              <span style={{ fontSize: '0.85em', color: '#aaa', display: 'block' }}>
                Email: {aluno.email} {aluno.matricula && `| Matrícula: ${aluno.matricula}`}
              </span>
            </>
          );
        }
      default:
        return null;
    }
  };

  const getItemKey = (item: ListItemType): string | number => {
    switch (activeView) {
      case 'cursos': return (item as Curso).id_curso;
      case 'professores': return (item as Usuario).id_usuario; // Usar id_usuario
      case 'alunos': return (item as Usuario).id_usuario; // Usar id_usuario
      default: return '';
    }
  };

    // Funções de exemplo para botões de ação (você precisará implementá-las)
    const handleEditItem = (item: ListItemType) => {
      console.log("Editar:", item);
      // Navegar para a página de edição, por exemplo: navigate(`/admin/${activeView}/${getItemKey(item)}/editar`)
    };

    const handleDeleteItem = (item: ListItemType) => {
      console.log("Excluir:", item);
      // Chamar API para excluir e atualizar a lista
    };

  // TODO: No futuro, você provavelmente vai querer buscar os dados dos professores
  // para exibir o nome deles em vez do ID.
  return (
    <div className={styles.AdminArea_page}>
      <NavBar />
      <div className={styles.main_content}>
        <h1>Painel Administrativo</h1>
        <div className={styles.admin_navigation}>
          <button onClick={() => { setActiveView('cursos'); setSearchTerm(''); }} className={`${styles.nav_button_admin} ${activeView === 'cursos' ? styles.active_nav_button : ''}`}>Cursos</button>
          <button onClick={() => { setActiveView('professores'); setSearchTerm(''); }} className={`${styles.nav_button_admin} ${activeView === 'professores' ? styles.active_nav_button : ''}`}>Professores</button>
          <button onClick={() => { setActiveView('alunos'); setSearchTerm(''); }} className={`${styles.nav_button_admin} ${activeView === 'alunos' ? styles.active_nav_button : ''}`}>Alunos</button>
        </div>

        <div className={styles.admin_list_container}>
          <h2 className={styles.admin_list_title}>{currentConfig.title}</h2>
          <div className={styles.admin_search_container}>
            <input
              type="text"
              placeholder={`Buscar ${activeView}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.admin_search_input}
            />
          </div>
          <div className={styles.admin_list_scrollable_content}>
            {/* O componente AdminList já foi fornecido em uma interação anterior e é usado aqui */}
            {/* Supondo que AdminList esteja corretamente importado e funcional */}
            {filteredData.length > 0 || searchTerm ? (
               <AdminList
                items={filteredData}
                renderItemContent={renderItemContent}
                addItemLabel={currentConfig.addItemLabel}
                addItemLink={currentConfig.addItemLink}
                itemKeyExtractor={getItemKey}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
              />
            ) : (
              <p style={{ color: '#ccc', textAlign: 'center', paddingTop: '20px' }}>
                Nenhum item para exibir. <Link to={currentConfig.addItemLink} className={styles.inline_add_link}>Adicionar novo?</Link>
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
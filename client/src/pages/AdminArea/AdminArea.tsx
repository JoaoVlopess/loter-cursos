import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import type { Curso } from "../../types/Curso/curso";
import { useState } from "react";
import styles from "./AdminArea.module.css";
import type { Usuario } from "../../types/Clientes/usuario";
import { AdminList } from "../../components/AdminList/AdminList";
import { EditCursoModal } from "../../components/EditCursoModal/EditCursoModal";
import { EditProfessorModal } from "../../components/EditProfessorModal/EditProfessorModal";
import { EditAlunoModal } from "../../components/EditAlunoModal/EditAlunoModal";



const initialCursosData: Curso[] = [
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
const initialProfessoresData: (Usuario & { especialidade?: string })[] = [
  { id_usuario: 1, nome: "Dr. Ana Silva", email: "ana.silva@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "React, Frontend" },
  { id_usuario: 2, nome: "Prof. Carlos Lima", email: "carlos.lima@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "Python, Inteligência Artificial" },
  { id_usuario: 3, nome: "Msc. Beatriz Costa", email: "beatriz.costa@example.com", ativo: true, tipo: 'PROFESSOR', especialidade: "Banco de Dados, Web Avançado" },
  { id_usuario: 4, nome: "Dr. João Mendes", email: "joao.mendes@example.com", ativo: false, tipo: 'PROFESSOR', especialidade: "Análise de Dados" },
];

// Dados de exemplo para Alunos (baseados no tipo Usuario)
const initialAlunosData: (Usuario & { matricula?: string })[] = [
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
  onAddNewItem: () => void;
  data: ListItemType[]; // Usa ListItemType[] para os dados
  nameKey: "titulo" | "nome"; // Torna nameKey mais específico
}

export const AdminArea = () => {
  const [activeView, setActiveView] = useState<AdminView>('cursos');
  const [searchTerm, setSearchTerm] = useState('');


  // State for data
  const [cursosData, setCursosData] = useState<Curso[]>(initialCursosData);
  const [professoresData, setProfessoresData] = useState<(Usuario & { especialidade?: string })[]>(initialProfessoresData);
  const [alunosData, setAlunosData] = useState<(Usuario & { matricula?: string })[]>(initialAlunosData);

  // State for Modals
  const [isCursoModalOpen, setIsCursoModalOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

  const [isProfessorModalOpen, setIsProfessorModalOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<(Usuario & { especialidade?: string }) | null>(null);

  const [isAlunoModalOpen, setIsAlunoModalOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<(Usuario & { matricula?: string }) | null>(null);

  // --- Modal Open/Close Handlers ---
  const openAddCursoModal = () => { setEditingCurso(null); setIsCursoModalOpen(true); };
  const openEditCursoModal = (curso: Curso) => { setEditingCurso(curso); setIsCursoModalOpen(true); };
  const closeCursoModal = () => setIsCursoModalOpen(false);

  const openAddProfessorModal = () => { setEditingProfessor(null); setIsProfessorModalOpen(true); };
  const openEditProfessorModal = (prof: Usuario & { especialidade?: string }) => { setEditingProfessor(prof); setIsProfessorModalOpen(true); };
  const closeProfessorModal = () => setIsProfessorModalOpen(false);

  const openAddAlunoModal = () => { setEditingAluno(null); setIsAlunoModalOpen(true); };
  const openEditAlunoModal = (aluno: Usuario & { matricula?: string }) => { setEditingAluno(aluno); setIsAlunoModalOpen(true); };
  const closeAlunoModal = () => setIsAlunoModalOpen(false);

  // --- Save Handlers ---
  const handleSaveCurso = (data: Omit<Curso, 'id_curso'>, cursoId?: number) => {
    if (cursoId) {
      setCursosData(prev => prev.map(c => c.id_curso === cursoId ? { ...c, ...data, id_curso: cursoId } : c));
    } else {
      const newId = cursosData.length > 0 ? Math.max(...cursosData.map(c => c.id_curso)) + 1 : 1;
      setCursosData(prev => [...prev, { ...data, id_curso: newId }]);
    }
    closeCursoModal();
  };

  const handleSaveProfessor = (data: { nome: string; email: string; especialidade?: string; ativo: boolean }, professorId?: number) => {
    const allUserIds = [...professoresData.map(p => p.id_usuario), ...alunosData.map(a => a.id_usuario)];
    if (professorId) {
      setProfessoresData(prev => prev.map(p => p.id_usuario === professorId ? { ...p, ...data, id_usuario: professorId, tipo: 'PROFESSOR' } : p));
    } else {
      const newId = allUserIds.length > 0 ? Math.max(0, ...allUserIds) + 1 : 1;
      setProfessoresData(prev => [...prev, { ...data, id_usuario: newId, tipo: 'PROFESSOR' }]);
    }
    closeProfessorModal();
  };

  const handleSaveAluno = (data: { nome: string; email: string; matricula?: string; ativo: boolean }, alunoId?: number) => {
    const allUserIds = [...professoresData.map(p => p.id_usuario), ...alunosData.map(a => a.id_usuario)];
    if (alunoId) {
      setAlunosData(prev => prev.map(a => a.id_usuario === alunoId ? { ...a, ...data, id_usuario: alunoId, tipo: 'ALUNO' } : a));
    } else {
      const newId = allUserIds.length > 0 ? Math.max(0, ...allUserIds) + 1 : 1;
      setAlunosData(prev => [...prev, { ...data, id_usuario: newId, tipo: 'ALUNO' }]);
    }
    closeAlunoModal();
  };

  // --- Delete Handlers (called by modals or by AdminList's onDeleteItem) ---
  const handleDeleteCursoById = (idCurso: number) => {
    setCursosData(prevCursos => prevCursos.filter(c => c.id_curso !== idCurso));
    closeCursoModal();
  };

  const handleDeleteProfessorById = (idUsuario: number) => {
    setProfessoresData(prevProfessores => prevProfessores.filter(p => p.id_usuario !== idUsuario));
    closeProfessorModal();
  };

  const handleDeleteAlunoById = (idUsuario: number) => {
    setAlunosData(prevAlunos => prevAlunos.filter(a => a.id_usuario !== idUsuario));
    closeAlunoModal();
  };

  const viewConfigs: Record<AdminView, ViewConfig> = {
    cursos: {
      title: "Cursos Cadastrados",
      addItemLabel: "Adicionar Novo Curso",
      onAddNewItem: openAddCursoModal,
      data: cursosData,
      nameKey: "titulo",
    },
    professores: {
      title: "Professores Cadastrados",
      addItemLabel: "Adicionar Novo Professor",
      onAddNewItem: openAddProfessorModal,
      data: professoresData, // Use state variable
      nameKey: "nome",
    },
    alunos: {
      title: "Alunos Cadastrados",
      addItemLabel: "Adicionar Novo Aluno",
      onAddNewItem: openAddAlunoModal,
      data: alunosData, // Use state variable
      nameKey: "nome",
    },
  };

  const currentConfig = viewConfigs[activeView];

  const filteredData = currentConfig.data.filter((item: ListItemType) => {

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
    switch (activeView) {
      case 'cursos':
        openEditCursoModal(item as Curso);
        break;
      case 'professores':
        openEditProfessorModal(item as Usuario & { especialidade?: string });
        break;
      case 'alunos':
        openEditAlunoModal(item as Usuario & { matricula?: string });
        break;
    }
  };

  const handleDeleteItemFromList = (item: ListItemType) => {
    let itemName = '';
    let deleteAction: (() => void) | undefined;

    if (activeView === 'cursos' && 'id_curso' in item) {
      itemName = (item as Curso).titulo;
      deleteAction = () => handleDeleteCursoById((item as Curso).id_curso);
    } else if ('id_usuario' in item && 'nome' in item) { // Professores e Alunos
      itemName = (item as Usuario).nome;
      deleteAction = activeView === 'professores' ? () => handleDeleteProfessorById(item.id_usuario) : () => handleDeleteAlunoById(item.id_usuario);
    }

    if (deleteAction && window.confirm(`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`)) {
      deleteAction();
    }
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
                onAddItem={currentConfig.onAddNewItem}
                itemKeyExtractor={getItemKey}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItemFromList}
              />
            ) : (
              <p style={{ color: '#ccc', textAlign: 'center', paddingTop: '20px' }}>
                Nenhum item para exibir. <button onClick={currentConfig.onAddNewItem} className={styles.inline_add_link_button}>Adicionar novo?</button>
              </p>
            )}
          </div>
        </div>
      </div>
      {isCursoModalOpen && (
        <EditCursoModal
          isOpen={isCursoModalOpen}
          onClose={closeCursoModal}
          curso={editingCurso}
          onSave={handleSaveCurso}
          onDelete={handleDeleteCursoById}
        />
      )}
      {isProfessorModalOpen && (
        <EditProfessorModal
          isOpen={isProfessorModalOpen}
          onClose={closeProfessorModal}
          professor={editingProfessor}
          onSave={handleSaveProfessor}
          onDelete={handleDeleteProfessorById}
        />
      )}
      {isAlunoModalOpen && (
        <EditAlunoModal
          isOpen={isAlunoModalOpen}
          onClose={closeAlunoModal}
          aluno={editingAluno}
          onSave={handleSaveAluno}
          onDelete={handleDeleteAlunoById}
        />
      )}
      <Footer />
    </div>
  );
};
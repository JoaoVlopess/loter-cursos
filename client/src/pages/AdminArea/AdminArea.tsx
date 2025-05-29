import { useEffect, useState } from "react";
import axios, { AxiosError } from 'axios';
import { Footer } from "../../components/Footer/Footer";
import { NavBar } from "../../components/NavBar/Navbar";
import type { Curso } from "../../types/Curso/curso";
import styles from "./AdminArea.module.css";
import type { Usuario } from "../../types/Clientes/usuario";
import { AdminList } from "../../components/AdminList/AdminList";
import { EditCursoModal } from "../../components/EditCursoModal/EditCursoModal";
import { EditProfessorModal } from "../../components/EditProfessorModal/EditProfessorModal";
import { EditAlunoModal } from "../../components/EditAlunoModal/EditAlunoModal";

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

interface ApiErrorData {
  message: string;
  success?: boolean;
  // Adicione outros campos que sua API pode retornar em caso de erro
}

// Dados mockados removidos - serão buscados da API
// const initialCursosData: Curso[] = [ ... ];
// const initialProfessoresData: (Usuario & { especialidade?: string })[] = [ ... ];
// const initialAlunosData: (Usuario & { matricula?: string })[] = [ ... ];

export const AdminArea = () => {
  const [activeView, setActiveView] = useState<AdminView>('cursos');
  const [searchTerm, setSearchTerm] = useState('');

  // State for API data loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for data
  const [cursosData, setCursosData] = useState<Curso[]>([]); {/*lista de todos cursos*/}
  const [professoresData, setProfessoresData] = useState<(Usuario & { especialidade?: string; id_professor?: number })[]>([]); {/*lista de todos professores*/}
  const [alunosData, setAlunosData] = useState<(Usuario & { matricula?: string })[]>([]); {/*lista de todos alunos*/}

  const API_URL_BASE = 'http://localhost:3000'; // Mova para o escopo do componente para reuso

  useEffect(() => {
    const API_URL_BASE = 'http://localhost:3000'; // Certifique-se que esta URL está correta

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken'); // Ou a chave que você usa para guardar o token
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        if (!token) {
          // Opcional: Redirecionar para login ou mostrar mensagem se não houver token
          // Exemplo: setError("Usuário não autenticado. Faça login para acessar esta área.");
          // setIsLoading(false);
          // return; // Ou lançar um erro específico
          throw new Error('Token de autenticação não encontrado. Faça o login.');
        }

        const [cursosRes, professoresRes, alunosRes] = await Promise.all([
          axios.get<{ success: boolean, data: Curso[] }>(`${API_URL_BASE}/cursos`),
          axios.get<{ success: boolean, data: (Usuario & { especialidade?: string; id_professor?: number })[] }>(`${API_URL_BASE}/usuarios/professores`, { headers }),
          axios.get<{ success: boolean, data: Usuario[] }>(`${API_URL_BASE}/usuarios/alunos`, { headers })
        ]);

        if (cursosRes.data.success) setCursosData(cursosRes.data.data);
        else throw new Error('Falha ao buscar cursos da API.');

        if (professoresRes.data.success) setProfessoresData(professoresRes.data.data);
        else throw new Error('Falha ao buscar professores da API.');

        if (alunosRes.data.success) setAlunosData(alunosRes.data.data.map(aluno => ({ ...aluno, matricula: undefined }))); // Adiciona matricula para conformar ao tipo
        else throw new Error('Falha ao buscar alunos da API.');

      } catch (err) {
        console.error("Erro ao buscar dados para AdminArea:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocorreu um erro desconhecido ao carregar os dados. Verifique a conexão com a API.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Array de dependências vazio para rodar apenas na montagem inicial

  // State for Modals
  const [isCursoModalOpen, setIsCursoModalOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

  const [isProfessorModalOpen, setIsProfessorModalOpen] = useState(false);
  // Align state type with EditProfessorModalProps
  const [editingProfessor, setEditingProfessor] = useState<(Usuario & { especialidade?: string; data_nascimento?: string; cpf?: string; }) | null>(null);

  const [isAlunoModalOpen, setIsAlunoModalOpen] = useState(false);
  // Align state type with EditAlunoModalProps
  // Note: EditAlunoModal's Aluno type now includes cpf
  const [editingAluno, setEditingAluno] = useState<(Usuario & { matricula?: string; data_nascimento?: string; cpf?: string; }) | null>(null);

  // --- Modal Open/Close Handlers ---
  const openAddCursoModal = () => { setEditingCurso(null); setIsCursoModalOpen(true); };
  const openEditCursoModal = (curso: Curso) => { setEditingCurso(curso); setIsCursoModalOpen(true); };
  const closeCursoModal = () => setIsCursoModalOpen(false);

  const openAddProfessorModal = () => { setEditingProfessor(null); setIsProfessorModalOpen(true); };
  const openEditProfessorModal = (prof: Usuario & { especialidade?: string }) => {
    let processedDob: string | undefined = undefined;
    if (prof.data_nascimento instanceof Date) {
      processedDob = prof.data_nascimento.toISOString().split('T')[0];
    } else if (typeof prof.data_nascimento === 'string') {
      // Assuming if it's a string, it's either in 'YYYY-MM-DD' format
      // or the modal's internal useEffect will handle it (e.g., by setting to '' if invalid for date input).
      processedDob = prof.data_nascimento;
    }
    const processedCpf = prof.cpf ?? undefined; // Convert null cpf to undefined
    // If prof.data_nascimento is null, processedDob remains undefined.
    setEditingProfessor({
      ...prof,
      data_nascimento: processedDob, // Ensure data_nascimento is string | undefined
      cpf: processedCpf, // Ensure cpf is string | undefined
    });
    setIsProfessorModalOpen(true);
  };
  const closeProfessorModal = () => setIsProfessorModalOpen(false);

  const openAddAlunoModal = () => { setEditingAluno(null); setIsAlunoModalOpen(true); };
  const openEditAlunoModal = (aluno: Usuario & { matricula?: string }) => {
    let processedDob: string | undefined = undefined;
    if (aluno.data_nascimento instanceof Date) {
      processedDob = aluno.data_nascimento.toISOString().split('T')[0];
    } else if (typeof aluno.data_nascimento === 'string') {
      processedDob = aluno.data_nascimento;
    }
    const processedCpf = aluno.cpf ?? undefined;
    // If aluno.data_nascimento is null, processedDob remains undefined.
    setEditingAluno({
      ...aluno,
      data_nascimento: processedDob, // Ensure data_nascimento is string | undefined
      cpf: processedCpf, // Ensure cpf is string | undefined
    });
    setIsAlunoModalOpen(true);
  };
  const closeAlunoModal = () => setIsAlunoModalOpen(false);

  // --- Save Handlers ---
  const handleSaveCurso = async (data: Pick<Curso, 'titulo' | 'descricao' | 'id_professor' | 'carga_horaria'>, cursoId?: number) => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!token) {
      setError("Autenticação necessária para salvar.");
      return;
    }

    try {
      if (cursoId) { // Atualizar curso existente
        const response = await axios.put(`${API_URL_BASE}/cursos/${cursoId}`, data, { headers });
        if (response.data.success) {
          setCursosData(prev => prev.map(c => c.id_curso === cursoId ? { ...c, ...data, id_curso: cursoId } : c));
        } else {
          throw new Error(response.data.message || 'Falha ao atualizar curso.');
        }
      } else { // Criar novo curso
        const response = await axios.post(`${API_URL_BASE}/cursos`, data, { headers });
        if (response.data.success && response.data.id_curso) {
          const novoCurso: Curso = { ...data, id_curso: response.data.id_curso, modulos: [] };
          setCursosData(prev => [...prev, novoCurso]);
        } else {
          throw new Error(response.data.message || 'Falha ao criar curso.');
        }
      }
    } catch (error: unknown) {
      let errorMessage = "Erro ao salvar curso.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao salvar curso.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao salvar curso:", error);
      setError(errorMessage);
    } finally {
      closeCursoModal();
    }
  };

  const handleSaveProfessor = async (data: { nome: string; email: string; especialidade?: string; ativo: boolean; cpf?: string; senha?: string; data_nascimento?: string }, professorId?: number) => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!token) {
      setError("Autenticação necessária para salvar.");
      return;
    }

    // Campos que o backend espera para criação via createUsuarioByAdmin
    const professorPayload: typeof data & { tipo: 'PROFESSOR' } = {
      ...data,
      tipo: 'PROFESSOR',
    };    

    try {
      if (professorId) { // Atualizar
        // O endpoint de update /usuarios/:id pode não aceitar 'tipo' ou 'email' diretamente.
        // Ajuste o payload conforme o que seu endpoint PUT /usuarios/:id aceita.
        // Ex: delete professorPayload.tipo; delete professorPayload.email; (se não forem atualizáveis)
        const updateData = { nome: data.nome, especialidade: data.especialidade, ativo: data.ativo, cpf: data.cpf, data_nascimento: data.data_nascimento };
        const response = await axios.put(`${API_URL_BASE}/usuarios/${professorId}`, updateData, { headers });
        if (response.data.success) {
          setProfessoresData(prev => prev.map(p => p.id_usuario === professorId ? { ...p, ...data, id_usuario: professorId, tipo: 'PROFESSOR' } : p));
        } else {
          throw new Error(response.data.message || 'Falha ao atualizar professor.');
        }
      } else { // Criar
        // Para criar, o backend espera: nome, cpf, email, senha, data_nascimento, tipo, especialidade
        // Certifique-se que o modal coleta todos os campos obrigatórios ou ajuste o backend.
        // Adicionando validação para CPF e Senha na criação
        if (!data.email || !data.nome || !data.cpf || !data.senha) {
            const missingFields = ["Nome", "Email", "CPF", "Senha"].filter(field => 
                (field === "Nome" && !data.nome) || (field === "Email" && !data.email) || (field === "CPF" && !data.cpf) || (field === "Senha" && !data.senha)
            ).join(', ');
            setError(`Campos obrigatórios (${missingFields}) não preenchidos para novo professor.`);
            return;
        }
        const response = await axios.post(`${API_URL_BASE}/usuarios`, professorPayload, { headers });
        if (response.data.success && response.data.id_usuario) {
          const novoProfessor = { ...data, id_usuario: response.data.id_usuario, tipo: 'PROFESSOR' } as (Usuario & { especialidade?: string });
          setProfessoresData(prev => [...prev, novoProfessor]);
        } else {
          throw new Error(response.data.message || 'Falha ao criar professor.');
        }
      }
    } catch (error: unknown) {
      let errorMessage = "Erro ao salvar professor.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao salvar professor.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao salvar professor:", error);
      setError(errorMessage);
    } finally {
      closeProfessorModal();
    }
  };

  const handleSaveAluno = async (data: { nome: string; email: string; matricula?: string; ativo: boolean; cpf?: string; senha?: string; data_nascimento?: string }, alunoId?: number) => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!token) {
      setError("Autenticação necessária para salvar.");
      return;
    }

    // Payload para criar ou atualizar. Para criação, o backend espera cpf, senha, etc.
    const alunoPayload: Omit<typeof data, 'matricula'> & { tipo: 'ALUNO' } = { // Omit 'matricula' as it's not part of Usuario base
        ...data,
        tipo: 'ALUNO', // Necessário se o endpoint de criação for genérico
    };

    try {
      if (alunoId) { // Atualizar
         const updateData = { nome: data.nome, ativo: data.ativo, cpf: data.cpf, data_nascimento: data.data_nascimento }; // Email geralmente não se atualiza assim, ou requer confirmação
        const response = await axios.put(`${API_URL_BASE}/usuarios/${alunoId}`, updateData, { headers });
        if (response.data.success) {
          setAlunosData(prev => prev.map(a => a.id_usuario === alunoId ? { ...a, ...data, id_usuario: alunoId, tipo: 'ALUNO' } : a));
        } else {
          throw new Error(response.data.message || 'Falha ao atualizar aluno.');
        }
      } else { // Criar
        // Assumindo que o backend /usuarios (createUsuarioByAdmin) foi atualizado para aceitar tipo 'ALUNO'
        // e espera nome, cpf, email, senha, data_nascimento, tipo.
        if (!alunoPayload.email || !alunoPayload.nome || !alunoPayload.cpf || !alunoPayload.senha) {
            const missingFields = ["Nome", "Email", "CPF", "Senha"].filter(field =>
                (field === "Nome" && !alunoPayload.nome) || (field === "Email" && !alunoPayload.email) ||
                (field === "CPF" && !alunoPayload.cpf) || (field === "Senha" && !alunoPayload.senha)
            ).join(', ');
            setError(`Campos obrigatórios (${missingFields}) não preenchidos para novo aluno.`);
            return; // Não fecha o modal, permite ao usuário corrigir
        }
        const response = await axios.post(`${API_URL_BASE}/usuarios`, alunoPayload, { headers });
        if (response.data.success && response.data.id_usuario) {
          const novoAluno = { ...data, id_usuario: response.data.id_usuario, tipo: 'ALUNO' } as (Usuario & { matricula?: string; cpf?: string });
          setAlunosData(prev => [...prev, novoAluno]);
        } else {
          throw new Error(response.data.message || 'Falha ao criar aluno.');
        }
      }
    } catch (error: unknown) {
      let errorMessage = "Erro ao salvar aluno.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao salvar aluno.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao salvar aluno:", error);
      setError(errorMessage);
    } finally {
      closeAlunoModal();
    }
  };

  // --- Delete Handlers (called by modals or by AdminList's onDeleteItem) ---
  const handleDeleteCursoById = async (idCurso: number) => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!token) { setError("Autenticação necessária para deletar."); return; }

    try {
      const response = await axios.delete(`${API_URL_BASE}/cursos/${idCurso}`, { headers });
      if (response.data.success) {
        setCursosData(prevCursos => prevCursos.filter(c => c.id_curso !== idCurso));
        closeCursoModal(); // Fechar se estiver aberto
      } else {
        throw new Error(response.data.message || 'Falha ao deletar curso.');
      }
    } catch (error: unknown) {
      let errorMessage = "Erro ao deletar curso.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao deletar curso.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao deletar curso:", error);
      setError(errorMessage);
    }
  };

  const handleDeleteProfessorById = async (idUsuario: number) => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!token) { setError("Autenticação necessária para deletar."); return; }

    try {
      // O backend usa soft delete (ativo = FALSE) para /usuarios/:id
      const response = await axios.delete(`${API_URL_BASE}/usuarios/${idUsuario}`, { headers });
      if (response.data.success) {
        // Se for soft delete, você pode querer refetch ou atualizar o estado 'ativo'
        setProfessoresData(prevProfessores => prevProfessores.filter(p => p.id_usuario !== idUsuario)); // Ou atualizar 'ativo'
        closeProfessorModal();
      } else {
        throw new Error(response.data.message || 'Falha ao deletar professor.');
      }
    } catch (error: unknown) {
      let errorMessage = "Erro ao deletar professor.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao deletar professor.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao deletar professor:", error);
      setError(errorMessage);
    }
  };

  const handleDeleteAlunoById = async (idUsuario: number) => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!token) { setError("Autenticação necessária para deletar."); return; }

    try {
      const response = await axios.delete(`${API_URL_BASE}/usuarios/${idUsuario}`, { headers });
      if (response.data.success) {
        setAlunosData(prevAlunos => prevAlunos.filter(a => a.id_usuario !== idUsuario)); // Ou atualizar 'ativo'
        closeAlunoModal();
      } else {
        throw new Error(response.data.message || 'Falha ao deletar aluno.');
      }
    } catch (error: unknown) {
      let errorMessage = "Erro ao deletar aluno.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao deletar aluno.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao deletar aluno:", error);
      setError(errorMessage);
    }
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
                Professor ID: {curso.id_professor} | Carga Horária: {curso.carga_horaria}h | Módulos: {curso.modulos?.length || 0}
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
            {isLoading && <p style={{ textAlign: 'center', padding: '20px' }}>Carregando dados...</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Erro ao carregar dados: {error}</p>}
            {!isLoading && !error && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
      {isCursoModalOpen && (
        <EditCursoModal
          isOpen={isCursoModalOpen}
          onClose={closeCursoModal}
          curso={editingCurso}
          professores={professoresData} // Passa a lista de professores
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
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Para obter o ID do curso da URL
import axios, { AxiosError } from 'axios'; // Para chamadas API
import styles from '../ProfessorEditPage/ProfessorEditPage.module.css';
import type { Modulo } from '../../types/Curso/modulo';
import type { Aula } from '../../types/Curso/aula'; // Importar Aula
import { FormButton } from '../../components/FormButton/FormButton';
import { ModulosList } from '../../components/ModulosList/ModulosList';
import { EditModuloModal } from '../../components/EditModuloModal/EditModuloModal';
import { EditAulaModal } from '../../components/EditAulaModal/EditAulaModal'; // Importar o modal de aula
import type { Curso } from '../../types/Curso/curso'; // Para o tipo de retorno da API de detalhes do curso


interface ApiErrorData {
  message: string;
  success?: boolean;
  // Adicione outros campos que sua API pode retornar em caso de erro
}

export const ProfessorEditPage = () => {


  const { cursoId: cursoIdFromParams } = useParams<{ cursoId: string }>(); // Obter cursoId da URL
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursoTitulo, setCursoTitulo] = useState<string>(''); // Para exibir o título do curso
  const [isModuloModalOpen, setIsModuloModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [nextModuloOrdem, setNextModuloOrdem] = useState<number>(1);

  // Estados para API
  const [isLoading, setIsLoading] = useState(false); // Para operações de save
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Para o carregamento inicial da página
  const API_URL_BASE = 'http://localhost:3000'; // Mova para uma constante ou config

  useEffect(() => {
    const fetchCursoDetails = async () => {
      if (!cursoIdFromParams) {
        console.warn("[ProfessorEditPage] ID do curso não disponível (cursoIdFromParams é falsy). Verifique a configuração da rota para :cursoId.");
        setIsLoadingPage(false);
        return;
      }
      setIsLoadingPage(true);
      setError(null); // Limpa erros anteriores antes de uma nova busca
      setModulos([]);   // Limpa módulos anteriores
      setCursoTitulo('');
      try {
        const response = await axios.get<{ success: boolean, data: Curso }>(

          `${API_URL_BASE}/cursos/${cursoIdFromParams}/detalhes`
        );
        if (response.data.success && response.data.data) {
          setModulos([]); // Limpa módulos se o ID não estiver presente
          setCursoTitulo(''); // Limpa título do curso
        } else {
          const apiErrorMessage = (response.data as unknown as ApiErrorData).message || "Falha ao buscar detalhes do curso (API retornou erro).";
          console.error("[ProfessorEditPage] Erro da API ao buscar detalhes:", apiErrorMessage, "Resposta completa:", response.data);
          setError(apiErrorMessage);
        }
      } catch (error: unknown) {
        let errorMessage = "Erro desconhecido ao buscar detalhes do curso.";
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiErrorData>;
          errorMessage = axiosError.response?.data?.message || axiosError.message;
          console.error("[ProfessorEditPage] Erro Axios:", errorMessage, "Detalhes:", axiosError.response);
        } else if (error instanceof Error) {
          errorMessage = error.message;
          console.error("[ProfessorEditPage] Erro Genérico:", errorMessage, "Objeto do erro:", error);
        }
        setError(errorMessage);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchCursoDetails();
  }, [cursoIdFromParams]);

  // Estados para o modal de Aula
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  const [currentModuloIdForAula, setCurrentModuloIdForAula] = useState<number | null>(null);
  const [nextAulaOrdemInModal, setNextAulaOrdemInModal] = useState<number>(1);

  const handleOpenEditModal = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setIsModuloModalOpen(true);
  };

  const handleCloseModuloModal = () => {
    setIsModuloModalOpen(false);
    setEditingModulo(null);
  };

  const handleOpenAddModuloModal = () => {
    const ordem = modulos.length > 0 ? Math.max(...modulos.map(m => m.ordem)) + 1 : 1;
    setNextModuloOrdem(ordem);
    setEditingModulo(null); // Indica que estamos adicionando, não editando
    setIsModuloModalOpen(true);
  };

  const handleSaveModulo = async (moduloData: { titulo: string; ordem: number; descricao: string }) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (!cursoIdFromParams) {
      setError("ID do curso não encontrado para adicionar o módulo.");
      setIsLoading(false);
      return;
    }

    try {
      if (editingModulo) { // Modo Edição
        // TODO: Implementar chamada PUT para /modulos/:moduloId
        const response = await axios.put(`${API_URL_BASE}/modulos/${editingModulo.id_modulo}`, moduloData, { headers });
        if (response.data.success) {
          setModulos(prevModulos =>
            prevModulos.map(mod =>
              mod.id_modulo === editingModulo.id_modulo
                ? { ...mod, ...moduloData } // Assumindo que a API não retorna o objeto atualizado
                : mod
            ).sort((a, b) => a.ordem - b.ordem)
          );
        } else {
          throw new Error(response.data.message || "Falha ao atualizar módulo.");
        }
      } else { // Modo Adição
        const response = await axios.post<{ success: boolean, id_modulo: number, message: string }>(
          `${API_URL_BASE}/cursos/${cursoIdFromParams}/modulos`,
          moduloData,
          { headers }
        );
        if (response.data.success && response.data.id_modulo) {
          const novoModulo: Modulo = {
            ...moduloData, // Spread the data sent to the API
            id_modulo: response.data.id_modulo,
            id_curso: parseInt(cursoIdFromParams, 10),
            aulas: [] // New module starts with no aulas
          };
          setModulos(prevModulos => [...prevModulos, novoModulo].sort((a, b) => a.ordem - b.ordem));
        } else {
          throw new Error((response.data as unknown as ApiErrorData).message || "Falha ao criar módulo.");
        }
      }
      handleCloseModuloModal();
    } catch (error: unknown) {
      let errorMessage = "Erro desconhecido ao salvar módulo.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao salvar módulo.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao salvar módulo:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModulo = (idModuloToDelete: number) => {
    setModulos(prevModulos => prevModulos.filter(mod => mod.id_modulo !== idModuloToDelete));
    handleCloseModuloModal(); // Fecha o modal após a exclusão
  };


  // Efeito para calcular a próxima ordem do módulo quando a lista de módulos mudar
  useEffect(() => {
    const ordem = modulos.length > 0 ? Math.max(...modulos.map(m => m.ordem)) + 1 : 1;
    setNextModuloOrdem(ordem);
  }, [modulos]);

  // Funções para Aula
  const handleOpenAddAulaModal = (idModulo: number) => {
    const modulo = modulos.find(m => m.id_modulo === idModulo);
    const ordem = modulo && modulo.aulas ? modulo.aulas.length + 1 : 1;
    setNextAulaOrdemInModal(ordem);
    setCurrentModuloIdForAula(idModulo);
    setEditingAula(null); // Garante que está em modo de adição
    setIsAulaModalOpen(true);
  };

  const handleOpenEditAulaModal = (aula: Aula, idModulo: number) => {
    setEditingAula(aula);
    setCurrentModuloIdForAula(idModulo);
    setIsAulaModalOpen(true);
  };

  const handleCloseAulaModal = () => {
    setIsAulaModalOpen(false);
    setEditingAula(null);
    setCurrentModuloIdForAula(null);
  };

  const handleSaveAula = async (aulaData: Omit<Aula, 'id_aula' | 'id_modulo'>, aulaIdToUpdate?: number) => {
    if (currentModuloIdForAula === null) return;
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      if (aulaIdToUpdate) { // Editando aula existente
        // TODO: Implementar chamada PUT para /aulas/:aulaId
        const response = await axios.put(`${API_URL_BASE}/aulas/${aulaIdToUpdate}`, aulaData, { headers });
        if (response.data.success) {
          setModulos(prevModulos =>
            prevModulos.map(mod => {
              if (mod.id_modulo === currentModuloIdForAula) {
                const newAulasArray = (mod.aulas || []).map(aula =>
                  aula.id_aula === aulaIdToUpdate ? { ...aula, ...aulaData } : aula
                ).sort((a, b) => a.ordem - b.ordem);
                return { ...mod, aulas: newAulasArray };
              }
              return mod;
            })
          );
        } else {
          throw new Error(response.data.message || "Falha ao atualizar aula.");
        }
      } else { // Adicionando nova aula
        const response = await axios.post<{ success: boolean, id_aula: number, message: string }>(
          `${API_URL_BASE}/modulos/${currentModuloIdForAula}/aulas`,
          aulaData,
          { headers }
        );
        if (response.data.success && response.data.id_aula) {
          setModulos(prevModulos =>
            prevModulos.map(mod => {
              if (mod.id_modulo === currentModuloIdForAula) {
                const novaAula: Aula = {
                  ...aulaData,
                  id_aula: response.data.id_aula,
                  id_modulo: currentModuloIdForAula
                };
                const newAulasArray = [...(mod.aulas || []), novaAula].sort((a, b) => a.ordem - b.ordem); return { ...mod, aulas: newAulasArray };
              }
              return mod;
            })
          );
        } else {
          throw new Error((response.data as unknown as ApiErrorData).message || "Falha ao criar aula.");
        }
      }
      handleCloseAulaModal();
    } catch (error: unknown) {
      let errorMessage = "Erro desconhecido ao salvar aula.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        errorMessage = axiosError.response?.data?.message || axiosError.message || "Erro do servidor ao salvar aula.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao salvar aula:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAula = (idAulaToDelete: number, idModuloDaAula: number) => {
    setModulos(prevModulos =>
      prevModulos.map(mod => {
        if (mod.id_modulo === idModuloDaAula) {
          const aulasAtualizadas = (mod.aulas || []).filter(a => a.id_aula !== idAulaToDelete);
          return { ...mod, aulas: aulasAtualizadas };
        }
        return mod;
      })
    );
    handleCloseAulaModal(); // Fecha o modal após a exclusão
  };


  return (
    <div className={styles.container}>
      {/* Idealmente, o título do curso viria da API */}
      <h1 className={styles.pageTitle}>
        Gerenciamento do Curso: {isLoadingPage ? 'Carregando...' : (cursoTitulo || `ID ${cursoIdFromParams}`)}
      </h1>

      <div className={styles.header}>
        <FormButton onClick={handleOpenAddModuloModal}>
          + Adicionar Módulo
        </FormButton>
      </div>
      {isLoading && <p className={styles.loadingMessage}>Salvando alterações...</p>}
      {error && !isLoadingPage && <p className={styles.errorMessage}>Erro: {error}</p>}

      {isLoadingPage && <p className={styles.loadingMessage}>Carregando dados do curso...</p>}
      {!isLoadingPage && !error && modulos.length === 0 && (
        <p>Nenhum módulo encontrado para este curso. Comece adicionando um!</p>
      )}
      {/* A linha que você destacou, agora com as novas props: */}
      <ModulosList
        modulos={modulos}
        onEditModulo={handleOpenEditModal}
        onAddAula={handleOpenAddAulaModal}
        onEditAula={handleOpenEditAulaModal}
      />

      {/* Changed condition to rely on isModuloModalOpen */}
      {isModuloModalOpen && (
        <EditModuloModal
          isOpen={isModuloModalOpen}
          onClose={handleCloseModuloModal}
          modulo={editingModulo} // This will be null for "add", or an object for "edit"
          onSave={handleSaveModulo}
          nextOrdem={nextModuloOrdem}
          onDelete={handleDeleteModulo}
        />
      )}

      {isAulaModalOpen && currentModuloIdForAula !== null && (
        <EditAulaModal
          isOpen={isAulaModalOpen}
          onClose={handleCloseAulaModal}
          onSave={handleSaveAula}
          aula={editingAula}
          idModulo={currentModuloIdForAula}
          nextOrdem={nextAulaOrdemInModal}
          onDelete={handleDeleteAula}
        />
      )}
    </div>
  );
};

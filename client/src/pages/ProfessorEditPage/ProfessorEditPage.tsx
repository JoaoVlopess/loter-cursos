import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import axios, { AxiosError } from 'axios'; // Remova se usar apiClient para tudo
import apiClient from '../../services/apiClient'; // Importa o valor padrão
import type { ApiErrorResponse } from '../../services/apiClient'; // <-- IMPORTA O TIPO SEPARADAMENTE COM 'type'
import styles from './ProfessorEditPage.module.css'; // Corrigido o caminho do CSS
import type { Modulo } from '../../types/Curso/modulo';
import type { Aula } from '../../types/Curso/aula';
import { FormButton } from '../../components/FormButton/FormButton';
import { ModulosList } from '../../components/ModulosList/ModulosList';
import { EditModuloModal } from '../../components/EditModuloModal/EditModuloModal';
import { EditAulaModal } from '../../components/EditAulaModal/EditAulaModal';
import type { Curso } from '../../types/Curso/curso';


// A interface ApiErrorData pode vir do apiClient.ts se você a exportou de lá
// interface ApiErrorData {
//   message: string;
//   success?: boolean;
// }

export const ProfessorEditPage = () => {
  const { cursoId: cursoIdFromParams } = useParams<{ cursoId: string }>();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [cursoTitulo, setCursoTitulo] = useState<string>('');
  const [isModuloModalOpen, setIsModuloModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [nextModuloOrdem, setNextModuloOrdem] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  // const API_URL_BASE = 'http://localhost:3000'; // Removido, apiClient tem baseURL

  useEffect(() => {
    const fetchCursoDetails = async () => {
      if (!cursoIdFromParams) {
        console.warn("[ProfessorEditPage] ID do curso não disponível.");
        setError("ID do curso não encontrado.");
        setIsLoadingPage(false);
        return;
      }
      setIsLoadingPage(true);
      setError(null);
      setModulos([]);
      setCursoTitulo('');
      try {
        // Use apiClient para chamadas autenticadas
        const response = await apiClient.get<{ success: boolean, data: Curso }>(
          `/cursos/${cursoIdFromParams}/detalhes`
        );
        console.log("[ProfessorEditPage - fetchCursoDetails] RESPOSTA COMPLETA DA API:", JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data) {
          setCursoTitulo(response.data.data.titulo);
          console.log("[ProfessorEditPage - fetchCursoDetails] Módulos recebidos da API:", JSON.stringify(response.data.data.modulos, null, 2));
          setModulos(response.data.data.modulos || []);
        } else {
          throw new Error((response.data as unknown as ApiErrorResponse).message || "Falha ao buscar detalhes do curso.");
        }
      } catch (err: any) {
        let errorMessage = "Erro desconhecido ao buscar detalhes do curso.";
         if (err.response && err.response.data) {
            errorMessage = (err.response.data as ApiErrorResponse).message || err.message;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        console.error("[ProfessorEditPage] Erro ao buscar detalhes:", errorMessage, err);
        setError(errorMessage);
      } finally {
        setIsLoadingPage(false);
      }
    };
    fetchCursoDetails();
  }, [cursoIdFromParams]);

  // Estados para Aula Modal (como antes)
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  const [currentModuloIdForAula, setCurrentModuloIdForAula] = useState<number | null>(null);
  const [nextAulaOrdemInModal, setNextAulaOrdemInModal] = useState<number>(1);

  // Funções de Abrir/Fechar Modais (como antes)
  const handleOpenEditModal = (modulo: Modulo) => { /* ... seu código ... */ setEditingModulo(modulo); setIsModuloModalOpen(true); };
  const handleCloseModuloModal = () => { /* ... seu código ... */ setIsModuloModalOpen(false); setEditingModulo(null);};
  const handleOpenAddModuloModal = () => { /* ... seu código ... */ const ordem = modulos.length > 0 ? Math.max(...modulos.map(m => m.ordem)) + 1 : 1; setNextModuloOrdem(ordem); setEditingModulo(null); setIsModuloModalOpen(true);};


  const handleSaveModulo = async (moduloData: { titulo: string; ordem: number; descricao: string }) => {
    setIsLoading(true); setError(null);
    // const token = localStorage.getItem('authToken'); // Removido - apiClient lida com token
    // const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (!cursoIdFromParams) { /* ... seu código ... */ return; }

    try {
      if (editingModulo) { // Modo Edição
        const response = await apiClient.put(`/modulos/${editingModulo.id_modulo}`, moduloData /* { headers } */); // apiClient já envia headers
        if (response.data.success) {
          setModulos(prevModulos =>
            prevModulos.map(mod =>
              mod.id_modulo === editingModulo.id_modulo ? { ...mod, ...moduloData, id_curso: mod.id_curso, aulas: mod.aulas || [] } : mod // Garante que aulas e id_curso são mantidos
            ).sort((a, b) => a.ordem - b.ordem)
          );
        } else { throw new Error(response.data.message || "Falha ao atualizar módulo."); }
      } else { // Modo Adição
        const response = await apiClient.post<{ success: boolean, id_modulo: number, message: string }>(
          `/cursos/${cursoIdFromParams}/modulos`, moduloData /*, { headers } */
        );
        if (response.data.success && response.data.id_modulo) {
          const novoModulo: Modulo = {
            ...moduloData,
            id_modulo: response.data.id_modulo,
            id_curso: parseInt(cursoIdFromParams!, 10),
            aulas: []
          };
          setModulos(prevModulos => [...prevModulos, novoModulo].sort((a, b) => a.ordem - b.ordem));
        } else { throw new Error((response.data as unknown as ApiErrorResponse).message || "Falha ao criar módulo."); }
      }
      handleCloseModuloModal();
    } catch (error: any) {
        let errorMessage = "Erro desconhecido ao salvar módulo.";
        if (error.response && error.response.data) {
            errorMessage = (error.response.data as ApiErrorResponse).message || error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Erro ao salvar módulo:", error);
        setError(errorMessage);
    } finally { setIsLoading(false); }
  };

  // ==========================================================
  // ## FUNÇÃO handleDeleteModulo ATUALIZADA ##
  // ==========================================================
  const handleDeleteModulo = async (idModuloToDelete: number) => {
    // Opcional: Confirmação do usuário
    // if (!window.confirm("Tem certeza que deseja excluir este módulo e todas as suas aulas?")) {
    //   return;
    // }
    console.log(`[ProfessorEditPage] Tentando deletar módulo ID: ${idModuloToDelete}`);
    setIsLoading(true);
    setError(null);
    try {
      // Chamada à API para deletar o módulo
      // apiClient já deve estar configurado para enviar o token
      const response = await apiClient.delete(`/modulos/${idModuloToDelete}`);

      if (response.data.success) { // Ou verifique response.status === 200 ou 204
        console.log(`[ProfessorEditPage] Módulo ID ${idModuloToDelete} deletado com sucesso no backend.`);
        // Atualiza o estado local APÓS o sucesso no backend
        setModulos(prevModulos => prevModulos.filter(mod => mod.id_modulo !== idModuloToDelete));
        // handleCloseModuloModal(); // Só feche se o modal de edição estiver aberto para ESTE item
      } else {
        // Se a API retornar success: false em um 2xx, trate aqui
        const apiErrorMessage = (response.data as unknown as ApiErrorResponse).message || "Falha ao deletar módulo no servidor.";
        console.error("[ProfessorEditPage] Erro da API ao deletar módulo:", apiErrorMessage);
        setError(apiErrorMessage);
      }
    } catch (error: any) {
      let errorMessage = "Erro ao tentar deletar o módulo.";
       if (error.response && error.response.data) {
          errorMessage = (error.response.data as ApiErrorResponse).message || error.message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }
      console.error("[ProfessorEditPage] Erro Axios ao deletar módulo:", errorMessage, error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (useEffect para nextModuloOrdem) ...
  useEffect(() => {
    const ordem = modulos.length > 0 ? Math.max(...modulos.map(m => m.ordem)) + 1 : 1;
    setNextModuloOrdem(ordem);
  }, [modulos]);


  // Funções para Aula (abrir/fechar modais como antes)
  const handleOpenAddAulaModal = (idModulo: number) => { /* ... seu código ... */ const modulo = modulos.find(m => m.id_modulo === idModulo); const ordem = modulo && modulo.aulas ? modulo.aulas.length + 1 : 1; setNextAulaOrdemInModal(ordem); setCurrentModuloIdForAula(idModulo); setEditingAula(null); setIsAulaModalOpen(true);};
  const handleOpenEditAulaModal = (aula: Aula, idModulo: number) => { /* ... seu código ... */  setEditingAula(aula); setCurrentModuloIdForAula(idModulo); setIsAulaModalOpen(true);};
  const handleCloseAulaModal = () => { /* ... seu código ... */ setIsAulaModalOpen(false); setEditingAula(null); setCurrentModuloIdForAula(null);};

  const handleSaveAula = async (aulaData: Omit<Aula, 'id_aula' | 'id_modulo'>, aulaIdToUpdate?: number) => {
    if (currentModuloIdForAula === null) { /* ... seu código ... */ return; }
    setIsLoading(true); setError(null);
    // const token = localStorage.getItem('authToken'); // Removido
    // const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      if (aulaIdToUpdate) { // Editando
        const response = await apiClient.put(`/aulas/${aulaIdToUpdate}`, aulaData /*, { headers } */);
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
        } else { throw new Error(response.data.message || "Falha ao atualizar aula."); }
      } else { // Adicionando
        const response = await apiClient.post<{ success: boolean, id_aula: number, message: string }>(
          `/modulos/${currentModuloIdForAula}/aulas`, aulaData /*, { headers } */
        );
        if (response.data.success && response.data.id_aula) {
          setModulos(prevModulos =>
            prevModulos.map(mod => {
              if (mod.id_modulo === currentModuloIdForAula) {
                const novaAula: Aula = {
                  ...(aulaData as Aula), // Cast para Aula para incluir todos os campos esperados
                  id_aula: response.data.id_aula,
                  id_modulo: currentModuloIdForAula
                };
                const newAulasArray = [...(mod.aulas || []), novaAula].sort((a, b) => a.ordem - b.ordem);
                return { ...mod, aulas: newAulasArray };
              }
              return mod;
            })
          );
        } else { throw new Error((response.data as unknown as ApiErrorResponse).message || "Falha ao criar aula."); }
      }
      handleCloseAulaModal();
    } catch (error: any) {
        let errorMessage = "Erro desconhecido ao salvar aula.";
        if (error.response && error.response.data) {
            errorMessage = (error.response.data as ApiErrorResponse).message || error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("[ProfessorEditPage - handleSaveAula] ERRO CAPTURADO:", error, "Mensagem:", errorMessage);
        setError(errorMessage);
    } finally { setIsLoading(false); }
  };

  // ==========================================================
  // ## FUNÇÃO handleDeleteAula ATUALIZADA ##
  // ==========================================================
  const handleDeleteAula = async (idAulaToDelete: number, idModuloDaAula: number) => {
    // Opcional: Confirmação do usuário
    // if (!window.confirm("Tem certeza que deseja excluir esta aula?")) {
    //   return;
    // }
    console.log(`[ProfessorEditPage] Tentando deletar aula ID: ${idAulaToDelete} do módulo ID: ${idModuloDaAula}`);
    setIsLoading(true);
    setError(null);
    try {
      // Chamada à API para deletar a aula
      const response = await apiClient.delete(`/aulas/${idAulaToDelete}`);

      if (response.data.success) { // Verifique a estrutura da sua resposta de sucesso
        console.log(`[ProfessorEditPage] Aula ID: ${idAulaToDelete} deletada com sucesso no backend.`);
        // ATUALIZA O ESTADO LOCAL *APÓS* SUCESSO NO BACKEND
        setModulos(prevModulos =>
          prevModulos.map(mod => {
            if (mod.id_modulo === idModuloDaAula) {
              const aulasAtualizadas = (mod.aulas || []).filter(a => a.id_aula !== idAulaToDelete);
              return { ...mod, aulas: aulasAtualizadas };
            }
            return mod;
          })
        );
        // handleCloseAulaModal(); // Só feche se o modal de edição estava aberto para ESTA aula
      } else {
        const apiErrorMessage = (response.data as unknown as ApiErrorResponse).message || "Falha ao deletar aula no servidor.";
        console.error("[ProfessorEditPage] Erro da API ao deletar aula:", apiErrorMessage);
        setError(apiErrorMessage);
      }
    } catch (error: any) {
      let errorMessage = "Erro ao tentar deletar a aula.";
      if (error.response && error.response.data) {
          errorMessage = (error.response.data as ApiErrorResponse).message || error.message;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }
      console.error("[ProfessorEditPage] Erro Axios ao deletar aula:", errorMessage, error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  // ... (seus console.log de render e o JSX)
  // Certifique-se que o ModulosList e o ModuloCursoCard (e um possível AulaCard)
  // tenham como props onDeleteModulo e onDeleteAula e as chamem com os IDs corretos.

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        Gerenciamento do Curso: {isLoadingPage ? 'Carregando...' : (cursoTitulo || `ID ${cursoIdFromParams}`)}
      </h1>
      <div className={styles.header}>
        <FormButton 
          onClick={handleOpenAddModuloModal}
          disabled={!cursoIdFromParams || isLoadingPage || !!error}
        >
          + Adicionar Módulo
        </FormButton>
      </div>
      {isLoading && <p className={styles.loadingMessage}>Processando...</p>}
      {error && !isLoadingPage && <p className={styles.errorMessage}>Erro: {error}</p>}

      {isLoadingPage && <p className={styles.loadingMessage}>Carregando dados do curso...</p>}
      {!isLoadingPage && !error && modulos.length === 0 && (
        <p>Nenhum módulo encontrado para este curso. Comece adicionando um!</p>
      )}
      <ModulosList
        modulos={modulos}
        onEditModulo={handleOpenEditModal}
        onAddAula={handleOpenAddAulaModal}
        onEditAula={handleOpenEditAulaModal}
        // Você precisará adicionar props para deleção aqui se os botões estiverem nos cards
        // onDeleteModulo={handleDeleteModulo} 
        // onDeleteAula={handleDeleteAula}
      />
      {isModuloModalOpen && (
        <EditModuloModal
          isOpen={isModuloModalOpen}
          onClose={handleCloseModuloModal}
          modulo={editingModulo}
          onSave={handleSaveModulo}
          nextOrdem={nextModuloOrdem}
          onDelete={handleDeleteModulo} // Passa a função de delete para o modal
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
          onDelete={(aulaId) => handleDeleteAula(aulaId, currentModuloIdForAula)} // Passa a função de delete
        />
      )}
    </div>
  );
};
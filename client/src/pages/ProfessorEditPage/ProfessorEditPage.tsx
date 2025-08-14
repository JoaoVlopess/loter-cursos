import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NavBar } from '../../components/NavBar/Navbar';
import apiClient from '../../services/apiClient';
import type { ApiErrorResponse as ApiGenericErrorResponse } from '../../services/apiClient'; // Renomeado para evitar conflito
import styles from './ProfessorEditPage.module.css';
import type { Modulo } from '../../types/Curso/modulo';
import type { Aula } from '../../types/Curso/aula';
import { FormButton } from '../../components/FormButton/FormButton';
import { ModulosList } from '../../components/ModulosList/ModulosList';
import { EditModuloModal } from '../../components/EditModuloModal/EditModuloModal';
import { EditAulaModal } from '../../components/EditAulaModal/EditAulaModal';
import type { Curso } from '../../types/Curso/curso';

// ✅ 1. DEFINA OS DOIS POSSÍVEIS FORMATOS DA RESPOSTA DA API
type CursoSuccessResponse = {
    success: true;
    data: Curso;
};

// Se você já tem ApiErrorResponse definido globalmente, pode importá-lo.
// Se não, garanta que ele tenha a propriedade 'success' para a verificação.
type ApiErrorResponse = {
    success: false;
    message: string;
};

// ✅ 2. CRIE UM TIPO DE UNIÃO PARA A RESPOSTA
type CursoDetailsResponse = CursoSuccessResponse | ApiErrorResponse;


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

    useEffect(() => {
        const fetchCursoDetails = async () => {
            if (!cursoIdFromParams) {
                setError("ID do curso não encontrado.");
                setIsLoadingPage(false);
                return;
            }
            setIsLoadingPage(true);
            setError(null);
            try {
                // ✅ 3. USE O NOVO TIPO DE UNIÃO NA SUA CHAMADA DA API
                const response = await apiClient.get<CursoDetailsResponse>(`/cursos/${cursoIdFromParams}/detalhes`);

                // ✅ 4. USE A VERIFICAÇÃO DE 'success' COMO UM TYPE GUARD
                if (response.data.success) {
                    // Se 'success' é true, o TypeScript sabe que 'response.data' é do tipo 'CursoSuccessResponse'
                    setCursoTitulo(response.data.data.titulo);
                    setModulos(response.data.data.modulos || []);
                } else {
                    // Se 'success' é false, o TypeScript sabe que 'response.data' é do tipo 'ApiErrorResponse'
                    // O casting perigoso 'as ApiErrorResponse' não é mais necessário.
                    throw new Error(response.data.message || "Falha ao buscar detalhes do curso.");
                }
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || "Erro ao buscar os detalhes do curso.";
                setError(errorMessage);
            } finally {
                setIsLoadingPage(false);
            }
        };
        fetchCursoDetails();
    }, [cursoIdFromParams]);

    // Estados e Handlers para Modal de Aula
    const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
    const [editingAula, setEditingAula] = useState<Aula | null>(null);
    const [currentModuloIdForAula, setCurrentModuloIdForAula] = useState<number | null>(null);
    const [nextAulaOrdemInModal, setNextAulaOrdemInModal] = useState<number>(1);

    const handleOpenEditModal = (modulo: Modulo) => { setEditingModulo(modulo); setIsModuloModalOpen(true); };
    const handleCloseModuloModal = () => { setIsModuloModalOpen(false); setEditingModulo(null); };
    const handleOpenAddModuloModal = () => {
        const ordem = modulos.length > 0 ? Math.max(...modulos.map(m => m.ordem)) + 1 : 0;
        setNextModuloOrdem(ordem);
        setEditingModulo(null);
        setIsModuloModalOpen(true);
    };

    const handleOpenAddAulaModal = (idModulo: number) => {
        const modulo = modulos.find(m => m.id_modulo === idModulo);
        const ordem = modulo && modulo.aulas && modulo.aulas.length > 0 ? Math.max(...modulo.aulas.map(a => a.ordem)) + 1 : 0;
        setNextAulaOrdemInModal(ordem);
        setCurrentModuloIdForAula(idModulo);
        setEditingAula(null);
        setIsAulaModalOpen(true);
    };
    const handleOpenEditAulaModal = (aula: Aula, idModulo: number) => { setEditingAula(aula); setCurrentModuloIdForAula(idModulo); setIsAulaModalOpen(true); };
    const handleCloseAulaModal = () => { setIsAulaModalOpen(false); setEditingAula(null); setCurrentModuloIdForAula(null); };

    const handleSaveModulo = async (moduloData: { titulo: string; ordem: number; descricao: string }, forceCreation: boolean = false) => {
        setIsLoading(true); setError(null);
        if (!cursoIdFromParams) { setError("ID do curso é inválido."); setIsLoading(false); return; }

        try {
            if (editingModulo) {
                await apiClient.put(`/modulos/${editingModulo.id_modulo}`, moduloData);
                setModulos(prev => prev.map(m => m.id_modulo === editingModulo.id_modulo ? { ...m, ...moduloData } : m).sort((a, b) => a.ordem - b.ordem));
                handleCloseModuloModal();
            } else {
                const requestBody = { ...moduloData, force: forceCreation };
                const response = await apiClient.post<{ id_modulo: number }>(`/cursos/${cursoIdFromParams}/modulos`, requestBody);
                
                const novoModulo: Modulo = { ...moduloData, id_modulo: response.data.id_modulo, id_curso: parseInt(cursoIdFromParams), aulas: [] };
                setModulos(prev => [...prev, novoModulo].sort((a, b) => a.ordem - b.ordem));
                handleCloseModuloModal();
            }
        } catch (error: any) {
            const errorData = error.response?.data;
            if (error.response?.status === 409 && errorData?.code === 'CONFIRMATION_REQUIRED') {
                if (window.confirm(errorData.warning.message)) {
                    await handleSaveModulo(moduloData, true);
                }
            } else {
                const errorMessage = errorData?.message || error.message || "Erro ao salvar módulo.";
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveAula = async (aulaData: Omit<Aula, 'id_aula' | 'id_modulo'>, aulaIdToUpdate?: number, forceCreation: boolean = false) => {
        if (currentModuloIdForAula === null) { setError("ID do módulo não encontrado."); return; }
        setIsLoading(true); setError(null);
        
        try {
            if (aulaIdToUpdate) {
                await apiClient.put(`/aulas/${aulaIdToUpdate}`, aulaData);
                setModulos(prev => prev.map(mod => mod.id_modulo === currentModuloIdForAula ? { ...mod, aulas: (mod.aulas || []).map(a => a.id_aula === aulaIdToUpdate ? { ...a, ...aulaData } : a).sort((a, b) => a.ordem - b.ordem) } : mod));
                handleCloseAulaModal();
            } else {
                const requestBody = { ...aulaData, force: forceCreation };
                const response = await apiClient.post<{ id_aula: number }>(`/modulos/${currentModuloIdForAula}/aulas`, requestBody);

                setModulos(prev => prev.map(mod => mod.id_modulo === currentModuloIdForAula ? { ...mod, aulas: [...(mod.aulas || []), { ...aulaData, id_aula: response.data.id_aula, id_modulo: currentModuloIdForAula }].sort((a, b) => a.ordem - b.ordem) } : mod));
                handleCloseAulaModal();
            }
        } catch (error: any) {
            const errorData = error.response?.data;
            if (error.response?.status === 409 && errorData?.code === 'CONFIRMATION_REQUIRED') {
                if (window.confirm(errorData.warning.message)) {
                    await handleSaveAula(aulaData, undefined, true);
                }
            } else {
                const errorMessage = errorData?.message || error.message || "Erro ao salvar aula.";
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleDeleteModulo = async (idModuloToDelete: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este módulo e todas as suas aulas?")) return;
        setIsLoading(true); setError(null);
        try {
            await apiClient.delete(`/modulos/${idModuloToDelete}`);
            setModulos(prev => prev.filter(mod => mod.id_modulo !== idModuloToDelete));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Erro ao deletar módulo.";
            setError(errorMessage);
            alert(`Erro: ${errorMessage}`);
        } finally { setIsLoading(false); }
    };

    const handleDeleteAula = async (idAulaToDelete: number, idModuloDaAula: number) => {
        if (!window.confirm("Tem certeza que deseja excluir esta aula?")) return;
        setIsLoading(true); setError(null);
        try {
            await apiClient.delete(`/aulas/${idAulaToDelete}`);
            setModulos(prev => prev.map(mod => mod.id_modulo === idModuloDaAula ? { ...mod, aulas: (mod.aulas || []).filter(a => a.id_aula !== idAulaToDelete) } : mod));
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Erro ao deletar aula.";
            setError(errorMessage);
            alert(`Erro: ${errorMessage}`);
        } finally { setIsLoading(false); }
    };

    return (
        <div className={styles.page_container}>
            <NavBar />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>
                    Gerenciamento do Curso: {isLoadingPage ? 'Carregando...' : (cursoTitulo || `ID ${cursoIdFromParams}`)}
                </h1>
                <div className={styles.header}>
                    <FormButton onClick={handleOpenAddModuloModal} disabled={isLoadingPage || !!error}>
                        + Adicionar Módulo
                    </FormButton>
                </div>
                {isLoading && <p className={styles.loadingMessage}>Processando...</p>}
                {error && !isLoadingPage && <p className={styles.errorMessage}>Erro: {error}</p>}

                {isLoadingPage && <p className={styles.loadingMessage}>Carregando dados do curso...</p>}
                {!isLoadingPage && !error && modulos.length === 0 && <p>Nenhum módulo encontrado.</p>}
                
                <ModulosList
                    modulos={modulos}
                    onEditModulo={handleOpenEditModal}
                    onAddAula={handleOpenAddAulaModal}
                    onEditAula={handleOpenEditAulaModal}
                    onDeleteModulo={handleDeleteModulo} 
                    onDeleteAula={handleDeleteAula}
                />

                {isModuloModalOpen && (
                    <EditModuloModal
                        isOpen={isModuloModalOpen}
                        onClose={handleCloseModuloModal}
                        modulo={editingModulo}
                        onSave={(data) => handleSaveModulo(data)}
                        nextOrdem={nextModuloOrdem}
                        onDelete={handleDeleteModulo}
                    />
                )}
                {isAulaModalOpen && currentModuloIdForAula !== null && (
                    <EditAulaModal
                        isOpen={isAulaModalOpen}
                        onClose={handleCloseAulaModal}
                        onSave={(data, id) => handleSaveAula(data, id)}
                        aula={editingAula}
                        idModulo={currentModuloIdForAula}
                        nextOrdem={nextAulaOrdemInModal}
                        onDelete={(aulaId) => handleDeleteAula(aulaId, currentModuloIdForAula)}
                    />
                )}
            </div>
        </div>
    );
};
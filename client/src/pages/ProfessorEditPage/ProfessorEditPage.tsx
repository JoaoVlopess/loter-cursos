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

interface ApiErrorData {
  message: string;
  success?: boolean;
  // Adicione outros campos que sua API pode retornar em caso de erro
}

export const ProfessorEditPage = () => {
  // Dados de exemplo iniciais
  const initialModulos: Modulo[] = [
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
          duracao: 17,
          descricao: "Uma breve introdução ao conceito de backend."
        },
        {
          id_aula: 2,
          id_modulo: 1,
          titulo: "O que é cliente e servidor?",
          ordem: 2,
          conteudo: "Diferença entre cliente e servidor, como se comunicam e exemplos práticos.",
          duracao: 27,
          descricao: "Explorando a arquitetura cliente-servidor."
        },
        {
          id_aula: 3,
          id_modulo: 1,
          titulo: "Entendendo o protocolo HTTP 1",
          ordem: 3,
          conteudo: "Visão geral do HTTP 1, cabeçalhos, métodos e exemplo s de requisições.",
          duracao: 25,
          descricao: "Detalhes sobre o funcionamento do HTTP."
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
          duracao: 12,
          descricao: "Visão geral do Node.js."
        },
        {
          id_aula: 5,
          id_modulo: 2,
          titulo: "Configurando o ambiente",
          ordem: 2,
          conteudo: "Como instalar o Node.js, npm e configurar o VSCode.",
          duracao: 19,
          descricao: "Passos para preparar seu ambiente de desenvolvimento Node.js."
        }
      ]
    }
  ];

  const { cursoId: cursoIdFromParams } = useParams<{ cursoId: string }>(); // Obter cursoId da URL
  const [modulos, setModulos] = useState<Modulo[]>(initialModulos);
  const [isModuloModalOpen, setIsModuloModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [nextModuloOrdem, setNextModuloOrdem] = useState<number>(1);

  // Estados para API
  const [isLoading, setIsLoading] = useState(false); // Para operações de save
  const [error, setError] = useState<string | null>(null);
  const API_URL_BASE = 'http://localhost:3000'; // Mova para uma constante ou config

  // TODO: No futuro, buscar os módulos e aulas da API com base no cursoIdFromParams
  // useEffect(() => {
  //   // fetchModulosEaulas(cursoIdFromParams);
  // }, [cursoIdFromParams]);

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
        const response = await axios.post<{ success: boolean, data: Modulo, message: string }>(
          `${API_URL_BASE}/cursos/${cursoIdFromParams}/modulos`,
          moduloData,
          { headers }
        );
        if (response.data.success && response.data.data) {
          setModulos(prevModulos => [...prevModulos, response.data.data].sort((a, b) => a.ordem - b.ordem));
        } else {
          throw new Error(response.data.message || "Falha ao criar módulo.");
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
        const response = await axios.post<{ success: boolean, data: Aula, message: string }>(
          `${API_URL_BASE}/modulos/${currentModuloIdForAula}/aulas`,
          aulaData,
          { headers }
        );
        if (response.data.success && response.data.data) {
          setModulos(prevModulos =>
            prevModulos.map(mod => {
              if (mod.id_modulo === currentModuloIdForAula) {
                const newAulasArray = [...(mod.aulas || []), response.data.data].sort((a, b) => a.ordem - b.ordem);
                return { ...mod, aulas: newAulasArray };
              }
              return mod;
            })
          );
        } else {
          throw new Error(response.data.message || "Falha ao criar aula.");
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
      <h1 className={styles.pageTitle}>Gerenciamento do Curso (ID: {cursoIdFromParams || 'Carregando...'})</h1>
      <div className={styles.header}>
        <FormButton onClick={handleOpenAddModuloModal}>
          + Adicionar Módulo
        </FormButton>
      </div>
      {isLoading && <p className={styles.loadingMessage}>Salvando...</p>}
      {error && <p className={styles.errorMessage}>Erro: {error}</p>}
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

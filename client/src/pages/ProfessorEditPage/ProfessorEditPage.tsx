import { useEffect, useState } from 'react';
import styles from '../ProfessorEditPage/ProfessorEditPage.module.css';
import type { Modulo } from '../../types/Curso/modulo';
import type { Aula } from '../../types/Curso/aula'; // Importar Aula
import { FormButton } from '../../components/FormButton/FormButton';
import { ModulosList } from '../../components/ModulosList/ModulosList';
import { EditModuloModal } from '../../components/EditModuloModal/EditModuloModal';
import { EditAulaModal } from '../../components/EditAulaModal/EditAulaModal'; // Importar o modal de aula


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

  const [modulos, setModulos] = useState<Modulo[]>(initialModulos);
  const [isModuloModalOpen, setIsModuloModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [nextModuloOrdem, setNextModuloOrdem] = useState<number>(1);


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

  const handleSaveModulo = (updatedData: { titulo: string; ordem: number; descricao: string }) => {
    if (editingModulo) { // Modo Edição
      setModulos(prevModulos =>
        prevModulos.map(mod =>
          mod.id_modulo === editingModulo.id_modulo
            ? { ...mod, ...updatedData }
            : mod
        ).sort((a, b) => a.ordem - b.ordem) // Reordena após edição
      );
    } else { // Modo Adição
      const newModulo: Modulo = {
        id_modulo: Date.now(), // ID temporário. Em produção, viria do backend.
        id_curso: initialModulos.length > 0 ? initialModulos[0].id_curso : 0, // Usar um id_curso de exemplo ou de contexto
        ...updatedData,
        aulas: [], // Novo módulo começa sem aulas
      };
      setModulos(prevModulos => [...prevModulos, newModulo].sort((a, b) => a.ordem - b.ordem));
    }
    handleCloseModuloModal();
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

  const handleSaveAula = (aulaData: Omit<Aula, 'id_aula' | 'id_modulo'>, aulaIdToUpdate?: number) => {
    if (currentModuloIdForAula === null) return;

    setModulos(prevModulos =>
      prevModulos.map(mod => {
        if (mod.id_modulo === currentModuloIdForAula) {
          let newAulasArray: Aula[];
          if (aulaIdToUpdate) { // Editando aula existente
            newAulasArray = (mod.aulas || []).map(aula =>
              aula.id_aula === aulaIdToUpdate
                ? { ...aula, ...aulaData } // Mantém id_aula e id_modulo originais
                : aula
            );
          } else { // Adicionando nova aula
            const newAula: Aula = {
              ...aulaData,
              id_aula: Date.now(), // Gerar um ID simples para o exemplo.
              id_modulo: currentModuloIdForAula,
            };
            newAulasArray = [...(mod.aulas || []), newAula];
          }
          // Garante que as aulas sejam ordenadas após adição/edição
          newAulasArray.sort((a, b) => a.ordem - b.ordem);
          return { ...mod, aulas: newAulasArray };
        }
        return mod;
      })
    );
    handleCloseAulaModal();
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
      <h1 className={styles.pageTitle}>Gerenciamento Curso X</h1>
      <div className={styles.header}>
        <FormButton onClick={handleOpenAddModuloModal}>
          + Adicionar Módulo
        </FormButton>
      </div>
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

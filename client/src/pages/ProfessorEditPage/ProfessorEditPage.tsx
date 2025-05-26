import React, { useState } from 'react'; // Adicionado useState
import styles from '../ProfessorEditPage/ProfessorEditPage.module.css';
import { Modulo } from '../../types/Curso/modulo';
import { FormButton } from '../../components/FormButton/FormButton';
import { Link } from 'react-router-dom';
import { ModulosList } from '../../components/ModulosList/ModulosList';
import { EditModuloModal } from '../../components/EditModuloModal/EditModuloModal'; // Importar o modal


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

  const [modulos, setModulos] = useState<Modulo[]>(initialModulos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);

  const handleOpenEditModal = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModulo(null);
  };

  const handleSaveModulo = (updatedData: { titulo: string; ordem: number; descricao: string }) => {
    if (!editingModulo) return;

    setModulos(prevModulos =>
      prevModulos.map(mod =>
        mod.id_modulo === editingModulo.id_modulo
          ? { ...mod, ...updatedData }
          : mod
      )
    );
    handleCloseModal();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Gerenciamento Curso X</h1>
      <div className={styles.header}>
        <FormButton>
          {/* Idealmente, este botão também abriria um modal para adicionar novo módulo */}
          <Link to="#"> + Adicionar Módulo</Link>
        </FormButton>
      </div>
      <ModulosList modulos={modulos} onEditModulo={handleOpenEditModal} />

      {editingModulo && (
        <EditModuloModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          modulo={editingModulo}
          onSave={handleSaveModulo}
        />
      )}
    </div>
  );
};
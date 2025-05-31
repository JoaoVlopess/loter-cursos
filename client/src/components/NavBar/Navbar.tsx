import { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';
import { SlArrowDown } from "react-icons/sl";
import type {Usuario} from '../../types/Clientes/usuario';


// Tipos locais para uso nos type guards, refletindo que 'especialidade' e 'cargo'
// vêm diretamente no objeto Usuario após o fetch.
type ProfessorComDetalhes = Usuario & {
  especialidade?: string | null;
};
type AdminComDetalhes = Usuario & {
  cargo?: string | null;
};

export const NavBar = () => {
   const[isDropdownOpen, setIsDropdownOpen] =useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null); //referencia para o menu
    const [currentUser, setCurrentUser] = useState<Usuario | null>(null); // Usa o tipo Usuario
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Recupera o ID do usuário logado (ex: do localStorage)
    const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        return storedUserId ? parseInt(storedUserId, 10) : null;
    });

    // Type guards para verificar o tipo de usuário
    function isProfessor(user: Usuario): user is ProfessorComDetalhes {
        return user.tipo === 'PROFESSOR';
    }
    function isAdmin(user: Usuario): user is AdminComDetalhes {
        return user.tipo === 'ADMIN';
    }
    //funcao de fechar o menu
    useEffect(() => {
       const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
       useEffect(() => {
        if (currentUserId) {
            const fetchUserData = async () => {
                try {
                    const response = await fetch(`/api/usuarios/${currentUserId}`, {
                        // headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Adicionar se necessário
                    });
                    if (!response.ok) {
                        throw new Error(`Falha ao buscar dados do usuário. Status: ${response.status}`);
                    }
                    const result = await response.json();
                    if (result.success && result.data) {
                        setCurrentUser(result.data as Usuario); // Faz o cast para Usuario
                    } else {
                        console.error("Erro ao processar dados do usuário:", result.message);
                        setCurrentUser(null);
                    }
                } catch (error) {
                    console.error("Erro na requisição de dados do usuário:", error);
                    setCurrentUser(null);
                }
            };
            fetchUserData();
        } else {
            setCurrentUser(null); // Limpa o usuário se não houver ID
        }
    }, [currentUserId]);

    const handleLogout = () => {
    console.log("Usuário saiu");
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userId');
            localStorage.removeItem('token'); // Limpa também o token, se houver
        }
        setCurrentUserId(null); // Limpa o ID do usuário
        setCurrentUser(null);   // Limpa os dados do usuário
        setIsDropdownOpen(false);
        // Opcional: redirecionar para a página de login
        // window.location.href = '/login'
     };

    const getInitials = (name: string | undefined): string => {
        if (!name) return '';
        const names = name.trim().split(' ').filter(n => n);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0].substring(0, Math.min(2, names[0].length)).toUpperCase();
        return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
    };

    const handleOpenProfileModal = () => {
        if (currentUser) {
            setIsProfileModalOpen(true);
            setIsDropdownOpen(false); // Fecha o dropdown ao abrir o modal
        }
    };

    const formatDateForInput = (dateValue: Date | string | undefined | null): string => {
        if (!dateValue) return '';
        if (dateValue instanceof Date) {
            return dateValue.toISOString().split('T')[0];
        }
        // Garante que dateValue seja tratado como string para o split
        return String(dateValue).split('T')[0];
    };

    const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!currentUser || !currentUserId) return;

        const formData = new FormData(event.currentTarget);
        
        // Monta o payload para a API, respeitando o tipo Usuario e campos condicionais
        const payload: Partial<Usuario & { especialidade?: string | null, cargo?: string | null }> = {
            nome: formData.get('nome') as string,
            cpf: (formData.get('cpf') as string) || null, // CPF pode ser nulo
            data_nascimento: (formData.get('data_nascimento') as string) || null, // Data pode ser nula
            ativo: currentUser.ativo, // Mantém o status 'ativo' do usuário
        };

        if (isProfessor(currentUser)) {
            payload.especialidade = (formData.get('especialidade') as string) || null;
        }
        if (isAdmin(currentUser)) {
            payload.cargo = (formData.get('cargo') as string) || null;
        }

        try {
            const response = await fetch(`/api/usuarios/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Adicionar se necessário
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Atualiza o estado local com os dados enviados (otimista, pois o backend não retorna o objeto atualizado)
                setCurrentUser(prevUser => ({
                    ...(prevUser as Usuario), // Mantém os campos não alterados
                    ...payload // Sobrescreve com os dados atualizados
                }));
                setIsProfileModalOpen(false);
                alert('Perfil atualizado com sucesso!');
            } else {
                alert(`Erro ao atualizar perfil: ${result.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert('Ocorreu um erro ao tentar atualizar o perfil.');
        }
    };

return (
    <div className={styles.navbar_area}>
      {/* Logo */}
      <img src="/img/Loter_Logo_Aba.png" alt="Logo Loter" />

      {/* Botão de perfil */}
      <div className={styles.profile_area} ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={styles.profile_button} aria-expanded={isDropdownOpen} aria-haspopup="true">
          <div className={styles.avatar}>
            {currentUser ? getInitials(currentUser.nome) : (currentUserId ? '...' : '')}
          </div>
          <span className={styles.username}>
            {currentUser ? currentUser.nome : (currentUserId ? 'Carregando...' : 'Visitante')}
          </span>
          <SlArrowDown /> {/*Seta para o Dropdown*/}
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className={styles.dropdown}>
            {currentUser && ( // Only show "Meu Perfil" if user is logged in and data loaded
                <button onClick={handleOpenProfileModal} className={styles.dropdown_item}>
                    Meu Perfil
                </button>
            )}
            <a href="/certificados" className={styles.dropdown_item}>Meus Certificados</a>
            {currentUser ? (
                <button onClick={handleLogout} className={styles.dropdown_item}>Sair</button>
            ) : (
                <a href="/login" className={styles.dropdown_item}>Login</a> // Example login link
            )}
          </div>
        )}
      </div>

      {/* Modal de Perfil */}
      {isProfileModalOpen && currentUser && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <h2>Meu Perfil</h2>
            <form onSubmit={handleProfileUpdate}>
              <div>
                <label htmlFor="profile_nome">Nome:</label>
                <input type="text" id="profile_nome" name="nome" defaultValue={currentUser.nome} required />
              </div>
              <div>
                <label htmlFor="profile_email">Email:</label>
                <input type="email" id="profile_email" name="email" value={currentUser.email} readOnly 
                       title="O email não pode ser alterado através desta interface."/>
              </div>
              <div>
                <label htmlFor="profile_cpf">CPF:</label>
                <input type="text" id="profile_cpf" name="cpf" defaultValue={currentUser.cpf || ''} required />
              </div>
              <div>
                <label htmlFor="profile_data_nascimento">Data de Nascimento:</label>
                <input type="date" id="profile_data_nascimento" name="data_nascimento" defaultValue={formatDateForInput(currentUser.data_nascimento)} required />
              </div>

              {currentUser && isProfessor(currentUser) && (
                <div>
                  <label htmlFor="profile_especialidade">Especialidade:</label>
                  <input type="text" id="profile_especialidade" name="especialidade" defaultValue={currentUser.especialidade || ''} />
                </div>
              )}
              {currentUser && isAdmin(currentUser) && (
                <div>
                  <label htmlFor="profile_cargo">Cargo:</label>
                  <input type="text" id="profile_cargo" name="cargo" defaultValue={currentUser.cargo || ''} />
                </div>
              )}
              
              <div className={styles.modal_actions}>
                <button type="submit" className={`${styles.button} ${styles.button_primary}`}>Salvar Alterações</button>
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className={`${styles.button} ${styles.button_secondary}`}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';
import { SlArrowDown } from "react-icons/sl";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importa do AuthContext
// ApiClient e ApiErrorResponse não são mais necessários aqui se handleProfileUpdate for removido
// import apiClient from '../../services/apiClient';
// import type { ApiErrorResponse } from '../../services/apiClient';
// AuthUser também não é mais necessário aqui se o modal for removido e user do useAuth for suficiente
// import type { AuthUser } from '../../context/AuthContext';
//teste

export const NavBar: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    // Removemos loginContext se não for mais usado após remover handleProfileUpdate
    const { isAuthenticated, user, logoutContext, isLoading: authIsLoading } = useAuth();

    // Estados e funções do Modal de Perfil são removidos
    // const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    // const handleOpenProfileModal = () => { ... };
    // const handleProfileUpdate = async (...) => { ... };
    // const formatDateForInput = (...) => { ... };
    // Os type guards isProfessor e isAdmin também não são mais necessários aqui

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

    const handleLogoClick = () => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }
        switch (user.tipo) {
            case 'ALUNO':
                navigate('/home');
                break;
            case 'PROFESSOR':
                navigate('/professor');
                break;
            case 'ADMIN':
                navigate('/admin');
                break;
            default:
                navigate('/');
                break;
        }
    };

        const handleLogout = () => {
        logoutContext(); // Limpa o token do context/localStorage
        setIsDropdownOpen(false);
        navigate('/login'); // Usa o React Router para mudar a URL para /login
    };

    const getInitials = (name: string | undefined): string => {
        if (!name) return '';
        const names = name.trim().split(' ').filter(n => n);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0].substring(0, Math.min(2, names[0].length)).toUpperCase();
        return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
    };

    if (authIsLoading) {
        return (
            <div className={styles.navbar_area}>
                <img src="/img/Loter_Logo_Aba.png" alt="Logo Loter" style={{ opacity: 0.5 }} />
                <div className={styles.profile_area}>
                    <div className={styles.avatar_placeholder}>...</div>
                    <span className={styles.username_placeholder}>Carregando...</span>
                </div>
            </div>
        );
    }
    
    const ariaExpandedValue = isDropdownOpen ? "true" : "false";

    return (
        <div className={styles.navbar_area}>
            <img
                src="/img/Loter_Logo_Aba.png"
                alt="Logo Loter"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
            />

            <div className={styles.profile_area} ref={dropdownRef}>
                <button 
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className={styles.profile_button} 
                    aria-expanded={ariaExpandedValue}
                    aria-haspopup="true"
                >
                    <div className={styles.avatar}>
                        {isAuthenticated && user ? getInitials(user.nome) : '?'}
                    </div>
                    <span className={styles.username}>
                        {isAuthenticated && user ? user.nome : 'Entrar'}
                    </span>
                    {isAuthenticated && user && <SlArrowDown className={styles.arrow} />}
                </button>

                {isDropdownOpen && (
                    <div className={styles.dropdown}>
                        {isAuthenticated && user ? (
                            // Agora apenas o botão Sair se o usuário estiver autenticado
                            <button type="button" onClick={handleLogout} className={styles.dropdown_item}>
                                Sair
                            </button>
                        ) : (
                            <Link to="/login" className={styles.dropdown_item} onClick={() => setIsDropdownOpen(false)}>
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Perfil Removido */}
        </div>
    );
};
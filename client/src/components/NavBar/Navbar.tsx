import { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';
import { SlArrowDown } from "react-icons/sl";
export const NavBar = () => {
    const[isOpen, SetIsOpen] =useState(false) //Controla se o menu esta aberto
    const dropdownRef = useRef<HTMLDivElement>(null); //referencia para o menu

    //funcao de fechar o menu
    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        SetIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside)
    }, []);

    const handleLogout = () => {
    console.log("Usuário saiu");
    // Aqui você pode adicionar lógica real, como limpar localStorage e redirecionar
     };

return (
    <div className={styles.navbar_area}>
      {/* Logo */}
      <img src="/img/Loter_Logo_Aba.png" alt="Logo Loter" />

      {/* Botão de perfil */}
      <div className={styles.profile_area} ref={dropdownRef}>
        <button onClick={() => SetIsOpen(!isOpen)} className={styles.profile_button}>
          <div className={styles.avatar}>JC</div>
          <span className={styles.username}>João</span>
          <SlArrowDown /> {/*Seta para o Dropdown*/}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className={styles.dropdown}>
            <a href="/perfil" className={styles.dropdown_item}>Meu Perfil</a>
            <a href="/certificados" className={styles.dropdown_item}>Meus Certificados</a>
            <button onClick={handleLogout} className={styles.dropdown_item}>Sair</button>
          </div>
        )}
      </div>
    </div>
  );
}
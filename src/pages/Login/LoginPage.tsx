import styles from "./LoginPage.module.css";
import { Link } from 'react-router-dom';


export const LoginPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.login_area}>
                <img src="/public/img/loter_Logo.png" alt="Logo Loter" />
                <h1 className={styles.login_area_titulo}>Bem vindo de volta, dev!</h1>
                <div className={styles.login_area_cadastro}>
                    <p>Chegando pela primeira vez?</p>
                    <a><Link to="/cadastro" >Cadastre-se!</Link></a>
                </div>
                <div className={styles.login_area_input}>
                    <input type="email" placeholder="Seu email" />
                    <input type="password" placeholder="********" />
                </div>
                <button className={styles.signin_button}>Entrar</button>
            </div>
        </div>
    );
}
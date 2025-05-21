import { useEffect, useState } from "react";

export type Usuario = {
  id_usuario: number;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  data_nascimento: Date;
  tipo: "ALUNO" | "PROFESSOR" | "ADMIN";
};

export function useUser(): Usuario | null {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error("Erro ao analisar os dados do usuário:", e);
        setUser(null);
      }
    }
  }, []);

  return user;
}
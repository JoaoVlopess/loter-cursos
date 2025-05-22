// server/config.ts
import dotenv from 'dotenv';
import path from 'path';

// Garante que o .env da pasta 'server' seja carregado
dotenv.config({ path: path.resolve(__dirname, '.env') }); // Use o path.resolve para maior clareza

export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_NAME = process.env.DB_NAME;

// Converta DB_PORT para número aqui!
export const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
// Se DB_PORT não estiver definido no .env, ele será undefined.
// Se estiver definido, será convertido para um número inteiro (base 10).
// Você pode definir um valor padrão se preferir, ex: : 3306;

export const JWT_SECRET = process.env.JWT_SECRET as string; // Força a tipagem

// Verificação para JWT_SECRET (e outras variáveis críticas)
if (!JWT_SECRET) {
  console.error("ERRO FATAL: JWT_SECRET não está definido no arquivo .env!");
  process.exit(1); // Encerra a aplicação se o segredo JWT não estiver definido
}

// Porta do servidor
export const SERVER_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000; // Já estava correto aqui
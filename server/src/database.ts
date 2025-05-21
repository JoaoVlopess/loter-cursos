import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config({ path: './.env' });

console.log("🔍 Variáveis de ambiente carregadas:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT
});



// Configurações padrão para XAMPP
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexões no pool
  queueLimit: 0,
  timezone: 'Z', // Evita problemas com fuso horário
  namedPlaceholders: true // Permite usar :nome nos placeholders
};

// Cria o pool de conexões
const pool = mysql.createPool(dbConfig);

// Função corrigida com tratamento de erros tipado
export async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('✅ Conexão com MySQL estabelecida via pool');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Falha na conexão com MySQL:', {
        code: 'code' in error ? error.code : 'UNKNOWN_ERROR',
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('❌ Erro desconhecido:', error);
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Exporta o pool e funções úteis
export {
  pool,
};

// Teste inicial de conexão (opcional)
testConnection()
  .then(() => console.log('📊 Pronto para consultas ao banco de dados'))
  .catch(() => {
    console.error('🛑 Encerrando aplicação devido a erro de conexão');
    process.exit(1);
  });
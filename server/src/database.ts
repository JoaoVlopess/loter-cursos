import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } from '../config';

console.log("🔍 Variáveis de ambiente carregadas:", {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_PORT
});

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  namedPlaceholders: true
};

const pool = mysql.createPool(dbConfig);

export async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('✅ Conexão com MySQL estabelecida via pool');
    return true;
  } catch (error: unknown) {
    console.error('❌ Falha na conexão com MySQL:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

export { pool };

testConnection()
  .then(() => console.log('📊 Pronto para consultas ao banco de dados'))
  .catch(() => {
    console.error('🛑 Encerrando aplicação devido a erro de conexão');
    process.exit(1);
  });

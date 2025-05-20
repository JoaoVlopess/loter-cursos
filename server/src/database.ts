import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export let db: mysql.Connection;

async function connectDB() {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log('Banco de dados conectado');
}

connectDB();
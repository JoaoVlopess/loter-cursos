import { Router } from 'express';
import { pool } from '../database';
import { ResultSetHeader } from 'mysql2';


const router = Router();

router.post('/cadastro', async (req, res) => {
  const { nome, cpf, email, senha, data_nascimento, tipo, especialidade, cargo } = req.body;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [userResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO usuario (nome, cpf, email, senha, ativo, data_nascimento, tipo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, cpf, email, senha, true, data_nascimento, tipo]
    );

    const userId = userResult.insertId;

    if (tipo === 'ALUNO') {
      await connection.query(`INSERT INTO aluno (id_usuario) VALUES (?)`, [userId]);
    } else if (tipo === 'PROFESSOR') {
      await connection.query(`INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?)`, [userId, especialidade]);
    } else if (tipo === 'ADMIN') {
      await connection.query(`INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?)`, [userId, cargo]);
    }

    await connection.commit();
    res.status(201).json({ sucesso: true, id_usuario: userId });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ erro: 'Erro ao cadastrar', detalhe: error });
  } finally {
    connection.release();
  }
});

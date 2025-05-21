// src/Routes/cadastro.routes.ts
import { Router } from 'express';
import { pool } from '../database';
import { ResultSetHeader } from 'mysql2';

const router = Router();

router.post('/cadastro', async (req, res) => {
    const { nome, cpf, email, senha, data_nascimento, tipo, especialidade, cargo } = req.body;

    try {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO usuario (nome, cpf, email, senha, data_nascimento, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, cpf, email, senha, data_nascimento, tipo]
        );

        const userId = result.insertId;

        if (tipo === 'ALUNO') {
            await pool.query(`INSERT INTO aluno (id_usuario) VALUES (?)`, [userId]);
        } else if (tipo === 'PROFESSOR') {
            await pool.query(`INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?)`, [userId, especialidade]);
        } else if (tipo === 'ADMIN') {
            await pool.query(`INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?)`, [userId, cargo]);
        }

        res.status(201).json({ success: true, id: userId });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;

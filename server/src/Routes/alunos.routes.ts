import { Router } from 'express';
import { db } from '../database';

const router = Router();

router.get('/alunos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM alunos'); // ou o nome real da tabela
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar alunos' });
  }
});

export default router;
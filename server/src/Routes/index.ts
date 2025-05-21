import express from 'express'


const router= express.Router();

// Rota de teste para a raiz
router.get('/', (req, res) => {
  res.send('API Plataforma Cursos rodando!');
});

router.get('/ping', (req, res) => {
    res.json({ pong: true });
});

export default router;
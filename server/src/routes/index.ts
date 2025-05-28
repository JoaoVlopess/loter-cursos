import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes'
import cursoRoutes from './curso.routes';
import { moduloRouter, cursoModuloRouter } from './modulo.routes';
import { aulaRouter, moduloAulaRouter } from './aula.routes';
import avaliacoesRouter from './avaliacao.routes'; // <-- Importe
import { getAvaliacoesByItem } from '../controllers/avaliacao.controller'; // <-- Importe o controller específico

const router = Router();

// rota de boas-vindas
router.get('/', (req: Request, res: Response) => {
  res.send('API Plataforma Cursos rodando!');
});

router.use(authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/cursos', cursoRoutes);
// Rotas aninhadas e diretas para Módulos
router.use('/cursos/:cursoId/modulos', cursoModuloRouter); // Para POST e GET de módulos de um curso
router.use('/modulos', moduloRouter);                     // Para GET /:id, PUT /:id, DELETE /:id de módulos

// Rotas aninhadas e diretas para Aulas
router.use('/modulos/:moduloId/aulas', moduloAulaRouter); // Para POST e GET de aulas de um módulo
router.use('/aulas', aulaRouter);                         // Para GET /:id, PUT /:id, DELETE /:id de aulas

// Rotas para Avaliações
router.use('/avaliacoes', avaliacoesRouter); // Para POST, PUT, DELETE em /avaliacoes/:id

// Rotas específicas para GET de avaliações por item
router.get('/cursos/:cursoId/avaliacoes', getAvaliacoesByItem);
router.get('/modulos/:moduloId/avaliacoes', getAvaliacoesByItem);
router.get('/aulas/:aulaId/avaliacoes', getAvaliacoesByItem);


export default router;

import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import cursoRoutes from './curso.routes';
import { moduloRouter, cursoModuloRouter } from './modulo.routes';
import { aulaRouter, moduloAulaRouter } from './aula.routes';
import avaliacoesRouter from './avaliacao.routes';
import { getAvaliacoesByItem } from '../controllers/avaliacao.controller';
import progressoRoutes from './progresso.routes';
import certificadoRoutes from './certificado.routes';
import professorRoutes from './professor.routes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('API Plataforma Cursos está operacional!');
});

router.use(authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/cursos', cursoRoutes);
router.use('/professores', professorRoutes);
router.use('/cursos/:cursoId/modulos', cursoModuloRouter);
router.use('/modulos', moduloRouter);
router.use('/modulos/:moduloId/aulas', moduloAulaRouter);
router.use('/aulas', aulaRouter);
router.use('/avaliacoes', avaliacoesRouter);
router.get('/cursos/:cursoId/avaliacoes', getAvaliacoesByItem);
router.get('/modulos/:moduloId/avaliacoes', getAvaliacoesByItem);
router.get('/aulas/:aulaId/avaliacoes', getAvaliacoesByItem);
router.use('/progresso', progressoRoutes);
router.use('/certificados', certificadoRoutes);

export default router;
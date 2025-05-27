import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes'
import cursoRoutes from './curso.routes';
import { moduloRouter, cursoModuloRouter } from './modulo.routes';
import { aulaRouter, moduloAulaRouter } from './aula.routes';

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

export default router;

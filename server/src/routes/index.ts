import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes'
import cursoRoutes from './curso.routes';

const router = Router();

// rota de boas-vindas
router.get('/', (req: Request, res: Response) => {
  res.send('API Plataforma Cursos rodando!');
});

router.use(authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/cursos', cursoRoutes);
export default router;

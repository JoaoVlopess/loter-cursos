import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// rota de boas-vindas
router.get('/', (req: Request, res: Response) => {
  res.send('API Plataforma Cursos rodando!');
});

router.use(authRoutes);

export default router;

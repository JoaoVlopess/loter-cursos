import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.get('/', (req, res) => {
  res.send('API Plataforma Cursos rodando!');
});


router.use(authRoutes); // monta /cadastro e /login na raiz

export default router;

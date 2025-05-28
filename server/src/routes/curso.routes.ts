import { Router } from 'express';
import { getAllCursos, createCurso, getCursoDetalhes, updateCurso, deleteCurso } from '../controllers/curso.controller';
import { verificarToken, checkRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getAllCursos); // Listar cursos pode ser público
router.get('/:cursoId/detalhes', getCursoDetalhes); // Detalhes também

// Ações que modificam cursos - idealmente Admin ou Professor dono
router.post('/', verificarToken, checkRole(['ADMIN']), createCurso); // Só Admin cria curso base
router.put('/:cursoId', verificarToken, checkRole(['ADMIN', 'PROFESSOR']), updateCurso); // Admin ou Professor (precisaria verificar se é dono)
router.delete('/:cursoId', verificarToken, checkRole(['ADMIN', 'PROFESSOR']), deleteCurso); // Idem

export default router;
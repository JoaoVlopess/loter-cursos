import { Router } from 'express';
import {
    getAllCursos,
    createCurso,
    getCursoDetalhes,
    updateCurso, // <-- Importe
    deleteCurso,  // <-- Importe
    getCursosByProfessorId
} from '../controllers/curso.controller';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Rotas GET (Públicas)
router.get('/', getAllCursos);
router.get('/:cursoId/detalhes', getCursoDetalhes);
router.get('/por-professor/:idProfessor', getCursosByProfessorId);
// Rotas POST, PUT, DELETE (Protegidas por Token, mas sem Role Check)
router.post('/', verificarToken, createCurso);
router.put('/:cursoId', verificarToken, updateCurso);   // <-- NOVA ROTA PUT
router.delete('/:cursoId', verificarToken, deleteCurso); // <-- NOVA ROTA DELETE


export default router;
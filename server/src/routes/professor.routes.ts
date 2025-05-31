import { Router } from 'express';
import {
    getMeusCursos,
    getCursosByProfessorId
} from '../controllers/professor.controller'; // Verifique o caminho
import { verificarToken } from '../middlewares/authMiddleware';
// import { checkRole } from '../middlewares/authMiddleware'; // Descomente se for usar

const router = Router();

router.get(
    '/meus-cursos',
    verificarToken,
    // checkRole(['PROFESSOR']), // Adicionar quando for refinar a segurança
    getMeusCursos
);

router.get(
    '/:idProfessor/cursos',
    getCursosByProfessorId
);

export default router;
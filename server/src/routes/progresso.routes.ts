import { Router } from 'express';
import {
    iniciarProgressoCurso,
    marcarAulaConcluida,
    getMeuProgressoCurso // Nome atualizado da função
} from '../controllers/progresso.controller';
import { verificarToken, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Aluno inicia um curso
router.post('/cursos/iniciar', verificarToken, checkRole(['ALUNO']), iniciarProgressoCurso);

// Aluno marca uma aula como concluída
router.post('/aulas/concluir', verificarToken, checkRole(['ALUNO']), marcarAulaConcluida);

// Aluno busca seu progresso em um curso específico
// Alterei a rota para ficar mais RESTful e evitar conflito com outras rotas de /cursos/:id
router.get('/cursos/:cursoId/meuprogresso', verificarToken, checkRole(['ALUNO']), getMeuProgressoCurso);


export default router;
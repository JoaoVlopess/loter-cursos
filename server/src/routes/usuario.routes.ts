import { Router } from 'express';
import {
    getAllUsuarios, getUsuarioById, updateUsuario, deleteUsuario,
    createUsuarioByAdmin, getAllAlunos, getAllProfessores
} from '../controllers/usuario.controller';
import { verificarToken, checkRole } from '../middlewares/authMiddleware'; // Importe checkRole

const router = Router();

// Rotas que devem ser SOMENTE para ADMIN
router.get('/', verificarToken, checkRole(['ADMIN']), getAllUsuarios);
router.post('/', verificarToken, checkRole(['ADMIN']), createUsuarioByAdmin);
router.get('/alunos', verificarToken, checkRole(['ADMIN']), getAllAlunos); // Ou ['ADMIN', 'PROFESSOR'] se professor puder ver
router.get('/professores', verificarToken, checkRole(['ADMIN']), getAllProfessores); // Ou ['ADMIN', 'PROFESSOR']

// Rotas que podem ser para ADMIN ou o próprio usuário (lógica no controller)
// Ou você pode querer que só ADMIN altere outros.
router.get('/:id', verificarToken, getUsuarioById); // A lógica de "self" ou "admin" está no controller
router.put('/:id', verificarToken, updateUsuario);   // Idem
router.delete('/:id', verificarToken, checkRole(['ADMIN']), deleteUsuario); // Deletar geralmente é só Admin

export default router;
import { Router } from 'express';
import {
    getAllUsuarios,
    getUsuarioById,
    updateUsuario,
    deleteUsuario,
    createUsuarioByAdmin,
    getAllAlunos,      // <-- Importe
    getAllProfessores  // <-- Importe
} from '../controllers/usuario.controller';
// Importamos apenas 'verificarToken', removemos 'checkRole'
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Agora, aplicamos apenas 'verificarToken'.
// **ATENÇÃO:** Qualquer usuário logado poderá acessar estas rotas!
router.get('/alunos', verificarToken, getAllAlunos);   
router.get('/professores', verificarToken, getAllProfessores); 
router.get('/', verificarToken, getAllUsuarios);
router.post('/', verificarToken, createUsuarioByAdmin);
router.get('/:id', verificarToken, getUsuarioById);
router.put('/:id', verificarToken, updateUsuario);
router.delete('/:id', verificarToken, deleteUsuario);

export default router;
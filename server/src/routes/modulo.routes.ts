import { Router } from 'express';
import {
    createModulo,       // Será usado em /cursos/:cursoId/modulos
    getModulosByCurso,  // Será usado em /cursos/:cursoId/modulos
    getModuloById,      // Será usado em /modulos/:moduloId
    updateModulo,       // Será usado em /modulos/:moduloId
    deleteModulo        // Será usado em /modulos/:moduloId
} from '../controllers/modulo.controller';
import { verificarToken } from '../middlewares/authMiddleware';

// Roteador para rotas que começam com /modulos/:moduloId
const moduloRouter = Router({ mergeParams: true }); // Para acessar :moduloId
moduloRouter.get('/:moduloId', getModuloById);
moduloRouter.put('/:moduloId', verificarToken, updateModulo); // Lembre-se que o ID do módulo vem da rota base
moduloRouter.delete('/:moduloId', verificarToken, deleteModulo);

// Roteador para rotas aninhadas sob /cursos/:cursoId/modulos
const cursoModuloRouter = Router({ mergeParams: true }); // Para acessar :cursoId
cursoModuloRouter.post('/', verificarToken, createModulo);
cursoModuloRouter.get('/', getModulosByCurso); // Listar módulos de um curso

export { moduloRouter, cursoModuloRouter }; // Exportamos os dois
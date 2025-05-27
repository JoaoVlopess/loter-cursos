import { Router } from 'express';
import {
    createAula,         // Usado em /modulos/:moduloId/aulas
    getAulasByModulo,   // Usado em /modulos/:moduloId/aulas
    getAulaById,        // Usado em /aulas/:aulaId
    updateAula,         // Usado em /aulas/:aulaId
    deleteAula          // Usado em /aulas/:aulaId
} from '../controllers/aula.controller';
import { verificarToken } from '../middlewares/authMiddleware';

// Roteador para rotas que começam com /aulas/:aulaId
const aulaRouter = Router(); // mergeParams não é estritamente necessário aqui se não herda params

// Para GET, PUT, DELETE em uma aula específica pelo seu ID
aulaRouter.get('/:aulaId', getAulaById);        // <-- MUDANÇA AQUI
aulaRouter.put('/:aulaId', verificarToken, updateAula);    // <-- MUDANÇA AQUI
aulaRouter.delete('/:aulaId', verificarToken, deleteAula); // <-- MUDANÇA AQUI

// Roteador para rotas aninhadas sob /modulos/:moduloId/aulas
const moduloAulaRouter = Router({ mergeParams: true }); // Para acessar :moduloId
moduloAulaRouter.post('/', verificarToken, createAula); // Para criar aula EM um módulo
moduloAulaRouter.get('/', getAulasByModulo);           // Para listar aulas DE um módulo

export { aulaRouter, moduloAulaRouter }; // Exportamos os dois
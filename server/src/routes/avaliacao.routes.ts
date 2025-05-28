import { Router } from 'express';
import {
    createAvaliacao,
    getAvaliacoesByItem, // Usaremos rotas separadas para buscar por item
    getAvaliacaoById,
    updateAvaliacao,
    deleteAvaliacao
} from '../controllers/avaliacao.controller';
import { verificarToken, checkRole } from '../middlewares/authMiddleware';


const router = Router();

// Criar avaliação (Aluno logado)
router.post('/', verificarToken, checkRole(['ALUNO']), createAvaliacao);

// Obter uma avaliação específica pelo seu ID
router.get('/:avaliacaoId', getAvaliacaoById); // Pode ser pública ou precisar de token

// Atualizar uma avaliação (Aluno dono)
router.put('/:avaliacaoId', verificarToken, checkRole(['ALUNO']), updateAvaliacao);

// Deletar uma avaliação (Aluno dono ou Admin)
router.delete('/:avaliacaoId', verificarToken, checkRole(['ALUNO']), deleteAvaliacao);


// Rotas para buscar avaliações por item específico (serão montadas no app.ts)
// Não serão definidas aqui diretamente, mas sim no app.ts para usar os params corretos

export default router;
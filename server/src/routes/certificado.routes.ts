import { Router } from 'express';
import {
    gerarEregistrarCertificado, // Nome atualizado da função
} from '../controllers/certificado.controller';
import { verificarToken, checkRole } from '../middlewares/authMiddleware';

const router = Router();

// Aluno solicita a geração e registro de um certificado
router.post('/gerar', verificarToken, checkRole(['ALUNO']), gerarEregistrarCertificado);

// // Aluno lista seus certificados
// router.get('/meus', verificarToken, checkRole(['ALUNO']), getMeusCertificados);

// // Obter um certificado específico (Aluno dono ou Admin)
// router.get('/:certificadoId', verificarToken, checkRole(['ALUNO', 'ADMIN']), getCertificadoById);

export default router;
import { Request, Response, NextFunction } from 'express';
import professorDAO from '../dao/professorDAO'; // <-- Importa o DAO
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * @route   GET /professores/meus-cursos
 * @desc    Obter todos os cursos vinculados ao professor logado
 * @access  Professor (Protegido por Token)
 */
export const getMeusCursos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }

    try {
        // O controller agora apenas chama o método do DAO
        const cursos = await professorDAO.findCursosByUsuarioId(id_usuario_logado);
        res.json({ success: true, data: cursos });
    } catch (err: any) {
        console.error("Erro ao buscar cursos do professor:", err);
        next(err);
    }
};

/**
 * @route   GET /professores/:idProfessor/cursos
 * @desc    Obter todos os cursos de um professor específico pelo ID do professor
 * @access  Público (ou Logado)
 */
export const getCursosByProfessorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { idProfessor } = req.params;

    try {
        // 1. Valida se o professor existe usando o DAO
        const professor = await professorDAO.findById(parseInt(idProfessor, 10));
        if (!professor) {
            res.status(404).json({ success: false, message: 'Professor não encontrado.' });
            return;
        }

        // 2. Se existe, busca os cursos usando o DAO
        const cursos = await professorDAO.findCursosByProfessorId(parseInt(idProfessor, 10));
        res.json({ success: true, data: cursos });

    } catch (err: any) {
        console.error("Erro ao buscar cursos pelo ID do professor:", err);
        next(err);
    }
};
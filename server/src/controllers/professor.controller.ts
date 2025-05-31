import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware'; // Para pegar o id_usuario logado

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
        const [rows]: any[] = await pool.execute(
            `SELECT c.*, u_prof.nome as nome_professor_responsavel
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u_prof ON p.id_usuario = u_prof.id_usuario
             WHERE p.id_usuario = ?
             ORDER BY c.titulo ASC`,
            [id_usuario_logado]
        );
        res.json({ success: true, data: rows });
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
        const [professorRows]: any[] = await pool.execute(
            `SELECT id_professor FROM professor WHERE id_professor = ?`,
            [idProfessor]
        );

        if (professorRows.length === 0) {
            res.status(404).json({ success: false, message: 'Professor não encontrado.' });
            return;
        }

        const [cursoRows]: any[] = await pool.execute(
            `SELECT c.*, u.nome as nome_professor_responsavel 
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE c.id_professor = ?
             ORDER BY c.titulo ASC`,
            [idProfessor]
        );
        res.json({ success: true, data: cursoRows });
    } catch (err: any) {
        console.error("Erro ao buscar cursos pelo ID do professor:", err);
        next(err);
    }
};
// server/src/controllers/modulo.controller.ts
import { Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * @route   POST /cursos/:cursoId/modulos
 * @desc    Criar um novo módulo para um curso
 * @access  Logado (SEM CHECKROLE)
 */
export const createModulo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params; // Pega o ID do curso da URL
    const { titulo, descricao, ordem } = req.body;

    // Validação básica
    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios para o módulo.' });
        return;
    }

    try {
        // Opcional: Validar se o cursoId existe.
         const [curso]:any[] = await pool.execute('SELECT * FROM curso WHERE id_curso = ?', [cursoId]);
        if (curso.length === 0) {
             res.status(404).json({ success: false, message: 'Curso não encontrado.' });
             return;
        }
        // TODO: Adicionar lógica para verificar se a 'ordem' já existe ou recalcular.
        // Por agora, estamos confiando que o frontend enviará a ordem correta.

        const [result]: any = await pool.execute(
            `INSERT INTO modulo (id_curso, titulo, descricao, ordem) VALUES (?, ?, ?, ?)`,
            [cursoId, titulo, descricao, ordem]
        );
        res.status(201).json({ success: true, id_modulo: result.insertId, message: "Módulo criado com sucesso." });

    } catch (err: any) {
        console.error("Erro ao criar módulo:", err);
        // Tratar erro de 'ordem' duplicada (UNIQUE constraint)
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Já existe um módulo com esta ordem neste curso.' });
        } else {
            next(err);
        }
    }
};
import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware';

// =============================================================================
// ## Criar um Novo Módulo (Dentro de um Curso)
// =============================================================================
/**
 * @route   POST /cursos/:cursoId/modulos
 * @desc    Criar um novo módulo para um curso
 * @access  Logado (SEM CHECKROLE)
 */
export const createModulo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;
    const { titulo, descricao, ordem } = req.body;

    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios para o módulo.' });
        return;
    }
    // TODO: Adicionar verificação se o usuário logado pode adicionar módulo a este cursoId

    try {
        const [cursoRows]: any[] = await pool.execute('SELECT id_curso FROM curso WHERE id_curso = ?', [cursoId]);
        if (cursoRows.length === 0) {
            res.status(404).json({ success: false, message: 'Curso não encontrado para adicionar o módulo.' });
            return;
        }

        const [result]: any = await pool.execute(
            `INSERT INTO modulo (id_curso, titulo, descricao, ordem) VALUES (?, ?, ?, ?)`,
            [cursoId, titulo, descricao, ordem]
        );
        res.status(201).json({ success: true, id_modulo: result.insertId, message: "Módulo criado com sucesso." });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') { // Por causa da UNIQUE key (id_curso, ordem)
            res.status(409).json({ success: false, message: 'Já existe um módulo com esta ordem neste curso.' });
        } else {
            console.error("Erro ao criar módulo:", err);
            next(err);
        }
    }
};

// =============================================================================
// ## Listar Módulos de um Curso Específico
// =============================================================================
/**
 * @route   GET /cursos/:cursoId/modulos
 * @desc    Listar todos os módulos de um curso específico
 * @access  Público/Logado
 */
export const getModulosByCurso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;
    try {
        const [cursoRows]: any[] = await pool.execute('SELECT id_curso FROM curso WHERE id_curso = ?', [cursoId]);
        if (cursoRows.length === 0) {
            res.status(404).json({ success: false, message: 'Curso não encontrado.' });
            return;
        }

        const [moduloRows]: any[] = await pool.execute(
            `SELECT * FROM modulo WHERE id_curso = ? ORDER BY ordem ASC`,
            [cursoId]
        );
        res.json({ success: true, data: moduloRows });
    } catch (err: any) {
        console.error("Erro ao listar módulos do curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter um Módulo Específico
// =============================================================================
/**
 * @route   GET /modulos/:moduloId
 * @desc    Obter um módulo específico pelo ID
 * @access  Público/Logado
 */
export const getModuloById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    try {
        const [rows]: any[] = await pool.execute(
            `SELECT * FROM modulo WHERE id_modulo = ?`,
            [moduloId]
        );
        if (rows.length === 0) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado.' });
            return;
        }
        res.json({ success: true, data: rows[0] });
    } catch (err: any) {
        console.error("Erro ao buscar módulo por ID:", err);
        next(err);
    }
};


// =============================================================================
// ## Atualizar um Módulo
// =============================================================================
/**
 * @route   PUT /modulos/:moduloId
 * @desc    Atualizar um módulo existente
 * @access  Logado (SEM CHECKROLE)
 */
export const updateModulo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    const { titulo, descricao, ordem } = req.body;

    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios.' });
        return;
    }
    // TODO: Adicionar verificação se o usuário logado pode editar este módulo

    try {
        const [result]: any = await pool.execute(
            `UPDATE modulo SET titulo = ?, descricao = ?, ordem = ? WHERE id_modulo = ?`,
            [titulo, descricao, ordem, moduloId]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado para atualização.' });
            return;
        }
        res.json({ success: true, message: 'Módulo atualizado com sucesso.' });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') { // Por causa da UNIQUE key (id_curso, ordem) - mais complexo aqui
            res.status(409).json({ success: false, message: 'Erro de ordem duplicada. Verifique a ordem dos módulos.' });
        } else {
            console.error("Erro ao atualizar módulo:", err);
            next(err);
        }
    }
};

// =============================================================================
// ## Deletar um Módulo
// =============================================================================
/**
 * @route   DELETE /modulos/:moduloId
 * @desc    Deletar um módulo (e suas aulas, devido ao ON DELETE CASCADE)
 * @access  Logado (SEM CHECKROLE)
 */
export const deleteModulo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    // TODO: Adicionar verificação se o usuário logado pode deletar este módulo

    try {
        const [result]: any = await pool.execute(
            `DELETE FROM modulo WHERE id_modulo = ?`,
            [moduloId]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado para exclusão.' });
            return;
        }
        res.json({ success: true, message: 'Módulo e suas aulas foram excluídos com sucesso.' });
    } catch (err: any) {
        console.error("Erro ao deletar módulo:", err);
        next(err);
    }
};
import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware'; // Para pegar o id_aluno logado

// =============================================================================
// ## Criar Nova Avaliação
// =============================================================================
/**
 * @route   POST /avaliacoes
 * @desc    Aluno cria uma nova avaliação para um curso, módulo ou aula
 * @access  Aluno (Protegido por Token)
 */
export const createAvaliacao = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { id_curso, id_modulo, id_aula, nota, feedback } = req.body;

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }

    // Validação: Pelo menos um item (curso, módulo, aula) deve ser fornecido
    const itensAvaliacao = [id_curso, id_modulo, id_aula].filter(item => item != null).length;
    if (itensAvaliacao !== 1) {
        res.status(400).json({ success: false, message: 'Você deve avaliar exatamente um item: curso, módulo ou aula.' });
        return;
    }

    if (nota === undefined || nota < 0 || nota > 5) {
        res.status(400).json({ success: false, message: 'Nota inválida. Deve ser entre 0 e 5.' });
        return;
    }

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Buscar o id_aluno correspondente ao id_usuario_logado
        const [alunoRows]: any[] = await connection.execute('SELECT id_aluno FROM aluno WHERE id_usuario = ?', [id_usuario_logado]);
        if (alunoRows.length === 0) {
            await connection.rollback();
            connection.release();
            res.status(403).json({ success: false, message: 'Apenas alunos podem fazer avaliações.' });
            return;
        }
        const id_aluno = alunoRows[0].id_aluno;

        // **VERIFICAÇÃO DE AVALIAÇÃO ÚNICA (Lógica da Aplicação)**
        let existingQuery = 'SELECT id_avaliacao FROM avaliacao WHERE id_aluno = ? AND ';
        const queryParams = [id_aluno];

        if (id_curso) {
            existingQuery += 'id_curso = ?';
            queryParams.push(id_curso);
        } else if (id_modulo) {
            existingQuery += 'id_modulo = ?';
            queryParams.push(id_modulo);
        } else { // id_aula
            existingQuery += 'id_aula = ?';
            queryParams.push(id_aula);
        }

        const [existingAvaliacao]: any[] = await connection.execute(existingQuery, queryParams);
        if (existingAvaliacao.length > 0) {
            await connection.rollback();
            connection.release();
            res.status(409).json({ success: false, message: 'Você já avaliou este item.' });
            return;
        }

        // Inserir a nova avaliação
        const [result]: any = await connection.execute(
            `INSERT INTO avaliacao (id_aluno, id_curso, id_modulo, id_aula, nota, feedback, data_avaliacao)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [id_aluno, id_curso || null, id_modulo || null, id_aula || null, nota, feedback]
        );

        await connection.commit();
        connection.release();
        res.status(201).json({ success: true, id_avaliacao: result.insertId, message: 'Avaliação registrada com sucesso.' });

    } catch (err: any) {
        if (connection) {
            try { await connection.rollback(); connection.release(); } catch (rbError) { console.error("Erro no rollback:", rbError); }
        }
        console.error("Erro ao criar avaliação:", err);
        next(err);
    }
};

// =============================================================================
// ## Listar Avaliações (Ex: de um curso específico, ou de um aluno)
// =============================================================================
/**
 * @route   GET /cursos/:cursoId/avaliacoes OU /modulos/:moduloId/avaliacoes OU /aulas/:aulaId/avaliacoes
 * @desc    Listar avaliações de um item específico
 * @access  Público/Logado
 */
export const getAvaliacoesByItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId, moduloId, aulaId } = req.params;
    let query = `
        SELECT a.*, u.nome as nome_aluno
        FROM avaliacao a
        JOIN aluno al ON a.id_aluno = al.id_aluno
        JOIN usuario u ON al.id_usuario = u.id_usuario
        WHERE
    `;
    const params: any[] = [];

    if (cursoId) {
        query += ' a.id_curso = ?';
        params.push(cursoId);
    } else if (moduloId) {
        query += ' a.id_modulo = ?';
        params.push(moduloId);
    } else if (aulaId) {
        query += ' a.id_aula = ?';
        params.push(aulaId);
    } else {
        res.status(400).json({ success: false, message: 'ID do item não fornecido.' });
        return;
    }
    query += ' ORDER BY a.data_avaliacao DESC';

    try {
        const [rows]: any[] = await pool.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (err: any) {
        console.error("Erro ao listar avaliações:", err);
        next(err);
    }
};

/**
 * @route   GET /avaliacoes/:avaliacaoId
 * @desc    Obter uma avaliação específica
 * @access  Público/Logado (ou dono/Admin)
 */
export const getAvaliacaoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { avaliacaoId } = req.params;
    try {
        const [rows]: any[] = await pool.execute('SELECT * FROM avaliacao WHERE id_avaliacao = ?', [avaliacaoId]);
        if (rows.length === 0) {
            res.status(404).json({ success: false, message: 'Avaliação não encontrada.' });
            return;
        }
        res.json({ success: true, data: rows[0] });
    } catch (err: any) {
        console.error("Erro ao buscar avaliação:", err);
        next(err);
    }
};

// =============================================================================
// ## Atualizar uma Avaliação
// =============================================================================
/**
 * @route   PUT /avaliacoes/:avaliacaoId
 * @desc    Aluno atualiza sua própria avaliação
 * @access  Aluno Dono (Protegido por Token)
 */
export const updateAvaliacao = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { avaliacaoId } = req.params;
    const id_usuario_logado = req.usuario?.id_usuario;
    const { nota, feedback } = req.body; // Apenas nota e feedback podem ser atualizados

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }
    if (nota === undefined && feedback === undefined) {
        res.status(400).json({ success: false, message: 'Nenhum dado fornecido para atualização.' });
        return;
    }
    if (nota !== undefined && (nota < 0 || nota > 5)) {
        res.status(400).json({ success: false, message: 'Nota inválida. Deve ser entre 0 e 5.' });
        return;
    }

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [alunoRows]: any[] = await connection.execute('SELECT id_aluno FROM aluno WHERE id_usuario = ?', [id_usuario_logado]);
        if (alunoRows.length === 0) {
            await connection.rollback();
            connection.release();
            res.status(403).json({ success: false, message: 'Apenas alunos podem modificar avaliações.' });
            return;
        }
        const id_aluno = alunoRows[0].id_aluno;

        // Verifica se a avaliação pertence ao aluno logado
        const [avaliacaoRows]: any[] = await connection.execute(
            'SELECT id_avaliacao FROM avaliacao WHERE id_avaliacao = ? AND id_aluno = ?',
            [avaliacaoId, id_aluno]
        );
        if (avaliacaoRows.length === 0) {
            await connection.rollback();
            connection.release();
            res.status(404).json({ success: false, message: 'Avaliação não encontrada ou não pertence a este aluno.' });
            return;
        }

        // Constrói a query de update dinamicamente
        let updateQuery = 'UPDATE avaliacao SET ';
        const updateParams: any[] = [];
        if (nota !== undefined) {
            updateQuery += 'nota = ?, ';
            updateParams.push(nota);
        }
        if (feedback !== undefined) {
            updateQuery += 'feedback = ?, ';
            updateParams.push(feedback);
        }
        updateQuery += 'data_avaliacao = NOW() WHERE id_avaliacao = ? AND id_aluno = ?';
        updateParams.push(avaliacaoId, id_aluno);

        const [result]: any = await connection.execute(updateQuery, updateParams);

        await connection.commit();
        connection.release();

        if (result.affectedRows === 0) {
            // Isso não deveria acontecer se a verificação acima passou, mas por segurança...
             res.status(404).json({ success: false, message: 'Avaliação não encontrada para atualização (pós-verificação).' });
            return;
        }
        res.json({ success: true, message: 'Avaliação atualizada com sucesso.' });

    } catch (err: any) {
        if (connection) {
            try { await connection.rollback(); connection.release(); } catch (rbError) { console.error("Erro no rollback:", rbError); }
        }
        console.error("Erro ao atualizar avaliação:", err);
        next(err);
    }
};

// =============================================================================
// ## Deletar uma Avaliação
// =============================================================================
/**
 * @route   DELETE /avaliacoes/:avaliacaoId
 * @desc    Aluno deleta sua própria avaliação
 * @access  Aluno Dono (ou Admin)
 */
export const deleteAvaliacao = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { avaliacaoId } = req.params;
    const id_usuario_logado = req.usuario?.id_usuario;
    const tipo_usuario_logado = req.usuario?.tipo;

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let query = 'DELETE FROM avaliacao WHERE id_avaliacao = ?';
        const params: any[] = [avaliacaoId];

        // Se não for Admin, só pode deletar a própria avaliação
        if (tipo_usuario_logado !== 'ADMIN') {
            const [alunoRows]: any[] = await connection.execute('SELECT id_aluno FROM aluno WHERE id_usuario = ?', [id_usuario_logado]);
            if (alunoRows.length === 0) {
                await connection.rollback();
                connection.release();
                res.status(403).json({ success: false, message: 'Usuário não é um aluno válido para deletar avaliações.' });
                return;
            }
            const id_aluno = alunoRows[0].id_aluno;
            query += ' AND id_aluno = ?';
            params.push(id_aluno);
        }

        const [result]: any = await connection.execute(query, params);

        await connection.commit();
        connection.release();

        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Avaliação não encontrada ou você não tem permissão para deletá-la.' });
            return;
        }
        res.json({ success: true, message: 'Avaliação excluída com sucesso.' });

    } catch (err: any) {
        if (connection) {
            try { await connection.rollback(); connection.release(); } catch (rbError) { console.error("Erro no rollback:", rbError); }
        }
        console.error("Erro ao deletar avaliação:", err);
        next(err);
    }
};
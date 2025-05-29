import { Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware'; // Para pegar o id_aluno logado
import { RowDataPacket } from 'mysql2';

// =============================================================================
// ## Aluno Inicia um Curso (Registra Progresso)
// =============================================================================
/**
 * @route   POST /progresso/cursos/iniciar
 * @desc    Aluno inicia um curso, criando um registro de progresso
 * @access  Aluno (Protegido por Token)
 */
    export const iniciarProgressoCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const id_usuario_logado = req.usuario?.id_usuario;
        const { id_curso } = req.body;

        if (!id_usuario_logado) {
            res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
            return;
        }
        if (!id_curso) {
            res.status(400).json({ success: false, message: 'ID do curso é obrigatório.' });
            return;
        }

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [alunoRows]: any[] = await connection.execute('SELECT id_aluno FROM aluno WHERE id_usuario = ?', [id_usuario_logado]);
        if (alunoRows.length === 0) {
            await connection.rollback(); connection.release();
            res.status(403).json({ success: false, message: 'Apenas alunos podem iniciar o progresso em cursos.' });
            return;
        }
        const id_aluno = alunoRows[0].id_aluno;

        const [cursoRows]: any[] = await connection.execute('SELECT id_curso FROM curso WHERE id_curso = ?', [id_curso]);
        if (cursoRows.length === 0) {
            await connection.rollback(); connection.release();
            res.status(404).json({ success: false, message: 'Curso não encontrado.' });
            return;
        }

        const [existingProgresso]: any[] = await connection.execute(
            `SELECT id_progresso_curso, status FROM progressoCurso WHERE id_aluno = ? AND id_curso = ?`,
            [id_aluno, id_curso]
        );

        if (existingProgresso.length > 0) {
            await connection.rollback(); connection.release();
            res.status(200).json({
                success: true,
                id_progresso_curso: existingProgresso[0].id_progresso_curso,
                message: 'Você já iniciou este curso.',
                status: existingProgresso[0].status
            });
            return;
        }

        const [result]: any = await connection.execute(
            `INSERT INTO progressoCurso (id_aluno, id_curso, data_inicio, status)
             VALUES (?, ?, CURDATE(), 'EM ANDAMENTO')`,
            [id_aluno, id_curso]
        );

        await connection.commit();
        connection.release();
        res.status(201).json({
            success: true,
            id_progresso_curso: result.insertId,
            status: 'EM ANDAMENTO',
            message: 'Progresso do curso iniciado com sucesso.'
        });

    } catch (err: any) {
        if (connection) { try { await connection.rollback(); connection.release(); } catch (rbError) { console.error("Erro no rollback:", rbError); } }
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Progresso para este curso já existe (conflito de chave única).' });
        } else {
            console.error("Erro ao iniciar progresso do curso:", err);
            next(err);
        }
    }
};

// =============================================================================
// ## Aluno Marca Aula como Concluída (COM ATUALIZAÇÃO DE data_fim)
// =============================================================================
/**
 * @route   POST /progresso/aulas/concluir
 * @desc    Aluno marca uma aula como concluída
 * @access  Aluno (Protegido por Token)
 */
export const marcarAulaConcluida = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { id_curso, id_aula } = req.body;

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }
    if (!id_curso || !id_aula) {
        res.status(400).json({ success: false, message: 'ID do curso e ID da aula são obrigatórios.' });
        return;
    }

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [alunoRows]: any[] = await connection.execute('SELECT id_aluno FROM aluno WHERE id_usuario = ?', [id_usuario_logado]);
        if (alunoRows.length === 0) {
            await connection.rollback(); connection.release();
            res.status(403).json({ success: false, message: 'Apenas alunos podem marcar aulas como concluídas.' });
            return;
        }
        const id_aluno = alunoRows[0].id_aluno;

        const [progCursoRows]: any[] = await connection.execute(
            'SELECT id_progresso_curso FROM progressoCurso WHERE id_aluno = ? AND id_curso = ?',
            [id_aluno, id_curso]
        );
        if (progCursoRows.length === 0) {
            await connection.rollback(); connection.release();
            res.status(404).json({ success: false, message: 'Progresso do curso não encontrado. Por favor, inicie o curso primeiro.' });
            return;
        }
        const id_progresso_curso = progCursoRows[0].id_progresso_curso;

        const [aulaRows]: any[] = await connection.execute('SELECT id_aula FROM aula WHERE id_aula = ?', [id_aula]);
        if (aulaRows.length === 0) {
            await connection.rollback(); connection.release();
            res.status(404).json({ success: false, message: 'Aula não encontrada.' });
            return;
        }
        
        await connection.execute(
            `INSERT INTO progressoAula (id_progresso_curso, id_aula, concluida, data_conclusao)
             VALUES (?, ?, TRUE, NOW())
             ON DUPLICATE KEY UPDATE concluida = TRUE, data_conclusao = NOW()`,
            [id_progresso_curso, id_aula]
        );

        const [totalAulasRows]: any[] = await connection.execute(
            `SELECT COUNT(a.id_aula) as total_aulas
             FROM aula a
             JOIN modulo m ON a.id_modulo = m.id_modulo
             WHERE m.id_curso = ?`,
            [id_curso]
        );
        const total_aulas_curso = totalAulasRows[0].total_aulas;

        const [aulasConcluidasRows]: any[] = await connection.execute(
            `SELECT COUNT(id_aula) as aulas_concluidas
             FROM progressoAula
             WHERE id_progresso_curso = ? AND concluida = TRUE`,
            [id_progresso_curso]
        );
        const aulas_concluidas_aluno = aulasConcluidasRows[0].aulas_concluidas;

        let status_curso_final = 'EM ANDAMENTO';
        if (total_aulas_curso > 0 && aulas_concluidas_aluno >= total_aulas_curso) {
            // Atualiza o status E a data_fim
            await connection.execute(
                `UPDATE progressoCurso SET status = 'CONCLUÍDO', data_fim = CURDATE()
                 WHERE id_progresso_curso = ?`,
                [id_progresso_curso]
            );
            status_curso_final = 'CONCLUÍDO';
        }

        await connection.commit();
        connection.release();
        res.status(200).json({ success: true, message: 'Aula marcada como concluída.', status_curso: status_curso_final });

    } catch (err: any) {
        if (connection) { try { await connection.rollback(); connection.release(); } catch (rbError) { console.error("Erro no rollback:", rbError); } }
        console.error("Erro ao marcar aula como concluída:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter Progresso de um Aluno em um Curso Específico
// =============================================================================
/**
 * @route   GET /progresso/cursos/:cursoId/meu
 * @desc    Obter o progresso do aluno logado em um curso específico, incluindo aulas concluídas
 * @access  Aluno (Protegido por Token)
 */
export const getMeuProgressoCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { cursoId } = req.params;

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }

    if (!cursoId) {
        res.status(400).json({ success: false, message: 'ID do curso não fornecido na URL.' });
        return;
    }

    try {
        // 1. Buscar o id_aluno
        const [alunoRows] = await pool.execute<RowDataPacket[]>('SELECT id_aluno FROM aluno WHERE id_usuario = ?', [id_usuario_logado]);
        if (alunoRows.length === 0) {
            res.status(403).json({ success: false, message: 'Usuário não é um aluno válido.' });
            return;
        }
        const id_aluno = alunoRows[0].id_aluno;

        // 2. Buscar o progresso do curso
        const [progressoCursoRows] = await pool.execute<RowDataPacket[]>(
            `SELECT pc.id_progresso_curso, pc.id_aluno, pc.id_curso, pc.data_inicio, pc.status, pc.data_fim,
                    c.titulo as titulo_curso
             FROM progressoCurso pc
             JOIN curso c ON pc.id_curso = c.id_curso
             WHERE pc.id_aluno = ? AND pc.id_curso = ?`,
            [id_aluno, cursoId]
        );

        if (progressoCursoRows.length === 0) {
            res.json({
                success: true,
                data: {
                    id_curso: parseInt(cursoId, 10),
                    status: 'NÃO INICIADO',
                    aulas_concluidas_ids: []
                }
            });
            return;
        }
        const progressoCurso = progressoCursoRows[0] as any; // Usar 'as any' por simplicidade aqui ou criar um tipo para progressoCurso

        // 3. Buscar os IDs das aulas concluídas
        // Tipamos explicitamente o resultado esperado como um array de objetos com id_aula
        const [rowsAulasConcluidas] = await pool.execute<RowDataPacket[]>(
            `SELECT id_aula FROM progressoAula WHERE id_progresso_curso = ? AND concluida = TRUE`,
            [progressoCurso.id_progresso_curso]
        );

        if (rowsAulasConcluidas && rowsAulasConcluidas.length > 0) {
            // Fazemos um type assertion aqui para garantir que cada 'row' é do tipo esperado
            progressoCurso.aulas_concluidas_ids = rowsAulasConcluidas.map(row => (row as { id_aula: number }).id_aula);
        } else {
            progressoCurso.aulas_concluidas_ids = [];
        }

        res.json({ success: true, data: progressoCurso });

    } catch (err: any) {
        console.error("Erro ao buscar progresso do curso:", err);
        next(err);
    }
};
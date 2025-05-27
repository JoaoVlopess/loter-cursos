import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware'; // Usado para rotas protegidas

// --- Importe seus tipos atualizados ---
// Certifique-se que estes caminhos estão corretos!
import { Curso } from '../types/Curso/curso';
import { Modulo } from '../types/Curso/modulo';
import { Aula } from '../types/Curso/aula';

// =============================================================================
// ## Obter Todos os Cursos
// =============================================================================
/**
 * @route   GET /cursos
 * @desc    Obter todos os cursos (com id_professor e nome_professor)
 * @access  Público
 */
export const getAllCursos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // A query já inclui c.id_professor implicitamente com c.* ou explicitamente
        // Vamos garantir que ele esteja explicitamente selecionado para clareza
        const [rows]: any[] = await pool.execute(
            `SELECT
                c.id_curso,
                c.titulo,
                c.descricao,
                c.carga_horaria,
                c.id_professor, -- <<< GARANTINDO QUE ESTÁ AQUI
                u.nome as nome_professor
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             ORDER BY c.titulo ASC`
        );
        // Se você estiver usando um tipo forte para 'rows', como Curso[],
        // certifique-se de que o tipo Curso tem a propriedade id_professor.
        res.json({ success: true, data: rows });
    } catch (err: any) {
        console.error("Erro ao buscar todos os cursos:", err);
        next(err);
    }
};
// =============================================================================
// ## Obter Detalhes de um Curso
// =============================================================================
/**
 * @route   GET /cursos/:cursoId/detalhes
 * @desc    Obter detalhes de um curso, incluindo módulos e aulas
 * @access  Público
 */
export const getCursoDetalhes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;

    try {
        // 1. Obter informações do curso
        const [cursoRows]: any[] = await pool.execute(
            `SELECT c.*, u.nome as nome_professor
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE c.id_curso = ?`,
            [cursoId]
        );

        if (cursoRows.length === 0) {
            res.status(404).json({ success: false, message: 'Curso não encontrado.' });
            return;
        }
        // **Usa o tipo Curso (que agora tem 'modulos')**
        const curso: Curso = cursoRows[0];

        // 2. Obter os módulos do curso
        const [moduloRows]: any[] = await pool.execute(
            `SELECT * FROM modulo WHERE id_curso = ? ORDER BY ordem ASC`,
            [cursoId]
        );

        // 3. Obter todas as aulas para esses módulos
        let aulaRows: Aula[] = []; // **Tipado como Aula[]**
        if (moduloRows.length > 0) {
            // **Usa o tipo Modulo aqui**
            const moduloIds = moduloRows.map((m: Modulo) => m.id_modulo);
            const [aulas]: any[] = await pool.execute(
                `SELECT * FROM aula WHERE id_modulo IN (?) ORDER BY ordem ASC`,
                [moduloIds]
            );
            aulaRows = aulas;
        }

        // 4. Estruturar a resposta aninhada (usando os tipos)
        curso.modulos = moduloRows.map((modulo: Modulo) => {
            // **Usa o tipo Aula aqui**
            // **Agora 'modulo.aulas' existe no tipo Modulo**
            modulo.aulas = aulaRows.filter((aula: Aula) => aula.id_modulo === modulo.id_modulo);
            return modulo;
        });

        res.json({ success: true, data: curso });

    } catch (err: any) {
        console.error("Erro ao buscar detalhes do curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Criar um Novo Curso
// =============================================================================
/**
 * @route   POST /cursos
 * @desc    Criar um novo curso
 * @access  Logado (Sem checkRole, conforme solicitado)
 */
export const createCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id_professor, titulo, descricao, carga_horaria } = req.body;

    // **AVISO:** Idealmente, esta rota deveria ser protegida por checkRole(['ADMIN']).

    // Validação básica
    if (!id_professor || !titulo) {
        res.status(400).json({ success: false, message: 'ID do professor e título são obrigatórios.' });
        return;
    }

    try {
        // Valida se o id_professor existe
        const [prof]:any[] = await pool.execute('SELECT * FROM professor WHERE id_professor = ?', [id_professor]);
        if (prof.length === 0) {
             res.status(400).json({ success: false, message: 'ID do professor inválido.' });
             return;
        }

        const [result]: any = await pool.execute(
            `INSERT INTO curso (id_professor, titulo, descricao, carga_horaria)
             VALUES (?, ?, ?, ?)`,
            [id_professor, titulo, descricao, carga_horaria]
        );
        res.status(201).json({ success: true, id_curso: result.insertId, message: "Curso criado com sucesso." });
    } catch (err: any) {
        console.error("Erro ao criar curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Atualizar um Curso Existente
// =============================================================================
/**
 * @route   PUT /cursos/:cursoId
 * @desc    Atualizar um curso existente
 * @access  Logado (SEM CHECKROLE - NÃO RECOMENDADO)
 */
export const updateCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;
    const { id_professor, titulo, descricao, carga_horaria } = req.body;

    // **AVISO:** Nenhuma verificação de quem está atualizando!

    // Validação básica
    if (!id_professor || !titulo) {
        res.status(400).json({ success: false, message: 'ID do professor e título são obrigatórios.' });
        return;
    }

    try {
        // Valida se o id_professor existe
        const [prof]:any[] = await pool.execute('SELECT * FROM professor WHERE id_professor = ?', [id_professor]);
        if (prof.length === 0) {
             res.status(400).json({ success: false, message: 'ID do professor inválido.' });
             return;
        }

        // Executa o UPDATE
        const [result]: any = await pool.execute(
            `UPDATE curso SET id_professor = ?, titulo = ?, descricao = ?, carga_horaria = ?
             WHERE id_curso = ?`,
            [id_professor, titulo, descricao, carga_horaria, cursoId]
        );

        // Verifica se alguma linha foi realmente atualizada
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Curso não encontrado para atualização.' });
            return;
        }

        res.json({ success: true, message: 'Curso atualizado com sucesso.' });

    } catch (err: any) {
        console.error("Erro ao atualizar curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Deletar um Curso
// =============================================================================
/**
 * @route   DELETE /cursos/:cursoId
 * @desc    Deletar um curso (Hard Delete)
 * @access  Logado (SEM CHECKROLE - NÃO RECOMENDADO E PERIGOSO!)
 */
export const deleteCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;

    // **AVISO:** Nenhuma verificação de quem está deletando!
    // **CUIDADO:** Isso é um HARD DELETE. Devido ao 'ON DELETE CASCADE' nos módulos,
    // deletar um curso aqui irá deletar TODOS os seus módulos e TODAS as suas aulas.
    // Considere implementar um 'Soft Delete' (marcar como inativo) no futuro.

    try {
        const [result]: any = await pool.execute(
            `DELETE FROM curso WHERE id_curso = ?`,
            [cursoId]
        );

        // Verifica se alguma linha foi deletada
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Curso não encontrado para exclusão.' });
            return;
        }

        res.json({ success: true, message: 'Curso e seus módulos/aulas foram excluídos com sucesso.' });

    } catch (err: any) {
        console.error("Erro ao deletar curso:", err);
        // Pode dar erro se houver outras dependências (ex: progressoCurso)
        // sem ON DELETE CASCADE ou SET NULL.
        next(err);
    }
};

/**
 * @route   GET /professores/:idProfessor/cursos
 * @desc    Obter todos os cursos de um professor específico pelo ID do professor
 * @access  Público (ou Logado, se preferir)
 */
export const getCursosByProfessorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { idProfessor } = req.params;

    try {
        // Verifica se o professor existe (opcional, mas bom para dar um 404 mais preciso)
        const [professorRows]: any[] = await pool.execute(
            `SELECT id_professor FROM professor WHERE id_professor = ?`,
            [idProfessor]
        );

        if (professorRows.length === 0) {
            res.status(404).json({ success: false, message: 'Professor não encontrado.' });
            return;
        }

        // Busca os cursos do professor
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
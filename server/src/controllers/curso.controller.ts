import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2'; // Importar RowDataPacket se não estiver lá
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
        const [rows] = await pool.execute<RowDataPacket[] & Curso[]>(
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

    console.log("==========================================================");
    console.log(`[curso.controller - getCursoDetalhes] Buscando detalhes para curso ID: ${cursoId}`);

    try {
        // 1. Obter informações do curso
        const [cursoRows] = await pool.execute<RowDataPacket[] & Curso[]>(
            `SELECT c.*, u.nome as nome_professor
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE c.id_curso = ?`,
            [cursoId]
        );
    
        if (cursoRows.length === 0) {
            console.log(`[curso.controller - getCursoDetalhes] Curso ID: ${cursoId} não encontrado.`);
            res.status(404).json({ success: false, message: 'Curso não encontrado.' });
            return;
        }
        // **Usa o tipo Curso (que agora tem 'modulos')**
        const curso: Curso = cursoRows[0];
        console.log(`[curso.controller - getCursoDetalhes] Curso encontrado: ${curso.titulo} (ID: ${curso.id_curso})`);

        // 2. Obter os módulos do curso
        const [dbModuloRows] = await pool.execute<RowDataPacket[] & Modulo[]>(
            `SELECT * FROM modulo WHERE id_curso = ? ORDER BY ordem ASC`,
            [cursoId]
        );
        const modulosDoCurso: Modulo[] = dbModuloRows;
        console.log(`[curso.controller - getCursoDetalhes] Módulos encontrados para o curso ${curso.id_curso}: ${modulosDoCurso.length}`);
        modulosDoCurso.forEach(m => console.log(`  -> Módulo DB: ID ${m.id_modulo}, Título '${m.titulo}', Ordem ${m.ordem}`));

        // 3. Obter todas as aulas para esses módulos
        let aulaRows: Aula[] = []; // **Tipado como Aula[]**
        if (modulosDoCurso.length > 0) {
            // **Usa o tipo Modulo aqui**
            const moduloIds = modulosDoCurso.map((m: Modulo) => m.id_modulo);
            console.log(`[curso.controller - getCursoDetalhes] IDs dos módulos para buscar aulas: [${moduloIds.join(', ')}]`);

            console.log(`[curso.controller - getCursoDetalhes] EXECUTANDO QUERY para aulas com moduloIds: ${JSON.stringify(moduloIds)}`);
            const [dbAulaRows] = await pool.execute<RowDataPacket[] & Aula[]>(
                `SELECT * FROM aula WHERE id_modulo IN (?) ORDER BY ordem ASC`,
                [moduloIds]
            );
            aulaRows = dbAulaRows;
            console.log(`[curso.controller - getCursoDetalhes] QUERY para aulas EXECUTADA. Número de aulas retornadas: ${aulaRows.length}`);
            console.log(`[curso.controller - getCursoDetalhes] Total de Aulas encontradas no DB para estes módulos: ${aulaRows.length}`);
            aulaRows.forEach(a => console.log(`  -> Aula DB: ID ${a.id_aula}, Título '${a.titulo}', Ordem ${a.ordem}, MóduloID ${a.id_modulo}`));
        }

        // 4. Estruturar a resposta aninhada (usando os tipos)
        curso.modulos = modulosDoCurso.map((currentModulo: Modulo) => {
            console.log(`[curso.controller - getCursoDetalhes] Processando módulo ID: ${currentModulo.id_modulo} ('${currentModulo.titulo}') para atribuir aulas.`);
            // **Usa o tipo Aula aqui**
            // **Agora 'modulo.aulas' existe no tipo Modulo**
            const aulasDesteModulo = aulaRows.filter((aula: Aula) => {
                const match = aula.id_modulo === currentModulo.id_modulo;
                // if (match) console.log(`    -> Atribuindo Aula ID ${aula.id_aula} ('${aula.titulo}') ao Módulo ID ${currentModulo.id_modulo}`);
                return match;
            });
            console.log(`[curso.controller - getCursoDetalhes] Módulo ID ${currentModulo.id_modulo} ('${currentModulo.titulo}') ficou com ${aulasDesteModulo.length} aulas.`);
            return { ...currentModulo, aulas: aulasDesteModulo.sort((a,b) => a.ordem - b.ordem) }; // Garante a ordem das aulas
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
    const { titulo, descricao, carga_horaria } = req.body;
    let { id_professor } = req.body; // id_professor from body if admin is creating for someone else

    // **SEGURANÇA: Implementar verificação de role e propriedade**
    // Exemplo: Se o usuário logado é PROFESSOR, ele só pode criar cursos para si mesmo.
    // if (req.usuario?.tipo === 'PROFESSOR') {
    //     id_professor = req.usuario.id_professor; // Ou o campo correspondente em req.usuario
    // } else if (req.usuario?.tipo !== 'ADMIN') {
    //     return res.status(403).json({ success: false, message: 'Acesso negado.' });
    // }
    // Validação básica
    if (!id_professor || !titulo) {
        res.status(400).json({ success: false, message: 'ID do professor e título são obrigatórios.' });
        return;
    }

    try {
        // Valida se o id_professor existe
        const [prof] = await pool.execute<RowDataPacket[]>('SELECT * FROM professor WHERE id_professor = ?', [id_professor]);
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

    // Validação básica
    if (!id_professor || !titulo) {
        res.status(400).json({ success: false, message: 'ID do professor e título são obrigatórios.' });
        return;
    }
    // **SEGURANÇA: Implementar verificação de role e propriedade**
    // 1. Verificar se o curso existe e quem é o proprietário
    // 2. Se req.usuario.tipo === 'PROFESSOR', verificar se req.usuario.id_professor === curso.id_professor
    // 3. Se req.usuario.tipo === 'ADMIN', permitir a edição.
    // 4. Caso contrário, retornar 403 Forbidden.
    // Exemplo (simplificado):
    // if (!req.usuario) {
    //    return res.status(401).json({ success: false, message: 'Não autenticado.' });
    // }
    // const [cursoOriginalRows] = await pool.execute<RowDataPacket[] & Pick<Curso, 'id_professor'>[]>(
    //    'SELECT id_professor FROM curso WHERE id_curso = ?', [cursoId]
    // );
    // if (cursoOriginalRows.length === 0) {
    //    return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    // }
    // const cursoOriginal = cursoOriginalRows[0];
    // if (req.usuario.tipo === 'PROFESSOR' && req.usuario.id_professor !== cursoOriginal.id_professor) {
    //    return res.status(403).json({ success: false, message: 'Acesso negado: Você não é o proprietário deste curso.' });
    // } else if (req.usuario.tipo !== 'PROFESSOR' && req.usuario.tipo !== 'ADMIN') { // Se não for PROFESSOR dono nem ADMIN
    //    return res.status(403).json({ success: false, message: 'Acesso negado.' });
    // }
    try {
        // Valida se o novo id_professor (se estiver sendo alterado) existe
        const [prof] = await pool.execute<RowDataPacket[]>('SELECT * FROM professor WHERE id_professor = ?', [id_professor]);
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

    // **SEGURANÇA: Implementar verificação de role e propriedade (similar ao updateCurso)**
    // Exemplo (simplificado):
    // if (!req.usuario) {
    //    return res.status(401).json({ success: false, message: 'Não autenticado.' });
    // }
    // const [cursoOriginalRows] = await pool.execute<RowDataPacket[] & Pick<Curso, 'id_professor'>[]>(
    //    'SELECT id_professor FROM curso WHERE id_curso = ?', [cursoId]
    // );
    // if (cursoOriginalRows.length === 0) {
    //    return res.status(404).json({ success: false, message: 'Curso não encontrado.' });
    // }
    // const cursoOriginal = cursoOriginalRows[0];
    // if (req.usuario.tipo === 'PROFESSOR' && req.usuario.id_professor !== cursoOriginal.id_professor) {
    //    return res.status(403).json({ success: false, message: 'Acesso negado: Você não é o proprietário deste curso.' });
    // } else if (req.usuario.tipo !== 'PROFESSOR' && req.usuario.tipo !== 'ADMIN') {
    //    return res.status(403).json({ success: false, message: 'Acesso negado.' });
    // }

    // **CUIDADO:** Isso é um HARD DELETE. Devido ao 'ON DELETE CASCADE' nos módulos,
    // deletar um curso aqui irá deletar TODOS os seus módulos e TODAS as suas aulas.
    // **RECOMENDAÇÃO:** Implementar 'Soft Delete' (ex: UPDATE curso SET ativo = FALSE WHERE id_curso = ?)
    try {
        const [result] = await pool.execute<any>( // ResultSetHeader para DELETE
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
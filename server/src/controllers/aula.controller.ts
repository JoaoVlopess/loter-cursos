import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware';

// =============================================================================
// ## Criar uma Nova Aula (Dentro de um Módulo)
// =============================================================================
/**
 * @route   POST /modulos/:moduloId/aulas
 * @desc    Criar uma nova aula para um módulo
 * @access  Logado (SEM CHECKROLE)
 */
export const createAula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    const { titulo, descricao, conteudo, duracao, ordem } = req.body;

    console.log(`[aula.controller - createAula] Requisição para criar aula no módulo ID: ${moduloId}`);
    console.log(`[aula.controller - createAula] Dados recebidos (req.body):`, req.body);
    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios para a aula.' });
        return;
    }
    // TODO: Adicionar verificação se o usuário logado pode adicionar aula a este moduloId

    try {
        const [moduloRows]: any[] = await pool.execute('SELECT id_modulo FROM modulo WHERE id_modulo = ?', [moduloId]);
        console.log(`[aula.controller - createAula] Verificando existência do módulo ${moduloId}. Encontrados: ${moduloRows.length}`);
        if (moduloRows.length === 0) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado para adicionar a aula.' });
            return;
        }

        console.log(`[aula.controller - createAula] Módulo ${moduloId} encontrado. Tentando inserir aula com dados:`, { moduloId, titulo, descricao, conteudo, duracao, ordem });
        const [result]: any = await pool.execute(
            `INSERT INTO aula (id_modulo, titulo, descricao, conteudo, duracao, ordem) VALUES (?, ?, ?, ?, ?, ?)`,
            [moduloId, titulo, descricao, conteudo, duracao, ordem]
        );
        console.log(`[aula.controller - createAula] Aula inserida com sucesso. ID da nova aula: ${result.insertId}`);
        res.status(201).json({ success: true, id_aula: result.insertId, message: "Aula criada com sucesso."});
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') { // Por causa da UNIQUE key (id_modulo, ordem)
            res.status(409).json({ success: false, message: 'Já existe uma aula com esta ordem neste módulo.' });
        } else {
            console.error("Erro ao criar aula:", err);
            next(err);
        }
    }
};

// =============================================================================
// ## Listar Aulas de um Módulo Específico
// =============================================================================
/**
 * @route   GET /modulos/:moduloId/aulas
 * @desc    Listar todas as aulas de um módulo específico
 * @access  Público/Logado
 */
export const getAulasByModulo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    try {
        const [moduloRows]: any[] = await pool.execute('SELECT id_modulo FROM modulo WHERE id_modulo = ?', [moduloId]);
        if (moduloRows.length === 0) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado.' });
            return;
        }

        const [aulaRows]: any[] = await pool.execute(
            `SELECT * FROM aula WHERE id_modulo = ? ORDER BY ordem ASC`,
            [moduloId]
        );
        res.json({ success: true, data: aulaRows });
    } catch (err: any) {
        console.error("Erro ao listar aulas do módulo:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter uma Aula Específica
// =============================================================================
/**
 * @route   GET /aulas/:aulaId
 * @desc    Obter uma aula específica pelo ID
 * @access  Público/Logado
 */
export const getAulaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { aulaId } = req.params;
    try {
        const [rows]: any[] = await pool.execute(
            `SELECT * FROM aula WHERE id_aula = ?`,
            [aulaId]
        );
        if (rows.length === 0) {
            res.status(404).json({ success: false, message: 'Aula não encontrada.' });
            return;
        }
        res.json({ success: true, data: rows[0] });
    } catch (err: any) {
        console.error("Erro ao buscar aula por ID:", err);
        next(err);
    }
};

// =============================================================================
// ## Atualizar uma Aula
// =============================================================================
/**
 * @route   PUT /aulas/:aulaId
 * @desc    Atualizar uma aula existente
 * @access  Logado (SEM CHECKROLE)
 */
export const updateAula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { aulaId } = req.params;
    const { titulo, descricao, conteudo, duracao, ordem } = req.body;

    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios.' });
        return;
    }
    // TODO: Adicionar verificação se o usuário logado pode editar esta aula

    try {
        const [result]: any = await pool.execute(
            `UPDATE aula SET titulo = ?, descricao = ?, conteudo = ?, duracao = ?, ordem = ? WHERE id_aula = ?`,
            [titulo, descricao, conteudo, duracao, ordem, aulaId]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Aula não encontrada para atualização.' });
            return;
        }
        res.json({ success: true, message: 'Aula atualizada com sucesso.' });
    } catch (err: any) {
         if (err.code === 'ER_DUP_ENTRY') { // Por causa da UNIQUE key (id_modulo, ordem)
            res.status(409).json({ success: false, message: 'Erro de ordem duplicada. Verifique a ordem das aulas.' });
        } else {
            console.error("Erro ao atualizar aula:", err);
            next(err);
        }
    }
};

// =============================================================================
// ## Deletar uma Aula
// =============================================================================
/**
 * @route   DELETE /aulas/:aulaId
 * @desc    Deletar uma aula
 * @access  Logado (SEM CHECKROLE)
 */
export const deleteAula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { aulaId } = req.params;
    // TODO: Adicionar verificação se o usuário logado pode deletar esta aula

    try {
        const [result]: any = await pool.execute(
            `DELETE FROM aula WHERE id_aula = ?`,
            [aulaId]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Aula não encontrada para exclusão.' });
            return;
        }
        res.json({ success: true, message: 'Aula excluída com sucesso.' });
    } catch (err: any) {
        console.error("Erro ao deletar aula:", err);
        next(err);
    }
};
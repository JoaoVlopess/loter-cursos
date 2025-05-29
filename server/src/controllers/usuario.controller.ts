import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * @route   GET /api/usuarios
 * @desc    Obter todos os usuários
 * @access  Logado (SEM VERIFICAÇÃO DE ADMIN!)
 */
export const getAllUsuarios = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows]: any[] = await pool.execute(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo, p.especialidade, a.cargo
             FROM usuario u
             LEFT JOIN professor p ON u.id_usuario = p.id_usuario AND u.tipo = 'PROFESSOR'
             LEFT JOIN administrador a ON u.id_usuario = a.id_usuario AND u.tipo = 'ADMIN'
             ORDER BY u.nome ASC`
        );
        res.json({ success: true, data: rows });
    } catch (err: any) {
        next(err);
    }
};

/**
 * @route   GET /usuarios/alunos
 * @desc    Obter todos os usuários que são Alunos
 * @access  Logado (SEM VERIFICAÇÃO DE ADMIN!)
 */
export const getAllAlunos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows]: any[] = await pool.execute(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo
             FROM usuario u
             WHERE u.tipo = 'ALUNO' AND u.ativo = TRUE
             ORDER BY u.nome ASC`
        );
        res.json({ success: true, data: rows });
    } catch (err: any) {
        console.error("Erro ao buscar todos os alunos:", err);
        next(err);
    }
};

/**
 * @route   GET /usuarios/professores
 * @desc    Obter todos os usuários que são Professores (com detalhes do professor)
 * @access  Logado (SEM VERIFICAÇÃO DE ADMIN!)
 */
export const getAllProfessores = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows]: any[] = await pool.execute(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo,
                    p.id_professor, p.especialidade
             FROM usuario u
             INNER JOIN professor p ON u.id_usuario = p.id_usuario -- Garante que é um professor
             WHERE u.ativo = TRUE
             ORDER BY u.nome ASC`
        );
        res.json({ success: true, data: rows });
    } catch (err: any) {
        console.error("Erro ao buscar todos os professores:", err);
        next(err);
    }
};



/**
 * @route   GET /api/usuarios/:id
 * @desc    Obter um usuário específico pelo ID
 * @access  Logado (SEM VERIFICAÇÃO DE ADMIN OU PRÓPRIO USUÁRIO!)
 */
export const getUsuarioById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // REMOVIDO: Bloco 'if (tipo_logado !== 'ADMIN' && ...)'
    // **RISCO:** Agora, qualquer usuário logado pode ver qualquer outro.

    try {
        const [rows]: any[] = await pool.execute(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo, u.cpf, p.especialidade, a.cargo
             FROM usuario u
             LEFT JOIN professor p ON u.id_usuario = p.id_usuario AND u.tipo = 'PROFESSOR'
             LEFT JOIN administrador a ON u.id_usuario = a.id_usuario AND u.tipo = 'ADMIN'
             WHERE u.id_usuario = ?`,
            [id]
        );
        if (rows.length === 0) {
            res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            return;
        }
        res.json({ success: true, data: rows[0] });
    } catch (err: any) {
        next(err);
    }
};

/**
 * @route   POST /usuarios
 * @desc    Cria um novo Professor ou Admin
 * @access  Logado (SEM VERIFICAÇÃO DE ADMIN!)
 */
export const createUsuarioByAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { nome, cpf, email, senha, data_nascimento, tipo, especialidade, cargo } = req.body;

    // A validação do TIPO ainda existe, mas não a verificação de QUEM está criando.
    if (tipo !== 'PROFESSOR' && tipo !== 'ADMIN' && tipo !== 'ALUNO') { // Adicionado 'ALUNO'
        res.status(400).json({ success: false, message: 'Tipo de usuário inválido. Apenas Alunos, Professores ou Admins podem ser criados por esta rota.' });
        return;
    }
    // ... (resto das validações de entrada)...

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        // ... (lógica de checagem de existente e inserção) ...
        const [existing]: any[] = await connection.execute( `SELECT id_usuario FROM usuario WHERE email = ? OR (cpf IS NOT NULL AND cpf = ?)`, [email, cpf]);
        if (existing.length > 0) {
            await connection.rollback(); connection.release();
            res.status(409).json({ success: false, message: 'Email ou CPF já cadastrado.' }); return;
        }
        const hashed = await bcrypt.hash(senha, SALT_ROUNDS);
        const [result]: any = await connection.execute( `INSERT INTO usuario (nome, cpf, email, senha, data_nascimento, tipo) VALUES (?, ?, ?, ?, ?, ?)`, [nome, cpf, email, hashed, data_nascimento, tipo]);
        const id_usuario = result.insertId;
        if (tipo === 'PROFESSOR') {
            await connection.execute( `INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?)`, [id_usuario, especialidade]);
        } else if (tipo === 'ADMIN') { // Alterado para else if para tratar ADMIN explicitamente
            await connection.execute( `INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?)`, [id_usuario, cargo]);
        }
        // Se tipo for 'ALUNO', nenhuma inserção adicional em tabelas específicas é necessária aqui.
        await connection.commit(); connection.release();
        res.status(201).json({ success: true, id_usuario: id_usuario, message: `Usuário ${tipo} criado com sucesso.` });
    } catch (err: any) {
        if (connection) { try { await connection.rollback(); connection.release(); } catch (rbErr) { console.error(rbErr); } }
        next(err);
    }
};

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Atualizar um usuário
 * @access  Logado (SEM VERIFICAÇÃO DE ADMIN!)
 */
export const updateUsuario = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { nome, cpf, data_nascimento, ativo, especialidade, cargo } = req.body;

    // REMOVIDO: Bloco 'if (tipo_logado !== 'ADMIN' ...)'
    // **RISCO:** Agora, qualquer usuário logado pode atualizar qualquer outro.

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        // ... (lógica de atualização) ...
         const [updateResult]: any = await connection.execute( `UPDATE usuario SET nome = ?, cpf = ?, data_nascimento = ?, ativo = ? WHERE id_usuario = ?`, [nome, cpf, data_nascimento, ativo, id] );
        if (updateResult.affectedRows === 0) {
            await connection.rollback(); connection.release();
            res.status(404).json({ success: false, message: 'Usuário não encontrado para atualização.' }); return;
        }
        if (especialidade !== undefined) { await connection.execute( `UPDATE professor SET especialidade = ? WHERE id_usuario = ?`, [especialidade, id] ); }
        if (cargo !== undefined) { await connection.execute( `UPDATE administrador SET cargo = ? WHERE id_usuario = ?`, [cargo, id] ); }
        await connection.commit(); connection.release();
        res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    } catch (err: any) {
        if (connection) { try { await connection.rollback(); connection.release(); } catch (rbErr) { console.error(rbErr); } }
        next(err);
    }
};

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Desativar um usuário (Soft Delete)
 * @access  Logado (SEM VERIFICAÇÃO DE ADMIN!)
 */
export const deleteUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    // **RISCO:** Agora, qualquer usuário logado pode deletar qualquer outro.
    try {
        const [result]: any = await pool.execute(
            `UPDATE usuario SET ativo = FALSE WHERE id_usuario = ?`,
            [id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            return;
        }
        res.json({ success: true, message: 'Usuário desativado com sucesso.' });
    } catch (err: any) {
        next(err);
    }
};
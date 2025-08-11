import { Request, Response, NextFunction } from 'express';
import { pool } from '../database'; // Importa o pool de conexões
import { AuthRequest } from '../middlewares/authMiddleware';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2'; // Importe para tipagem

const SALT_ROUNDS = 10;

/**
 * @route   GET /usuarios
 */
export const getAllUsuarios = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo, p.id_professor, p.especialidade, a.cargo
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
 */
export const getAllAlunos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo
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
 */
export const getAllProfessores = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, p.id_professor, p.especialidade
             FROM usuario u
             INNER JOIN professor p ON u.id_usuario = p.id_usuario
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
 * @route   GET /usuarios/:id
 */
export const getUsuarioById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo, u.cpf, u.data_nascimento, p.especialidade, a.cargo
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
 * @desc    Admin cria um novo usuário (Aluno, Professor ou Admin).
 */
export const createUsuarioByAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { nome, cpf, email, senha, data_nascimento, tipo, especialidade, cargo } = req.body;

    if (!nome || !email || !senha || !tipo) {
        res.status(400).json({ success: false, message: 'Nome, email, senha e tipo são obrigatórios.' });
        return;
    }
    if (!['ALUNO', 'PROFESSOR', 'ADMIN'].includes(tipo)) {
        res.status(400).json({ success: false, message: 'Tipo de usuário inválido.' });
        return;
    }
    if (tipo === 'PROFESSOR' && !especialidade) {
        res.status(400).json({ success: false, message: 'Especialidade é obrigatória para Professor.' });
        return;
    }
    if (tipo === 'ADMIN' && !cargo) {
        res.status(400).json({ success: false, message: 'Cargo é obrigatório para Admin.' });
        return;
    }

    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [existing]: any[] = await connection.execute(`SELECT id_usuario FROM usuario WHERE email = ?`, [email]);
        if (existing.length > 0) {
            await connection.rollback(); connection.release();
            res.status(409).json({ success: false, message: 'Email já cadastrado.' }); return;
        }
        
        const hashed = await bcrypt.hash(senha, SALT_ROUNDS);
        
        const [result]: any = await connection.execute(
            `INSERT INTO usuario (nome, cpf, email, senha, data_nascimento, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, cpf || null, email, hashed, data_nascimento || null, tipo]
        );
        const id_usuario = result.insertId;

        if (tipo === 'PROFESSOR') {
            await connection.execute(`INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?)`, [id_usuario, especialidade]);
        } else if (tipo === 'ADMIN') {
            await connection.execute(`INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?)`, [id_usuario, cargo]);
        } else if (tipo === 'ALUNO') {
            await connection.execute(`INSERT INTO aluno (id_usuario) VALUES (?)`, [id_usuario]);
        }
        
        await connection.commit();
        
        const [newUserRows]: any[] = await connection.execute(`SELECT * FROM usuario WHERE id_usuario = ?`, [id_usuario]);
        const { senha: _, ...usuarioSemSenha } = newUserRows[0]; // Remove a senha do retorno

        connection.release();
        res.status(201).json({ success: true, data: usuarioSemSenha, message: `Usuário ${tipo} criado com sucesso.` });

    } catch (err: any) {
        if (connection) {
            try { await connection.rollback(); connection.release(); } catch (rbError) { console.error("Erro no rollback:", rbError); }
        }
        next(err);
    }
};

/**
 * @route   PUT /usuarios/:id
 */
export const updateUsuario = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { nome, cpf, data_nascimento, ativo, especialidade, cargo } = req.body;

    if (nome === undefined || ativo === undefined) {
       res.status(400).json({ success: false, message: 'Nome e status ativo são obrigatórios.' });
       return;
    }
    
    let connection: any;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [updateResult]: any = await connection.execute(
            `UPDATE usuario SET nome = ?, cpf = ?, data_nascimento = ?, ativo = ? WHERE id_usuario = ?`,
            [nome, cpf, data_nascimento, ativo, id]
        );
        
        if (updateResult.affectedRows === 0) {
            await connection.rollback(); connection.release();
            res.status(404).json({ success: false, message: 'Usuário não encontrado para atualização.' }); return;
        }

        if (especialidade !== undefined) {
             await connection.execute(`UPDATE professor SET especialidade = ? WHERE id_usuario = ?`, [especialidade, id]);
        }
        if (cargo !== undefined) {
             await connection.execute(`UPDATE administrador SET cargo = ? WHERE id_usuario = ?`, [cargo, id]);
        }

        await connection.commit();
        connection.release();
        res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    } catch (err: any) {
        if (connection) { try { await connection.rollback(); connection.release(); } catch (rbError) { console.error(rbError); } }
        next(err);
    }
};

/**
 * @route    DELETE /usuarios/:id
 */
export const deleteUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        // Soft delete: apenas desativa o usuário
        const [result]: any = await pool.execute(
            `UPDATE usuario SET ativo = FALSE WHERE id_usuario = ?`,
            [id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: 'Usuário não encontrado para desativar.' });
            return;
        }
        res.json({ success: true, message: 'Usuário desativado com sucesso.' });
    } catch (err: any) {
        next(err);
    }
};
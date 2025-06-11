import { pool } from '../database';
import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { Usuario } from '../types/Clientes/usuario';

// Interface para dados de criação (usada por auth.controller)
export interface CreateUserData {
    nome: string;
    cpf?: string | null;
    email: string;
    senha_hash: string;
    data_nascimento?: string | null;
    tipo: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
    especialidade?: string | null;
    cargo?: string | null;
}

// Interface para dados de atualização
export interface UpdateUserData {
    nome: string;
    cpf: string | null;
    data_nascimento: string | null;
    ativo: boolean;
    especialidade?: string | null;
    cargo?: string | null;
}

// Interface para o que a busca completa retorna
export interface UserWithRoleDetails extends Usuario, RowDataPacket {
    id_professor?: number;
    especialidade?: string;
    id_aluno?: number;
    id_admin?: number;
    cargo?: string;
}

class UsuarioDAO {

    /**
     * Busca um usuário pelo email com todos os detalhes de perfil.
     */
    async findByEmail(email: string): Promise<UserWithRoleDetails | null> {
        const [rows] = await pool.execute<UserWithRoleDetails[]>(
            `SELECT u.*, p.id_professor, p.especialidade, a.id_aluno, adm.id_admin, adm.cargo
             FROM usuario u
             LEFT JOIN professor p ON u.id_usuario = p.id_usuario
             LEFT JOIN aluno a ON u.id_usuario = a.id_usuario
             LEFT JOIN administrador adm ON u.id_usuario = adm.id_usuario
             WHERE u.email = ? AND u.ativo = TRUE`,
            [email]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Busca um usuário pelo ID com todos os detalhes de perfil.
     */
    async findById(id: number): Promise<UserWithRoleDetails | null> {
        const [rows] = await pool.execute<UserWithRoleDetails[]>(
            `SELECT u.*, p.especialidade, adm.cargo
             FROM usuario u
             LEFT JOIN professor p ON u.id_usuario = p.id_usuario
             LEFT JOIN administrador adm ON u.id_usuario = adm.id_usuario
             WHERE u.id_usuario = ?`,
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Cria um novo usuário e seu perfil correspondente em uma transação.
     */
    async create(userData: CreateUserData): Promise<number> {
        const connection: PoolConnection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            const { nome, cpf, email, senha_hash, data_nascimento, tipo, especialidade, cargo } = userData;
            const [result]: any = await connection.execute(
                `INSERT INTO usuario (nome, cpf, email, senha, data_nascimento, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
                [nome, cpf, email, senha_hash, data_nascimento, tipo]
            );
            const id_usuario = result.insertId;

            if (tipo === 'ALUNO') {
                await connection.execute(`INSERT INTO aluno (id_usuario) VALUES (?)`, [id_usuario]);
            } else if (tipo === 'PROFESSOR') {
                await connection.execute(`INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?)`, [id_usuario, especialidade]);
            } else if (tipo === 'ADMIN') {
                await connection.execute(`INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?)`, [id_usuario, cargo]);
            }

            await connection.commit();
            return id_usuario;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Busca todos os usuários com detalhes de seus perfis (professor ou admin).
     */
    async findAllWithDetails(): Promise<UserWithRoleDetails[]> {
        const [rows] = await pool.execute<UserWithRoleDetails[]>(
            `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo, p.especialidade, adm.cargo
             FROM usuario u
             LEFT JOIN professor p ON u.id_usuario = p.id_usuario
             LEFT JOIN administrador adm ON u.id_usuario = adm.id_usuario
             ORDER BY u.nome ASC`
        );
        return rows;
    }

    /**
     * Busca todos os usuários ativos de um tipo específico (ALUNO ou PROFESSOR).
     */
    async findActivesByType(tipo: 'ALUNO' | 'PROFESSOR'): Promise<UserWithRoleDetails[]> {
        let query = '';
        if (tipo === 'ALUNO') {
            query = `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo, a.id_aluno
                     FROM usuario u
                     JOIN aluno a ON u.id_usuario = a.id_usuario
                     WHERE u.ativo = TRUE ORDER BY u.nome ASC`;
        } else if (tipo === 'PROFESSOR') {
            query = `SELECT u.id_usuario, u.nome, u.email, u.ativo, u.tipo, p.id_professor, p.especialidade
                     FROM usuario u
                     INNER JOIN professor p ON u.id_usuario = p.id_usuario
                     WHERE u.ativo = TRUE ORDER BY u.nome ASC`;
        }
        if (!query) return [];
        const [rows] = await pool.execute<UserWithRoleDetails[]>(query);
        return rows;
    }

    /**
     * Atualiza os dados de um usuário e seu perfil.
     */
    async update(userId: number, userData: UpdateUserData): Promise<boolean> {
        const connection: PoolConnection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            const { nome, cpf, data_nascimento, ativo, especialidade, cargo } = userData;
            const [updateResult]: any = await connection.execute(
                `UPDATE usuario SET nome = ?, cpf = ?, data_nascimento = ?, ativo = ? WHERE id_usuario = ?`,
                [nome, cpf, data_nascimento, ativo, userId]
            );

            if (especialidade !== undefined) {
                await connection.execute(`INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?) ON DUPLICATE KEY UPDATE especialidade = VALUES(especialidade)`, [userId, especialidade]);
            }
            if (cargo !== undefined) {
                await connection.execute(`INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?) ON DUPLICATE KEY UPDATE cargo = VALUES(cargo)`, [userId, cargo]);
            }
            await connection.commit();
            return updateResult.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Desativa um usuário (Soft Delete).
     */
    async deactivate(userId: number): Promise<boolean> {
        const [result]: any = await pool.execute(
            `UPDATE usuario SET ativo = FALSE WHERE id_usuario = ?`,
            [userId]
        );
        return result.affectedRows > 0;
    }
}

export default new UsuarioDAO();
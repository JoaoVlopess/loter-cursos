import { pool } from '../database';
import { RowDataPacket } from 'mysql2';
import { Curso } from '../types/Curso/curso'; // Ajuste o caminho para seus tipos
import { Professor } from '../types/Clientes/professor'; // Ajuste o caminho

// Interface para o tipo de retorno que inclui o nome do professor
interface CursoComProfessor extends Curso, RowDataPacket {
    nome_professor_responsavel: string;
}

class ProfessorDAO {

    /**
     * Busca um professor pelo seu ID.
     * @param professorId O ID do professor.
     * @returns O objeto do professor ou null se não for encontrado.
     */
    async findById(professorId: number): Promise<Professor | null> {
        const [rows] = await pool.execute<RowDataPacket[] & Professor[]>(
            `SELECT * FROM professor WHERE id_professor = ?`,
            [professorId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Busca todos os cursos associados a um id_usuario de um professor.
     * @param usuarioId O ID do usuário (da tabela usuario).
     * @returns Uma lista de cursos.
     */
    async findCursosByUsuarioId(usuarioId: number): Promise<CursoComProfessor[]> {
        const [rows] = await pool.execute<CursoComProfessor[]>(
            `SELECT c.*, u.nome as nome_professor_responsavel
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE p.id_usuario = ?
             ORDER BY c.titulo ASC`,
            [usuarioId]
        );
        return rows;
    }

    /**
     * Busca todos os cursos associados a um id_professor.
     * @param professorId O ID do professor (da tabela professor).
     * @returns Uma lista de cursos.
     */
    async findCursosByProfessorId(professorId: number): Promise<CursoComProfessor[]> {
        const [rows] = await pool.execute<CursoComProfessor[]>(
            `SELECT c.*, u.nome as nome_professor_responsavel 
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE c.id_professor = ?
             ORDER BY c.titulo ASC`,
            [professorId]
        );
        return rows;
    }
}

// Exporta uma única instância da classe (padrão Singleton)
export default new ProfessorDAO();
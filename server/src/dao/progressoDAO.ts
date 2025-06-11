import { pool } from '../database';
import { RowDataPacket, PoolConnection } from 'mysql2/promise';

// Assumindo que você tem tipos definidos para ProgressoCurso e ProgressoAula
import { ProgressoCurso } from '../types/Curso/progressoCurso'; // Crie estes tipos
import { ProgressoAula } from '../types/Curso/progressoAula';   // Crie estes tipos

interface ProgressoCursoComTitulo extends ProgressoCurso, RowDataPacket {
    titulo_curso: string;
    aulas_concluidas_ids?: number[];
}

class ProgressoDAO {

    /**
     * Encontra ou cria um registro de progresso para um aluno em um curso.
     * @returns O ID do progresso do curso.
     */
    async findOrCreateProgressoCurso(id_aluno: number, id_curso: number): Promise<{ id_progresso_curso: number, status: string, isNew: boolean }> {
        // Primeiro, tenta encontrar
        const [existing] = await pool.execute<RowDataPacket[] & ProgressoCurso[]>(
            `SELECT id_progresso_curso, status FROM progressoCurso WHERE id_aluno = ? AND id_curso = ?`,
            [id_aluno, id_curso]
        );
        if (existing.length > 0) {
            return { id_progresso_curso: existing[0].id_progresso_curso, status: existing[0].status, isNew: false };
        }

        // Se não existir, cria um novo
        const [result]: any = await pool.execute(
            `INSERT INTO progressoCurso (id_aluno, id_curso, data_inicio, status)
             VALUES (?, ?, CURDATE(), 'EM ANDAMENTO')`,
            [id_aluno, id_curso]
        );
        return { id_progresso_curso: result.insertId, status: 'EM ANDAMENTO', isNew: true };
    }

    /**
     * Marca uma aula como concluída e verifica se o curso foi finalizado.
     * Usa uma transação para garantir a consistência dos dados.
     * @returns O status final do curso ('EM ANDAMENTO' ou 'CONCLUÍDO').
     */
    async marcarAulaConcluidaEVerificarProgresso(id_progresso_curso: number, id_curso: number, id_aula: number): Promise<string> {
        const connection: PoolConnection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insere ou atualiza o progresso da aula
            await connection.execute(
                `INSERT INTO progressoAula (id_progresso_curso, id_aula, concluida, data_conclusao)
                 VALUES (?, ?, TRUE, NOW())
                 ON DUPLICATE KEY UPDATE concluida = TRUE, data_conclusao = NOW()`,
                [id_progresso_curso, id_aula]
            );

            // 2. Conta o total de aulas do curso
            const [totalAulasRows] = await connection.execute<RowDataPacket[]>(
                `SELECT COUNT(a.id_aula) as total_aulas FROM aula a JOIN modulo m ON a.id_modulo = m.id_modulo WHERE m.id_curso = ?`,
                [id_curso]
            );
            const total_aulas_curso = totalAulasRows[0].total_aulas;

            // 3. Conta aulas concluídas pelo aluno para este curso
            const [aulasConcluidasRows] = await connection.execute<RowDataPacket[]>(
                `SELECT COUNT(id_aula) as aulas_concluidas FROM progressoAula WHERE id_progresso_curso = ? AND concluida = TRUE`,
                [id_progresso_curso]
            );
            const aulas_concluidas_aluno = aulasConcluidasRows[0].aulas_concluidas;

            // 4. Se todas as aulas foram concluídas, atualiza o status do curso
            let status_curso_final = 'EM ANDAMENTO';
            if (total_aulas_curso > 0 && aulas_concluidas_aluno >= total_aulas_curso) {
                await connection.execute(
                    `UPDATE progressoCurso SET status = 'CONCLUÍDO', data_fim = CURDATE() WHERE id_progresso_curso = ?`,
                    [id_progresso_curso]
                );
                status_curso_final = 'CONCLUÍDO';
            }

            await connection.commit();
            return status_curso_final;

        } catch (error) {
            await connection.rollback();
            console.error("DAO Error: Erro na transação de progresso da aula.", error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Busca o progresso de um aluno em um curso, incluindo a lista de IDs de aulas concluídas.
     * @returns O objeto de progresso do curso com detalhes ou null se não encontrado.
     */
    async getProgressoDetalhado(id_aluno: number, cursoId: number): Promise<ProgressoCursoComTitulo | null> {
        const [progressoCursoRows] = await pool.execute<ProgressoCursoComTitulo[]>(
            `SELECT pc.*, c.titulo as titulo_curso
             FROM progressoCurso pc
             JOIN curso c ON pc.id_curso = c.id_curso
             WHERE pc.id_aluno = ? AND pc.id_curso = ?`,
            [id_aluno, cursoId]
        );

        if (progressoCursoRows.length === 0) {
            return null; // Nenhum progresso iniciado para este curso
        }
        const progressoCurso = progressoCursoRows[0];

        const [rowsAulasConcluidas] = await pool.execute<RowDataPacket[]>(
            `SELECT id_aula FROM progressoAula WHERE id_progresso_curso = ? AND concluida = TRUE`,
            [progressoCurso.id_progresso_curso]
        );
        
        progressoCurso.aulas_concluidas_ids = rowsAulasConcluidas.map(row => (row as { id_aula: number }).id_aula);

        return progressoCurso;
    }
}

// Exporta uma única instância da classe
export default new ProgressoDAO();
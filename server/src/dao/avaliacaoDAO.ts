import { pool } from '../database';
import { RowDataPacket } from 'mysql2';
import { Avaliacao } from '../types/Avaliacao/avaliacao'; // Use seus tipos

// Interface para os dados necessários para criar uma avaliação
interface CreateAvaliacaoData {
    id_aluno: number;
    id_curso?: number | null;
    id_modulo?: number | null;
    id_aula?: number | null;
    nota: number;
    feedback?: string | null;
}

// Interface para os dados para atualizar uma avaliação
type UpdateAvaliacaoData = Pick<CreateAvaliacaoData, 'nota' | 'feedback'>;

// Interface para o que a busca por item retorna
interface AvaliacaoComAluno extends Avaliacao, RowDataPacket {
    nome_aluno: string;
}

class AvaliacaoDAO {

    /**
     * Verifica se uma avaliação já existe para um aluno e um item específico.
     * @returns A avaliação existente ou null.
     */
    async findExisting(id_aluno: number, item: { id_curso?: number, id_modulo?: number, id_aula?: number }): Promise<Avaliacao | null> {
        let query = 'SELECT * FROM avaliacao WHERE id_aluno = ? AND ';
        const params: any[] = [id_aluno];

        if (item.id_curso) {
            query += 'id_curso = ?';
            params.push(item.id_curso);
        } else if (item.id_modulo) {
            query += 'id_modulo = ?';
            params.push(item.id_modulo);
        } else if (item.id_aula) {
            query += 'id_aula = ?';
            params.push(item.id_aula);
        } else {
            return null; // Não há item para verificar
        }

        const [rows] = await pool.execute<RowDataPacket[] & Avaliacao[]>(query, params);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Cria uma nova avaliação no banco de dados.
     * @param avaliacaoData Os dados da nova avaliação.
     * @returns O ID da nova avaliação criada.
     */
    async create(avaliacaoData: CreateAvaliacaoData): Promise<number> {
        const { id_aluno, id_curso, id_modulo, id_aula, nota, feedback } = avaliacaoData;
        const [result]: any = await pool.execute(
            `INSERT INTO avaliacao (id_aluno, id_curso, id_modulo, id_aula, nota, feedback, data_avaliacao)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [id_aluno, id_curso || null, id_modulo || null, id_aula || null, nota, feedback]
        );
        return result.insertId;
    }

    /**
     * Busca todas as avaliações de um item específico (curso, módulo ou aula).
     * @returns Uma lista de avaliações com o nome do aluno.
     */
    async findByItem(item: { cursoId?: number, moduloId?: number, aulaId?: number }): Promise<AvaliacaoComAluno[]> {
        let query = `
            SELECT a.*, u.nome as nome_aluno
            FROM avaliacao a
            JOIN aluno al ON a.id_aluno = al.id_aluno
            JOIN usuario u ON al.id_usuario = u.id_usuario
            WHERE
        `;
        const params: any[] = [];

        if (item.cursoId) { query += ' a.id_curso = ?'; params.push(item.cursoId); }
        else if (item.moduloId) { query += ' a.id_modulo = ?'; params.push(item.moduloId); }
        else if (item.aulaId) { query += ' a.id_aula = ?'; params.push(item.aulaId); }
        else { return []; } // Retorna vazio se nenhum ID for fornecido

        query += ' ORDER BY a.data_avaliacao DESC';
        const [rows] = await pool.execute<AvaliacaoComAluno[]>(query, params);
        return rows;
    }

    /**
     * Busca uma avaliação pelo seu ID.
     * @returns A avaliação ou null se não encontrada.
     */
    async findById(avaliacaoId: number): Promise<Avaliacao | null> {
        const [rows] = await pool.execute<RowDataPacket[] & Avaliacao[]>(
            'SELECT * FROM avaliacao WHERE id_avaliacao = ?',
            [avaliacaoId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Atualiza uma avaliação existente.
     * @returns boolean indicando se a operação foi bem-sucedida.
     */
    async update(avaliacaoId: number, id_aluno: number, avaliacaoData: UpdateAvaliacaoData): Promise<boolean> {
        let updateQuery = 'UPDATE avaliacao SET ';
        const updateParams: any[] = [];
        if (avaliacaoData.nota !== undefined) {
            updateQuery += 'nota = ?, ';
            updateParams.push(avaliacaoData.nota);
        }
        if (avaliacaoData.feedback !== undefined) {
            updateQuery += 'feedback = ?, ';
            updateParams.push(avaliacaoData.feedback);
        }
        updateQuery += 'data_avaliacao = NOW() WHERE id_avaliacao = ? AND id_aluno = ?';
        updateParams.push(avaliacaoId, id_aluno);

        const [result]: any = await pool.execute(updateQuery, updateParams);
        return result.affectedRows > 0;
    }

    /**
     * Deleta uma avaliação.
     * @param avaliacaoId O ID da avaliação a ser deletada.
     * @param id_aluno (Opcional) Se fornecido, só deleta se a avaliação pertencer a este aluno.
     * @returns boolean indicando se a operação foi bem-sucedida.
     */
    async delete(avaliacaoId: number, id_aluno?: number): Promise<boolean> {
        let query = 'DELETE FROM avaliacao WHERE id_avaliacao = ?';
        const params: any[] = [avaliacaoId];

        if (id_aluno) {
            query += ' AND id_aluno = ?';
            params.push(id_aluno);
        }

        const [result]: any = await pool.execute(query, params);
        return result.affectedRows > 0;
    }
}

export default new AvaliacaoDAO();
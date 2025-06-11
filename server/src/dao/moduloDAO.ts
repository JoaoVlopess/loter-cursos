import { pool } from '../database'; // Importa o pool de conexões
import { RowDataPacket } from 'mysql2';
import { Modulo } from '../types/Curso/modulo'; // Use seu tipo Modulo

// Interface para os dados necessários para criar/atualizar um módulo
type ModuloData = Omit<Modulo, 'id_modulo' | 'id_curso' | 'aulas'>;

class ModuloDAO {

    /**
     * Cria um novo módulo para um curso específico.
     * @param cursoId O ID do curso ao qual o módulo pertence.
     * @param moduloData Os dados do novo módulo.
     * @returns O ID do novo módulo criado.
     */
    async create(cursoId: number, moduloData: ModuloData): Promise<number> {
        const { titulo, descricao, ordem } = moduloData;
        const [result]: any = await pool.execute(
            `INSERT INTO modulo (id_curso, titulo, descricao, ordem) VALUES (?, ?, ?, ?)`,
            [cursoId, titulo, descricao, ordem]
        );
        return result.insertId;
    }

    /**
     * Busca todos os módulos de um curso específico, ordenados por 'ordem'.
     * @param cursoId O ID do curso.
     * @returns Uma lista de módulos.
     */
    async findByCursoId(cursoId: number): Promise<Modulo[]> {
        const [rows] = await pool.execute<RowDataPacket[] & Modulo[]>(
            `SELECT * FROM modulo WHERE id_curso = ? ORDER BY ordem ASC`,
            [cursoId]
        );
        return rows;
    }

    /**
     * Busca um módulo pelo seu ID.
     * @param moduloId O ID do módulo a ser buscado.
     * @returns O módulo ou null se não for encontrado.
     */
    async findById(moduloId: number): Promise<Modulo | null> {
        const [rows] = await pool.execute<RowDataPacket[] & Modulo[]>(
            `SELECT * FROM modulo WHERE id_modulo = ?`,
            [moduloId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Atualiza um módulo existente.
     * @param moduloId O ID do módulo a ser atualizado.
     * @param moduloData Os novos dados para o módulo.
     * @returns boolean indicando se a operação foi bem-sucedida.
     */
    async update(moduloId: number, moduloData: ModuloData): Promise<boolean> {
        const { titulo, descricao, ordem } = moduloData;
        const [result]: any = await pool.execute(
            `UPDATE modulo SET titulo = ?, descricao = ?, ordem = ? WHERE id_modulo = ?`,
            [titulo, descricao, ordem, moduloId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Deleta um módulo do banco de dados.
     * @param moduloId O ID do módulo a ser deletado.
     * @returns boolean indicando se a operação foi bem-sucedida.
     */
    async delete(moduloId: number): Promise<boolean> {
        const [result]: any = await pool.execute(
            `DELETE FROM modulo WHERE id_modulo = ?`,
            [moduloId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Busca todos os títulos de módulos de um curso específico.
     * @param cursoId O ID do curso.
     * @returns Uma lista de títulos de módulos.
     */
    async findTitlesByCursoId(cursoId: number): Promise<string[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT titulo FROM modulo WHERE id_curso = ?`,
            [cursoId]
        );
        return rows.map((row: any) => row.titulo);
    }
}

// Exporta uma única instância da classe
export default new ModuloDAO();
import { pool } from '../database'; // Importa o pool de conexões
import { RowDataPacket } from 'mysql2';
import { Aula } from '../types/Curso/aula'; // Use seu tipo Aula

// Interface para os dados necessários para criar/atualizar uma aula
type AulaData = Omit<Aula, 'id_aula'>;

// Classe que agrupa todos os métodos de acesso a dados para 'aula'
class AulaDAO {

    // Método para criar uma nova aula
    async create(moduloId: number, aulaData: Omit<Aula, 'id_aula' | 'id_modulo'>): Promise<number> {
        const { titulo, descricao, conteudo, duracao, ordem } = aulaData;
        const [result]: any = await pool.execute(
            `INSERT INTO aula (id_modulo, titulo, descricao, conteudo, duracao, ordem) VALUES (?, ?, ?, ?, ?, ?)`,
            [moduloId, titulo, descricao, conteudo, duracao, ordem]
        );
        return result.insertId;
    }

    // Método para buscar todas as aulas de um módulo
    async findByModuloId(moduloId: number): Promise<Aula[]> {
        const [rows] = await pool.execute<RowDataPacket[] & Aula[]>(
            `SELECT * FROM aula WHERE id_modulo = ? ORDER BY ordem ASC`,
            [moduloId]
        );
        return rows;
    }

    // Método para buscar uma aula pelo seu ID
    async findById(aulaId: number): Promise<Aula | null> {
        const [rows] = await pool.execute<RowDataPacket[] & Aula[]>(
            `SELECT * FROM aula WHERE id_aula = ?`,
            [aulaId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    // Método para atualizar uma aula existente
    async update(aulaId: number, aulaData: Omit<Aula, 'id_aula' | 'id_modulo'>): Promise<boolean> {
        const { titulo, descricao, conteudo, duracao, ordem } = aulaData;
        const [result]: any = await pool.execute(
            `UPDATE aula SET titulo = ?, descricao = ?, conteudo = ?, duracao = ?, ordem = ? WHERE id_aula = ?`,
            [titulo, descricao, conteudo, duracao, ordem, aulaId]
        );
        return result.affectedRows > 0; // Retorna true se atualizou, false se não encontrou
    }

    // Método para deletar uma aula
    async delete(aulaId: number): Promise<boolean> {
        const [result]: any = await pool.execute(
            `DELETE FROM aula WHERE id_aula = ?`,
            [aulaId]
        );
        return result.affectedRows > 0; // Retorna true se deletou, false se não encontrou
    }

    // Opcional: Um método para verificar se um módulo pai existe, para uso nos controllers
    async checkModuloExists(moduloId: number): Promise<boolean> {
         const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT id_modulo FROM modulo WHERE id_modulo = ?',
            [moduloId]
        );
        return rows.length > 0;
    }

    /**
     * Busca todos os títulos de aulas de um módulo específico.
     * @param moduloId O ID do módulo.
     * @returns Uma lista de títulos de aulas.
     */
    async findTitlesByModuloId(moduloId: number): Promise<string[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT titulo FROM aula WHERE id_modulo = ?`,
            [moduloId]
        );
        return rows.map((row: any) => row.titulo);
    }

    
}

// Exporta uma instância da classe, seguindo o padrão Singleton para o DAO
export default new AulaDAO();
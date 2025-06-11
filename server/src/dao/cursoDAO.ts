import { pool } from '../database';
import { RowDataPacket } from 'mysql2';
import { Curso } from '../types/Curso/curso';
import { Modulo } from '../types/Curso/modulo';
import { Aula } from '../types/Curso/aula';

// Interface para o que a query que busca nome do professor retorna
interface CursoComProfessor extends Curso, RowDataPacket {
    nome_professor: string;
}

// Interface para os dados necessários para criar/atualizar um curso
type CursoData = Omit<Curso, 'id_curso' | 'nome_professor' | 'modulos'>;


class CursoDAO {

    /**
     * Busca um curso pelo seu ID (sem módulos ou aulas, apenas os dados do curso).
     * @param cursoId O ID do curso a ser buscado.
     * @returns O objeto do curso ou null se não for encontrado.
     */
    async findById(cursoId: number): Promise<Curso | null> {
        const [rows] = await pool.execute<RowDataPacket[] & Curso[]>(
            `SELECT * FROM curso WHERE id_curso = ?`,
            [cursoId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Busca todos os cursos com o nome do professor.
     */
    async findAll(): Promise<CursoComProfessor[]> {
        const [rows] = await pool.execute<CursoComProfessor[]>(
            `SELECT c.id_curso, c.titulo, c.descricao, c.carga_horaria, c.id_professor, u.nome as nome_professor
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             ORDER BY c.titulo ASC`
        );
        return rows;
    }

    /**
     * Busca os detalhes completos de um curso, incluindo módulos e aulas aninhados.
     * @param cursoId O ID do curso a ser buscado.
     * @returns O objeto completo do curso ou null se não encontrado.
     */
    async findDetailsById(cursoId: number): Promise<Curso | null> {
        // 1. Busca os dados do curso
        const [cursoRows] = await pool.execute<CursoComProfessor[]>(
            `SELECT c.*, u.nome as nome_professor
             FROM curso c
             JOIN professor p ON c.id_professor = p.id_professor
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE c.id_curso = ?`,
            [cursoId]
        );
        if (cursoRows.length === 0) {
            return null;
        }
        const curso: Curso = cursoRows[0];

        // 2. Obter os módulos do curso
// AQUI: Informe que o resultado é RowDataPacket[] e depois faça a coerção.
const [dbModuloRows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM modulo WHERE id_curso = ? ORDER BY ordem ASC`,
    [cursoId]
);
const modulosDoCurso: Modulo[] = dbModuloRows as Modulo[]; // Coerção de tipo aqui

// 3. Obter todas as aulas para esses módulos encontrados
if (modulosDoCurso.length > 0) {
    const moduloIds = modulosDoCurso.map(m => m.id_modulo);
    const placeholders = moduloIds.map(() => '?').join(',');
    const queryAulas = `SELECT * FROM aula WHERE id_modulo IN (${placeholders}) ORDER BY ordem ASC`;

    // AQUI: Mesma lógica, informe RowDataPacket[] e depois faça a coerção.
    const [dbAulaRows] = await pool.execute<RowDataPacket[]>(queryAulas, moduloIds);
    const aulaRows: Aula[] = dbAulaRows as Aula[]; // Coerção de tipo aqui

            // 4. Aninha as aulas nos seus respectivos módulos
            curso.modulos = modulosDoCurso.map(modulo => {
                return {
                    ...modulo,
                    aulas: aulaRows.filter(aula => aula.id_modulo === modulo.id_modulo)
                };
            });
        } else {
            curso.modulos = []; // Garante que a propriedade exista, mesmo que vazia
        }

        return curso;
    }

    /**
     * Cria um novo curso no banco de dados.
     * @param cursoData Dados do curso a ser criado.
     * @returns O ID do novo curso.
     */
    async create(cursoData: CursoData): Promise<number> {
        const { id_professor, titulo, descricao, carga_horaria } = cursoData;
        const [result]: any = await pool.execute(
            `INSERT INTO curso (id_professor, titulo, descricao, carga_horaria)
             VALUES (?, ?, ?, ?)`,
            [id_professor, titulo, descricao, carga_horaria]
        );
        return result.insertId;
    }

    /**
     * Atualiza um curso existente.
     * @param cursoId ID do curso a ser atualizado.
     * @param cursoData Novos dados para o curso.
     * @returns boolean indicando se a operação foi bem-sucedida.
     */
    async update(cursoId: number, cursoData: CursoData): Promise<boolean> {
        const { id_professor, titulo, descricao, carga_horaria } = cursoData;
        const [result]: any = await pool.execute(
            `UPDATE curso SET id_professor = ?, titulo = ?, descricao = ?, carga_horaria = ?
             WHERE id_curso = ?`,
            [id_professor, titulo, descricao, carga_horaria, cursoId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Deleta um curso do banco de dados.
     * @param cursoId ID do curso a ser deletado.
     * @returns boolean indicando se a operação foi bem-sucedida.
     */
    async delete(cursoId: number): Promise<boolean> {
        const [result]: any = await pool.execute(
            `DELETE FROM curso WHERE id_curso = ?`,
            [cursoId]
        );
        return result.affectedRows > 0;
    }

    // ... dentro da classe CursoDAO

    /**
     * Busca todos os títulos de cursos existentes.
     * @returns Uma lista de títulos.
     */
    async findAllTitles(): Promise<string[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT titulo FROM curso`
        );
        // Mapeia o resultado para um array de strings
        return rows.map((row: any) => row.titulo);
    }

    
}

// Exporta uma única instância da classe
export default new CursoDAO();
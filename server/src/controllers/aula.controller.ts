// server/src/controllers/aula.controller.ts
import { Response, NextFunction } from 'express';
import { pool } from '../database';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * @route   POST /modulos/:moduloId/aulas
 * @desc    Criar uma nova aula para um módulo
 * @access  Logado (SEM CHECKROLE)
 */
export const createAula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params; // Pega o ID do módulo da URL
    const { titulo, descricao, conteudo, duracao, ordem } = req.body;

    // Validação básica
    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios para a aula.' });
        return;
    }

    try {
        // Opcional: Validar se o moduloId existe.
        const [modulo]:any[] = await pool.execute('SELECT * FROM modulo WHERE id_modulo = ?', [moduloId]);
        if (modulo.length === 0) {
             res.status(404).json({ success: false, message: 'Módulo não encontrado.' });
             return;
        }
        // TODO: Adicionar lógica para verificar se a 'ordem' já existe ou recalcular.

        const [result]: any = await pool.execute(
            `INSERT INTO aula (id_modulo, titulo, descricao, conteudo, duracao, ordem) VALUES (?, ?, ?, ?, ?, ?)`,
            [moduloId, titulo, descricao, conteudo, duracao, ordem]
        );
        res.status(201).json({ success: true, id_aula: result.insertId, message: "Aula criada com sucesso." });

    } catch (err: any) {
        console.error("Erro ao criar aula:", err);
         if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Já existe uma aula com esta ordem neste módulo.' });
        } else {
            next(err);
        }
    }
};  
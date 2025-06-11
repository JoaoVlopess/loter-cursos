import { Response, NextFunction } from 'express';
import progressoDAO from '../dao/progressoDAO'; // <-- Importa o DAO
import usuarioDAO from '../dao/usuarioDAO';   // <-- Para buscar id_aluno
import cursoDAO from '../dao/cursoDAO';       // <-- Para validar se curso existe
import aulaDAO from '../dao/aulaDAO';         // <-- Para validar se aula existe
import { AuthRequest } from '../middlewares/authMiddleware';

// =============================================================================
// ## Aluno Inicia um Curso (Refatorado)
// =============================================================================
export const iniciarProgressoCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { id_curso } = req.body;

    if (!id_usuario_logado || !id_curso) {
        res.status(400).json({ success: false, message: 'ID do usuário e ID do curso são obrigatórios.' });
        return;
    }

    try {
        const usuario = await usuarioDAO.findByEmail(req.usuario!.email);
        if (!usuario || !usuario.id_aluno) {
            res.status(403).json({ success: false, message: 'Apenas alunos podem iniciar o progresso.' });
            return;
        }

        const curso = await cursoDAO.findById(id_curso);
        if (!curso) {
            res.status(404).json({ success: false, message: 'Curso não encontrado.' });
            return;
        }

        const { id_progresso_curso, status, isNew } = await progressoDAO.findOrCreateProgressoCurso(usuario.id_aluno, id_curso);

        if (isNew) {
            res.status(201).json({ success: true, id_progresso_curso, status, message: 'Progresso do curso iniciado com sucesso.' });
        } else {
            res.status(200).json({ success: true, id_progresso_curso, status, message: 'Você já iniciou este curso.' });
        }
    } catch (err: any) {
        console.error("Erro ao iniciar progresso do curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Aluno Marca Aula como Concluída (Refatorado)
// =============================================================================
export const marcarAulaConcluida = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { id_curso, id_aula } = req.body;

    if (!id_usuario_logado || !id_curso || !id_aula) {
        res.status(400).json({ success: false, message: 'ID do usuário, curso e aula são obrigatórios.' });
        return;
    }

    try {
        const usuario = await usuarioDAO.findByEmail(req.usuario!.email);
        if (!usuario || !usuario.id_aluno) {
            res.status(403).json({ success: false, message: 'Apenas alunos podem marcar aulas como concluídas.' });
            return;
        }

        const progressoCurso = await progressoDAO.getProgressoDetalhado(usuario.id_aluno, id_curso);
        if (!progressoCurso) {
            res.status(404).json({ success: false, message: 'Progresso do curso não encontrado. Inicie o curso primeiro.' });
            return;
        }
        
        const aula = await aulaDAO.findById(id_aula);
        if (!aula) {
            res.status(404).json({ success: false, message: 'Aula não encontrada.' });
            return;
        }

        const status_curso_final = await progressoDAO.marcarAulaConcluidaEVerificarProgresso(progressoCurso.id_progresso_curso, id_curso, id_aula);
        res.status(200).json({ success: true, message: 'Aula marcada como concluída.', status_curso: status_curso_final });

    } catch (err: any) {
        console.error("Erro ao marcar aula como concluída:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter Progresso de um Aluno em um Curso (Refatorado)
// =============================================================================
export const getMeuProgressoCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { cursoId } = req.params;

    if (!id_usuario_logado || !cursoId) {
        res.status(400).json({ success: false, message: 'ID do usuário e ID do curso são obrigatórios.' });
        return;
    }

    try {
        const usuario = await usuarioDAO.findByEmail(req.usuario!.email);
        if (!usuario || !usuario.id_aluno) {
            res.status(403).json({ success: false, message: 'Usuário não é um aluno válido.' });
            return;
        }

        const progresso = await progressoDAO.getProgressoDetalhado(usuario.id_aluno, parseInt(cursoId));

        if (!progresso) {
            res.json({ success: true, data: { id_curso: parseInt(cursoId), status: 'NÃO INICIADO', aulas_concluidas_ids: [] } });
            return;
        }
        
        res.json({ success: true, data: progresso });

    } catch (err: any) {
        console.error("Erro ao buscar progresso do curso:", err);
        next(err);
    }
};
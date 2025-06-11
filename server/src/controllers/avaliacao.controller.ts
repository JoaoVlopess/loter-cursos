import { Request, Response, NextFunction } from 'express';
import avaliacaoDAO from '../dao/avaliacaoDAO'; // <-- Importa o DAO
import { AuthRequest } from '../middlewares/authMiddleware';
import usuarioDAO from '../dao/usuarioDAO'; // Precisamos dele para buscar id_aluno

// =============================================================================
// ## Criar Nova Avaliação (Refatorado)
// =============================================================================
export const createAvaliacao = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { id_curso, id_modulo, id_aula, nota, feedback } = req.body;

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }

    const itensAvaliacao = [id_curso, id_modulo, id_aula].filter(item => item != null).length;
    if (itensAvaliacao !== 1) {
        res.status(400).json({ success: false, message: 'Você deve avaliar exatamente um item: curso, módulo ou aula.' });
        return;
    }
    if (nota === undefined || nota < 0 || nota > 5) {
        res.status(400).json({ success: false, message: 'Nota inválida. Deve ser entre 0 e 5.' });
        return;
    }

    try {
        const usuario = await usuarioDAO.findByEmail(req.usuario!.email); // Busca usuário completo para pegar id_aluno
        if (!usuario || !usuario.id_aluno) {
            res.status(403).json({ success: false, message: 'Apenas alunos podem fazer avaliações.' });
            return;
        }
        const id_aluno = usuario.id_aluno;

        const jaAvaliou = await avaliacaoDAO.findExisting(id_aluno, { id_curso, id_modulo, id_aula });
        if (jaAvaliou) {
            res.status(409).json({ success: false, message: 'Você já avaliou este item.' });
            return;
        }

        const novaAvaliacaoId = await avaliacaoDAO.create({ id_aluno, id_curso, id_modulo, id_aula, nota, feedback });
        res.status(201).json({ success: true, id_avaliacao: novaAvaliacaoId, message: 'Avaliação registrada com sucesso.' });

    } catch (err: any) {
        console.error("Erro ao criar avaliação:", err);
        next(err);
    }
};

// =============================================================================
// ## Listar Avaliações por Item (Refatorado)
// =============================================================================
export const getAvaliacoesByItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId, moduloId, aulaId } = req.params;
    try {
        const avaliacoes = await avaliacaoDAO.findByItem({
            cursoId: cursoId ? parseInt(cursoId) : undefined,
            moduloId: moduloId ? parseInt(moduloId) : undefined,
            aulaId: aulaId ? parseInt(aulaId) : undefined,
        });
        res.json({ success: true, data: avaliacoes });
    } catch (err: any) {
        console.error("Erro ao listar avaliações:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter uma Avaliação Específica por ID (Refatorado)
// =============================================================================
export const getAvaliacaoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { avaliacaoId } = req.params;
    try {
        const avaliacao = await avaliacaoDAO.findById(parseInt(avaliacaoId));
        if (!avaliacao) {
            res.status(404).json({ success: false, message: 'Avaliação não encontrada.' });
            return;
        }
        res.json({ success: true, data: avaliacao });
    } catch (err: any) {
        console.error("Erro ao buscar avaliação:", err);
        next(err);
    }
};

// =============================================================================
// ## Atualizar uma Avaliação (Refatorado)
// =============================================================================
export const updateAvaliacao = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { avaliacaoId } = req.params;
    const id_usuario_logado = req.usuario?.id_usuario;
    const { nota, feedback } = req.body;

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }
    // Adicione validações de nota e feedback aqui se necessário

    try {
        const usuario = await usuarioDAO.findByEmail(req.usuario!.email);
        if (!usuario || !usuario.id_aluno) {
            res.status(403).json({ success: false, message: 'Apenas alunos podem modificar avaliações.' });
            return;
        }
        const id_aluno = usuario.id_aluno;

        const success = await avaliacaoDAO.update(parseInt(avaliacaoId), id_aluno, { nota, feedback });
        if (!success) {
            res.status(404).json({ success: false, message: 'Avaliação não encontrada ou não pertence a este aluno.' });
            return;
        }
        res.json({ success: true, message: 'Avaliação atualizada com sucesso.' });
    } catch (err: any) {
        console.error("Erro ao atualizar avaliação:", err);
        next(err);
    }
};

// =============================================================================
// ## Deletar uma Avaliação (Refatorado)
// =============================================================================
export const deleteAvaliacao = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { avaliacaoId } = req.params;
    const tipo_usuario_logado = req.usuario?.tipo;

    try {
        let success = false;
        if (tipo_usuario_logado === 'ADMIN') {
            // Admin pode deletar qualquer avaliação sem verificar o dono
            success = await avaliacaoDAO.delete(parseInt(avaliacaoId));
        } else {
            // Aluno só pode deletar a própria avaliação
            const usuario = await usuarioDAO.findByEmail(req.usuario!.email);
            if (!usuario || !usuario.id_aluno) {
                res.status(403).json({ success: false, message: 'Usuário não é um aluno válido para deletar avaliações.' });
                return;
            }
            success = await avaliacaoDAO.delete(parseInt(avaliacaoId), usuario.id_aluno);
        }

        if (!success) {
            res.status(404).json({ success: false, message: 'Avaliação não encontrada ou você não tem permissão para deletá-la.' });
            return;
        }
        res.json({ success: true, message: 'Avaliação excluída com sucesso.' });

    } catch (err: any) {
        console.error("Erro ao deletar avaliação:", err);
        next(err);
    }
};
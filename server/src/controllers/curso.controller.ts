import { Request, Response, NextFunction } from 'express';
import cursoDAO from '../dao/cursoDAO'; // <-- Importa o DAO
import { AuthRequest } from '../middlewares/authMiddleware';
// Importar o DAO de professor para validar a existência do professor
import professorDAO from '../dao/professorDAO'; // <-- Supondo que você crie um professorDAO
import { normalizeTitle } from '../utils/stringUtils';

// =============================================================================
// ## Obter Todos os Cursos (Refatorado)
// =============================================================================
export const getAllCursos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const cursos = await cursoDAO.findAll();
        res.json({ success: true, data: cursos });
    } catch (err: any) {
        console.error("Erro ao buscar todos os cursos:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter Detalhes de um Curso (Refatorado)
// =============================================================================
export const getCursoDetalhes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;
    try {
        const cursoCompleto = await cursoDAO.findDetailsById(parseInt(cursoId, 10));

        if (!cursoCompleto) {
            res.status(404).json({ success: false, message: 'Curso não encontrado.' });
            return;
        }
        res.json({ success: true, data: cursoCompleto });
    } catch (err: any) {
        console.error("Erro ao buscar detalhes do curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Criar um Novo Curso (Refatorado)
// =============================================================================
export const createCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id_professor, titulo, descricao, carga_horaria } = req.body;

    if (!id_professor || !titulo) {
        res.status(400).json({ success: false, message: 'ID do professor e título são obrigatórios.' });
        return;
    }

    try {
        // TODO: Adicionar validação se o professor existe usando professorDAO

        // 1. Busca os títulos existentes
        const titulosExistentes = await cursoDAO.findAllTitles();

        // 2. Normaliza e verifica por similaridade
        const novoTituloNormalizado = normalizeTitle(titulo);
        let similarTitle: string | null = null;
        for (const existente of titulosExistentes) {
            if (normalizeTitle(existente) === novoTituloNormalizado) {
                similarTitle = existente;
                break;
            }
        }

        // 3. Cria o curso no banco
        const novoCursoId = await cursoDAO.create({ id_professor, titulo, descricao, carga_horaria });

        // 4. Monta a resposta
        const responseBody: { success: boolean, id_curso: number, message: string, warning?: object } = {
            success: true,
            id_curso: novoCursoId,
            message: "Curso criado com sucesso."
        };

        // 5. Se encontrou um título similar, adiciona o aviso
        if (similarTitle) {
            responseBody.warning = {
                type: 'SIMILAR_NAME_FOUND',
                message: `Aviso: Já existe um curso com nome muito similar ('${similarTitle}'). Considere adicionar ou editar a descrição para diferenciá-los.`,
                similarTo: similarTitle
            };
        }

        res.status(201).json(responseBody);

    } catch (err: any) {
        console.error("Erro ao criar curso:", err);
        next(err);
    }
};
// =============================================================================
// ## Atualizar um Curso Existente (Refatorado)
// =============================================================================
export const updateCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;
    const { id_professor, titulo, descricao, carga_horaria } = req.body;

    if (!id_professor || !titulo) {
        res.status(400).json({ success: false, message: 'ID do professor e título são obrigatórios.' });
        return;
    }

    try {
        // Validação e lógica de permissão (deveria vir aqui)
        // ex: const curso = await cursoDAO.findById(parseInt(cursoId, 10));
        // if (req.usuario.tipo === 'PROFESSOR' && curso.id_professor !== req.usuario.id_professor) { ... }

        const success = await cursoDAO.update(parseInt(cursoId, 10), { id_professor, titulo, descricao, carga_horaria });

        if (!success) {
            res.status(404).json({ success: false, message: 'Curso não encontrado para atualização.' });
            return;
        }
        res.json({ success: true, message: 'Curso atualizado com sucesso.' });
    } catch (err: any) {
        console.error("Erro ao atualizar curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Deletar um Curso (Refatorado)
// =============================================================================
export const deleteCurso = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;

    try {
        // Validação de permissão deveria vir aqui
        const success = await cursoDAO.delete(parseInt(cursoId, 10));

        if (!success) {
            res.status(404).json({ success: false, message: 'Curso não encontrado para exclusão.' });
            return;
        }
        res.json({ success: true, message: 'Curso e seus módulos/aulas foram excluídos com sucesso.' });
    } catch (err: any) {
        console.error("Erro ao deletar curso:", err);
        next(err);
    }

    
};
import { Request, Response, NextFunction } from 'express';
import moduloDAO from '../dao/moduloDAO'; // <-- Importa o DAO
import cursoDAO from '../dao/cursoDAO'; // <-- Para verificar se o curso existe
import { AuthRequest } from '../middlewares/authMiddleware';
import { normalizeTitle } from '../utils/stringUtils';

// =============================================================================
// ## Criar um Novo Módulo (Refatorado)
// =============================================================================
export const createModulo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;
    // Captura o 'force' do corpo da requisição
    const { titulo, descricao, ordem, force } = req.body;

    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios para o módulo.' });
        return;
    }

    try {
        const curso = await cursoDAO.findById(parseInt(cursoId));
        if (!curso) {
            res.status(404).json({ success: false, message: 'Curso não encontrado para adicionar o módulo.' });
            return;
        }

        const titulosExistentes = await moduloDAO.findTitlesByCursoId(parseInt(cursoId));
        let warning = null;


        const novoTituloNormalizado = normalizeTitle(titulo);
        const novoTituloIdentico = titulo.trim().toLowerCase();

        let similarMatch: string | null = null;
        let identicalMatch: string | null = null;

        for (const tituloExistente of titulosExistentes) {
            // Verifica primeiro por nomes EXATAMENTE iguais (ignorando maiúsculas/minúsculas)
            if (tituloExistente.trim().toLowerCase() === novoTituloIdentico) {
                identicalMatch = tituloExistente;
                break; // Encontrou um idêntico, esta é a maior prioridade.
            }
            // Se ainda não achamos um similar, vamos procurar
            if (!similarMatch && normalizeTitle(tituloExistente) === novoTituloNormalizado) {
                similarMatch = tituloExistente;
            }
        }

        // Define a mensagem de aviso com base na prioridade (idêntico > similar)
        if (identicalMatch) {
            warning = {
                type: 'IDENTICAL_NAME_FOUND',
                message: `Aviso: Já existe um módulo com o nome EXATO "${identicalMatch}". Deseja criar mesmo assim?`,
                similarTo: identicalMatch
            };
        } else if (similarMatch) {
            warning = {
                type: 'SIMILAR_NAME_FOUND',
                message: `Aviso: O nome deste módulo é muito parecido com um já existente ('${similarMatch}'). Deseja criar mesmo assim?`,
                similarTo: similarMatch
            };
        }

        if (warning && !force) {
            res.status(409).json({
                success: false,
                code: 'CONFIRMATION_REQUIRED',
                warning: warning
            });
            return;
        }
        
        const novoModuloId = await moduloDAO.create(parseInt(cursoId), { titulo, descricao, ordem });

        res.status(201).json({
            success: true,
            id_modulo: novoModuloId,
            message: "Módulo criado com sucesso."
        });

    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Já existe um módulo com esta ordem neste curso.' });
        } else {
            console.error("Erro ao criar módulo:", err);
            next(err);
        }
    }
};
// =============================================================================
// ## Listar Módulos de um Curso (Refatorado)
// =============================================================================
export const getModulosByCurso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { cursoId } = req.params;
    try {
        // Opcional: Validar se o curso existe antes de buscar os módulos
        const curso = await cursoDAO.findById(parseInt(cursoId));
        if (!curso) {
            res.status(404).json({ success: false, message: 'Curso não encontrado.' });
            return;
        }

        const modulos = await moduloDAO.findByCursoId(parseInt(cursoId));
        res.json({ success: true, data: modulos });
    } catch (err: any) {
        console.error("Erro ao listar módulos do curso:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter um Módulo Específico (Refatorado)
// =============================================================================
export const getModuloById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    try {
        const modulo = await moduloDAO.findById(parseInt(moduloId));
        if (!modulo) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado.' });
            return;
        }
        res.json({ success: true, data: modulo });
    } catch (err: any) {
        console.error("Erro ao buscar módulo por ID:", err);
        next(err);
    }
};

// =============================================================================
// ## Atualizar um Módulo (Refatorado)
// =============================================================================
export const updateModulo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    const { titulo, descricao, ordem } = req.body;

    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios.' });
        return;
    }
    
    try {
        // TODO: Adicionar lógica de permissão aqui (verificar se o usuário pode editar este módulo)
        const success = await moduloDAO.update(parseInt(moduloId), { titulo, descricao, ordem });
        if (!success) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado para atualização.' });
            return;
        }
        res.json({ success: true, message: 'Módulo atualizado com sucesso.' });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Erro de ordem duplicada. Verifique a ordem dos módulos.' });
        } else {
            console.error("Erro ao atualizar módulo:", err);
            next(err);
        }
    }
};

// =============================================================================
// ## Deletar um Módulo (Refatorado)
// =============================================================================
export const deleteModulo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    try {
        // TODO: Adicionar lógica de permissão aqui
        const success = await moduloDAO.delete(parseInt(moduloId));
        if (!success) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado para exclusão.' });
            return;
        }
        res.json({ success: true, message: 'Módulo e suas aulas foram excluídos com sucesso.' });
    } catch (err: any) {
        console.error("Erro ao deletar módulo:", err);
        next(err);
    }
};
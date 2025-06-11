import { Request, Response, NextFunction } from 'express';
import aulaDAO from '../dao/aulaDAO'; // <-- Importa o DAO
import { AuthRequest } from '../middlewares/authMiddleware';
import { normalizeTitle } from '../utils/stringUtils';
// =============================================================================
// ## Criar uma Nova Aula (Refatorado)
// =============================================================================
export const createAula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    // Captura o 'force' do corpo da requisição
    const { titulo, descricao, conteudo, duracao, ordem, force } = req.body;

    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios para a aula.' });
        return;
    }

    try {
        const moduloExists = await aulaDAO.checkModuloExists(parseInt(moduloId, 10));
        if (!moduloExists) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado para adicionar a aula.' });
            return;
        }

        const titulosExistentes = await aulaDAO.findTitlesByModuloId(parseInt(moduloId, 10));
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
                message: `Aviso: Já existe uma aula com o nome EXATO "${identicalMatch}". Deseja criar mesmo assim?`,
                similarTo: identicalMatch
            };
        } else if (similarMatch) {
            warning = {
                type: 'SIMILAR_NAME_FOUND',
                message: `Aviso: O nome dessa aula é muito parecido com um já existente ('${similarMatch}'). Deseja criar mesmo assim?`,
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
        
        const novaAulaId = await aulaDAO.create(parseInt(moduloId), { titulo, descricao, ordem });

        res.status(201).json({
            success: true,
            id_aula: novaAulaId,
            message: "Aula criada com sucesso."
        });

    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Já existe uma aula com esta ordem neste módulo.' });
        } else {
            console.error("Erro ao criar aula:", err);
            next(err);
        }
    }
};


// =============================================================================
// ## Listar Aulas de um Módulo Específico (Refatorado)
// =============================================================================
export const getAulasByModulo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { moduloId } = req.params;
    try {
        const moduloExists = await aulaDAO.checkModuloExists(parseInt(moduloId));
        if (!moduloExists) {
            res.status(404).json({ success: false, message: 'Módulo não encontrado.' });
            return;
        }

        const aulas = await aulaDAO.findByModuloId(parseInt(moduloId));
        res.json({ success: true, data: aulas });
    } catch (err: any) {
        console.error("Erro ao listar aulas do módulo:", err);
        next(err);
    }
};

// =============================================================================
// ## Obter uma Aula Específica (Refatorado)
// =============================================================================
export const getAulaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { aulaId } = req.params;
    try {
        const aula = await aulaDAO.findById(parseInt(aulaId));
        if (!aula) {
            res.status(404).json({ success: false, message: 'Aula não encontrada.' });
            return;
        }
        res.json({ success: true, data: aula });
    } catch (err: any) {
        console.error("Erro ao buscar aula por ID:", err);
        next(err);
    }
};

// =============================================================================
// ## Atualizar uma Aula (Refatorado)
// =============================================================================
export const updateAula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { aulaId } = req.params;
    const { titulo, descricao, conteudo, duracao, ordem } = req.body;

    if (!titulo || ordem === undefined) {
        res.status(400).json({ success: false, message: 'Título e ordem são obrigatórios.' });
        return;
    }
    
    try {
        const success = await aulaDAO.update(parseInt(aulaId), { titulo, descricao, conteudo, duracao, ordem });
        if (!success) {
            res.status(404).json({ success: false, message: 'Aula não encontrada para atualização.' });
            return;
        }
        res.json({ success: true, message: 'Aula atualizada com sucesso.' });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'Erro de ordem duplicada. Verifique a ordem das aulas.' });
        } else {
            console.error("Erro ao atualizar aula:", err);
            next(err);
        }
    }
};

// =============================================================================
// ## Deletar uma Aula (Refatorado)
// =============================================================================
export const deleteAula = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { aulaId } = req.params;

    try {
        const success = await aulaDAO.delete(parseInt(aulaId));
        if (!success) {
            res.status(404).json({ success: false, message: 'Aula não encontrada para exclusão.' });
            return;
        }
        res.json({ success: true, message: 'Aula excluída com sucesso.' });
    } catch (err: any) {
        console.error("Erro ao deletar aula:", err);
        next(err);
    }
};
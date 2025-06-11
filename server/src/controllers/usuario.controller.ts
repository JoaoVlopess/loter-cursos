import { Request, Response, NextFunction } from 'express';
import usuarioDAO from '../dao/usuarioDAO'; // <-- Importa o DAO
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * @route   GET /usuarios
 */
export const getAllUsuarios = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const usuarios = await usuarioDAO.findAllWithDetails();
        res.json({ success: true, data: usuarios });
    } catch (err: any) {
        next(err);
    }
};

/**
 * @route   GET /usuarios/alunos
 */
export const getAllAlunos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const alunos = await usuarioDAO.findActivesByType('ALUNO');
        res.json({ success: true, data: alunos });
    } catch (err: any) {
        console.error("Erro ao buscar todos os alunos:", err);
        next(err);
    }
};

/**
 * @route   GET /usuarios/professores
 */
export const getAllProfessores = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const professores = await usuarioDAO.findActivesByType('PROFESSOR');
        res.json({ success: true, data: professores });
    } catch (err: any) {
        console.error("Erro ao buscar todos os professores:", err);
        next(err);
    }
};

/**
 * @route   GET /usuarios/:id
 */
export const getUsuarioById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        // Lógica de permissão (ex: Admin ou próprio usuário) deve ficar aqui
        const usuario = await usuarioDAO.findById(parseInt(id));
        if (!usuario) {
            res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            return;
        }
        res.json({ success: true, data: usuario });
    } catch (err: any) {
        next(err);
    }
};

/**
 * @route   POST /usuarios
 * @desc    OBS: Esta função é idêntica à cadastrarUsuario do auth.controller.
 * Considere unificar ou usar a do auth.controller para todas as criações.
 * Mantida aqui para seguir a refatoração do seu arquivo.
 */
export const createUsuarioByAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Esta lógica é complexa e já foi implementada no auth.controller com hashing.
    // O ideal é ter uma única função de criação de usuário.
    // Vamos redirecionar para a lógica já refatorada em auth.controller:
    // import { cadastrarUsuario } from './auth.controller';
    // export const createUsuarioByAdmin = cadastrarUsuario;
    // Se precisar de uma lógica diferente para o Admin, implemente aqui.
    res.status(501).json({ message: 'Funcionalidade duplicada. Use POST /auth/cadastro ou uma rota admin específica.' });
};

/**
 * @route   PUT /usuarios/:id
 */
export const updateUsuario = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { nome, cpf, data_nascimento, ativo, especialidade, cargo } = req.body;

    // Validação da entrada (aqui é um bom lugar para isso)
    if (typeof nome !== 'string' || typeof ativo !== 'boolean') {
        res.status(400).json({ success: false, message: 'Nome e status ativo são obrigatórios e devem ter os tipos corretos.' });
        return;
    }
    
    try {
        // Lógica de permissão para update (quem pode atualizar quem?) deve vir aqui

        // O objeto criado aqui agora corresponde ao que o DAO espera
        const success = await usuarioDAO.update(parseInt(id, 10), { 
            nome, 
            cpf, 
            data_nascimento, 
            ativo, 
            especialidade, 
            cargo 
        });

        if (!success) {
            res.status(404).json({ success: false, message: 'Usuário não encontrado para atualização.' });
            return;
        }
        res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    } catch (err: any) {
        // ... seu tratamento de erro ...
        next(err);
    }
};

/**
 * @route   DELETE /usuarios/:id
 */
export const deleteUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        // Lógica de permissão para delete deve vir aqui
        const success = await usuarioDAO.deactivate(parseInt(id));
        if (!success) {
            res.status(404).json({ success: false, message: 'Usuário não encontrado para desativar.' });
            return;
        }
        res.json({ success: true, message: 'Usuário desativado com sucesso.' });
    } catch (err: any) {
        next(err);
    }
};
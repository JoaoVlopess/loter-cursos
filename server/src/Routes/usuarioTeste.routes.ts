import { Router } from 'express';
import { pool } from '../database';
import { ResultSetHeader } from 'mysql2';


const router = Router();

// Interface para tipagem clara
interface UsuarioTeste {
    nome: string;
    cpf: string;
    email: string;
    senha: string;
    ativo: boolean;
    data_nascimento: string;
    tipo: 'ALUNO' | 'PROFESSOR' | 'ADMIN';
}

// Rota simplificada com tipagem explícita
router.post('/usuario-teste', async (req, res) => {
    try {
        const usuarioTeste: UsuarioTeste = {
            nome: 'Teste ' + Date.now(),
            cpf: Date.now().toString().slice(-11),
            email: `teste${Date.now()}@email.com`,
            senha: 'senhaSegura123',
            ativo: true,
            data_nascimento: '2000-01-01',
            tipo: 'ALUNO'
        };

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO usuario 
            (nome, cpf, email, senha, ativo, data_nascimento, tipo) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioTeste.nome,
                usuarioTeste.cpf,
                usuarioTeste.email,
                usuarioTeste.senha,
                usuarioTeste.ativo,
                usuarioTeste.data_nascimento,
                usuarioTeste.tipo
            ]
        );

        res.status(201).json({
            success: true,
            userId: result.insertId,
            userData: usuarioTeste
        });

    } catch (error: any) {
        console.error('Erro detalhado:', {
            code: error.code,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });
        
        res.status(500).json({
            success: false,
            errorCode: error.code || 'DATABASE_ERROR',
            message: error.sqlMessage || 'Erro no servidor'
        });
    }
});

router.get('/teste-conexao', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        res.status(200).json({ success: true, message: 'Conexão bem-sucedida!' });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});


export default router;
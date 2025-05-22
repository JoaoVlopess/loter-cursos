import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config'; 

const SALT_ROUNDS = 10;

export const cadastrarUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { nome, cpf, email, senha, data_nascimento, tipo, especialidade, cargo } =
    req.body;
  try {
    const hashed = await bcrypt.hash(senha, SALT_ROUNDS);
    const [result]: any = await pool.execute(
      `INSERT INTO usuario
         (nome, cpf, email, senha, data_nascimento, tipo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, cpf, email, hashed, data_nascimento, tipo]
    );

    const id_usuario = result.insertId;
    if (tipo === 'ALUNO') {
      await pool.execute(`INSERT INTO aluno (id_usuario) VALUES (?)`, [id_usuario]);
    } else if (tipo === 'PROFESSOR') {
      await pool.execute(
        `INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?)`,
        [id_usuario, especialidade]
      );
    } else if (tipo === 'ADMIN') {
      await pool.execute(
        `INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?)`,
        [id_usuario, cargo]
      );
    }

    res.status(201).json({ success: true, id_usuario });
  } catch (err: any) {
    next(err);
  }
};

export const loginUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  console.log('REQ BODY:', req.body);  // <---- AQUI!
  
  const { email, senha } = req.body;
  try {
    const [rows]: any[] = await pool.execute(
      `SELECT * FROM usuario WHERE email = ? AND ativo = TRUE`,
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      return;   // ⬅️ apenas sai da função, sem retornar o objeto Response
    }

    const usuario = rows[0];

    console.log('Senha do request (plain text):', senha);
    console.log('Hash da senha do banco:', usuario.senha); // Verifique se este é um hash válido (string longa)
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('Resultado da comparação (senhaValida):', senhaValida); // Deve ser true para login sucesso
    if (!senhaValida) {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      return;   // ⬅️ mesma coisa aqui
    }

        // Remova: const jwt_secret = process.env.JWT_SECRET!;
    // E use o JWT_SECRET importado na linha do jwt.sign:
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, tipo: usuario.tipo },
      JWT_SECRET, // <--- Use o importado de config.ts
      { expiresIn: '2h' }
    );

    const { senha: _, ...userWithoutPassword } = usuario;
    res.json({ success: true, token, usuario: userWithoutPassword });
  } catch (err: any) {
    next(err);
  }
};
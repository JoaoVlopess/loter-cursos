import { Request, Response } from 'express';
import { pool } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'sua_chave_secreta'; // ideal colocar no .env

export const cadastrarUsuario = async (req: Request, res: Response) => {
  const { nome, cpf, email, senha, data_nascimento, tipo, especialidade, cargo } = req.body;

  try {
    // Hashear a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir na tabela usuario
    const [usuarioResult]: any = await pool.query(
      `INSERT INTO usuario (nome, cpf, email, senha, data_nascimento, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, cpf, email, hashedPassword, data_nascimento, tipo]
    );

    const id_usuario = usuarioResult.insertId;

    // Inserir na tabela correspondente
    if (tipo === 'ALUNO') {
      await pool.query(`INSERT INTO aluno (id_usuario) VALUES (?)`, [id_usuario]);
    } else if (tipo === 'PROFESSOR') {
      await pool.query(`INSERT INTO professor (id_usuario, especialidade) VALUES (?, ?)`, [id_usuario, especialidade]);
    } else if (tipo === 'ADMIN') {
      await pool.query(`INSERT INTO administrador (id_usuario, cargo) VALUES (?, ?)`, [id_usuario, cargo]);
    }

    res.status(201).json({ success: true, id_usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  try {
    // Verifica se o usuário existe
    const [usuarios]: any = await pool.query(`SELECT * FROM usuario WHERE email = ?`, [email]);

    if (usuarios.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }

    const usuario = usuarios[0];

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }

    // Gera token JWT
    const token = jwt.sign({ id: usuario.id_usuario, tipo: usuario.tipo }, JWT_SECRET, {
      expiresIn: '2h'
    });

    res.json({ success: true, token, usuario: { id: usuario.id_usuario, nome: usuario.nome, tipo: usuario.tipo } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao fazer login' });
  }
};

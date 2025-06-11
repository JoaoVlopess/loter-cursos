import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';
import usuarioDAO from '../dao/usuarioDAO'; // Importa o DAO

const SALT_ROUNDS = 10;

/**
 * @route   POST /cadastro
 * @desc    Cadastra um novo usuário
 * @access  Público
 */
export const cadastrarUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { nome, cpf, email, senha, data_nascimento, tipo, especialidade, cargo } = req.body;

  // Validação de entrada básica
  if (!nome || !email || !senha || !tipo) {
      res.status(400).json({ success: false, message: 'Nome, email, senha e tipo são obrigatórios.' });
      return;
  }
  if (tipo === 'PROFESSOR' && !especialidade) {
        res.status(400).json({ success: false, message: 'Especialidade é obrigatória para Professor.' });
        return;
  }
  if (tipo === 'ADMIN' && !cargo) {
        res.status(400).json({ success: false, message: 'Cargo é obrigatório para Admin.' });
        return;
  }

  // Lógica de negócio (hashing) permanece no controller
  try {
    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

    // O controller prepara os dados e chama o DAO
    const novoUsuarioId = await usuarioDAO.create({
      nome, cpf, email, senha_hash, data_nascimento, tipo, especialidade, cargo
    });

    res.status(201).json({ success: true, id_usuario: novoUsuarioId, message: "Usuário criado com sucesso." });

  } catch (err: any) {
    // Trata erros que o DAO pode lançar, como email duplicado
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, message: 'Email ou CPF já cadastrado.' });
    } else {
      console.error("Erro ao cadastrar usuário:", err);
      next(err);
    }
  }
};


/**
 * @route   POST /login
 * @desc    Autentica um usuário e retorna um token JWT
 * @access  Público
 */
export const loginUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('REQ BODY:', req.body);
  const { email, senha } = req.body;

  // Validação explícita de tipo e existência para garantir a segurança de tipo
  if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
    res.status(400).json({ success: false, message: 'Email e senha são obrigatórios e devem ser do tipo string.' });
    return;
  }

  try {
    // 1. Busca o usuário pelo email usando o DAO
    const usuario = await usuarioDAO.findByEmail(email);

    if (!usuario) {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      return;
    }

    // 2. Compara a senha (lógica de autenticação)
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      return;
    }

    // 3. Gera o token JWT com dados úteis no payload
    const payload = {
      id_usuario: usuario.id_usuario,
      tipo: usuario.tipo,
      id_professor: usuario.id_professor,
      id_aluno: usuario.id_aluno,
      id_admin: usuario.id_admin
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Remove a senha do objeto de usuário antes de enviar a resposta
    const { senha: _, ...userWithoutPassword } = usuario;
    res.json({ success: true, token, usuario: userWithoutPassword });

  } catch (err: any) {
    console.error("Erro no processo de login:", err);
    next(err);
  }
};
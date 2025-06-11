// server/src/middlewares/authMiddleware.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

// Defina a interface para o payload do JWT
interface JwtPayload {
  id_usuario: number;
  tipo: string;
  email: string; // <--- ADICIONE ESTA LINHA
  // Adicione também os outros IDs que você coloca no token
  id_professor?: number;
  id_aluno?: number;
  id_admin?: number;
}

// Estenda a interface Request do Express
import { Request } from 'express';
export interface AuthRequest extends Request {
  usuario?: JwtPayload; // Agora o tipo 'usuario' conhece 'email' e outros IDs
}

// Sua função verificarToken (não precisa de alteração)
export function verificarToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.usuario = payload;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
        return;
    }
}

// Sua função checkRole (não precisa de alteração)
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario || !req.usuario.tipo) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado ou tipo não definido no token.' });
      return;
    }
    if (!allowedRoles.includes(req.usuario.tipo)) {
      res.status(403).json({ success: false, message: 'Acesso negado. Você não tem permissão para esta ação.' });
      return;
    }
    next();
  };
};
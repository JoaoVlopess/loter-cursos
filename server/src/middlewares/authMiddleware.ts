// src/middlewares/authMiddleware.ts
import { Response, NextFunction } from 'express'; // Remova Request daqui se usar AuthRequest
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config'; // <-- Verifique o caminho!

// Defina a interface para o payload do JWT
interface JwtPayload {
  id_usuario: number;
  tipo: string;
}

// Estenda a interface Request do Express
import { Request } from 'express'; // Importe Request aqui
export interface AuthRequest extends Request {
  usuario?: JwtPayload;
}

// **Ajuste a assinatura para retornar 'void'**
export function verificarToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        // Envia a resposta...
        res.status(401).json({ message: 'Token não fornecido' });
        // ...e então retorna 'void' (termina a função)
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.usuario = payload;
        // Se tudo estiver OK, chama next() e a função termina (retornando 'void')
        next();
    } catch (error) {
        // Envia a resposta...
        res.status(401).json({ message: 'Token inválido ou expirado' });
        // ...e então retorna 'void' (termina a função)
        return;
    }
}

// **Não se esqueça de também ter o checkRole se precisar dele:**
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => { // <-- Também retorna void
    if (!req.usuario) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
      return; // <-- Retorna void
    }

    if (!allowedRoles.includes(req.usuario.tipo)) {
      res.status(403).json({ success: false, message: 'Acesso negado. Você não tem permissão.' });
      return; // <-- Retorna void
    }

    next(); // <-- Retorna void
  };
};
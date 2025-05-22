import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rotas from './routes';
import { testConnection } from './database';
import { SERVER_PORT } from '../config';  // <---- usando porta daqui

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await testConnection();
    next();
  } catch {
    res.status(503).json({ error: 'Banco de dados indisponível' });
  }
});

server.use(rotas);

server.listen(SERVER_PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${SERVER_PORT}`)
);

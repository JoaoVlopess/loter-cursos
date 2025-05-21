import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rotas from './routes';            // certifique-se de usar "./routes"
import { testConnection } from './database';

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// health-check do DB
server.use(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await testConnection();
      next();
    } catch {
      res.status(503).json({ error: 'Banco de dados indisponível' });
    }
  }
);

// monta todas as rotas
server.use(rotas);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);

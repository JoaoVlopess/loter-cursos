import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors'; // <--- 1. IMPORTE O CORS
import rotas from './routes';
import { testConnection } from './database';
import { SERVER_PORT } from '../config';

const server = express();

server.use(helmet());

// --- 2. CONFIGURE E USE O CORS ---
const corsOptions = {
  origin: 'http://localhost:5173', // Permite requisições SOMENTE do seu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos HTTP que seu frontend pode usar
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers que seu frontend pode enviar
  optionsSuccessStatus: 200 // Responde com 200 para requisições OPTIONS bem-sucedidas
};
server.use(cors(corsOptions)); // <--- USE O CORS AQUI, ANTES DE QUALQUER ROTA
// ---------------------------------

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Middleware de teste de conexão (mantido como estava)
server.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await testConnection();
    next();
  } catch (dbError) {
    console.error("Middleware de teste de conexão: Banco indisponível", dbError);
    res.status(503).json({ error: 'Banco de dados indisponível' });
  }
});

server.post('/auth/login', (req, res) => {
  console.log("!!!! ROTA DE TESTE DIRETA POST /auth/login NO SERVER.TS FOI ACIONADA !!!!");
  console.log("Corpo da requisição na rota de teste:", req.body);
  res.status(200).json({ sucesso_teste: true, mensagem_teste: "Rota de teste POST /auth/login funcionou!" });
});

server.get('/auth/login', (req, res) => { // Adicione esta também para ver se GET funciona
  console.log("!!!! ROTA DE TESTE DIRETA GET /auth/login NO SERVER.TS FOI ACIONADA !!!!");
  res.status(200).json({ sucesso_teste: true, mensagem_teste: "Rota de teste GET /auth/login funcionou!" });
});

server.use(rotas); // Suas rotas principais

server.listen(SERVER_PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${SERVER_PORT}`)
);
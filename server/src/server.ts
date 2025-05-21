import express from 'express';
import helmet from 'helmet';
import rotasPrincipais from './Routes';
import rotaUsuarioTeste from './Routes/usuarioTeste.routes'; // <-- IMPORTAR ISSO
import { pool, testConnection } from './database';

const server = express();

// Middlewares essenciais
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Middleware de verificação do banco
server.use(async (req, res, next) => {
  try {
    await testConnection();
    next();
  } catch {
    res.status(503).json({ 
      error: 'Serviço indisponível',
      message: 'Banco de dados offline'
    });
  }
});

// Rotas sem prefixo
server.use('/', rotasPrincipais);
server.use('/', rotaUsuarioTeste); // <-- ADICIONE ISSA LINHA

// Inicia servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  await testConnection();
});

import express from "express";
import helmet from 'helmet'

const server = express();

server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.listen(3000, () => {
    console.log('Servidor rodando no link: http://localhost:3000');
});
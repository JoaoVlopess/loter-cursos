import express from 'express'
import helmet from 'helmet'

const server = express();
//executa um servidor

server.use(helmet());
// helmet -> middleware de segurança para proteger o servidor e adiciona headers
//.use -> função permite inserir configurações até bibliotecas externas ao servidor

server.use(express.json());
//avisa/configura o cabeçalho de resposta para avisar a quem recebe que a resposta será em json. A partir de agora as resposta terão que ser em json para não confundir quem verá o tipo de resposta

server.use(express.urlencoded({ extended: true }));
// transforma os dados que vem do formulário em json, para o servidor entender. O extended: true permite que o servidor entenda objetos aninhados, ou seja, objetos dentro de objetos. Se não colocar isso, o servidor não vai entender objetos aninhados e vai dar erro.
//.urlencoded -> transforma os dados que vem do formulário em json, para o servidor entender. O extended: true permite que o servidor entenda objetos aninhados, ou seja, objetos dentro de objetos. Se não colocar isso, o servidor não vai entender objetos aninhados e vai dar erro.



//todos que começarem com /produtos vão passar pelo produtosRouter

server.listen(3000, () => {
    console.log('Servidor rodando no link: http://localhost:3000');
});



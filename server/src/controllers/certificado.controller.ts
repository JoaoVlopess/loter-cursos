import { Response, NextFunction } from 'express';
import { pool } from '../database'; // Ajuste o caminho
import { AuthRequest } from '../middlewares/authMiddleware'; // Ajuste o caminho
import PDFDocument from 'pdfkit'; // Importa pdfkit
import fs from 'fs';             // File system para salvar o PDF localmente
import path from 'path';         // Para lidar com caminhos de arquivo
import { RowDataPacket, PoolConnection } from 'mysql2/promise'; 

interface AlunoCursoData extends RowDataPacket {
    nome_aluno: string;
    email_aluno: string;
    nome_curso: string;
    carga_horaria_curso: number;
}

// =============================================================================
// ## Gerar e Registrar um Novo Certificado
// =============================================================================
/**
 * @route   POST /certificados/gerar
 * @desc    Gera e registra um novo certificado para um aluno e curso concluído
 * @access  Aluno (Protegido por Token)
 */
export const gerarEregistrarCertificado = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id_usuario_logado = req.usuario?.id_usuario;
    const { id_curso } = req.body; // Aluno solicita para um curso específico

    if (!id_usuario_logado) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
        return;
    }
    if (!id_curso) {
        res.status(400).json({ success: false, message: 'ID do curso é obrigatório.' });
        return;
    }

    let connection: PoolConnection | null = null;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Buscar id_aluno
        const [alunoRows] = await connection.execute<RowDataPacket[]>('SELECT id_aluno FROM aluno WHERE id_usuario = ?', [id_usuario_logado]);
        if (alunoRows.length === 0) {
            await connection.rollback(); connection.release();
            res.status(403).json({ success: false, message: 'Apenas alunos podem gerar certificados.' });
            return;
        }
        const id_aluno = alunoRows[0].id_aluno;

        // 2. Verificar se o curso foi concluído pelo aluno
        const [progressoRows] = await connection.execute<RowDataPacket[]>(
            `SELECT status FROM progressoCurso WHERE id_aluno = ? AND id_curso = ?`,
            [id_aluno, id_curso]
        );
        if (progressoRows.length === 0 || progressoRows[0].status !== 'CONCLUÍDO') {
            await connection.rollback(); connection.release();
            res.status(403).json({ success: false, message: 'Curso não concluído ou progresso não encontrado.' });
            return;
        }

        // 3. Verificar se já não existe um certificado
        const [existingCertificado] = await connection.execute<RowDataPacket[]>(
            `SELECT id_certificado, caminho_arquivo FROM certificado WHERE id_aluno = ? AND id_curso = ?`,
            [id_aluno, id_curso]
        );
        if (existingCertificado.length > 0) {
            await connection.rollback(); connection.release();
            res.status(200).json({ // Alterado para 200 OK, pois o certificado já existe
                success: true,
                message: 'Certificado já emitido para este curso.',
                id_certificado: existingCertificado[0].id_certificado,
                caminho_arquivo: existingCertificado[0].caminho_arquivo
            });
            return;
        }

        // 4. Buscar dados para o certificado (nome do aluno, curso, carga horária)
        const [dadosCertificadoQuery] = await connection.execute<AlunoCursoData[]>(
            `SELECT u.nome as nome_aluno, u.email as email_aluno, c.titulo as nome_curso, c.carga_horaria as carga_horaria_curso
             FROM usuario u
             JOIN aluno al ON u.id_usuario = al.id_usuario
             JOIN curso c ON c.id_curso = ?
             WHERE al.id_aluno = ?`,
            [id_curso, id_aluno]
        );
        if (dadosCertificadoQuery.length === 0) {
            await connection.rollback(); connection.release();
            res.status(404).json({ success: false, message: 'Dados do aluno ou curso não encontrados.' });
            return;
        }
        const dadosCertificado = dadosCertificadoQuery[0];
        const data_conclusao = new Date(); // Usar a data atual para a conclusão

        // ==================================================
        // ETAPA DE GERAÇÃO DO PDF (Exemplo com PDFKit)
        // ==================================================
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
        const nomeArquivo = `certificado_${id_aluno}_${id_curso}_${Date.now()}.pdf`;
        const diretorioCertificados = path.join(__dirname, '..', '..', 'certificados_gerados'); // Ex: /server/certificados_gerados

        // Cria o diretório se não existir
        if (!fs.existsSync(diretorioCertificados)) {
            fs.mkdirSync(diretorioCertificados, { recursive: true });
        }
        const caminhoCompletoArquivo = path.join(diretorioCertificados, nomeArquivo);
        
        // Pipe o output para um arquivo (e também pode ser para a resposta HTTP se quiser download direto)
        doc.pipe(fs.createWriteStream(caminhoCompletoArquivo));

        /// Design Básico do Certificado (EXEMPLO CORRIGIDO)
        doc.fontSize(30).text('CERTIFICADO DE CONCLUSÃO', undefined, 150, { align: 'center' });
        doc.fontSize(18).text('Certificamos que', undefined, 250, { align: 'center' });
        doc.fontSize(24).text(dadosCertificado.nome_aluno, undefined, 280, { align: 'center' });
        doc.fontSize(18).text(`concluiu com sucesso o curso de`, undefined, 330, { align: 'center' });
        doc.fontSize(22).text(dadosCertificado.nome_curso, undefined, 360, { align: 'center' });
        doc.fontSize(16).text(`Carga horária: ${dadosCertificado.carga_horaria_curso} horas`, undefined, 410, { align: 'center' });
        doc.fontSize(16).text(`Concluído em: ${data_conclusao.toLocaleDateString('pt-BR')}`, undefined, 440, { align: 'center' });
        doc.end();
        // ==================================================

        // Caminho para salvar no banco (ex: relativo ou URL se for para S3)
        // Para este exemplo, vamos salvar o nome do arquivo, assumindo que há um endpoint para servi-lo.
        const caminho_arquivo_db = `/certificadosGerados/${nomeArquivo}`; // Ou a URL completa do S3

        // 5. Inserir o novo certificado no banco
        const [result]: any = await connection.execute(
            `INSERT INTO certificado (id_aluno, id_curso, data_conclusao, caminho_arquivo)
             VALUES (?, ?, ?, ?)`,
            [id_aluno, id_curso, data_conclusao, caminho_arquivo_db]
        );

        await connection.commit();
        connection.release();
        res.status(201).json({
            success: true,
            id_certificado: result.insertId,
            message: 'Certificado gerado e registrado com sucesso.',
            caminho_arquivo: caminho_arquivo_db
        });

    } catch (err: any) {
        if (connection) {
            try { await connection.rollback(); connection.release(); } catch (rbError) { console.error("Erro no rollback:", rbError); }
        }
        console.error("Erro ao gerar/registrar certificado:", err);
        next(err);
    }
};

// ... (getMeusCertificados, getCertificadoById - como antes) ...
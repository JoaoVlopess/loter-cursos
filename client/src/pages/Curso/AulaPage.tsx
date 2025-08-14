import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // <<-- Adicionado useNavigate
// import axios from 'axios'; // Removido, usaremos apiClient
import styles from "./AulaPage.module.css"; // <<-- Ajustado o caminho para o CSS local
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import type { Aula } from '../../types/Curso/aula'; // <<-- Ajuste o caminho se necessário
import apiClient from '../../services/apiClient';   // <<-- Importe seu apiClient
import { useAuth } from '../../context/AuthContext';  // <<-- Importe seu useAuth

// Interface para a estrutura de uma avaliação como vem da API (incluindo nome do aluno)
interface AvaliacaoApiItem {
  id_avaliacao: number; // Adicionado para usar como key na lista
  nota: number;
  feedback: string;
  nome_aluno: string;
  data_avaliacao: string; // Datas da API geralmente são strings
  // Adicione outros campos se sua API de avaliações retornar mais
}

export const AulaPage = () => {
  const { aulaId } = useParams<{ aulaId: string }>();
  const { isAuthenticated, user } = useAuth(); // Pega do contexto
  const navigate = useNavigate(); // Hook para navegação

  const [aula, setAula] = useState<Aula | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para nova avaliação
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Para feedback no botão de envio

  // API_URL_BASE não é mais necessário aqui, pois apiClient já tem a baseURL
  // const API_URL_BASE = 'http://localhost:3000';

  const fetchDadosDaAula = async () => { // Renomeado para clareza
    if (!aulaId) {
      setError("ID da aula não fornecido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Usar apiClient para as chamadas. O token será adicionado automaticamente se necessário.
      const [aulaRes, avaliacaoRes] = await Promise.all([
        apiClient.get(`/aulas/${aulaId}`),
        apiClient.get(`/aulas/${aulaId}/avaliacoes`)
      ]);

      if (aulaRes.data.success) {
        setAula(aulaRes.data.data);
      } else {
        // Se já houver um erro, não sobrescreva
        if (!error) setError(aulaRes.data.message || "Falha ao carregar dados da aula.");
      }

      if (avaliacaoRes.data.success) {
        setAvaliacoes(avaliacaoRes.data.data);
      } else {
        if (!error) setError(avaliacaoRes.data.message || "Falha ao carregar avaliações.");
      }

    } catch (err: any) {
      console.error("Erro ao carregar dados da aula e avaliações:", err);
      setError(err.response?.data?.message || err.message || "Erro ao buscar os dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDadosDaAula();
  }, [aulaId]); // Dependência aulaId

  const calcularMedia = (): number | null => {
    if (avaliacoes.length === 0) return null;
    const soma = avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
    return parseFloat((soma / avaliacoes.length).toFixed(1));
  };

  const renderEstrelas = (media: number | null) => { // Permite media ser null
    if (media === null) return null; // Não renderiza nada se media for null
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      if (media >= i) estrelas.push(<FaStar key={i} className={styles.starFilled} />);
      else if (media >= i - 0.5) estrelas.push(<FaStarHalfAlt key={i} className={styles.starFilled} />);
      else estrelas.push(<FaRegStar key={i} className={styles.starEmpty} />);
    }
    return estrelas;
  };

  const handleSubmitAvaliacao = async () => {
    if (!aulaId || rating === 0) {
      alert("Por favor, selecione uma nota antes de enviar.");
      return;
    }

    if (!isAuthenticated) {
      alert("Você precisa estar logado para enviar uma avaliação.");
      navigate('/login'); // Redireciona para a página de login
      return;
    }

    if (user?.tipo !== 'ALUNO') {
      alert("Apenas alunos podem enviar avaliações.");
      return;
    }

    setIsSubmitting(true);
    setError(null); // Limpa erros anteriores

    try {
      const response = await apiClient.post(
        `/avaliacoes`,
        {
          id_aula: parseInt(aulaId, 10), // Converte aulaId para número
          nota: rating,
          feedback: feedback
        }
      );

      if (response.data.success) {
        alert("Avaliação enviada com sucesso!");
        setRating(0);
        setFeedback('');
        // Rebusca os dados da aula e avaliações para atualizar a lista e a média
        fetchDadosDaAula();
      } else {
        // Se a API retornar success: false em um 2xx
        alert(response.data.message || "Não foi possível enviar sua avaliação.");
        setError(response.data.message || "Não foi possível enviar sua avaliação.");
      }
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao enviar avaliação. Tente novamente.";
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className={styles.container}><p>Carregando aula...</p></div>;
  // Mostra o erro da página se houver, mesmo que a aula não seja encontrada depois
  if (error && !aula) return <div className={styles.container}><p className={styles.errorMessage}>{error}</p></div>;
  if (!aula) return <div className={styles.container}><p>Aula não encontrada.</p></div>;

  const media = calcularMedia();

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h1>
          {aula.titulo}
          {media !== null && (
            <span style={{ marginLeft: '1rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}>
              {renderEstrelas(media)} ({media}/5)
            </span>
          )}
        </h1>
      </div>

      <div className={styles.videoWrapper}>
  {aula.conteudo ? (
    <iframe
      className={styles.videoPlayer}
      src={(() => {
        // Extrai o ID do vídeo a partir da URL recebida
        const match = aula.conteudo.match(
          /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/
        );
        return match ? `https://www.youtube.com/embed/${match[1]}` : "";
      })()}
      title={aula.titulo}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  ) : (
    <img
      src="/img/comingSoon.jpg"
      alt="Vídeo em breve"
      className={styles.videoPlayer}
    />
  )}
</div>

      <div className={styles.description}>
        <h2>Descrição da aula</h2>
        <p>{aula.descricao || "Nenhuma descrição disponível para esta aula."}</p>
      </div>

      {/* Só mostra a seção de avaliação se o usuário for um ALUNO autenticado */}
      {isAuthenticated && user?.tipo === 'ALUNO' && (
        <div className={styles.rating}>
          <h3>Avalie esta aula</h3>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={styles.starButton}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                disabled={isSubmitting} // Desabilita enquanto envia
              >
                {star <= (hover || rating) ? (
                  <FaStar className={styles.starFilled} />
                ) : (
                  <FaRegStar className={styles.starEmpty} />
                )}
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>
            {rating > 0
              ? `Você avaliou com ${rating} estrela${rating > 1 ? "s" : ""}`
              : "Selecione uma avaliação"}
          </p>

          <div className={styles.comments}>
            <label htmlFor="comment">Feedback</label>
            <textarea
              id="comment"
              placeholder="Digite seu comentário sobre a aula..."
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting} // Desabilita enquanto envia
            />
          </div>

          <button
            onClick={handleSubmitAvaliacao}
            className={styles.submitButton}
            disabled={isSubmitting || rating === 0} // Desabilita se estiver enviando ou se não houver nota
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
          {/* Mostra mensagem de erro do envio da avaliação */}
          {error && isSubmitting && <p className={styles.errorMessage}>{error}</p>}
        </div>
      )}

      {/* LISTA DE COMENTÁRIOS/AVALIAÇÕES EXISTENTES */}
      {avaliacoes.length > 0 && (
        <div className={styles.commentsList}>
          <h3>Avaliações dos alunos</h3>
          {avaliacoes.map((avaliacao) => ( // Usar id_avaliacao como key
            <div key={avaliacao.id_avaliacao} className={styles.singleComment}>
              <p><strong>{avaliacao.nome_aluno || 'Aluno'}</strong> avaliou com {renderEstrelas(avaliacao.nota)} ({avaliacao.nota}/5)</p>
              {avaliacao.feedback && <p>{avaliacao.feedback}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Remova o export default se seu arquivo se chama AulaPage.tsx e você tem outros exports nomeados
// ou se sua configuração de rotas espera um export default.
// Geralmente, para páginas, export default é comum.
// export default AulaPage;
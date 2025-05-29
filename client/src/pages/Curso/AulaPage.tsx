// AulaPage.tsx
import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from "../../pages/Curso/AulaPage.module.css";
import { FaStar, FaRegStar } from 'react-icons/fa';
import type { Aula } from '../../types/Curso/aula'; 

export const AulaPage = () => {
  const { aulaId } = useParams<{ aulaId: string }>(); // cursoId removido pois não era usado

  const [aula, setAula] = useState<Aula | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);

   useEffect(() => {
    if (!aulaId) {
      setError("ID da aula não fornecido.");
      setIsLoading(false);
      return;
    }

    const fetchAulaDetalhes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_URL_BASE = 'http://localhost:3000';
        // Ajustar o tipo da resposta para incluir a possibilidade de uma mensagem de erro
        type ApiResponse = 
          | { success: true, data: Aula } 
          | { success: false, message: string, data?: null }; // data pode ser null ou ausente em erro

        const response = await axios.get<ApiResponse>(
          `${API_URL_BASE}/aulas/${aulaId}` // Endpoint para buscar detalhes da aula
        );

        if (response.data && response.data.success) {
          setAula(response.data.data);
        } else {
          // Agora response.data.message é acessível e tipado corretamente
          setError(response.data.message || "Não foi possível carregar os detalhes da aula (resposta inesperada).");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes da aula:", err);
        setError("Erro ao buscar detalhes da aula. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAulaDetalhes();
  }, [aulaId]);

  if (isLoading) return <div className={styles.container}><p>Carregando aula...</p></div>;
  if (error) return <div className={styles.container}><p className={styles.errorMessage}>{error}</p></div>;
  if (!aula) return <div className={styles.container}><p>Aula não encontrada.</p></div>;
  

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h1>{aula.titulo}</h1>
      </div>
      <div className={styles.videoWrapper}>
          <img src="/img/comingSoon.jpg" className={styles.videoPlayer}/>
           
      </div>
      
      <div className={styles.description}>
        <h2>Descrição da aula</h2>
        <p>{aula.descricao || "Nenhuma descrição disponível para esta aula."}</p>
      </div>
      
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
          {rating > 0 ? `Você avaliou com ${rating} estrela${rating > 1 ? 's' : ''}` : 'Selecione uma avaliação'}
        </p>
         <div className={styles.comments}>
        <label htmlFor="comment">Feedback</label>
        <textarea 
          id="comment"
          placeholder="Digite seu comentário sobre a aula..."
          rows={5}
        />
      </div> 
      </div>

    </div>
  );
};
// AulaPage.tsx
import { useState } from "react";
import styles from "../../pages/Curso/AulaPage.module.css";
import { FaStar, FaRegStar } from 'react-icons/fa';

export const AulaPage = () => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h1>Título da aula</h1>
      </div>
      <div className={styles.videoWrapper}>
        <video controls className={styles.videoPlayer}>
          <source src="/videos/aula1.mp4" type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      </div>
      <div className={styles.description}>
        <h2>Descrição da aula</h2>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit... Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci neque laborum fugit doloribus, at quaerat libero soluta iusto! Distinctio ea eos voluptas, nam vitae voluptates iusto similique eum est dolore.</p>
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
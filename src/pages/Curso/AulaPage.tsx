// AulaPage.tsx
import { useParams } from "react-router-dom";

export const AulaPage = () => {
  const { cursoId, aulaId } = useParams();

  return (
    <div>
      <h1>Aula {aulaId} do Curso {cursoId}</h1>
      <p>Conteúdo da aula {aulaId}...</p>
      <p>Conteúdo da aula {aulaId}...</p>
    </div>
  );
};
import { useParams } from 'react-router-dom';

export default function AulaPage() {
  const { cursoId, aulaId } = useParams();

  return (
    <div>
      <h1>Curso: {cursoId}</h1>
      <h2>Aula: {aulaId}</h2>

    </div>
  );
}
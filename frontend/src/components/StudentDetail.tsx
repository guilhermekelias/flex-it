import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import {
  ApiUnauthorizedError,
  createStudentObservation,
  getStudentObservations,
  type Observation,
} from '../services/api';
import { formatObservationDate } from '../utils/formatObservationDate';

type StudentDetailStudent = {
  id: number;
  name: string;
  email: string;
  age: number;
  goal: string;
};

type StudentDetailProps = {
  student: StudentDetailStudent;
  onBack: () => void;
  onSessionExpired: () => void;
};

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'AL';
}

function formatAge(age: number) {
  return Number.isFinite(age) && age > 0 ? `${age} anos` : 'Idade nao informada';
}

function getDisplayGoal(goal: string) {
  return goal.trim() || 'Objetivo nao informado';
}

export function StudentDetail({ student, onBack, onSessionExpired }: StudentDetailProps) {
  const displayGoal = getDisplayGoal(student.goal);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [observationMessage, setObservationMessage] = useState('');
  const [observationFeedback, setObservationFeedback] = useState('');
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [isSavingObservation, setIsSavingObservation] = useState(false);

  useEffect(() => {
    let isCurrentStudent = true;

    const loadObservations = async () => {
      setIsLoadingObservations(true);
      setObservationFeedback('');

      try {
        const data = await getStudentObservations(student.id);

        if (isCurrentStudent) {
          setObservations(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentStudent) {
          setObservationFeedback('Nao foi possivel carregar as observacoes.');
        }
      } finally {
        if (isCurrentStudent) {
          setIsLoadingObservations(false);
        }
      }
    };

    loadObservations();

    return () => {
      isCurrentStudent = false;
    };
  }, [student.id]);

  const handleCreateObservation = async (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault();

    const message = observationMessage.trim();

    if (!message) {
      setObservationFeedback('Digite uma observacao antes de salvar.');
      return;
    }

    setIsSavingObservation(true);
    setObservationFeedback('');

    try {
      const newObservation = await createStudentObservation(student.id, { message });
      setObservations((currentObservations) => [newObservation, ...currentObservations]);
      setObservationMessage('');
      setObservationFeedback('Observacao registrada.');
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setObservationFeedback('Nao foi possivel salvar a observacao.');
    } finally {
      setIsSavingObservation(false);
    }
  };

  return (
    <section className="student-detail-view" aria-labelledby="student-detail-title">
      <button className="student-detail-back-button" onClick={onBack} type="button">
        Voltar para alunos
      </button>

      <header className="student-detail-hero">
        <div className="student-detail-avatar-large" aria-hidden="true">
          {getInitials(student.name)}
        </div>

        <div className="student-detail-hero-content">
          <span className="dashboard-section-kicker">Perfil do aluno</span>
          <h1 id="student-detail-title">{student.name}</h1>
          <p>{displayGoal}</p>
        </div>
      </header>

      <section className="student-detail-info-grid" aria-label="Dados principais do aluno">
        <article>
          <span>Email</span>
          <strong>{student.email || 'Email nao informado'}</strong>
        </article>
        <article>
          <span>Idade</span>
          <strong>{formatAge(student.age)}</strong>
        </article>
        <article>
          <span>Objetivo</span>
          <strong>{displayGoal}</strong>
        </article>
      </section>

      <section className="student-detail-grid" aria-label="Acompanhamento do aluno">
        <article className="dashboard-panel student-detail-card student-detail-card-workout">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Treino atual</span>
            <h2>Treino A - Base semanal</h2>
          </div>

          <div className="student-detail-card-meta">
            <span>4 sessoes/semana</span>
            <span>55 min</span>
            <span>Moderado</span>
          </div>

          <div className="student-detail-progress">
            <div>
              <span>Adesao planejada</span>
              <strong>72%</strong>
            </div>
            <div className="student-detail-progress-track" aria-hidden="true">
              <span style={{ width: '72%' }} />
            </div>
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-diet">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Dieta atual</span>
            <h2>Plano alimentar inicial</h2>
          </div>

          <div className="student-detail-nutrition-grid">
            <div>
              <span>Calorias</span>
              <strong>2.200 kcal</strong>
            </div>
            <div>
              <span>Refeicoes</span>
              <strong>5 ao dia</strong>
            </div>
            <div>
              <span>Foco</span>
              <strong>{displayGoal}</strong>
            </div>
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-metrics">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Metricas</span>
            <h2>Ultima avaliacao</h2>
          </div>

          <div className="student-detail-metric-grid">
            <div>
              <span>Peso</span>
              <strong>72,4 kg</strong>
            </div>
            <div>
              <span>Gordura</span>
              <strong>21,8%</strong>
            </div>
            <div>
              <span>IMC</span>
              <strong>24,9</strong>
            </div>
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-message">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">{'Comunica\u00e7\u00e3o'}</span>
            <h2>{'Observa\u00e7\u00f5es'}</h2>
          </div>

          <form className="student-detail-observation-form" onSubmit={handleCreateObservation}>
            <label>
              <span>Nova observacao</span>
              <textarea
                className="student-detail-observation-textarea"
                onInput={(event) =>
                  setObservationMessage((event.target as HTMLTextAreaElement).value)
                }
                placeholder="Registre uma orientacao simples para este aluno."
                rows={4}
                value={observationMessage}
              />
            </label>

            <button
              className="dashboard-primary-button"
              disabled={isSavingObservation}
              type="submit"
            >
              {isSavingObservation ? 'Salvando...' : 'Salvar observacao'}
            </button>

            {observationFeedback && (
              <p className="student-detail-observation-feedback">{observationFeedback}</p>
            )}
          </form>

          <div className="student-detail-note-list">
            {isLoadingObservations ? (
              <p>Carregando observacoes...</p>
            ) : observations.length === 0 ? (
              <p>Nenhuma observacao registrada para este aluno.</p>
            ) : (
              observations.map((observation) => (
                <article className="student-detail-note-item" key={observation.id}>
                  <p>{observation.message}</p>
                  <span>{formatObservationDate(observation.createdAt)}</span>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </section>
  );
}

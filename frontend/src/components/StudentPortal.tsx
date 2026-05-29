import { useEffect, useState } from 'preact/hooks';
import {
  ApiRequestError,
  ApiUnauthorizedError,
  getMyObservations,
  type Observation,
  type User,
} from '../services/api';
import { formatObservationDate } from '../utils/formatObservationDate';

type StudentPortalProps = {
  user: User;
  onLogout: () => void;
  onSessionExpired: () => void;
};

const currentWorkout = {
  title: 'Treino A - Forca e mobilidade',
  focus: 'Inferiores e core',
  duration: '58 min',
  exercises: '8 exercicios',
  nextSession: 'Hoje, 18:30',
  progress: 68,
};

const currentDiet = {
  title: 'Plano alimentar equilibrado',
  calories: '2.150 kcal',
  meals: '5 refeicoes',
  hydration: '2,7 L de agua',
  adherence: 82,
};

const mainMetrics = [
  { label: 'Peso', value: '72,4 kg', detail: '-1,2 kg no ciclo' },
  { label: 'Gordura', value: '21,8%', detail: 'queda gradual' },
  { label: 'Massa magra', value: '54,6 kg', detail: 'estavel' },
];

function getFirstName(name: string) {
  return name.trim().split(' ')[0] || 'aluno';
}

export function StudentPortal({ user, onLogout, onSessionExpired }: StudentPortalProps) {
  const firstName = getFirstName(user.name);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [observationError, setObservationError] = useState('');

  useEffect(() => {
    let isCurrentUser = true;

    const loadObservations = async () => {
      setIsLoadingObservations(true);
      setObservationError('');

      try {
        const data = await getMyObservations();

        if (isCurrentUser) {
          setObservations(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentUser) {
          if (error instanceof ApiRequestError && error.status === 404) {
            setObservationError('Nenhum cadastro de aluno foi encontrado para este usuario.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setObservationError(
              'Seu email esta vinculado a mais de um aluno. Solicite ajuste ao profissional.',
            );
          } else {
            setObservationError('Nao foi possivel carregar suas observacoes.');
          }
        }
      } finally {
        if (isCurrentUser) {
          setIsLoadingObservations(false);
        }
      }
    };

    loadObservations();

    return () => {
      isCurrentUser = false;
    };
  }, [user.email]);

  return (
    <div className="student-portal-shell">
      <main className="student-portal-page">
        <header className="student-portal-header">
          <div className="student-portal-brand" aria-label="FlexIt">
            <span className="student-portal-brand-mark">F</span>
            <span>FlexIt</span>
          </div>

          <button className="student-portal-logout" onClick={onLogout} type="button">
            Sair
          </button>
        </header>

        <section className="student-portal-hero" aria-labelledby="student-portal-title">
          <div>
            <span className="student-portal-kicker">Area do aluno</span>
            <h1 id="student-portal-title">Ola, {firstName}</h1>
            <p>Acompanhe seu plano atual, orientacoes e principais indicadores da semana.</p>
          </div>

          <div className="student-portal-checkin" aria-label="Resumo do acompanhamento">
            <span>Check-in</span>
            <strong>Semana 08</strong>
            <small>Atualizado pelo profissional</small>
          </div>
        </section>

        <section className="student-portal-grid" aria-label="Painel do aluno">
          <article className="student-portal-card student-portal-card-workout">
            <div className="student-portal-card-heading">
              <span className="student-portal-kicker">Treino atual</span>
              <h2>{currentWorkout.title}</h2>
            </div>

            <div className="student-portal-info-grid">
              <span>{currentWorkout.focus}</span>
              <span>{currentWorkout.duration}</span>
              <span>{currentWorkout.exercises}</span>
            </div>

            <div className="student-portal-progress">
              <div>
                <span>Conclusao semanal</span>
                <strong>{currentWorkout.progress}%</strong>
              </div>
              <div className="student-portal-progress-track" aria-hidden="true">
                <span style={{ width: `${currentWorkout.progress}%` }} />
              </div>
            </div>

            <p className="student-portal-card-note">Proxima sessao: {currentWorkout.nextSession}</p>
          </article>

          <article className="student-portal-card student-portal-card-diet">
            <div className="student-portal-card-heading">
              <span className="student-portal-kicker">Dieta atual</span>
              <h2>{currentDiet.title}</h2>
            </div>

            <div className="student-portal-info-grid">
              <span>{currentDiet.calories}</span>
              <span>{currentDiet.meals}</span>
              <span>{currentDiet.hydration}</span>
            </div>

            <div className="student-portal-progress">
              <div>
                <span>Aderencia</span>
                <strong>{currentDiet.adherence}%</strong>
              </div>
              <div className="student-portal-progress-track student-portal-progress-track-green" aria-hidden="true">
                <span style={{ width: `${currentDiet.adherence}%` }} />
              </div>
            </div>

            <p className="student-portal-card-note">Foco do dia: manter proteinas em todas as refeicoes.</p>
          </article>

          <article className="student-portal-card student-portal-card-metrics">
            <div className="student-portal-card-heading">
              <span className="student-portal-kicker">Metricas principais</span>
              <h2>Evolucao recente</h2>
            </div>

            <div className="student-portal-metric-grid">
              {mainMetrics.map((metric) => (
                <div key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.detail}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="student-portal-card student-portal-card-message">
            <div className="student-portal-card-heading">
              <span className="student-portal-kicker">Comunicacao</span>
              <h2>Observacoes do profissional</h2>
            </div>

            <div className="student-portal-note-list">
              {isLoadingObservations ? (
                <p>Carregando observacoes...</p>
              ) : observationError ? (
                <p>{observationError}</p>
              ) : observations.length === 0 ? (
                <p>Nenhuma observacao enviada pelo profissional ainda.</p>
              ) : (
                observations.map((observation) => (
                  <article className="student-portal-note-item" key={observation.id}>
                    <p>{observation.message}</p>
                    <span>{formatObservationDate(observation.createdAt)}</span>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

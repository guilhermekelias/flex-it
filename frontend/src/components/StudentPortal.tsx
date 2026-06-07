import { useEffect, useState } from 'preact/hooks';
import {
  ApiRequestError,
  ApiUnauthorizedError,
  getMyWorkouts,
  getMyObservations,
  type Observation,
  type User,
  type Workout,
} from '../services/api';
import { formatObservationDate } from '../utils/formatObservationDate';

type StudentPortalProps = {
  user: User;
  onLogout: () => void;
  onSessionExpired: () => void;
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
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [observationError, setObservationError] = useState('');

  useEffect(() => {
    let isCurrentUser = true;

    const loadWorkouts = async () => {
      setIsLoadingWorkouts(true);
      setWorkoutError('');

      try {
        const data = await getMyWorkouts();

        if (isCurrentUser) {
          setWorkouts(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentUser) {
          if (error instanceof ApiRequestError && error.status === 404) {
            setWorkoutError('Nenhum cadastro de aluno foi encontrado para este usuario.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setWorkoutError(
              'Seu email esta vinculado a mais de um aluno. Solicite ajuste ao profissional.',
            );
          } else {
            setWorkoutError('Nao foi possivel carregar seus treinos.');
          }
        }
      } finally {
        if (isCurrentUser) {
          setIsLoadingWorkouts(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      isCurrentUser = false;
    };
  }, [user.email]);

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

  const currentWorkout = workouts[0] ?? null;
  const workoutProgress = workouts.length > 0 ? 100 : 0;
  const workoutTitle = isLoadingWorkouts
    ? 'Carregando treinos...'
    : currentWorkout
      ? currentWorkout.name
      : 'Nenhum treino cadastrado';
  const workoutNote = currentWorkout
    ? `Atualizado em ${formatObservationDate(currentWorkout.updatedAt)}`
    : workoutError || 'Seu profissional ainda nao cadastrou treinos.';

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
              <span className="student-portal-kicker">Treinos atuais</span>
              <h2>{workoutTitle}</h2>
            </div>

            <div className="student-portal-info-grid">
              <span>{currentWorkout ? currentWorkout.type : 'Aguardando plano'}</span>
              <span>{currentWorkout ? `${currentWorkout.durationMinutes} min` : '-- min'}</span>
              <span>
                {currentWorkout ? `${currentWorkout.exercisesCount} exercicios` : '-- exercicios'}
              </span>
            </div>

            <div className="student-portal-progress">
              <div>
                <span>Treinos cadastrados</span>
                <strong>{workouts.length}</strong>
              </div>
              <div className="student-portal-progress-track" aria-hidden="true">
                <span style={{ width: `${workoutProgress}%` }} />
              </div>
            </div>

            <p className="student-portal-card-note">{workoutNote}</p>

            <div className="student-portal-note-list">
              {isLoadingWorkouts ? (
                <p>Carregando treinos...</p>
              ) : workoutError ? (
                <p>{workoutError}</p>
              ) : workouts.length === 0 ? (
                <p>Nenhum treino enviado pelo profissional ainda.</p>
              ) : (
                workouts.map((workout) => (
                  <article className="student-portal-note-item" key={workout.id}>
                    <p>
                      <strong>{workout.name}</strong>
                      {workout.description ? ` - ${workout.description}` : ''}
                    </p>
                    <span>
                      {workout.type} | {workout.durationMinutes} min |{' '}
                      {workout.exercisesCount} exercicios
                    </span>
                  </article>
                ))
              )}
            </div>
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

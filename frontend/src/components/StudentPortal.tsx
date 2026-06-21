import type { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import {
  ApiRequestError,
  ApiUnauthorizedError,
  createMyObservation,
  getMyNutritionPlans,
  getMyMetrics,
  getMyWorkouts,
  getMyObservationThreads,
  type Metric,
  type NutritionPlan,
  type ObservationThread,
  type User,
  type Workout,
} from '../services/api';
import { formatObservationDate } from '../utils/formatObservationDate';
import { calculateBmi, formatMetricValue } from '../utils/metricDisplay';
import {
  getObservationSenderLabel,
  getObservationSenderRole,
} from '../utils/observationDisplay';
import { NutritionMealSummaryList } from './NutritionMealSummaryList';
import { WorkoutExerciseSummaryList } from './WorkoutExerciseSummaryList';

type StudentPortalProps = {
  user: User;
  onLogout: () => void;
  onSessionExpired: () => void;
};

type StudentPortalTab = 'summary' | 'workouts' | 'nutrition' | 'metrics' | 'observations';

const STUDENT_PORTAL_TABS: Array<{ id: StudentPortalTab; label: string }> = [
  { id: 'summary', label: 'Resumo' },
  { id: 'workouts', label: 'Treinos' },
  { id: 'nutrition', label: 'Dietas' },
  { id: 'metrics', label: 'Métricas' },
  { id: 'observations', label: 'Comunicação' },
];

function getFirstName(name: string) {
  return name.trim().split(' ')[0] || 'aluno';
}

function getObservationThreadLabel(thread: ObservationThread) {
  const professionalLabel = thread.professionalId
    ? `Profissional #${thread.professionalId}`
    : 'Sem profissional vinculado';

  return `Vínculo #${thread.studentId} | ${professionalLabel}`;
}

function getMetricSummary(metric: Metric | null) {
  return [
    {
      label: 'Peso',
      value: metric ? formatMetricValue(metric.weightKg, 'kg') : '--',
      detail: metric ? formatObservationDate(metric.recordedAt) : 'sem avaliação',
    },
    {
      label: 'Gordura',
      value: metric ? formatMetricValue(metric.bodyFatPercentage, '%') : '--',
      detail: metric ? 'composição corporal' : 'aguardando dados',
    },
    {
      label: 'IMC',
      value: metric ? calculateBmi(metric.weightKg, metric.heightCm) : '--',
      detail: metric ? 'calculado por peso e altura' : 'peso e altura pendentes',
    },
  ];
}

export function StudentPortal({ user, onLogout, onSessionExpired }: StudentPortalProps) {
  const firstName = getFirstName(user.name);
  const [activeTab, setActiveTab] = useState<StudentPortalTab>('summary');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');
  const [observationThreads, setObservationThreads] = useState<ObservationThread[]>([]);
  const [observationMessages, setObservationMessages] = useState<Record<number, string>>({});
  const [observationFeedback, setObservationFeedback] = useState<Record<number, string>>({});
  const [savingObservationStudentId, setSavingObservationStudentId] = useState<number | null>(null);
  const observationThreadRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [observationError, setObservationError] = useState('');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricError, setMetricError] = useState('');
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [isLoadingNutritionPlans, setIsLoadingNutritionPlans] = useState(false);
  const [nutritionPlanError, setNutritionPlanError] = useState('');

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
            setWorkoutError('Nenhum cadastro de aluno foi encontrado para este usuário.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setWorkoutError('Seu usuário não tem permissão para visualizar estes treinos.');
          } else {
            setWorkoutError('Não foi possível carregar seus treinos.');
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
      setObservationFeedback({});

      try {
        const data = await getMyObservationThreads();

        if (isCurrentUser) {
          setObservationThreads(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentUser) {
          if (error instanceof ApiRequestError && error.status === 404) {
            setObservationError('Nenhum cadastro de aluno foi encontrado para este usuário.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setObservationError(
              'Seu usuário não tem permissão para visualizar estas mensagens.',
            );
          } else {
            setObservationError('Não foi possível carregar suas mensagens.');
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

  useEffect(() => {
    let isCurrentUser = true;

    const loadNutritionPlans = async () => {
      setIsLoadingNutritionPlans(true);
      setNutritionPlanError('');

      try {
        const data = await getMyNutritionPlans();

        if (isCurrentUser) {
          setNutritionPlans(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentUser) {
          if (error instanceof ApiRequestError && error.status === 404) {
            setNutritionPlanError('Nenhum cadastro de aluno foi encontrado para este usuário.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setNutritionPlanError(
              'Seu usuário não tem permissão para visualizar estes planos alimentares.',
            );
          } else {
            setNutritionPlanError('Não foi possível carregar seus planos alimentares.');
          }
        }
      } finally {
        if (isCurrentUser) {
          setIsLoadingNutritionPlans(false);
        }
      }
    };

    loadNutritionPlans();

    return () => {
      isCurrentUser = false;
    };
  }, [user.email]);

  useEffect(() => {
    let isCurrentUser = true;

    const loadMetrics = async () => {
      setIsLoadingMetrics(true);
      setMetricError('');

      try {
        const data = await getMyMetrics();

        if (isCurrentUser) {
          setMetrics(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentUser) {
          if (error instanceof ApiRequestError && error.status === 404) {
            setMetricError('Nenhum cadastro de aluno foi encontrado para este usuário.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setMetricError('Seu usuário não tem permissão para visualizar estas métricas.');
          } else {
            setMetricError('Não foi possível carregar suas métricas.');
          }
        }
      } finally {
        if (isCurrentUser) {
          setIsLoadingMetrics(false);
        }
      }
    };

    loadMetrics();

    return () => {
      isCurrentUser = false;
    };
  }, [user.email]);

  const observations = observationThreads.flatMap((thread) => thread.messages);

  const handleObservationMessageChange = (studentId: number, value: string) => {
    setObservationMessages((currentMessages) => ({
      ...currentMessages,
      [studentId]: value,
    }));
    setObservationFeedback((currentFeedback) => ({
      ...currentFeedback,
      [studentId]: '',
    }));
  };

  const handleCreateObservation = async (
    event: JSX.TargetedEvent<HTMLFormElement, Event>,
    studentId: number,
  ) => {
    event.preventDefault();

    const message = (observationMessages[studentId] ?? '').trim();
    const thread = observationThreads.find(
      (currentThread) => currentThread.studentId === studentId,
    );

    if (!message) {
      setObservationFeedback((currentFeedback) => ({
        ...currentFeedback,
        [studentId]: 'Digite uma mensagem antes de enviar.',
      }));
      return;
    }

    if (!thread?.professionalId) {
      setObservationFeedback((currentFeedback) => ({
        ...currentFeedback,
        [studentId]: 'Vínculo sem profissional para receber a mensagem.',
      }));
      return;
    }

    setSavingObservationStudentId(studentId);
    setObservationFeedback((currentFeedback) => ({
      ...currentFeedback,
      [studentId]: '',
    }));

    try {
      const newObservation = await createMyObservation({ studentId, message });

      setObservationThreads((currentThreads) =>
        currentThreads.map((currentThread) =>
          currentThread.studentId === studentId
            ? {
                ...currentThread,
                professionalId: newObservation.professionalId,
                messages: [...currentThread.messages, newObservation],
              }
            : currentThread,
        ),
      );
      setObservationMessages((currentMessages) => ({
        ...currentMessages,
        [studentId]: '',
      }));
      setObservationFeedback((currentFeedback) => ({
        ...currentFeedback,
        [studentId]: 'Mensagem enviada.',
      }));
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setObservationFeedback((currentFeedback) => ({
        ...currentFeedback,
        [studentId]: 'Não foi possível enviar a mensagem.',
      }));
    } finally {
      setSavingObservationStudentId(null);
    }
  };

  useEffect(() => {
    if (isLoadingObservations) {
      return;
    }

    observationThreads.forEach((thread) => {
      const observationList = observationThreadRefs.current[thread.studentId];

      if (observationList) {
        observationList.scrollTop = observationList.scrollHeight;
      }
    });
  }, [observationThreads, isLoadingObservations]);

  const currentWorkout = workouts[0] ?? null;
  const workoutProgress = workouts.length > 0 ? 100 : 0;
  const workoutTitle = isLoadingWorkouts
    ? 'Carregando treinos...'
    : currentWorkout
      ? currentWorkout.name
      : 'Nenhum treino cadastrado.';
  const workoutNote = currentWorkout
    ? `Atualizado em ${formatObservationDate(currentWorkout.updatedAt)}`
    : workoutError || 'Seu profissional ainda não cadastrou treinos.';
  const currentMetric = metrics[0] ?? null;
  const mainMetrics = getMetricSummary(currentMetric);
  const currentNutritionPlan = nutritionPlans[0] ?? null;
  const nutritionPlanProgress = nutritionPlans.length > 0 ? 100 : 0;
  const nutritionPlanTitle = isLoadingNutritionPlans
    ? 'Carregando dieta...'
    : currentNutritionPlan
      ? currentNutritionPlan.name
      : 'Nenhum plano alimentar cadastrado.';
  const nutritionPlanNote = currentNutritionPlan
    ? `Atualizado em ${formatObservationDate(currentNutritionPlan.updatedAt)}`
    : nutritionPlanError || 'Seu profissional ainda não cadastrou planos alimentares.';
  const activeTabLabel =
    STUDENT_PORTAL_TABS.find((tab) => tab.id === activeTab)?.label ?? 'Resumo';
  const hasMultipleObservationThreads = observationThreads.length > 1;
  const summaryCards = [
    {
      label: 'Treinos',
      value: isLoadingWorkouts ? '...' : workoutError ? '--' : String(workouts.length),
      detail: isLoadingWorkouts
        ? 'Carregando'
        : workoutError
          ? 'Não carregou'
          : workouts.length === 1
            ? 'treino cadastrado'
            : 'treinos cadastrados',
      modifier: 'student-portal-summary-stat-workout',
    },
    {
      label: 'Dietas',
      value: isLoadingNutritionPlans
        ? '...'
        : nutritionPlanError
          ? '--'
          : String(nutritionPlans.length),
      detail: isLoadingNutritionPlans
        ? 'Carregando'
        : nutritionPlanError
          ? 'Não carregou'
          : nutritionPlans.length === 1
            ? 'plano cadastrado'
            : 'planos cadastrados',
      modifier: 'student-portal-summary-stat-diet',
    },
    {
      label: 'Última métrica',
      value: isLoadingMetrics
        ? '...'
        : metricError || !currentMetric
          ? '--'
          : formatMetricValue(currentMetric.weightKg, 'kg'),
      detail: isLoadingMetrics
        ? 'Carregando'
        : metricError
          ? 'Não carregou'
          : currentMetric
            ? formatObservationDate(currentMetric.recordedAt)
            : 'Sem registro',
      modifier: 'student-portal-summary-stat-metric',
    },
    {
      label: 'Mensagens',
      value: isLoadingObservations
        ? '...'
        : observationError
          ? '--'
          : String(observations.length),
      detail: isLoadingObservations
        ? 'Carregando'
        : observationError
          ? 'Não carregou'
          : observations.length === 1
            ? 'mensagem registrada'
            : 'mensagens registradas',
      modifier: 'student-portal-summary-stat-observation',
    },
  ];

  return (
    <div className="student-portal-shell">
      <main className="student-portal-page">
        <header className="student-portal-header">
          <div className="student-portal-brand" aria-label="Flex-It">
            <img className="student-portal-brand-mark" src="/Icone.png" alt="" aria-hidden="true" />
            <span>Flex-It</span>
          </div>

          <button className="student-portal-logout" onClick={onLogout} type="button">
            Sair
          </button>
        </header>

        <section className="student-portal-hero" aria-labelledby="student-portal-title">
          <div>
            <span className="student-portal-kicker">Área do aluno</span>
            <h1 id="student-portal-title">Olá, {firstName}</h1>
            <p>Acompanhe seu plano atual, orientações e principais indicadores da semana.</p>
          </div>

          <div className="student-portal-checkin" aria-label="Resumo do acompanhamento">
            <span>Check-in</span>
            <strong>Semana 08</strong>
            <small>Atualizado pelo profissional</small>
          </div>
        </section>

        <nav className="student-portal-tabs" aria-label="Áreas do portal">
          {STUDENT_PORTAL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                aria-controls="student-portal-panel"
                aria-pressed={isActive}
                className={`student-portal-tab${isActive ? ' student-portal-tab-active' : ''}`}
                id={`student-portal-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section
          aria-label={`Conteúdo de ${activeTabLabel}`}
          aria-labelledby={`student-portal-tab-${activeTab}`}
          className="student-portal-tab-panel"
          id="student-portal-panel"
        >
          {activeTab === 'summary' && (
            <section className="student-portal-summary" aria-label="Resumo do aluno">
              <div className="student-portal-summary-heading">
                <span className="student-portal-kicker">Resumo</span>
                <h2>Olá, {firstName}</h2>
                <p>Seu acompanhamento em números.</p>
              </div>

              <div className="student-portal-summary-grid">
                {summaryCards.map((card) => (
                  <article
                    className={`student-portal-summary-stat ${card.modifier}`}
                    key={card.label}
                  >
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <small>{card.detail}</small>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'workouts' && (
            <section className="student-portal-grid" aria-label="Treinos do aluno">
              <article className="student-portal-card student-portal-card-workout">
                <div className="student-portal-card-heading">
                  <span className="student-portal-kicker">Treinos atuais</span>
                  <h2>{workoutTitle}</h2>
                </div>

                <div className="student-portal-info-grid">
                  <span>{currentWorkout ? currentWorkout.type : 'Aguardando plano'}</span>
                  <span>{currentWorkout ? `${currentWorkout.durationMinutes} min` : '-- min'}</span>
                  <span>
                    {currentWorkout
                      ? `${currentWorkout.exercisesCount} exercícios`
                      : '-- exercícios'}
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
                          {workout.exercisesCount} exercícios
                        </span>

                        <WorkoutExerciseSummaryList workout={workout} />
                      </article>
                    ))
                  )}
                </div>
              </article>
            </section>
          )}

          {activeTab === 'nutrition' && (
            <section className="student-portal-grid" aria-label="Dietas do aluno">
              <article className="student-portal-card student-portal-card-diet">
                <div className="student-portal-card-heading">
                  <span className="student-portal-kicker">Dieta atual</span>
                  <h2>{nutritionPlanTitle}</h2>
                </div>

                <div className="student-portal-info-grid">
                  <span>
                    {currentNutritionPlan ? `${currentNutritionPlan.calories} kcal` : '-- kcal'}
                  </span>
                  <span>
                    {currentNutritionPlan
                      ? `${currentNutritionPlan.mealsCount} refeições`
                      : '-- refeições'}
                  </span>
                  <span>
                    {currentNutritionPlan ? currentNutritionPlan.objective : 'Aguardando plano'}
                  </span>
                </div>

                <div className="student-portal-progress">
                  <div>
                    <span>Planos cadastrados</span>
                    <strong>{nutritionPlans.length}</strong>
                  </div>
                  <div
                    className="student-portal-progress-track student-portal-progress-track-green"
                    aria-hidden="true"
                  >
                    <span style={{ width: `${nutritionPlanProgress}%` }} />
                  </div>
                </div>

                <p className="student-portal-card-note">{nutritionPlanNote}</p>

                <div className="student-portal-note-list">
                  {isLoadingNutritionPlans ? (
                    <p>Carregando planos alimentares...</p>
                  ) : nutritionPlanError ? (
                    <p>{nutritionPlanError}</p>
                  ) : nutritionPlans.length === 0 ? (
                    <p>Nenhum plano alimentar enviado pelo profissional ainda.</p>
                  ) : (
                    nutritionPlans.map((nutritionPlan) => (
                      <article className="student-portal-note-item" key={nutritionPlan.id}>
                        <p>
                          <strong>{nutritionPlan.name}</strong> - {nutritionPlan.objective}
                        </p>
                        <span>
                          {nutritionPlan.calories} kcal | {nutritionPlan.mealsCount} refeições |{' '}
                          {nutritionPlan.proteinGrams}g P / {nutritionPlan.carbsGrams}g C /{' '}
                          {nutritionPlan.fatGrams}g G
                        </span>

                        <NutritionMealSummaryList nutritionPlan={nutritionPlan} />

                        {nutritionPlan.notes && <p>{nutritionPlan.notes}</p>}
                      </article>
                    ))
                  )}
                </div>
              </article>
            </section>
          )}

          {activeTab === 'metrics' && (
            <section className="student-portal-grid" aria-label="Métricas do aluno">
              <article className="student-portal-card student-portal-card-metrics">
                <div className="student-portal-card-heading">
                  <span className="student-portal-kicker">Métricas principais</span>
                  <h2>{isLoadingMetrics ? 'Carregando métricas...' : 'Evolução recente'}</h2>
                </div>

                {metricError ? (
                  <p className="student-portal-card-note">{metricError}</p>
                ) : metrics.length === 0 && !isLoadingMetrics ? (
                  <p className="student-portal-card-note">
                    Seu profissional ainda não registrou métricas.
                  </p>
                ) : (
                  <>
                    <div className="student-portal-metric-grid">
                      {mainMetrics.map((metric) => (
                        <div key={metric.label}>
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                          <small>{metric.detail}</small>
                        </div>
                      ))}
                    </div>

                    <div className="student-portal-note-list">
                      {isLoadingMetrics ? (
                        <p>Carregando métricas...</p>
                      ) : (
                        metrics.slice(0, 4).map((metric) => (
                          <article className="student-portal-note-item" key={metric.id}>
                            <p>
                              <strong>{formatObservationDate(metric.recordedAt)}</strong>
                              {metric.notes ? ` - ${metric.notes}` : ''}
                            </p>
                            <span>
                              Peso {formatMetricValue(metric.weightKg, 'kg')} | IMC{' '}
                              {calculateBmi(metric.weightKg, metric.heightCm)}
                            </span>
                          </article>
                        ))
                      )}
                    </div>
                  </>
                )}
              </article>
            </section>
          )}

          {activeTab === 'observations' && (
            <section className="student-portal-grid" aria-label="Observações do aluno">
              <article className="student-portal-card student-portal-card-message">
                <div className="student-portal-card-heading">
                  <span className="student-portal-kicker">Comunicação</span>
                  <h2>Conversa com o profissional</h2>
                </div>

                <div className="student-portal-chat-thread-list">
                  {isLoadingObservations ? (
                    <p>Carregando mensagens...</p>
                  ) : observationError ? (
                    <p>{observationError}</p>
                  ) : observationThreads.length === 0 ? (
                    <p>Nenhum vínculo de aluno encontrado para comunicação.</p>
                  ) : (
                    observationThreads.map((thread) => (
                      <article className="student-portal-chat-thread" key={thread.studentId}>
                        {hasMultipleObservationThreads && (
                          <div className="student-portal-chat-thread-heading">
                            <strong>{getObservationThreadLabel(thread)}</strong>
                          </div>
                        )}

                        <div
                          className="student-portal-chat-list"
                          ref={(element) => {
                            observationThreadRefs.current[thread.studentId] = element;
                          }}
                        >
                          {thread.messages.length === 0 ? (
                            <p>Nenhuma mensagem registrada neste vínculo.</p>
                          ) : (
                            thread.messages.map((observation) => {
                              const senderRole = getObservationSenderRole(observation);

                              return (
                                <article
                                  className={`student-portal-chat-message student-portal-chat-message-${senderRole}`}
                                  key={observation.id}
                                >
                                  <p>{observation.message}</p>
                                  <span className="student-portal-chat-meta">
                                    <strong>{getObservationSenderLabel(observation)}</strong>
                                    <span>{formatObservationDate(observation.createdAt)}</span>
                                  </span>
                                </article>
                              );
                            })
                          )}
                        </div>

                        <form
                          className="student-portal-observation-form"
                          onSubmit={(event) => handleCreateObservation(event, thread.studentId)}
                        >
                          <label>
                            <span>Nova mensagem</span>
                            <textarea
                              className="student-detail-observation-textarea"
                              disabled={!thread.professionalId}
                              onInput={(event) =>
                                handleObservationMessageChange(
                                  thread.studentId,
                                  (event.target as HTMLTextAreaElement).value,
                                )
                              }
                              placeholder="Escreva um relato ou resposta para o profissional."
                              rows={3}
                              value={observationMessages[thread.studentId] ?? ''}
                            />
                          </label>

                          <button
                            className="dashboard-primary-button"
                            disabled={
                              savingObservationStudentId === thread.studentId ||
                              !thread.professionalId
                            }
                            type="submit"
                          >
                            {savingObservationStudentId === thread.studentId
                              ? 'Enviando...'
                              : 'Enviar mensagem'}
                          </button>

                          {observationFeedback[thread.studentId] && (
                            <p className="student-detail-observation-feedback">
                              {observationFeedback[thread.studentId]}
                            </p>
                          )}
                        </form>
                      </article>
                    ))
                  )}
                </div>
              </article>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

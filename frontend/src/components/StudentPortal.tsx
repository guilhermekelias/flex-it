import { useEffect, useState } from 'preact/hooks';
import {
  ApiRequestError,
  ApiUnauthorizedError,
  getMyNutritionPlans,
  getMyMetrics,
  getMyWorkouts,
  getMyObservations,
  type Metric,
  type NutritionPlan,
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

type StudentPortalTab = 'summary' | 'workouts' | 'nutrition' | 'metrics' | 'observations';

const STUDENT_PORTAL_TABS: Array<{ id: StudentPortalTab; label: string }> = [
  { id: 'summary', label: 'Resumo' },
  { id: 'workouts', label: 'Treinos' },
  { id: 'nutrition', label: 'Dietas' },
  { id: 'metrics', label: 'Metricas' },
  { id: 'observations', label: 'Observacoes' },
];

function getFirstName(name: string) {
  return name.trim().split(' ')[0] || 'aluno';
}

function formatMetricValue(value: number | null, unit: string) {
  if (value === null || !Number.isFinite(value)) {
    return '--';
  }

  return `${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })} ${unit}`;
}

function calculateBmi(weightKg: number | null, heightCm: number | null) {
  if (
    weightKg === null ||
    heightCm === null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return '--';
  }

  const heightMeters = heightCm / 100;
  return (weightKg / heightMeters ** 2).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

function getMetricSummary(metric: Metric | null) {
  return [
    {
      label: 'Peso',
      value: metric ? formatMetricValue(metric.weightKg, 'kg') : '--',
      detail: metric ? formatObservationDate(metric.recordedAt) : 'sem avaliacao',
    },
    {
      label: 'Gordura',
      value: metric ? formatMetricValue(metric.bodyFatPercentage, '%') : '--',
      detail: metric ? 'composicao corporal' : 'aguardando dados',
    },
    {
      label: 'IMC',
      value: metric ? calculateBmi(metric.weightKg, metric.heightCm) : '--',
      detail: metric ? 'calculado por peso e altura' : 'peso e altura pendentes',
    },
  ];
}

function getStructuredWorkoutExercises(workout: Workout) {
  return Array.isArray(workout.exercises)
    ? workout.exercises.filter((exercise) => exercise.name.trim())
    : [];
}

function getExerciseMeta(exercise: ReturnType<typeof getStructuredWorkoutExercises>[number]) {
  const meta: string[] = [];

  if (exercise.sets) {
    meta.push(`${exercise.sets} series`);
  }

  if (exercise.reps) {
    meta.push(`${exercise.reps} reps`);
  }

  if (exercise.rest) {
    meta.push(`${exercise.rest} descanso`);
  }

  return meta.join(' | ');
}

function getStructuredNutritionMeals(nutritionPlan: NutritionPlan) {
  return Array.isArray(nutritionPlan.meals)
    ? nutritionPlan.meals
        .map((meal) => ({
          ...meal,
          foods: Array.isArray(meal.foods)
            ? meal.foods.filter((food) => food.name.trim())
            : [],
        }))
        .filter((meal) => meal.name.trim() && meal.foods.length > 0)
    : [];
}

function getNutritionFoodMeta(
  food: ReturnType<typeof getStructuredNutritionMeals>[number]['foods'][number],
) {
  const meta: string[] = [];

  if (food.quantity) {
    meta.push(food.quantity);
  }

  if (typeof food.calories === 'number' && Number.isFinite(food.calories)) {
    meta.push(`${food.calories} kcal`);
  }

  return meta.join(' | ');
}

export function StudentPortal({ user, onLogout, onSessionExpired }: StudentPortalProps) {
  const firstName = getFirstName(user.name);
  const [activeTab, setActiveTab] = useState<StudentPortalTab>('summary');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');
  const [observations, setObservations] = useState<Observation[]>([]);
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
            setWorkoutError('Nenhum cadastro de aluno foi encontrado para este usuario.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setWorkoutError('Seu usuario nao tem permissao para visualizar estes treinos.');
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
              'Seu usuario nao tem permissao para visualizar estas observacoes.',
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
            setNutritionPlanError('Nenhum cadastro de aluno foi encontrado para este usuario.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setNutritionPlanError(
              'Seu usuario nao tem permissao para visualizar estes planos alimentares.',
            );
          } else {
            setNutritionPlanError('Nao foi possivel carregar seus planos alimentares.');
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
            setMetricError('Nenhum cadastro de aluno foi encontrado para este usuario.');
          } else if (error instanceof ApiRequestError && error.status === 403) {
            setMetricError('Seu usuario nao tem permissao para visualizar estas metricas.');
          } else {
            setMetricError('Nao foi possivel carregar suas metricas.');
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
  const currentMetric = metrics[0] ?? null;
  const mainMetrics = getMetricSummary(currentMetric);
  const currentNutritionPlan = nutritionPlans[0] ?? null;
  const nutritionPlanProgress = nutritionPlans.length > 0 ? 100 : 0;
  const nutritionPlanTitle = isLoadingNutritionPlans
    ? 'Carregando dieta...'
    : currentNutritionPlan
      ? currentNutritionPlan.name
      : 'Nenhum plano alimentar';
  const nutritionPlanNote = currentNutritionPlan
    ? `Atualizado em ${formatObservationDate(currentNutritionPlan.updatedAt)}`
    : nutritionPlanError || 'Seu profissional ainda nao cadastrou planos alimentares.';
  const activeTabLabel =
    STUDENT_PORTAL_TABS.find((tab) => tab.id === activeTab)?.label ?? 'Resumo';
  const summaryCards = [
    {
      label: 'Treinos',
      value: isLoadingWorkouts ? '...' : workoutError ? '--' : String(workouts.length),
      detail: isLoadingWorkouts
        ? 'Carregando'
        : workoutError
          ? 'Nao carregou'
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
          ? 'Nao carregou'
          : nutritionPlans.length === 1
            ? 'plano cadastrado'
            : 'planos cadastrados',
      modifier: 'student-portal-summary-stat-diet',
    },
    {
      label: 'Ultima metrica',
      value: isLoadingMetrics
        ? '...'
        : metricError || !currentMetric
          ? '--'
          : formatMetricValue(currentMetric.weightKg, 'kg'),
      detail: isLoadingMetrics
        ? 'Carregando'
        : metricError
          ? 'Nao carregou'
          : currentMetric
            ? formatObservationDate(currentMetric.recordedAt)
            : 'Sem registro',
      modifier: 'student-portal-summary-stat-metric',
    },
    {
      label: 'Observacoes',
      value: isLoadingObservations
        ? '...'
        : observationError
          ? '--'
          : String(observations.length),
      detail: isLoadingObservations
        ? 'Carregando'
        : observationError
          ? 'Nao carregou'
          : observations.length === 1
            ? 'mensagem recebida'
            : 'mensagens recebidas',
      modifier: 'student-portal-summary-stat-observation',
    },
  ];

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

        <nav className="student-portal-tabs" aria-label="Areas do portal">
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
          aria-label={`Conteudo de ${activeTabLabel}`}
          aria-labelledby={`student-portal-tab-${activeTab}`}
          className="student-portal-tab-panel"
          id="student-portal-panel"
        >
          {activeTab === 'summary' && (
            <section className="student-portal-summary" aria-label="Resumo do aluno">
              <div className="student-portal-summary-heading">
                <span className="student-portal-kicker">Resumo</span>
                <h2>Ola, {firstName}</h2>
                <p>Seu acompanhamento em numeros.</p>
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
                      ? `${currentWorkout.exercisesCount} exercicios`
                      : '-- exercicios'}
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
                    workouts.map((workout) => {
                      const workoutExercises = getStructuredWorkoutExercises(workout);

                      return (
                        <article className="student-portal-note-item" key={workout.id}>
                          <p>
                            <strong>{workout.name}</strong>
                            {workout.description ? ` - ${workout.description}` : ''}
                          </p>
                          <span>
                            {workout.type} | {workout.durationMinutes} min |{' '}
                            {workout.exercisesCount} exercicios
                          </span>

                          {workoutExercises.length > 0 && (
                            <div className="workout-exercise-summary-list">
                              {workoutExercises.map((exercise, index) => {
                                const exerciseMeta = getExerciseMeta(exercise);

                                return (
                                  <div
                                    className="workout-exercise-summary-item"
                                    key={`${exercise.name}-${index}`}
                                  >
                                    <strong>{exercise.name}</strong>
                                    {exerciseMeta && <span>{exerciseMeta}</span>}
                                    {exercise.notes && <p>{exercise.notes}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </article>
                      );
                    })
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
                      ? `${currentNutritionPlan.mealsCount} refeicoes`
                      : '-- refeicoes'}
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
                    nutritionPlans.map((nutritionPlan) => {
                      const nutritionPlanMeals = getStructuredNutritionMeals(nutritionPlan);

                      return (
                        <article className="student-portal-note-item" key={nutritionPlan.id}>
                          <p>
                            <strong>{nutritionPlan.name}</strong> - {nutritionPlan.objective}
                          </p>
                          <span>
                            {nutritionPlan.calories} kcal | {nutritionPlan.mealsCount}{' '}
                            refeicoes | {nutritionPlan.proteinGrams}g P /{' '}
                            {nutritionPlan.carbsGrams}g C / {nutritionPlan.fatGrams}g G
                          </span>

                          {nutritionPlanMeals.length > 0 && (
                            <div className="nutrition-meal-summary-list">
                              {nutritionPlanMeals.map((meal, mealIndex) => (
                                <section
                                  className="nutrition-meal-summary-item"
                                  key={`${meal.name}-${mealIndex}`}
                                >
                                  <div className="nutrition-meal-summary-heading">
                                    <strong>{meal.name}</strong>
                                    {meal.time && <span>{meal.time}</span>}
                                  </div>

                                  <div className="nutrition-food-summary-list">
                                    {meal.foods.map((food, foodIndex) => {
                                      const foodMeta = getNutritionFoodMeta(food);

                                      return (
                                        <div
                                          className="nutrition-food-summary-item"
                                          key={`${food.name}-${foodIndex}`}
                                        >
                                          <strong>{food.name}</strong>
                                          {foodMeta && <span>{foodMeta}</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </section>
                              ))}
                            </div>
                          )}

                          {nutritionPlan.notes && <p>{nutritionPlan.notes}</p>}
                        </article>
                      );
                    })
                  )}
                </div>
              </article>
            </section>
          )}

          {activeTab === 'metrics' && (
            <section className="student-portal-grid" aria-label="Metricas do aluno">
              <article className="student-portal-card student-portal-card-metrics">
                <div className="student-portal-card-heading">
                  <span className="student-portal-kicker">Metricas principais</span>
                  <h2>{isLoadingMetrics ? 'Carregando metricas...' : 'Evolucao recente'}</h2>
                </div>

                {metricError ? (
                  <p className="student-portal-card-note">{metricError}</p>
                ) : metrics.length === 0 && !isLoadingMetrics ? (
                  <p className="student-portal-card-note">
                    Seu profissional ainda nao registrou metricas.
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
                        <p>Carregando metricas...</p>
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
            <section className="student-portal-grid" aria-label="Observacoes do aluno">
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
          )}
        </section>
      </main>
    </div>
  );
}

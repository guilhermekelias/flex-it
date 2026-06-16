import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import {
  ApiUnauthorizedError,
  createStudentNutritionPlan,
  createStudentObservation,
  createStudentMetric,
  createStudentWorkout,
  deleteStudentNutritionPlan,
  deleteStudentMetric,
  deleteStudentWorkout,
  getStudentNutritionPlans,
  getStudentMetrics,
  getStudentObservations,
  getStudentWorkouts,
  updateStudentNutritionPlan,
  updateStudentMetric,
  updateStudentWorkout,
  type Metric,
  type MetricPayload,
  type NutritionPlan,
  type NutritionPlanPayload,
  type Observation,
  type Workout,
  type WorkoutPayload,
} from '../services/api';
import { formatObservationDate } from '../utils/formatObservationDate';
import {
  createEmptyWorkoutFormValues,
  getWorkoutFormValues,
  WorkoutForm,
  type WorkoutFormValues,
} from './WorkoutForm';
import {
  createEmptyMetricFormValues,
  getMetricFormValues,
  MetricForm,
  type MetricFormValues,
} from './MetricForm';
import {
  createEmptyNutritionPlanFormValues,
  getNutritionPlanFormValues,
  NutritionPlanForm,
  type NutritionPlanFormValues,
} from './NutritionPlanForm';

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
  onMetricsChanged?: () => void;
  onNutritionPlansChanged?: () => void;
  onWorkoutsChanged?: () => void;
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

export function StudentDetail({
  student,
  onBack,
  onSessionExpired,
  onMetricsChanged,
  onNutritionPlansChanged,
  onWorkoutsChanged,
}: StudentDetailProps) {
  const displayGoal = getDisplayGoal(student.goal);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutFormValues, setWorkoutFormValues] = useState<WorkoutFormValues>(
    createEmptyWorkoutFormValues,
  );
  const [workoutFeedback, setWorkoutFeedback] = useState('');
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [removingWorkoutId, setRemovingWorkoutId] = useState<number | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [observationMessage, setObservationMessage] = useState('');
  const [observationFeedback, setObservationFeedback] = useState('');
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [isSavingObservation, setIsSavingObservation] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricFormValues, setMetricFormValues] = useState<MetricFormValues>(
    createEmptyMetricFormValues,
  );
  const [metricFeedback, setMetricFeedback] = useState('');
  const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isSavingMetric, setIsSavingMetric] = useState(false);
  const [removingMetricId, setRemovingMetricId] = useState<number | null>(null);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [nutritionPlanFormValues, setNutritionPlanFormValues] =
    useState<NutritionPlanFormValues>(createEmptyNutritionPlanFormValues);
  const [nutritionPlanFeedback, setNutritionPlanFeedback] = useState('');
  const [editingNutritionPlanId, setEditingNutritionPlanId] = useState<number | null>(null);
  const [isLoadingNutritionPlans, setIsLoadingNutritionPlans] = useState(false);
  const [isSavingNutritionPlan, setIsSavingNutritionPlan] = useState(false);
  const [removingNutritionPlanId, setRemovingNutritionPlanId] = useState<number | null>(null);

  useEffect(() => {
    let isCurrentStudent = true;

    const loadWorkouts = async () => {
      setIsLoadingWorkouts(true);
      setWorkoutFeedback('');
      setEditingWorkoutId(null);
      setWorkoutFormValues(createEmptyWorkoutFormValues());

      try {
        const data = await getStudentWorkouts(student.id);

        if (isCurrentStudent) {
          setWorkouts(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentStudent) {
          setWorkoutFeedback('Nao foi possivel carregar os treinos.');
        }
      } finally {
        if (isCurrentStudent) {
          setIsLoadingWorkouts(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      isCurrentStudent = false;
    };
  }, [student.id]);

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

  useEffect(() => {
    let isCurrentStudent = true;

    const loadNutritionPlans = async () => {
      setIsLoadingNutritionPlans(true);
      setNutritionPlanFeedback('');
      setEditingNutritionPlanId(null);
      setNutritionPlanFormValues(createEmptyNutritionPlanFormValues());

      try {
        const data = await getStudentNutritionPlans(student.id);

        if (isCurrentStudent) {
          setNutritionPlans(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentStudent) {
          setNutritionPlanFeedback('Nao foi possivel carregar os planos alimentares.');
        }
      } finally {
        if (isCurrentStudent) {
          setIsLoadingNutritionPlans(false);
        }
      }
    };

    loadNutritionPlans();

    return () => {
      isCurrentStudent = false;
    };
  }, [student.id]);

  useEffect(() => {
    let isCurrentStudent = true;

    const loadMetrics = async () => {
      setIsLoadingMetrics(true);
      setMetricFeedback('');
      setEditingMetricId(null);
      setMetricFormValues(createEmptyMetricFormValues());

      try {
        const data = await getStudentMetrics(student.id);

        if (isCurrentStudent) {
          setMetrics(data);
        }
      } catch (error) {
        if (error instanceof ApiUnauthorizedError) {
          onSessionExpired();
          return;
        }

        console.error(error);

        if (isCurrentStudent) {
          setMetricFeedback('Nao foi possivel carregar as metricas.');
        }
      } finally {
        if (isCurrentStudent) {
          setIsLoadingMetrics(false);
        }
      }
    };

    loadMetrics();

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

  const resetWorkoutForm = () => {
    setWorkoutFormValues(createEmptyWorkoutFormValues());
    setEditingWorkoutId(null);
  };

  const handleSubmitWorkout = async (workoutData: WorkoutPayload) => {
    setIsSavingWorkout(true);
    setWorkoutFeedback('');

    try {
      if (editingWorkoutId !== null) {
        const updatedWorkout = await updateStudentWorkout(
          student.id,
          editingWorkoutId,
          workoutData,
        );

        setWorkouts((currentWorkouts) =>
          currentWorkouts.map((workout) =>
            workout.id === updatedWorkout.id ? updatedWorkout : workout,
          ),
        );
        setWorkoutFeedback('Treino atualizado.');
      } else {
        const newWorkout = await createStudentWorkout(student.id, workoutData);
        setWorkouts((currentWorkouts) => [newWorkout, ...currentWorkouts]);
        setWorkoutFeedback('Treino criado.');
      }

      resetWorkoutForm();
      onWorkoutsChanged?.();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setWorkoutFeedback('Nao foi possivel salvar o treino.');
    } finally {
      setIsSavingWorkout(false);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutFormValues(getWorkoutFormValues(workout));
    setWorkoutFeedback('Editando treino selecionado.');
  };

  const handleRemoveWorkout = async (workoutId: number) => {
    setRemovingWorkoutId(workoutId);
    setWorkoutFeedback('');

    try {
      await deleteStudentWorkout(student.id, workoutId);
      setWorkouts((currentWorkouts) =>
        currentWorkouts.filter((workout) => workout.id !== workoutId),
      );

      if (editingWorkoutId === workoutId) {
        resetWorkoutForm();
      }

      setWorkoutFeedback('Treino removido.');
      onWorkoutsChanged?.();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setWorkoutFeedback('Nao foi possivel remover o treino.');
    } finally {
      setRemovingWorkoutId(null);
    }
  };

  const resetMetricForm = () => {
    setMetricFormValues(createEmptyMetricFormValues());
    setEditingMetricId(null);
  };

  const resetNutritionPlanForm = () => {
    setNutritionPlanFormValues(createEmptyNutritionPlanFormValues());
    setEditingNutritionPlanId(null);
  };

  const handleSubmitNutritionPlan = async (nutritionPlanData: NutritionPlanPayload) => {
    setIsSavingNutritionPlan(true);
    setNutritionPlanFeedback('');

    try {
      if (editingNutritionPlanId !== null) {
        const updatedNutritionPlan = await updateStudentNutritionPlan(
          student.id,
          editingNutritionPlanId,
          nutritionPlanData,
        );

        setNutritionPlans((currentNutritionPlans) =>
          currentNutritionPlans.map((nutritionPlan) =>
            nutritionPlan.id === updatedNutritionPlan.id ? updatedNutritionPlan : nutritionPlan,
          ),
        );
        setNutritionPlanFeedback('Plano alimentar atualizado.');
      } else {
        const newNutritionPlan = await createStudentNutritionPlan(student.id, nutritionPlanData);
        setNutritionPlans((currentNutritionPlans) => [
          newNutritionPlan,
          ...currentNutritionPlans,
        ]);
        setNutritionPlanFeedback('Plano alimentar criado.');
      }

      resetNutritionPlanForm();
      onNutritionPlansChanged?.();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setNutritionPlanFeedback('Nao foi possivel salvar o plano alimentar.');
    } finally {
      setIsSavingNutritionPlan(false);
    }
  };

  const handleEditNutritionPlan = (nutritionPlan: NutritionPlan) => {
    setEditingNutritionPlanId(nutritionPlan.id);
    setNutritionPlanFormValues(getNutritionPlanFormValues(nutritionPlan));
    setNutritionPlanFeedback('Editando plano alimentar selecionado.');
  };

  const handleRemoveNutritionPlan = async (nutritionPlanId: number) => {
    setRemovingNutritionPlanId(nutritionPlanId);
    setNutritionPlanFeedback('');

    try {
      await deleteStudentNutritionPlan(student.id, nutritionPlanId);
      setNutritionPlans((currentNutritionPlans) =>
        currentNutritionPlans.filter((nutritionPlan) => nutritionPlan.id !== nutritionPlanId),
      );

      if (editingNutritionPlanId === nutritionPlanId) {
        resetNutritionPlanForm();
      }

      setNutritionPlanFeedback('Plano alimentar removido.');
      onNutritionPlansChanged?.();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setNutritionPlanFeedback('Nao foi possivel remover o plano alimentar.');
    } finally {
      setRemovingNutritionPlanId(null);
    }
  };

  const handleSubmitMetric = async (metricData: MetricPayload) => {
    setIsSavingMetric(true);
    setMetricFeedback('');

    try {
      if (editingMetricId !== null) {
        const updatedMetric = await updateStudentMetric(student.id, editingMetricId, metricData);

        setMetrics((currentMetrics) =>
          currentMetrics.map((metric) =>
            metric.id === updatedMetric.id ? updatedMetric : metric,
          ),
        );
        setMetricFeedback('Metrica atualizada.');
      } else {
        const newMetric = await createStudentMetric(student.id, metricData);
        setMetrics((currentMetrics) => [newMetric, ...currentMetrics]);
        setMetricFeedback('Metrica registrada.');
      }

      resetMetricForm();
      onMetricsChanged?.();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setMetricFeedback('Nao foi possivel salvar a metrica.');
    } finally {
      setIsSavingMetric(false);
    }
  };

  const handleEditMetric = (metric: Metric) => {
    setEditingMetricId(metric.id);
    setMetricFormValues(getMetricFormValues(metric));
    setMetricFeedback('Editando metrica selecionada.');
  };

  const handleRemoveMetric = async (metricId: number) => {
    setRemovingMetricId(metricId);
    setMetricFeedback('');

    try {
      await deleteStudentMetric(student.id, metricId);
      setMetrics((currentMetrics) => currentMetrics.filter((metric) => metric.id !== metricId));

      if (editingMetricId === metricId) {
        resetMetricForm();
      }

      setMetricFeedback('Metrica removida.');
      onMetricsChanged?.();
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setMetricFeedback('Nao foi possivel remover a metrica.');
    } finally {
      setRemovingMetricId(null);
    }
  };

  const latestMetric = metrics[0] ?? null;
  const latestNutritionPlan = nutritionPlans[0] ?? null;

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
            <span className="dashboard-section-kicker">Treinos</span>
            <h2>{editingWorkoutId !== null ? 'Editar treino' : 'Novo treino'}</h2>
          </div>

          <WorkoutForm
            isEditing={editingWorkoutId !== null}
            isSubmitting={isSavingWorkout}
            onCancelEdit={resetWorkoutForm}
            onSubmit={handleSubmitWorkout}
            onValuesChange={setWorkoutFormValues}
            values={workoutFormValues}
          />

          {workoutFeedback && (
            <p className="student-detail-observation-feedback">{workoutFeedback}</p>
          )}

          <div className="student-detail-note-list">
            {isLoadingWorkouts ? (
              <p>Carregando treinos...</p>
            ) : workouts.length === 0 ? (
              <p>Nenhum treino cadastrado para este aluno.</p>
            ) : (
              workouts.map((workout) => {
                const workoutExercises = getStructuredWorkoutExercises(workout);

                return (
                  <article className="student-detail-note-item" key={workout.id}>
                    <strong>{workout.name}</strong>
                    {workout.description && <p>{workout.description}</p>}

                    <div className="student-detail-card-meta">
                      <span>{workout.type}</span>
                      <span>{workout.durationMinutes} min</span>
                      <span>{workout.exercisesCount} exercicios</span>
                    </div>

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

                    <span>Atualizado em {formatObservationDate(workout.updatedAt)}</span>

                    <div className="student-card-actions">
                      <button
                        className="student-detail-button"
                        onClick={() => handleEditWorkout(workout)}
                        type="button"
                      >
                        Editar
                      </button>

                      <button
                        className="student-remove-button"
                        disabled={removingWorkoutId === workout.id}
                        onClick={() => handleRemoveWorkout(workout.id)}
                        type="button"
                      >
                        {removingWorkoutId === workout.id ? 'Removendo...' : 'Remover'}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-diet">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Dietas</span>
            <h2>{editingNutritionPlanId !== null ? 'Editar plano' : 'Novo plano alimentar'}</h2>
          </div>

          <NutritionPlanForm
            isEditing={editingNutritionPlanId !== null}
            isSubmitting={isSavingNutritionPlan}
            onCancelEdit={resetNutritionPlanForm}
            onSubmit={handleSubmitNutritionPlan}
            onValuesChange={setNutritionPlanFormValues}
            values={nutritionPlanFormValues}
          />

          {nutritionPlanFeedback && (
            <p className="student-detail-observation-feedback">{nutritionPlanFeedback}</p>
          )}

          {latestNutritionPlan && (
            <div className="student-detail-nutrition-grid">
              <div>
                <span>Calorias</span>
                <strong>{latestNutritionPlan.calories} kcal</strong>
              </div>
              <div>
                <span>Refeicoes</span>
                <strong>{latestNutritionPlan.mealsCount} ao dia</strong>
              </div>
              <div>
                <span>Foco</span>
                <strong>{latestNutritionPlan.objective}</strong>
              </div>
            </div>
          )}

          <div className="student-detail-note-list">
            {isLoadingNutritionPlans ? (
              <p>Carregando planos alimentares...</p>
            ) : nutritionPlans.length === 0 ? (
              <p>Nenhum plano alimentar cadastrado para este aluno.</p>
            ) : (
              nutritionPlans.map((nutritionPlan) => (
                <article className="student-detail-note-item" key={nutritionPlan.id}>
                  <strong>{nutritionPlan.name}</strong>
                  <p>{nutritionPlan.objective}</p>

                  <div className="student-detail-card-meta">
                    <span>{nutritionPlan.calories} kcal</span>
                    <span>{nutritionPlan.mealsCount} refeicoes</span>
                    <span>{nutritionPlan.proteinGrams}g proteinas</span>
                  </div>

                  <div className="student-detail-card-meta">
                    <span>{nutritionPlan.carbsGrams}g carboidratos</span>
                    <span>{nutritionPlan.fatGrams}g gorduras</span>
                    <span>{formatObservationDate(nutritionPlan.updatedAt)}</span>
                  </div>

                  {nutritionPlan.notes && <p>{nutritionPlan.notes}</p>}

                  <span>Atualizado em {formatObservationDate(nutritionPlan.updatedAt)}</span>

                  <div className="student-card-actions">
                    <button
                      className="student-detail-button"
                      onClick={() => handleEditNutritionPlan(nutritionPlan)}
                      type="button"
                    >
                      Editar
                    </button>

                    <button
                      className="student-remove-button"
                      disabled={removingNutritionPlanId === nutritionPlan.id}
                      onClick={() => handleRemoveNutritionPlan(nutritionPlan.id)}
                      type="button"
                    >
                      {removingNutritionPlanId === nutritionPlan.id ? 'Removendo...' : 'Remover'}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-metrics">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Metricas</span>
            <h2>{editingMetricId !== null ? 'Editar metrica' : 'Nova metrica'}</h2>
          </div>

          <MetricForm
            isEditing={editingMetricId !== null}
            isSubmitting={isSavingMetric}
            onCancelEdit={resetMetricForm}
            onSubmit={handleSubmitMetric}
            onValuesChange={setMetricFormValues}
            values={metricFormValues}
          />

          {metricFeedback && (
            <p className="student-detail-observation-feedback">{metricFeedback}</p>
          )}

          <div className="student-detail-metric-grid">
            <div>
              <span>Peso</span>
              <strong>{latestMetric ? formatMetricValue(latestMetric.weightKg, 'kg') : '--'}</strong>
            </div>
            <div>
              <span>Gordura</span>
              <strong>
                {latestMetric ? formatMetricValue(latestMetric.bodyFatPercentage, '%') : '--'}
              </strong>
            </div>
            <div>
              <span>IMC</span>
              <strong>
                {latestMetric ? calculateBmi(latestMetric.weightKg, latestMetric.heightCm) : '--'}
              </strong>
            </div>
          </div>

          <div className="student-detail-note-list">
            {isLoadingMetrics ? (
              <p>Carregando metricas...</p>
            ) : metrics.length === 0 ? (
              <p>Nenhuma metrica cadastrada para este aluno.</p>
            ) : (
              metrics.map((metric) => (
                <article className="student-detail-note-item" key={metric.id}>
                  <strong>Avaliacao de {formatObservationDate(metric.recordedAt)}</strong>

                  <div className="student-detail-card-meta">
                    <span>Peso {formatMetricValue(metric.weightKg, 'kg')}</span>
                    <span>Gordura {formatMetricValue(metric.bodyFatPercentage, '%')}</span>
                    <span>IMC {calculateBmi(metric.weightKg, metric.heightCm)}</span>
                  </div>

                  <div className="student-detail-card-meta">
                    <span>Altura {formatMetricValue(metric.heightCm, 'cm')}</span>
                    <span>Massa {formatMetricValue(metric.muscleMassKg, 'kg')}</span>
                    <span>{formatObservationDate(metric.recordedAt)}</span>
                  </div>

                  {metric.notes && <p>{metric.notes}</p>}

                  <span>Atualizado em {formatObservationDate(metric.updatedAt)}</span>

                  <div className="student-card-actions">
                    <button
                      className="student-detail-button"
                      onClick={() => handleEditMetric(metric)}
                      type="button"
                    >
                      Editar
                    </button>

                    <button
                      className="student-remove-button"
                      disabled={removingMetricId === metric.id}
                      onClick={() => handleRemoveMetric(metric.id)}
                      type="button"
                    >
                      {removingMetricId === metric.id ? 'Removendo...' : 'Remover'}
                    </button>
                  </div>
                </article>
              ))
            )}
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

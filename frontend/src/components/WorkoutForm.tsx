import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { Workout, WorkoutExercise, WorkoutPayload } from '../services/api';

export type WorkoutExerciseFormValues = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
};

export type WorkoutFormValues = {
  name: string;
  description: string;
  type: string;
  durationMinutes: string;
  exercisesCount: string;
  exercises: WorkoutExerciseFormValues[];
  usesStructuredExercises: boolean;
};

type WorkoutFormProps = {
  values: WorkoutFormValues;
  isEditing: boolean;
  isSubmitting: boolean;
  onValuesChange: (values: WorkoutFormValues) => void;
  onSubmit: (workoutData: WorkoutPayload) => void;
  onCancelEdit: () => void;
};

type WorkoutTextField = 'name' | 'description' | 'type' | 'durationMinutes' | 'exercisesCount';

function createEmptyExerciseFormValues(): WorkoutExerciseFormValues {
  return {
    name: '',
    sets: '',
    reps: '',
    rest: '',
    notes: '',
  };
}

function getWorkoutExercises(workout: Workout): WorkoutExercise[] {
  return Array.isArray(workout.exercises)
    ? workout.exercises.filter((exercise) => exercise.name.trim())
    : [];
}

export function createEmptyWorkoutFormValues(): WorkoutFormValues {
  return {
    name: '',
    description: '',
    type: '',
    durationMinutes: '',
    exercisesCount: '',
    exercises: [createEmptyExerciseFormValues()],
    usesStructuredExercises: true,
  };
}

export function getWorkoutFormValues(workout: Workout): WorkoutFormValues {
  const exercises = getWorkoutExercises(workout);

  return {
    name: workout.name,
    description: workout.description || '',
    type: workout.type,
    durationMinutes: String(workout.durationMinutes),
    exercisesCount: String(workout.exercisesCount),
    exercises:
      exercises.length > 0
        ? exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets ? String(exercise.sets) : '',
            reps: exercise.reps || '',
            rest: exercise.rest || '',
            notes: exercise.notes || '',
          }))
        : [],
    usesStructuredExercises: exercises.length > 0,
  };
}

export function WorkoutForm({
  values,
  isEditing,
  isSubmitting,
  onValuesChange,
  onSubmit,
  onCancelEdit,
}: WorkoutFormProps) {
  const [formError, setFormError] = useState('');

  const updateValue = (field: WorkoutTextField, value: string) => {
    setFormError('');
    onValuesChange({
      ...values,
      [field]: value,
    });
  };

  const updateExerciseValue = (
    index: number,
    field: keyof WorkoutExerciseFormValues,
    value: string,
  ) => {
    setFormError('');
    onValuesChange({
      ...values,
      usesStructuredExercises: true,
      exercises: values.exercises.map((exercise, currentIndex) =>
        currentIndex === index
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise,
      ),
    });
  };

  const addExercise = () => {
    setFormError('');
    onValuesChange({
      ...values,
      usesStructuredExercises: true,
      exercises: [...values.exercises, createEmptyExerciseFormValues()],
    });
  };

  const removeExercise = (index: number) => {
    setFormError('');

    const remainingExercises = values.exercises.filter(
      (_exercise, currentIndex) => currentIndex !== index,
    );

    onValuesChange({
      ...values,
      usesStructuredExercises: true,
      exercises:
        remainingExercises.length > 0
          ? remainingExercises
          : [createEmptyExerciseFormValues()],
    });
  };

  const normalizeExercises = (): WorkoutExercise[] | null => {
    const normalizedExercises: WorkoutExercise[] = [];

    for (const [index, exercise] of values.exercises.entries()) {
      const name = exercise.name.trim();
      const sets = exercise.sets.trim();
      const reps = exercise.reps.trim();
      const rest = exercise.rest.trim();
      const notes = exercise.notes.trim();
      const hasAnyValue = Boolean(name || sets || reps || rest || notes);

      if (!hasAnyValue) {
        continue;
      }

      if (!name) {
        setFormError(`Informe o nome do exercício ${index + 1}.`);
        return null;
      }

      const setsValue = sets ? Number(sets) : null;

      if (setsValue !== null && (!Number.isInteger(setsValue) || setsValue <= 0)) {
        setFormError(`Séries do exercício ${index + 1} devem ser um número positivo.`);
        return null;
      }

      if (rest.length > 40) {
        setFormError(`Descanso do exercício ${index + 1} deve ser curto.`);
        return null;
      }

      normalizedExercises.push({
        name,
        sets: setsValue,
        reps: reps || null,
        rest: rest || null,
        notes: notes || null,
      });
    }

    return normalizedExercises;
  };

  const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault();

    const name = values.name.trim();
    const type = values.type.trim();
    const durationMinutes = Number(values.durationMinutes);

    if (!name || !type || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      setFormError('Preencha nome, tipo e duração com valores válidos.');
      return;
    }

    const normalizedExercises = normalizeExercises();

    if (!normalizedExercises) {
      return;
    }

    if (!isEditing && normalizedExercises.length === 0) {
      setFormError('Adicione pelo menos um exercício ao treino.');
      return;
    }

    const description = values.description.trim();
    const workoutData: WorkoutPayload = {
      name,
      description: description || null,
      type,
      durationMinutes,
    };

    if (values.usesStructuredExercises || normalizedExercises.length > 0) {
      workoutData.exercises = normalizedExercises;
      workoutData.exercisesCount = normalizedExercises.length;
    } else {
      const legacyExercisesCount = Number(values.exercisesCount);

      if (!Number.isInteger(legacyExercisesCount) || legacyExercisesCount < 0) {
        setFormError('Quantidade de exercícios deve ser zero ou maior.');
        return;
      }

      workoutData.exercisesCount = legacyExercisesCount;
    }

    onSubmit(workoutData);
  };

  return (
    <form className="student-form workout-form" onSubmit={handleSubmit}>
      <label>
        <span>Nome do treino</span>
        <input
          onInput={(event) => updateValue('name', (event.target as HTMLInputElement).value)}
          placeholder="Ex: Treino A"
          required
          type="text"
          value={values.name}
        />
      </label>

      <label>
        <span>Descrição</span>
        <input
          onInput={(event) =>
            updateValue('description', (event.target as HTMLInputElement).value)
          }
          placeholder="Orientação geral do treino"
          type="text"
          value={values.description}
        />
      </label>

      <label>
        <span>Tipo</span>
        <input
          onInput={(event) => updateValue('type', (event.target as HTMLInputElement).value)}
          placeholder="Hipertrofia, força, cardio"
          required
          type="text"
          value={values.type}
        />
      </label>

      <label>
        <span>Duração (em minutos)</span>
        <input
          min="1"
          onInput={(event) =>
            updateValue('durationMinutes', (event.target as HTMLInputElement).value)
          }
          placeholder="60"
          required
          type="number"
          value={values.durationMinutes}
        />
      </label>

      <section className="workout-exercises-section" aria-labelledby="workout-exercises-title">
        <div className="workout-exercises-heading">
          <div>
            <span id="workout-exercises-title">Exercícios</span>
            <small>Monte a lista do dia com séries, repetições e descanso.</small>
          </div>

          <button className="workout-exercise-add-button" onClick={addExercise} type="button">
            + Adicionar
          </button>
        </div>

        <div className="workout-exercise-list">
          {values.exercises.map((exercise, index) => (
            <article className="workout-exercise-item" key={index}>
              <div className="workout-exercise-item-heading">
                <span className="workout-exercise-index" aria-label={`Exercício ${index + 1}`}>
                  {index + 1}
                </span>

                <label className="workout-exercise-name-field">
                  <span>Nome do exercício</span>
                  <input
                    onInput={(event) =>
                      updateExerciseValue(index, 'name', (event.target as HTMLInputElement).value)
                    }
                    placeholder="Nome do exercício"
                    type="text"
                    value={exercise.name}
                  />
                </label>

                <button
                  className="workout-exercise-remove-button"
                  onClick={() => removeExercise(index)}
                  type="button"
                >
                  Remover
                </button>
              </div>

              <div className="workout-exercise-grid">
                <label>
                  <span>Séries</span>
                  <input
                    min="1"
                    onInput={(event) =>
                      updateExerciseValue(index, 'sets', (event.target as HTMLInputElement).value)
                    }
                    placeholder="3"
                    type="number"
                    value={exercise.sets}
                  />
                </label>

                <label>
                  <span>Reps</span>
                  <input
                    onInput={(event) =>
                      updateExerciseValue(index, 'reps', (event.target as HTMLInputElement).value)
                    }
                    placeholder="12"
                    type="text"
                    value={exercise.reps}
                  />
                </label>

                <label>
                  <span>Descanso</span>
                  <input
                    onInput={(event) =>
                      updateExerciseValue(index, 'rest', (event.target as HTMLInputElement).value)
                    }
                    placeholder="60s"
                    type="text"
                    value={exercise.rest}
                  />
                </label>
              </div>

              <label>
                <span>Observações</span>
                <input
                  onInput={(event) =>
                    updateExerciseValue(index, 'notes', (event.target as HTMLInputElement).value)
                  }
                  placeholder="Ex: Foco na contração, não travar cotovelos..."
                  type="text"
                  value={exercise.notes}
                />
              </label>
            </article>
          ))}
        </div>
      </section>

      <div className="workout-form-actions">
        {isEditing && (
          <button className="dashboard-secondary-button" onClick={onCancelEdit} type="button">
            Cancelar edição
          </button>
        )}

        <button className="dashboard-primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar treino' : 'Criar treino'}
        </button>
      </div>

      {formError && <p className="student-detail-observation-feedback">{formError}</p>}
    </form>
  );
}

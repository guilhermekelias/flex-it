import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { Workout, WorkoutPayload } from '../services/api';

export type WorkoutFormValues = {
  name: string;
  description: string;
  type: string;
  durationMinutes: string;
  exercisesCount: string;
};

type WorkoutFormProps = {
  values: WorkoutFormValues;
  isEditing: boolean;
  isSubmitting: boolean;
  onValuesChange: (values: WorkoutFormValues) => void;
  onSubmit: (workoutData: WorkoutPayload) => void;
  onCancelEdit: () => void;
};

export function createEmptyWorkoutFormValues(): WorkoutFormValues {
  return {
    name: '',
    description: '',
    type: '',
    durationMinutes: '',
    exercisesCount: '',
  };
}

export function getWorkoutFormValues(workout: Workout): WorkoutFormValues {
  return {
    name: workout.name,
    description: workout.description || '',
    type: workout.type,
    durationMinutes: String(workout.durationMinutes),
    exercisesCount: String(workout.exercisesCount),
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

  const updateValue = (field: keyof WorkoutFormValues, value: string) => {
    setFormError('');
    onValuesChange({
      ...values,
      [field]: value,
    });
  };

  const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault();

    const name = values.name.trim();
    const type = values.type.trim();
    const durationMinutes = Number(values.durationMinutes);
    const exercisesCount = Number(values.exercisesCount);

    if (!name || !type || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      setFormError('Preencha nome, tipo e duracao com valores validos.');
      return;
    }

    if (!Number.isInteger(exercisesCount) || exercisesCount < 0) {
      setFormError('Quantidade de exercicios deve ser zero ou maior.');
      return;
    }

    const description = values.description.trim();

    onSubmit({
      name,
      description: description || null,
      type,
      durationMinutes,
      exercisesCount,
    });
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
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
        <span>Descricao</span>
        <input
          onInput={(event) =>
            updateValue('description', (event.target as HTMLInputElement).value)
          }
          placeholder="Orientacao geral do treino"
          type="text"
          value={values.description}
        />
      </label>

      <label>
        <span>Tipo</span>
        <input
          onInput={(event) => updateValue('type', (event.target as HTMLInputElement).value)}
          placeholder="Hipertrofia, forca, cardio"
          required
          type="text"
          value={values.type}
        />
      </label>

      <div className="student-form-row">
        <label>
          <span>Duracao</span>
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

        <label>
          <span>Exercicios</span>
          <input
            min="0"
            onInput={(event) =>
              updateValue('exercisesCount', (event.target as HTMLInputElement).value)
            }
            placeholder="8"
            required
            type="number"
            value={values.exercisesCount}
          />
        </label>
      </div>

      <button className="dashboard-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar treino' : 'Criar treino'}
      </button>

      {isEditing && (
        <button className="dashboard-secondary-button" onClick={onCancelEdit} type="button">
          Cancelar edicao
        </button>
      )}

      {formError && <p className="student-detail-observation-feedback">{formError}</p>}
    </form>
  );
}

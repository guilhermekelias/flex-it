import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { Metric, MetricPayload } from '../services/api';

export type MetricFormValues = {
  weightKg: string;
  heightCm: string;
  bodyFatPercentage: string;
  muscleMassKg: string;
  notes: string;
  recordedAt: string;
};

type MetricFormProps = {
  values: MetricFormValues;
  isEditing: boolean;
  isSubmitting: boolean;
  onValuesChange: (values: MetricFormValues) => void;
  onSubmit: (metricData: MetricPayload) => void;
  onCancelEdit: () => void;
};

export function createEmptyMetricFormValues(): MetricFormValues {
  return {
    weightKg: '',
    heightCm: '',
    bodyFatPercentage: '',
    muscleMassKg: '',
    notes: '',
    recordedAt: new Date().toISOString().slice(0, 10),
  };
}

export function getMetricFormValues(metric: Metric): MetricFormValues {
  return {
    weightKg: formatOptionalNumber(metric.weightKg),
    heightCm: formatOptionalNumber(metric.heightCm),
    bodyFatPercentage: formatOptionalNumber(metric.bodyFatPercentage),
    muscleMassKg: formatOptionalNumber(metric.muscleMassKg),
    notes: metric.notes || '',
    recordedAt: getDateInputValue(metric.recordedAt),
  };
}

function formatOptionalNumber(value: number | null): string {
  return value === null ? '' : String(value);
}

function getDateInputValue(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
}

function parseOptionalNumber(value: string, errorMessage: string): number | undefined {
  const normalizedValue = value.trim().replace(',', '.');

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(errorMessage);
  }

  return parsedValue;
}

export function MetricForm({
  values,
  isEditing,
  isSubmitting,
  onValuesChange,
  onSubmit,
  onCancelEdit,
}: MetricFormProps) {
  const [formError, setFormError] = useState('');

  const updateValue = (field: keyof MetricFormValues, value: string) => {
    setFormError('');
    onValuesChange({
      ...values,
      [field]: value,
    });
  };

  const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault();

    try {
      const weightKg = parseOptionalNumber(values.weightKg, 'Peso deve ser um número válido.');
      const heightCm = parseOptionalNumber(values.heightCm, 'Altura deve ser um número válido.');
      const bodyFatPercentage = parseOptionalNumber(
        values.bodyFatPercentage,
        'Gordura corporal deve ser um número válido.',
      );
      const muscleMassKg = parseOptionalNumber(
        values.muscleMassKg,
        'Massa muscular deve ser um número válido.',
      );

      if (
        weightKg === undefined &&
        heightCm === undefined &&
        bodyFatPercentage === undefined &&
        muscleMassKg === undefined
      ) {
        setFormError('Informe ao menos uma métrica corporal.');
        return;
      }

      if (
        (weightKg !== undefined && weightKg <= 0) ||
        (heightCm !== undefined && heightCm <= 0) ||
        (muscleMassKg !== undefined && muscleMassKg <= 0)
      ) {
        setFormError('Peso, altura e massa muscular devem ser maiores que zero.');
        return;
      }

      if (
        bodyFatPercentage !== undefined &&
        (bodyFatPercentage < 0 || bodyFatPercentage > 100)
      ) {
        setFormError('Gordura corporal deve estar entre 0 e 100.');
        return;
      }

      const notes = values.notes.trim();
      const recordedAt = values.recordedAt.trim();
      const metricData: MetricPayload = {};

      if (weightKg !== undefined) {
        metricData.weightKg = weightKg;
      }

      if (heightCm !== undefined) {
        metricData.heightCm = heightCm;
      }

      if (bodyFatPercentage !== undefined) {
        metricData.bodyFatPercentage = bodyFatPercentage;
      }

      if (muscleMassKg !== undefined) {
        metricData.muscleMassKg = muscleMassKg;
      }

      if (notes || isEditing) {
        metricData.notes = notes || null;
      }

      if (recordedAt) {
        metricData.recordedAt = recordedAt;
      }

      onSubmit(metricData);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Métrica inválida.');
    }
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="student-form-row">
        <label>
          <span>Peso kg</span>
          <input
            min="0"
            onInput={(event) => updateValue('weightKg', (event.target as HTMLInputElement).value)}
            placeholder="72.4"
            step="0.1"
            type="number"
            value={values.weightKg}
          />
        </label>

        <label>
          <span>Altura cm</span>
          <input
            min="0"
            onInput={(event) => updateValue('heightCm', (event.target as HTMLInputElement).value)}
            placeholder="170"
            step="0.1"
            type="number"
            value={values.heightCm}
          />
        </label>
      </div>

      <div className="student-form-row">
        <label>
          <span>Gordura %</span>
          <input
            max="100"
            min="0"
            onInput={(event) =>
              updateValue('bodyFatPercentage', (event.target as HTMLInputElement).value)
            }
            placeholder="21.8"
            step="0.1"
            type="number"
            value={values.bodyFatPercentage}
          />
        </label>

        <label>
          <span>Massa muscular kg</span>
          <input
            min="0"
            onInput={(event) =>
              updateValue('muscleMassKg', (event.target as HTMLInputElement).value)
            }
            placeholder="54.6"
            step="0.1"
            type="number"
            value={values.muscleMassKg}
          />
        </label>
      </div>

      <label>
        <span>Data da avaliação</span>
        <input
          onInput={(event) => updateValue('recordedAt', (event.target as HTMLInputElement).value)}
          type="date"
          value={values.recordedAt}
        />
      </label>

      <label>
        <span>Observações</span>
        <input
          onInput={(event) => updateValue('notes', (event.target as HTMLInputElement).value)}
          placeholder="Resumo da avaliação"
          type="text"
          value={values.notes}
        />
      </label>

      <button className="dashboard-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar métrica' : 'Registrar métrica'}
      </button>

      {isEditing && (
        <button className="dashboard-secondary-button" onClick={onCancelEdit} type="button">
          Cancelar edição
        </button>
      )}

      {formError && <p className="student-detail-observation-feedback">{formError}</p>}
    </form>
  );
}

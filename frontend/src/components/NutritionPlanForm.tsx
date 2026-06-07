import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { NutritionPlan, NutritionPlanPayload } from '../services/api';

export type NutritionPlanFormValues = {
  name: string;
  objective: string;
  calories: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
  mealsCount: string;
  notes: string;
};

type NutritionPlanFormProps = {
  values: NutritionPlanFormValues;
  isEditing: boolean;
  isSubmitting: boolean;
  onValuesChange: (values: NutritionPlanFormValues) => void;
  onSubmit: (nutritionPlanData: NutritionPlanPayload) => void;
  onCancelEdit: () => void;
};

export function createEmptyNutritionPlanFormValues(): NutritionPlanFormValues {
  return {
    name: '',
    objective: '',
    calories: '',
    proteinGrams: '',
    carbsGrams: '',
    fatGrams: '',
    mealsCount: '',
    notes: '',
  };
}

export function getNutritionPlanFormValues(
  nutritionPlan: NutritionPlan,
): NutritionPlanFormValues {
  return {
    name: nutritionPlan.name,
    objective: nutritionPlan.objective,
    calories: String(nutritionPlan.calories),
    proteinGrams: String(nutritionPlan.proteinGrams),
    carbsGrams: String(nutritionPlan.carbsGrams),
    fatGrams: String(nutritionPlan.fatGrams),
    mealsCount: String(nutritionPlan.mealsCount),
    notes: nutritionPlan.notes || '',
  };
}

function parseInteger(value: string, errorMessage: string): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue)) {
    throw new Error(errorMessage);
  }

  return parsedValue;
}

export function NutritionPlanForm({
  values,
  isEditing,
  isSubmitting,
  onValuesChange,
  onSubmit,
  onCancelEdit,
}: NutritionPlanFormProps) {
  const [formError, setFormError] = useState('');

  const updateValue = (field: keyof NutritionPlanFormValues, value: string) => {
    setFormError('');
    onValuesChange({
      ...values,
      [field]: value,
    });
  };

  const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault();

    try {
      const name = values.name.trim();
      const objective = values.objective.trim();
      const calories = parseInteger(values.calories, 'Calorias devem ser um numero inteiro.');
      const proteinGrams = parseInteger(
        values.proteinGrams,
        'Proteinas devem ser um numero inteiro.',
      );
      const carbsGrams = parseInteger(
        values.carbsGrams,
        'Carboidratos devem ser um numero inteiro.',
      );
      const fatGrams = parseInteger(values.fatGrams, 'Gorduras devem ser um numero inteiro.');
      const mealsCount = parseInteger(
        values.mealsCount,
        'Refeicoes devem ser um numero inteiro.',
      );

      if (!name || !objective) {
        setFormError('Preencha nome e objetivo do plano alimentar.');
        return;
      }

      if (calories <= 0 || mealsCount <= 0) {
        setFormError('Calorias e refeicoes devem ser maiores que zero.');
        return;
      }

      if (proteinGrams < 0 || carbsGrams < 0 || fatGrams < 0) {
        setFormError('Macros devem ser zero ou maiores.');
        return;
      }

      const notes = values.notes.trim();

      onSubmit({
        name,
        objective,
        calories,
        proteinGrams,
        carbsGrams,
        fatGrams,
        mealsCount,
        notes: notes || null,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Plano alimentar invalido.');
    }
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <label>
        <span>Nome do plano</span>
        <input
          onInput={(event) => updateValue('name', (event.target as HTMLInputElement).value)}
          placeholder="Ex: Plano de hipertrofia"
          required
          type="text"
          value={values.name}
        />
      </label>

      <label>
        <span>Objetivo</span>
        <input
          onInput={(event) => updateValue('objective', (event.target as HTMLInputElement).value)}
          placeholder="Hipertrofia, emagrecimento, manutencao"
          required
          type="text"
          value={values.objective}
        />
      </label>

      <div className="student-form-row">
        <label>
          <span>Calorias</span>
          <input
            min="1"
            onInput={(event) => updateValue('calories', (event.target as HTMLInputElement).value)}
            placeholder="2200"
            required
            type="number"
            value={values.calories}
          />
        </label>

        <label>
          <span>Refeicoes</span>
          <input
            min="1"
            onInput={(event) =>
              updateValue('mealsCount', (event.target as HTMLInputElement).value)
            }
            placeholder="5"
            required
            type="number"
            value={values.mealsCount}
          />
        </label>
      </div>

      <div className="student-form-row">
        <label>
          <span>Proteinas g</span>
          <input
            min="0"
            onInput={(event) =>
              updateValue('proteinGrams', (event.target as HTMLInputElement).value)
            }
            placeholder="150"
            required
            type="number"
            value={values.proteinGrams}
          />
        </label>

        <label>
          <span>Carboidratos g</span>
          <input
            min="0"
            onInput={(event) =>
              updateValue('carbsGrams', (event.target as HTMLInputElement).value)
            }
            placeholder="280"
            required
            type="number"
            value={values.carbsGrams}
          />
        </label>
      </div>

      <label>
        <span>Gorduras g</span>
        <input
          min="0"
          onInput={(event) => updateValue('fatGrams', (event.target as HTMLInputElement).value)}
          placeholder="70"
          required
          type="number"
          value={values.fatGrams}
        />
      </label>

      <label>
        <span>Observacoes</span>
        <input
          onInput={(event) => updateValue('notes', (event.target as HTMLInputElement).value)}
          placeholder="Orientacoes gerais do plano"
          type="text"
          value={values.notes}
        />
      </label>

      <button className="dashboard-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar plano' : 'Criar plano'}
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

import { describe, expect, it } from 'vitest';
import {
  createEmptyMetricFormValues,
  getMetricFormValues,
} from './MetricForm';
import {
  createEmptyNutritionPlanFormValues,
  getNutritionPlanFormValues,
} from './NutritionPlanForm';
import {
  createEmptyWorkoutFormValues,
  getWorkoutFormValues,
} from './WorkoutForm';
import type { Metric, NutritionPlan, Workout } from '../services/api';

describe('valores iniciais dos formulários', () => {
  it('cria valores vazios para métricas mantendo a data atual no formato do input', () => {
    const values = createEmptyMetricFormValues();

    expect(values.weightKg).toBe('');
    expect(values.recordedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('transforma uma métrica existente em valores editáveis', () => {
    const metric: Metric = {
      id: 1,
      weightKg: 72.4,
      heightCm: 170,
      bodyFatPercentage: null,
      muscleMassKg: 54.6,
      notes: null,
      recordedAt: '2026-06-03T12:00:00Z',
      studentId: 10,
      professionalId: 1,
      createdAt: '2026-06-03T12:00:00Z',
      updatedAt: '2026-06-03T12:00:00Z',
    };

    expect(getMetricFormValues(metric)).toMatchObject({
      weightKg: '72.4',
      heightCm: '170',
      bodyFatPercentage: '',
      muscleMassKg: '54.6',
      notes: '',
      recordedAt: '2026-06-03',
    });
  });

  it('cria e transforma valores de treino com exercícios estruturados', () => {
    const workout: Workout = {
      id: 1,
      name: 'Treino A',
      description: null,
      type: 'Força',
      durationMinutes: 50,
      exercisesCount: 1,
      exercises: [
        {
          name: 'Agachamento',
          sets: 4,
          reps: '8',
          rest: null,
          notes: null,
        },
      ],
      studentId: 10,
      professionalId: 1,
      createdAt: '2026-06-01T12:00:00Z',
      updatedAt: '2026-06-02T12:00:00Z',
    };

    expect(createEmptyWorkoutFormValues()).toMatchObject({
      name: '',
      usesStructuredExercises: true,
    });
    expect(getWorkoutFormValues(workout)).toMatchObject({
      name: 'Treino A',
      description: '',
      type: 'Força',
      durationMinutes: '50',
      exercisesCount: '1',
      usesStructuredExercises: true,
    });
  });

  it('cria e transforma valores de plano alimentar com refeições estruturadas', () => {
    const nutritionPlan: NutritionPlan = {
      id: 1,
      name: 'Plano hipertrofia',
      objective: 'Ganho de massa',
      calories: 2400,
      proteinGrams: 160,
      carbsGrams: 300,
      fatGrams: 70,
      mealsCount: 1,
      meals: [
        {
          name: 'Café',
          time: null,
          foods: [
            {
              name: 'Ovos',
              quantity: null,
              calories: 140,
            },
          ],
        },
      ],
      notes: null,
      studentId: 10,
      professionalId: 1,
      createdAt: '2026-06-04T12:00:00Z',
      updatedAt: '2026-06-04T12:00:00Z',
    };

    expect(createEmptyNutritionPlanFormValues().meals.length).toBeGreaterThan(0);
    expect(getNutritionPlanFormValues(nutritionPlan)).toMatchObject({
      name: 'Plano hipertrofia',
      objective: 'Ganho de massa',
      calories: '2400',
      proteinGrams: '160',
      carbsGrams: '300',
      fatGrams: '70',
      mealsCount: '1',
      usesStructuredMeals: true,
      hasStructuredMeals: true,
      notes: '',
    });
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NutritionPlan } from '../services/api';
import {
  NutritionPlanForm,
  type NutritionPlanFormValues,
  createEmptyNutritionPlanFormValues,
  getNutritionPlanFormValues,
} from './NutritionPlanForm';

const baseValues: NutritionPlanFormValues = {
  name: 'Plano hipertrofia',
  objective: 'Hipertrofia',
  calories: '2200',
  proteinGrams: '150',
  carbsGrams: '280',
  fatGrams: '70',
  mealsCount: '5',
  notes: 'Revisar em 30 dias',
};

function renderNutritionPlanForm(
  overrides: Partial<Parameters<typeof NutritionPlanForm>[0]> = {},
) {
  const props: Parameters<typeof NutritionPlanForm>[0] = {
    values: baseValues,
    isEditing: false,
    isSubmitting: false,
    onValuesChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancelEdit: vi.fn(),
    ...overrides,
  };

  const view = render(<NutritionPlanForm {...props} />);

  return { props, ...view };
}

function submitNutritionPlanForm(buttonName: RegExp) {
  const button = screen.getByRole('button', { name: buttonName });
  const form = button.closest('form');

  if (!form) {
    throw new Error('Formulario nao encontrado.');
  }

  fireEvent.submit(form);
}

describe('NutritionPlanForm', () => {
  afterEach(cleanup);

  it('cria valores iniciais vazios', () => {
    expect(createEmptyNutritionPlanFormValues()).toEqual({
      name: '',
      objective: '',
      calories: '',
      proteinGrams: '',
      carbsGrams: '',
      fatGrams: '',
      mealsCount: '',
      notes: '',
    });
  });

  it('mapeia um plano existente para valores editaveis', () => {
    const nutritionPlan: NutritionPlan = {
      id: 2,
      name: 'Definicao',
      objective: 'Emagrecimento',
      calories: 1800,
      proteinGrams: 130,
      carbsGrams: 190,
      fatGrams: 55,
      mealsCount: 4,
      notes: null,
      studentId: 7,
      professionalId: 3,
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    };

    expect(getNutritionPlanFormValues(nutritionPlan)).toEqual({
      name: 'Definicao',
      objective: 'Emagrecimento',
      calories: '1800',
      proteinGrams: '130',
      carbsGrams: '190',
      fatGrams: '55',
      mealsCount: '4',
      notes: '',
    });
  });

  it('notifica alteracao de campo mantendo os demais valores', () => {
    const onValuesChange = vi.fn();
    renderNutritionPlanForm({ onValuesChange });

    fireEvent.input(screen.getByLabelText(/Objetivo/i), {
      target: { value: 'Manutencao' },
    });

    expect(onValuesChange).toHaveBeenCalledWith({
      ...baseValues,
      objective: 'Manutencao',
    });
  });

  it('envia payload numerico e textos normalizados', () => {
    const onSubmit = vi.fn();
    renderNutritionPlanForm({
      values: {
        ...baseValues,
        name: '  Plano base  ',
        objective: '  Performance  ',
        notes: '   ',
      },
      onSubmit,
    });

    submitNutritionPlanForm(/criar plano/i);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Plano base',
      objective: 'Performance',
      calories: 2200,
      proteinGrams: 150,
      carbsGrams: 280,
      fatGrams: 70,
      mealsCount: 5,
      notes: null,
    });
  });

  it('valida nome e objetivo obrigatorios', () => {
    const onSubmit = vi.fn();
    renderNutritionPlanForm({
      values: {
        ...baseValues,
        name: '   ',
      },
      onSubmit,
    });

    submitNutritionPlanForm(/criar plano/i);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Preencha nome e objetivo do plano alimentar.')).toBeTruthy();
  });

  it('valida valores inteiros', () => {
    const onSubmit = vi.fn();
    renderNutritionPlanForm({
      values: {
        ...baseValues,
        calories: '2200.5',
      },
      onSubmit,
    });

    submitNutritionPlanForm(/criar plano/i);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Calorias devem ser um numero inteiro.')).toBeTruthy();
  });

  it('valida valores positivos', () => {
    const onSubmit = vi.fn();
    renderNutritionPlanForm({
      values: {
        ...baseValues,
        mealsCount: '0',
      },
      onSubmit,
    });

    submitNutritionPlanForm(/criar plano/i);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Calorias e refeicoes devem ser maiores que zero.')).toBeTruthy();
  });

  it('permite cancelar edicao', () => {
    const onCancelEdit = vi.fn();
    renderNutritionPlanForm({ isEditing: true, onCancelEdit });

    fireEvent.click(screen.getByRole('button', { name: /cancelar edicao/i }));

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });
});

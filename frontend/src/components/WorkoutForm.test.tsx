import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Workout } from '../services/api';
import {
  WorkoutForm,
  type WorkoutFormValues,
  createEmptyWorkoutFormValues,
  getWorkoutFormValues,
} from './WorkoutForm';

const baseValues: WorkoutFormValues = {
  name: 'Treino A',
  description: 'Peito e triceps',
  type: 'Hipertrofia',
  durationMinutes: '60',
  exercisesCount: '8',
};

function renderWorkoutForm(overrides: Partial<Parameters<typeof WorkoutForm>[0]> = {}) {
  const props: Parameters<typeof WorkoutForm>[0] = {
    values: baseValues,
    isEditing: false,
    isSubmitting: false,
    onValuesChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancelEdit: vi.fn(),
    ...overrides,
  };

  const view = render(<WorkoutForm {...props} />);

  return { props, ...view };
}

function submitWorkoutForm(buttonName: RegExp) {
  const button = screen.getByRole('button', { name: buttonName });
  const form = button.closest('form');

  if (!form) {
    throw new Error('Formulario nao encontrado.');
  }

  fireEvent.submit(form);
}

describe('WorkoutForm', () => {
  afterEach(cleanup);

  it('cria valores iniciais vazios', () => {
    expect(createEmptyWorkoutFormValues()).toEqual({
      name: '',
      description: '',
      type: '',
      durationMinutes: '',
      exercisesCount: '',
    });
  });

  it('mapeia um treino existente para valores editaveis', () => {
    const workout: Workout = {
      id: 4,
      name: 'Treino B',
      description: null,
      type: 'Forca',
      durationMinutes: 45,
      exercisesCount: 6,
      studentId: 7,
      professionalId: 3,
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    };

    expect(getWorkoutFormValues(workout)).toEqual({
      name: 'Treino B',
      description: '',
      type: 'Forca',
      durationMinutes: '45',
      exercisesCount: '6',
    });
  });

  it('notifica alteracao de campo mantendo os demais valores', () => {
    const onValuesChange = vi.fn();
    renderWorkoutForm({ onValuesChange });

    fireEvent.input(screen.getByLabelText(/Tipo/i), { target: { value: 'Cardio' } });

    expect(onValuesChange).toHaveBeenCalledWith({
      ...baseValues,
      type: 'Cardio',
    });
  });

  it('envia payload numerico e textos normalizados', () => {
    const onSubmit = vi.fn();
    renderWorkoutForm({
      values: {
        ...baseValues,
        name: '  Treino C  ',
        description: '   ',
        type: '  Mobilidade  ',
      },
      onSubmit,
    });

    submitWorkoutForm(/criar treino/i);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Treino C',
      description: null,
      type: 'Mobilidade',
      durationMinutes: 60,
      exercisesCount: 8,
    });
  });

  it('valida nome, tipo e duracao antes de enviar', () => {
    const onSubmit = vi.fn();
    renderWorkoutForm({
      values: {
        ...baseValues,
        durationMinutes: '0',
      },
      onSubmit,
    });

    submitWorkoutForm(/criar treino/i);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Preencha nome, tipo e duracao com valores validos.')).toBeTruthy();
  });

  it('valida quantidade de exercicios nao negativa', () => {
    const onSubmit = vi.fn();
    renderWorkoutForm({
      values: {
        ...baseValues,
        exercisesCount: '-1',
      },
      onSubmit,
    });

    submitWorkoutForm(/criar treino/i);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Quantidade de exercicios deve ser zero ou maior.')).toBeTruthy();
  });

  it('mostra estado de salvamento e permite cancelar edicao', () => {
    const onCancelEdit = vi.fn();
    renderWorkoutForm({
      isEditing: true,
      isSubmitting: true,
      onCancelEdit,
    });

    expect(screen.getByRole('button', { name: /salvando/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /cancelar edicao/i }));

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });
});

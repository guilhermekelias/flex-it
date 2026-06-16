import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Metric } from '../services/api';
import {
  MetricForm,
  type MetricFormValues,
  createEmptyMetricFormValues,
  getMetricFormValues,
} from './MetricForm';

const baseValues: MetricFormValues = {
  weightKg: '72.5',
  heightCm: '170',
  bodyFatPercentage: '21',
  muscleMassKg: '54',
  notes: 'Boa evolucao',
  recordedAt: '2026-06-11',
};

function renderMetricForm(overrides: Partial<Parameters<typeof MetricForm>[0]> = {}) {
  const props: Parameters<typeof MetricForm>[0] = {
    values: baseValues,
    isEditing: false,
    isSubmitting: false,
    onValuesChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancelEdit: vi.fn(),
    ...overrides,
  };

  const view = render(<MetricForm {...props} />);

  return { props, ...view };
}

function submitMetricForm(buttonName: RegExp) {
  const button = screen.getByRole('button', { name: buttonName });
  const form = button.closest('form');

  if (!form) {
    throw new Error('Formulario nao encontrado.');
  }

  fireEvent.submit(form);
}

describe('MetricForm', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('cria valores iniciais com a data atual', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-11T12:00:00.000Z'));

    expect(createEmptyMetricFormValues()).toEqual({
      weightKg: '',
      heightCm: '',
      bodyFatPercentage: '',
      muscleMassKg: '',
      notes: '',
      recordedAt: '2026-06-11',
    });
  });

  it('mapeia uma metrica existente para valores editaveis', () => {
    const metric: Metric = {
      id: 1,
      weightKg: 80,
      heightCm: null,
      bodyFatPercentage: 18.5,
      muscleMassKg: 62,
      notes: null,
      recordedAt: '2026-05-20T10:30:00.000Z',
      studentId: 7,
      professionalId: 3,
      createdAt: '2026-05-20T10:30:00.000Z',
      updatedAt: '2026-05-21T10:30:00.000Z',
    };

    expect(getMetricFormValues(metric)).toEqual({
      weightKg: '80',
      heightCm: '',
      bodyFatPercentage: '18.5',
      muscleMassKg: '62',
      notes: '',
      recordedAt: '2026-05-20',
    });
  });

  it('limpa data invalida ao mapear uma metrica existente', () => {
    const metric: Metric = {
      id: 1,
      weightKg: null,
      heightCm: null,
      bodyFatPercentage: null,
      muscleMassKg: null,
      notes: 'Sem data',
      recordedAt: 'data-invalida',
      studentId: 7,
      professionalId: 3,
      createdAt: '2026-05-20T10:30:00.000Z',
      updatedAt: '2026-05-21T10:30:00.000Z',
    };

    expect(getMetricFormValues(metric).recordedAt).toBe('');
  });

  it('notifica alteracao de campo mantendo os demais valores', () => {
    const onValuesChange = vi.fn();
    renderMetricForm({ onValuesChange });

    fireEvent.input(screen.getByLabelText(/Peso kg/i), { target: { value: '73' } });

    expect(onValuesChange).toHaveBeenCalledWith({
      ...baseValues,
      weightKg: '73',
    });
  });

  it('envia payload numerico e textos normalizados', () => {
    const onSubmit = vi.fn();
    renderMetricForm({
      values: {
        ...baseValues,
        weightKg: '72,5',
        notes: '  Reavaliar em 30 dias  ',
      },
      onSubmit,
    });

    submitMetricForm(/registrar metrica/i);

    expect(onSubmit).toHaveBeenCalledWith({
      weightKg: 72.5,
      heightCm: 170,
      bodyFatPercentage: 21,
      muscleMassKg: 54,
      notes: 'Reavaliar em 30 dias',
      recordedAt: '2026-06-11',
    });
  });

  it('exige ao menos uma metrica corporal', () => {
    const onSubmit = vi.fn();
    renderMetricForm({
      values: {
        weightKg: '',
        heightCm: '',
        bodyFatPercentage: '',
        muscleMassKg: '',
        notes: '',
        recordedAt: '',
      },
      onSubmit,
    });

    submitMetricForm(/registrar metrica/i);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Informe ao menos uma metrica corporal.')).toBeTruthy();
  });

  it('valida limites antes de enviar', () => {
    const onSubmit = vi.fn();
    renderMetricForm({
      values: {
        ...baseValues,
        bodyFatPercentage: '120',
      },
      onSubmit,
    });

    submitMetricForm(/registrar metrica/i);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Gordura corporal deve estar entre 0 e 100.')).toBeTruthy();
  });

  it('envia notes nulo ao editar sem observacoes', () => {
    const onSubmit = vi.fn();
    renderMetricForm({
      values: {
        ...baseValues,
        notes: '   ',
      },
      isEditing: true,
      onSubmit,
    });

    submitMetricForm(/salvar metrica/i);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: null,
      }),
    );
  });

  it('permite cancelar edicao', () => {
    const onCancelEdit = vi.fn();
    renderMetricForm({ isEditing: true, onCancelEdit });

    fireEvent.click(screen.getByRole('button', { name: /cancelar edicao/i }));

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });
});

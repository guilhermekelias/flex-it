import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMetrics,
  getNutritionPlans,
  getWorkouts,
  type Metric,
  type NutritionPlan,
  type Student,
  type Workout,
} from '../services/api';
import { DashboardPage } from './DashboardPage';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();

  return {
    ...actual,
    getMetrics: vi.fn(),
    getNutritionPlans: vi.fn(),
    getWorkouts: vi.fn(),
  };
});

const students: Student[] = [
  {
    id: 7,
    name: 'Ana Silva',
    email: 'ana@example.com',
    age: 28,
    goal: 'Hipertrofia',
  },
];

const workouts: Workout[] = [
  {
    id: 1,
    name: 'Treino A',
    description: 'Peito e triceps',
    type: 'Hipertrofia',
    durationMinutes: 60,
    exercisesCount: 8,
    studentId: 7,
    professionalId: 3,
    createdAt: '2026-06-10T10:00:00.000Z',
    updatedAt: '2026-06-11T10:00:00.000Z',
  },
];

const nutritionPlans: NutritionPlan[] = [
  {
    id: 2,
    name: 'Plano base',
    objective: 'Performance',
    calories: 2200,
    proteinGrams: 150,
    carbsGrams: 280,
    fatGrams: 70,
    mealsCount: 5,
    notes: 'Revisar em 30 dias',
    studentId: 7,
    professionalId: 3,
    createdAt: '2026-06-09T10:00:00.000Z',
    updatedAt: '2026-06-10T10:00:00.000Z',
  },
];

const metrics: Metric[] = [
  {
    id: 3,
    weightKg: 72,
    heightCm: 170,
    bodyFatPercentage: 20,
    muscleMassKg: 54,
    notes: 'Boa evolucao',
    recordedAt: '2026-06-11T10:00:00.000Z',
    studentId: 7,
    professionalId: 3,
    createdAt: '2026-06-11T10:00:00.000Z',
    updatedAt: '2026-06-11T10:00:00.000Z',
  },
  {
    id: 4,
    weightKg: 74,
    heightCm: 170,
    bodyFatPercentage: 21,
    muscleMassKg: 53,
    notes: null,
    recordedAt: '2026-05-11T10:00:00.000Z',
    studentId: 7,
    professionalId: 3,
    createdAt: '2026-05-11T10:00:00.000Z',
    updatedAt: '2026-05-11T10:00:00.000Z',
  },
];

function renderDashboard(overrides: Partial<Parameters<typeof DashboardPage>[0]> = {}) {
  const props: Parameters<typeof DashboardPage>[0] = {
    user: {
      id: 3,
      name: 'Guilherme Elias',
      email: 'gui@example.com',
      role: 'professional',
    },
    students,
    onCreateStudent: vi.fn(),
    onUpdateStudent: vi.fn(async (_id, student) => ({ id: 7, ...student })),
    onDeleteStudent: vi.fn(),
    onSessionExpired: vi.fn(),
    onLogout: vi.fn(),
    ...overrides,
  };

  render(<DashboardPage {...props} />);

  return props;
}

function clickNavigationButton(name: RegExp) {
  fireEvent.click(screen.getByRole('button', { name }));
}

function submitByButton(name: RegExp) {
  const button = screen.getByRole('button', { name });
  const form = button.closest('form');

  if (!form) {
    throw new Error('Formulario nao encontrado.');
  }

  fireEvent.submit(form);
}

describe('DashboardPage', () => {
  const getWorkoutsMock = vi.mocked(getWorkouts);
  const getNutritionPlansMock = vi.mocked(getNutritionPlans);
  const getMetricsMock = vi.mocked(getMetrics);

  beforeEach(() => {
    getWorkoutsMock.mockResolvedValue(workouts);
    getNutritionPlansMock.mockResolvedValue(nutritionPlans);
    getMetricsMock.mockResolvedValue(metrics);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renderiza resumo profissional e carrega dados agregados', async () => {
    const props = renderDashboard();

    expect(screen.getByText('Dashboard profissional')).toBeTruthy();
    expect(screen.getByText('gui@example.com')).toBeTruthy();

    await waitFor(() => {
      expect(getWorkoutsMock).toHaveBeenCalled();
      expect(getNutritionPlansMock).toHaveBeenCalled();
      expect(getMetricsMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Sair$/i }));

    expect(props.onLogout).toHaveBeenCalledTimes(1);
  });

  it('permite editar aluno pela aba de alunos', async () => {
    const onUpdateStudent = vi.fn(async (_id: number, student: Omit<Student, 'id'>) => ({
      id: 7,
      ...student,
    }));
    renderDashboard({ onUpdateStudent });

    clickNavigationButton(/Alunos/i);

    expect(await screen.findByText('Ana Silva')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    fireEvent.input(screen.getByPlaceholderText('Ex: Ana Silva'), {
      target: { value: 'Ana Souza' },
    });
    submitByButton(/Salvar/);

    await waitFor(() => {
      expect(onUpdateStudent).toHaveBeenCalledWith(7, {
        name: 'Ana Souza',
        email: 'ana@example.com',
        age: 28,
        goal: 'Hipertrofia',
      });
    });
  });

  it('renderiza treinos, dietas e metricas em suas abas', async () => {
    renderDashboard();

    clickNavigationButton(/Treinos/i);
    expect(await screen.findByText('Treino A')).toBeTruthy();
    expect(screen.getByText('Peito e triceps')).toBeTruthy();

    clickNavigationButton(/Dietas/i);
    expect(await screen.findByText('Plano base')).toBeTruthy();
    expect(screen.getByText('Revisar em 30 dias')).toBeTruthy();

    clickNavigationButton(/M.tricas/i);
    expect(await screen.findByText('Peso atual')).toBeTruthy();
    expect(screen.getAllByText('-2 kg desde a ultima avaliacao').length).toBeGreaterThan(0);
  });
});

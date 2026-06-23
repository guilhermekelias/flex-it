import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { BottomNavigation } from './components/BottomNavigation';
import { DashboardPage } from './components/DashboardPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { StudentDetail } from './components/StudentDetail';
import { StudentPortal } from './components/StudentPortal';
import * as api from './services/api';
import type {
  Metric,
  NutritionPlan,
  Observation,
  ObservationThread,
  Student,
  User,
  Workout,
} from './services/api';

vi.mock('./services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/api')>();

  return {
    ...actual,
    getStudents: vi.fn(),
    getWorkouts: vi.fn(),
    getMetrics: vi.fn(),
    getNutritionPlans: vi.fn(),
    getStudentWorkouts: vi.fn(),
    getStudentObservations: vi.fn(),
    getStudentMetrics: vi.fn(),
    getStudentNutritionPlans: vi.fn(),
    createStudentObservation: vi.fn(),
    createStudentWorkout: vi.fn(),
    updateStudentWorkout: vi.fn(),
    deleteStudentWorkout: vi.fn(),
    createStudentMetric: vi.fn(),
    updateStudentMetric: vi.fn(),
    deleteStudentMetric: vi.fn(),
    createStudentNutritionPlan: vi.fn(),
    updateStudentNutritionPlan: vi.fn(),
    deleteStudentNutritionPlan: vi.fn(),
    getMyWorkouts: vi.fn(),
    getMyObservationThreads: vi.fn(),
    getMyNutritionPlans: vi.fn(),
    getMyMetrics: vi.fn(),
    createMyObservation: vi.fn(),
  };
});

const user: User = {
  id: 1,
  name: 'Patricia Lima',
  email: 'patricia@example.com',
  role: 'professional',
};

const studentUser: User = {
  id: 2,
  name: 'Ana Silva',
  email: 'ana@example.com',
  role: 'student',
};

const students: Student[] = [
  {
    id: 10,
    name: 'Ana Silva',
    email: 'ana@example.com',
    age: 28,
    goal: 'Hipertrofia',
  },
];

const workouts: Workout[] = [
  {
    id: 20,
    name: 'Treino A',
    description: 'Foco em membros superiores',
    type: 'Hipertrofia',
    durationMinutes: 60,
    exercisesCount: 1,
    exercises: [
      {
        name: 'Supino reto',
        sets: 4,
        reps: '10',
        rest: '60s',
        notes: 'Controle a descida',
      },
    ],
    studentId: 10,
    professionalId: 1,
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-06-02T12:00:00Z',
  },
];

const metrics: Metric[] = [
  {
    id: 30,
    weightKg: 72.4,
    heightCm: 170,
    bodyFatPercentage: 21.8,
    muscleMassKg: 54.6,
    notes: 'Boa evolução',
    recordedAt: '2026-06-03T12:00:00Z',
    studentId: 10,
    professionalId: 1,
    createdAt: '2026-06-03T12:00:00Z',
    updatedAt: '2026-06-03T12:00:00Z',
  },
  {
    id: 31,
    weightKg: 73,
    heightCm: 170,
    bodyFatPercentage: 22,
    muscleMassKg: 54,
    notes: null,
    recordedAt: '2026-05-03T12:00:00Z',
    studentId: 10,
    professionalId: 1,
    createdAt: '2026-05-03T12:00:00Z',
    updatedAt: '2026-05-03T12:00:00Z',
  },
];

const nutritionPlans: NutritionPlan[] = [
  {
    id: 40,
    name: 'Plano hipertrofia',
    objective: 'Ganho de massa',
    calories: 2400,
    proteinGrams: 160,
    carbsGrams: 300,
    fatGrams: 70,
    mealsCount: 1,
    meals: [
      {
        name: 'Café da manhã',
        time: '07:00',
        foods: [
          {
            name: 'Ovos',
            quantity: '2 unidades',
            calories: 140,
          },
        ],
      },
    ],
    notes: 'Ajustar conforme treino',
    studentId: 10,
    professionalId: 1,
    createdAt: '2026-06-04T12:00:00Z',
    updatedAt: '2026-06-04T12:00:00Z',
  },
];

const observations: Observation[] = [
  {
    id: 50,
    message: 'Manter hidratação durante o treino.',
    studentId: 10,
    professionalId: 1,
    senderRole: 'professional',
    createdAt: '2026-06-05T12:00:00Z',
  },
];

const observationThreads: ObservationThread[] = [
  {
    studentId: 10,
    professionalId: 1,
    messages: observations,
  },
];

function configureResolvedApiMocks() {
  vi.mocked(api.getStudents).mockResolvedValue(students);
  vi.mocked(api.getWorkouts).mockResolvedValue(workouts);
  vi.mocked(api.getMetrics).mockResolvedValue(metrics);
  vi.mocked(api.getNutritionPlans).mockResolvedValue(nutritionPlans);
  vi.mocked(api.getStudentWorkouts).mockResolvedValue(workouts);
  vi.mocked(api.getStudentObservations).mockResolvedValue(observations);
  vi.mocked(api.getStudentMetrics).mockResolvedValue(metrics);
  vi.mocked(api.getStudentNutritionPlans).mockResolvedValue(nutritionPlans);
  vi.mocked(api.getMyWorkouts).mockResolvedValue(workouts);
  vi.mocked(api.getMyObservationThreads).mockResolvedValue(observationThreads);
  vi.mocked(api.getMyNutritionPlans).mockResolvedValue(nutritionPlans);
  vi.mocked(api.getMyMetrics).mockResolvedValue(metrics);
  vi.mocked(api.createMyObservation).mockResolvedValue(observations[0]);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

beforeEach(() => {
  configureResolvedApiMocks();
});

describe('componentes de autenticação e navegação', () => {
  it('renderiza o login e repassa as ações do formulário', () => {
    const onEmailChange = vi.fn();
    const onPasswordChange = vi.fn();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const onCreateAccountClick = vi.fn();

    render(
      <LoginPage
        email=""
        password=""
        message="Credenciais inválidas"
        onCreateAccountClick={onCreateAccountClick}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.input(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'patricia@example.com' },
    });
    fireEvent.input(screen.getByPlaceholderText('Digite sua senha'), {
      target: { value: '123456' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!);
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByRole('alert').textContent).toContain('Credenciais inválidas');
    expect(onEmailChange).toHaveBeenCalledWith('patricia@example.com');
    expect(onPasswordChange).toHaveBeenCalledWith('123456');
    expect(onSubmit).toHaveBeenCalled();
    expect(onCreateAccountClick).toHaveBeenCalled();
  });

  it('monta o payload de cadastro com o perfil selecionado', () => {
    const onSubmit = vi.fn();

    render(
      <RegisterPage message="" onBackToLogin={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.input(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'Ana Silva' },
    });
    fireEvent.input(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.input(screen.getByPlaceholderText('Crie uma senha'), {
      target: { value: 'Senha@123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aluno' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Criar conta' }).closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@example.com',
      password: 'Senha@123',
      role: 'student',
    });
  });

  it('bloqueia cadastro com senha fraca', () => {
    const onSubmit = vi.fn();

    render(
      <RegisterPage message="" onBackToLogin={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.input(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'Ana Silva' },
    });
    fireEvent.input(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.input(screen.getByPlaceholderText('Crie uma senha'), {
      target: { value: '123456' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Criar conta' }).closest('form')!);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain(
      'A senha deve ter no mínimo 8 caracteres, incluindo letras, números e caracteres especiais.',
    );
  });

  it('aciona a aba escolhida na navegação inferior', () => {
    const onTabChange = vi.fn();

    render(<BottomNavigation activeTab="home" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Métricas' }));

    expect(onTabChange).toHaveBeenCalledWith('metrics');
  });
});

describe('fluxos principais do frontend', () => {
  it('renderiza o app deslogado na tela de login', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Acesse o Flex-It' })).toBeTruthy();
  });

  it('renderiza dashboard e abas profissionais com dados vindos da API', async () => {
    render(
      <DashboardPage
        user={user}
        students={students}
        onCreateStudent={vi.fn()}
        onDeleteStudent={vi.fn()}
        onLogout={vi.fn()}
        onSessionExpired={vi.fn()}
        onUpdateStudent={vi.fn()}
      />,
    );

    await waitFor(() => expect(api.getWorkouts).toHaveBeenCalled());
    expect(screen.getByText('Dashboard profissional')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Treinos' }));
    await waitFor(() => expect(screen.getAllByText('Treino A').length).toBeGreaterThan(0));

    fireEvent.click(screen.getByRole('button', { name: 'Dietas' }));
    await waitFor(() =>
      expect(screen.getAllByText('Plano hipertrofia').length).toBeGreaterThan(0),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Métricas' }));
    expect(await screen.findByText('Peso atual')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Alunos' }));
    expect(screen.getByText('Ana Silva')).toBeTruthy();
  });

  it('renderiza detalhes do aluno em abas com treinos, dietas, métricas e observações', async () => {
    render(
      <StudentDetail
        student={students[0]}
        onBack={vi.fn()}
        onMetricsChanged={vi.fn()}
        onNutritionPlansChanged={vi.fn()}
        onSessionExpired={vi.fn()}
        onWorkoutsChanged={vi.fn()}
      />,
    );

    await waitFor(() => expect(api.getStudentWorkouts).toHaveBeenCalled());
    expect(screen.getByText('Acompanhamento de Ana Silva')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Treinos' }));
    expect(await screen.findByText('Treino A')).toBeTruthy();
    expect(screen.queryByText('Plano hipertrofia')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Dietas' }));
    expect(await screen.findByText('Plano hipertrofia')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Métricas' }));
    expect(await screen.findByText('Boa evolução')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Comunicação' }));
    expect(await screen.findByText('Manter hidratação durante o treino.')).toBeTruthy();
  });

  it('renderiza portal do aluno e alterna entre as abas carregadas', async () => {
    render(
      <StudentPortal
        user={studentUser}
        onLogout={vi.fn()}
        onSessionExpired={vi.fn()}
      />,
    );

    await waitFor(() => expect(api.getMyWorkouts).toHaveBeenCalled());
    expect(screen.getAllByText(/Olá, Ana/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Semana 08')).toBeNull();
    expect(screen.getByText('Última atualização')).toBeTruthy();
    expect(screen.getByText('03/06/2026')).toBeTruthy();
    expect(screen.getByText('Atualizado pelo profissional')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Treinos' }));
    await waitFor(() => expect(screen.getAllByText('Treino A').length).toBeGreaterThan(0));

    fireEvent.click(screen.getByRole('button', { name: 'Dietas' }));
    await waitFor(() =>
      expect(screen.getAllByText('Plano hipertrofia').length).toBeGreaterThan(0),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Métricas' }));
    expect(await screen.findByText('Peso')).toBeTruthy();
    expect(screen.getByText('Histórico visual')).toBeTruthy();
    expect(screen.getByText('Evolução do peso')).toBeTruthy();
    expect(screen.getByText('Histórico recente')).toBeTruthy();
    expect(screen.queryByText('Registrar métrica')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Comunicação' }));
    expect(await screen.findByText('Manter hidratação durante o treino.')).toBeTruthy();
  });

  it('mostra estado vazio amigável na aba de métricas do aluno', async () => {
    vi.mocked(api.getMyMetrics).mockResolvedValue([]);

    render(
      <StudentPortal
        user={studentUser}
        onLogout={vi.fn()}
        onSessionExpired={vi.fn()}
      />,
    );

    await waitFor(() => expect(api.getMyMetrics).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Métricas' }));

    expect(
      screen.getByText(
        'Suas métricas ainda não foram registradas. Quando seu profissional adicionar uma avaliação, sua evolução aparecerá aqui.',
      ),
    ).toBeTruthy();
  });

  it('mostra plano ativo no card quando não há métrica mas existe acompanhamento', async () => {
    vi.mocked(api.getMyMetrics).mockResolvedValue([]);

    render(
      <StudentPortal
        user={studentUser}
        onLogout={vi.fn()}
        onSessionExpired={vi.fn()}
      />,
    );

    await waitFor(() => expect(api.getMyWorkouts).toHaveBeenCalled());
    expect(screen.getByText('Acompanhamento')).toBeTruthy();
    expect(screen.getByText('Plano ativo')).toBeTruthy();
    expect(screen.getByText('Atualizado pelo profissional')).toBeTruthy();
  });

  it('mantém fallback seguro no card quando o portal não tem dados', async () => {
    vi.mocked(api.getMyWorkouts).mockResolvedValue([]);
    vi.mocked(api.getMyObservationThreads).mockResolvedValue([]);
    vi.mocked(api.getMyNutritionPlans).mockResolvedValue([]);
    vi.mocked(api.getMyMetrics).mockResolvedValue([]);

    render(
      <StudentPortal
        user={studentUser}
        onLogout={vi.fn()}
        onSessionExpired={vi.fn()}
      />,
    );

    await waitFor(() => expect(api.getMyMetrics).toHaveBeenCalled());
    expect(screen.getByText('Acompanhamento')).toBeTruthy();
    expect(screen.getByText('Em andamento')).toBeTruthy();
    expect(screen.getByText('Atualizado pelo profissional')).toBeTruthy();
  });
});

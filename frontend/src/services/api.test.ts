import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiRequestError,
  ApiUnauthorizedError,
  createStudent,
  createStudentMetric,
  createStudentNutritionPlan,
  createStudentObservation,
  createStudentWorkout,
  deleteStudent,
  deleteStudentMetric,
  deleteStudentNutritionPlan,
  deleteStudentWorkout,
  getMetrics,
  getMyMetrics,
  getMyNutritionPlans,
  getMyObservations,
  getMyWorkouts,
  getNutritionPlans,
  getStudentMetrics,
  getStudentNutritionPlans,
  getStudentObservations,
  getStudentWorkouts,
  getStudents,
  getWorkouts,
  login,
  updateStudent,
  updateStudentMetric,
  updateStudentNutritionPlan,
  updateStudentWorkout,
} from './api';

const API_BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN_STORAGE_KEY = 'flexit_token';

type ApiCase = {
  name: string;
  execute: () => Promise<unknown>;
  path: string;
  method: string;
  authenticated?: boolean;
  body?: unknown;
  emptyResponse?: boolean;
};

const studentPayload = {
  name: 'Ana Silva',
  email: 'ana@example.com',
  age: 28,
  goal: 'Hipertrofia',
};

const workoutPayload = {
  name: 'Treino A',
  description: 'Peito e triceps',
  type: 'Hipertrofia',
  durationMinutes: 60,
  exercisesCount: 8,
};

const nutritionPlanPayload = {
  name: 'Plano base',
  objective: 'Hipertrofia',
  calories: 2200,
  proteinGrams: 150,
  carbsGrams: 280,
  fatGrams: 70,
  mealsCount: 5,
  notes: 'Revisar em 30 dias',
};

const metricPayload = {
  weightKg: 72.5,
  heightCm: 170,
  bodyFatPercentage: 21,
  muscleMassKg: 54,
  notes: 'Boa evolucao',
  recordedAt: '2026-06-11',
};

const fetchMock = vi.fn();

function mockJsonResponse(body: unknown) {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function mockEmptyResponse() {
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
}

function mockTextResponse(body: string | null, status: number) {
  fetchMock.mockResolvedValueOnce(new Response(body, { status }));
}

function getLastRequest() {
  const call = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as
    | [string, RequestInit]
    | undefined;

  if (!call) {
    throw new Error('Fetch nao foi chamado.');
  }

  return call;
}

describe('api service', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  const apiCases: ApiCase[] = [
    {
      name: 'login',
      execute: () => login({ email: 'pro@example.com', password: 'secret' }),
      path: '/users/login',
      method: 'POST',
      body: { email: 'pro@example.com', password: 'secret' },
    },
    {
      name: 'getStudents',
      execute: () => getStudents(),
      path: '/students',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'createStudent',
      execute: () => createStudent(studentPayload),
      path: '/students',
      method: 'POST',
      authenticated: true,
      body: studentPayload,
    },
    {
      name: 'updateStudent',
      execute: () => updateStudent(7, studentPayload),
      path: '/students/7',
      method: 'PUT',
      authenticated: true,
      body: studentPayload,
    },
    {
      name: 'deleteStudent',
      execute: () => deleteStudent(7),
      path: '/students/7',
      method: 'DELETE',
      authenticated: true,
      emptyResponse: true,
    },
    {
      name: 'getStudentObservations',
      execute: () => getStudentObservations(7),
      path: '/students/7/observations',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'createStudentObservation',
      execute: () => createStudentObservation(7, { message: 'Aluno evoluiu bem' }),
      path: '/students/7/observations',
      method: 'POST',
      authenticated: true,
      body: { message: 'Aluno evoluiu bem' },
    },
    {
      name: 'getMyObservations',
      execute: () => getMyObservations(),
      path: '/observations/me',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'getWorkouts',
      execute: () => getWorkouts(),
      path: '/workouts',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'getStudentWorkouts',
      execute: () => getStudentWorkouts(7),
      path: '/students/7/workouts',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'createStudentWorkout',
      execute: () => createStudentWorkout(7, workoutPayload),
      path: '/students/7/workouts',
      method: 'POST',
      authenticated: true,
      body: workoutPayload,
    },
    {
      name: 'updateStudentWorkout',
      execute: () => updateStudentWorkout(7, 9, { durationMinutes: 75 }),
      path: '/students/7/workouts/9',
      method: 'PUT',
      authenticated: true,
      body: { durationMinutes: 75 },
    },
    {
      name: 'deleteStudentWorkout',
      execute: () => deleteStudentWorkout(7, 9),
      path: '/students/7/workouts/9',
      method: 'DELETE',
      authenticated: true,
      emptyResponse: true,
    },
    {
      name: 'getMyWorkouts',
      execute: () => getMyWorkouts(),
      path: '/workouts/me',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'getNutritionPlans',
      execute: () => getNutritionPlans(),
      path: '/nutrition-plans',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'getStudentNutritionPlans',
      execute: () => getStudentNutritionPlans(7),
      path: '/students/7/nutrition-plans',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'createStudentNutritionPlan',
      execute: () => createStudentNutritionPlan(7, nutritionPlanPayload),
      path: '/students/7/nutrition-plans',
      method: 'POST',
      authenticated: true,
      body: nutritionPlanPayload,
    },
    {
      name: 'updateStudentNutritionPlan',
      execute: () => updateStudentNutritionPlan(7, 11, { calories: 2400 }),
      path: '/students/7/nutrition-plans/11',
      method: 'PUT',
      authenticated: true,
      body: { calories: 2400 },
    },
    {
      name: 'deleteStudentNutritionPlan',
      execute: () => deleteStudentNutritionPlan(7, 11),
      path: '/students/7/nutrition-plans/11',
      method: 'DELETE',
      authenticated: true,
      emptyResponse: true,
    },
    {
      name: 'getMyNutritionPlans',
      execute: () => getMyNutritionPlans(),
      path: '/nutrition-plans/me',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'getMetrics',
      execute: () => getMetrics(),
      path: '/metrics',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'getStudentMetrics',
      execute: () => getStudentMetrics(7),
      path: '/students/7/metrics',
      method: 'GET',
      authenticated: true,
    },
    {
      name: 'createStudentMetric',
      execute: () => createStudentMetric(7, metricPayload),
      path: '/students/7/metrics',
      method: 'POST',
      authenticated: true,
      body: metricPayload,
    },
    {
      name: 'updateStudentMetric',
      execute: () => updateStudentMetric(7, 13, { weightKg: 73 }),
      path: '/students/7/metrics/13',
      method: 'PUT',
      authenticated: true,
      body: { weightKg: 73 },
    },
    {
      name: 'deleteStudentMetric',
      execute: () => deleteStudentMetric(7, 13),
      path: '/students/7/metrics/13',
      method: 'DELETE',
      authenticated: true,
      emptyResponse: true,
    },
    {
      name: 'getMyMetrics',
      execute: () => getMyMetrics(),
      path: '/metrics/me',
      method: 'GET',
      authenticated: true,
    },
  ];

  it.each(apiCases)('envia a requisicao correta para $name', async (apiCase) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'jwt-token');

    if (apiCase.emptyResponse) {
      mockEmptyResponse();
    } else {
      mockJsonResponse({ ok: true });
    }

    await apiCase.execute();

    const [url, init] = getLastRequest();
    const headers = init.headers as Headers;

    expect(url).toBe(`${API_BASE_URL}${apiCase.path}`);
    expect(init.method).toBe(apiCase.method);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Authorization')).toBe(
      apiCase.authenticated ? 'Bearer jwt-token' : null,
    );

    if (apiCase.body) {
      expect(init.body).toBe(JSON.stringify(apiCase.body));
    } else {
      expect(init.body).toBeUndefined();
    }
  });

  it('nao envia Authorization quando nao existe token salvo', async () => {
    mockJsonResponse([]);

    await getStudents();

    const [, init] = getLastRequest();
    const headers = init.headers as Headers;

    expect(headers.get('Authorization')).toBeNull();
  });

  it('lanca ApiUnauthorizedError para respostas 401', async () => {
    mockTextResponse(null, 401);

    await expect(getStudents()).rejects.toBeInstanceOf(ApiUnauthorizedError);
  });

  it('lanca ApiRequestError usando mensagem retornada em array', async () => {
    mockTextResponse(JSON.stringify({ message: ['Nome obrigatorio', 'Email invalido'] }), 400);

    await expect(createStudent(studentPayload)).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 400,
      message: 'Nome obrigatorio Email invalido',
    });
  });

  it('lanca ApiRequestError usando fallback quando o corpo nao e JSON', async () => {
    mockTextResponse('erro interno', 500);

    await expect(getStudents()).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 500,
      message: 'Erro ao comunicar com a API',
    });
  });

  it('mantem status e mensagem customizada no ApiRequestError', () => {
    const error = new ApiRequestError(422, 'Dados invalidos');

    expect(error.status).toBe(422);
    expect(error.message).toBe('Dados invalidos');
    expect(error.name).toBe('ApiRequestError');
  });
});

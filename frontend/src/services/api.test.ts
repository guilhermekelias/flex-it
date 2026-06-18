import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiUnauthorizedError,
  createMyObservation,
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
  getMyObservationThreads,
  getMyObservations,
  getMyWorkouts,
  getNutritionPlans,
  getStudentMetrics,
  getStudentNutritionPlans,
  getStudentObservations,
  getStudents,
  getStudentWorkouts,
  getWorkouts,
  login,
  register,
  updateStudent,
  updateStudentMetric,
  updateStudentNutritionPlan,
  updateStudentWorkout,
} from './api';

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response.clone()));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('api service', () => {
  it('envia login sem token e interpreta resposta JSON', async () => {
    const fetchMock = mockFetch(
      jsonResponse({
        message: 'Login realizado com sucesso',
        user: {
          id: 1,
          name: 'Patricia Lima',
          email: 'patricia@example.com',
          role: 'professional',
        },
        accessToken: 'jwt-token',
      }),
    );

    const result = await login({
      email: 'patricia@example.com',
      password: '123456',
    });
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/login',
      expect.objectContaining({ method: 'POST' }),
    );
    expect((options.headers as Headers).get('Content-Type')).toBe('application/json');
    expect((options.headers as Headers).has('Authorization')).toBe(false);
    expect(result.accessToken).toBe('jwt-token');
  });

  it('inclui authorization em chamadas autenticadas', async () => {
    localStorage.setItem('flexit_token', 'jwt-token');
    const fetchMock = mockFetch(jsonResponse([]));

    await getStudents();
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/students',
      expect.objectContaining({ method: 'GET' }),
    );
    expect((options.headers as Headers).get('Authorization')).toBe('Bearer jwt-token');
  });

  it('propaga erro 401 como ApiUnauthorizedError', async () => {
    mockFetch(new Response('', { status: 401 }));

    await expect(getStudents()).rejects.toBeInstanceOf(ApiUnauthorizedError);
  });

  it('normaliza mensagens de erro retornadas pela API', async () => {
    mockFetch(jsonResponse({ message: ['E-mail invalido', 'Senha obrigatoria'] }, { status: 400 }));

    await expect(
      register({
        name: 'Patricia Lima',
        email: 'patricia',
        password: '',
        role: 'professional',
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'E-mail invalido Senha obrigatoria',
    });
  });

  it('monta threads de observacao quando o endpoint novo ainda nao existe', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Not found' }, { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            studentId: 10,
            professionalId: 1,
            message: 'Primeira mensagem',
            senderRole: 'professional',
            createdAt: '2026-06-05T12:00:00Z',
          },
          {
            id: 2,
            studentId: 10,
            professionalId: 1,
            message: 'Resposta do aluno',
            senderRole: 'student',
            createdAt: '2026-06-05T13:00:00Z',
          },
        ]),
      );
    vi.stubGlobal('fetch', fetchMock);

    const threads = await getMyObservationThreads();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/observations/me/threads',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/observations/me',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(threads).toHaveLength(1);
    expect(threads[0].messages).toHaveLength(2);
  });

  it('expoe os endpoints autenticados do dominio profissional e do portal do aluno', async () => {
    localStorage.setItem('flexit_token', 'jwt-token');
    const fetchMock = mockFetch(new Response('', { status: 200 }));

    await createStudent({ name: 'Ana', email: 'ana@example.com', age: 28, goal: 'Forca' });
    await updateStudent(10, { name: 'Ana', email: 'ana@example.com', age: 29, goal: 'Forca' });
    await deleteStudent(10);
    await getWorkouts();
    await getStudentWorkouts(10);
    await createStudentWorkout(10, {
      name: 'Treino A',
      type: 'Forca',
      durationMinutes: 50,
    });
    await updateStudentWorkout(10, 20, { durationMinutes: 55 });
    await deleteStudentWorkout(10, 20);
    await getNutritionPlans();
    await getStudentNutritionPlans(10);
    await createStudentNutritionPlan(10, {
      name: 'Plano A',
      objective: 'Ganho de massa',
      calories: 2400,
      proteinGrams: 160,
      carbsGrams: 300,
      fatGrams: 70,
      mealsCount: 1,
    });
    await updateStudentNutritionPlan(10, 40, { calories: 2500 });
    await deleteStudentNutritionPlan(10, 40);
    await getMetrics();
    await getStudentMetrics(10);
    await createStudentMetric(10, { weightKg: 72.4 });
    await updateStudentMetric(10, 30, { weightKg: 73 });
    await deleteStudentMetric(10, 30);
    await getStudentObservations(10);
    await createStudentObservation(10, { message: 'Boa evolucao' });
    await getMyObservations();
    await createMyObservation({ studentId: 10, message: 'Mensagem do aluno' });
    await getMyWorkouts();
    await getMyNutritionPlans();
    await getMyMetrics();

    const requestedUrls = fetchMock.mock.calls.map(([url]) => url);

    expect(requestedUrls).toContain('/api/students/10/workouts/20');
    expect(requestedUrls).toContain('/api/students/10/nutrition-plans/40');
    expect(requestedUrls).toContain('/api/students/10/metrics/30');
    expect(requestedUrls).toContain('/api/observations/me');
    expect(requestedUrls).toContain('/api/workouts/me');
    expect(requestedUrls).toContain('/api/nutrition-plans/me');
    expect(requestedUrls).toContain('/api/metrics/me');
  });
});

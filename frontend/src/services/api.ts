export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  goal: string;
};

export type StudentPayload = Omit<Student, 'id'>;

export type Observation = {
  id: number;
  message: string;
  studentId: number;
  professionalId: number;
  createdAt: string;
};

export type ObservationPayload = {
  message: string;
};

export type Workout = {
  id: number;
  name: string;
  description: string | null;
  type: string;
  durationMinutes: number;
  exercisesCount: number;
  studentId: number;
  professionalId: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutPayload = {
  name: string;
  description?: string | null;
  type: string;
  durationMinutes: number;
  exercisesCount: number;
};

export type WorkoutUpdatePayload = Partial<WorkoutPayload>;

export type Metric = {
  id: number;
  weightKg: number | null;
  heightCm: number | null;
  bodyFatPercentage: number | null;
  muscleMassKg: number | null;
  notes: string | null;
  recordedAt: string;
  studentId: number;
  professionalId: number;
  createdAt: string;
  updatedAt: string;
};

export type MetricPayload = {
  weightKg?: number | null;
  heightCm?: number | null;
  bodyFatPercentage?: number | null;
  muscleMassKg?: number | null;
  notes?: string | null;
  recordedAt?: string;
};

export type MetricUpdatePayload = Partial<MetricPayload>;

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user?: User;
  accessToken?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const AUTH_TOKEN_STORAGE_KEY = 'flexit_token';

type RequestOptions = RequestInit & {
  authenticated?: boolean;
};

export class ApiUnauthorizedError extends Error {
  constructor() {
    super('Sessao expirada ou nao autorizada');
    this.name = 'ApiUnauthorizedError';
  }
}

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.authenticated) {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  if (response.status === 401) {
    throw new ApiUnauthorizedError();
  }

  if (!response.ok) {
    throw new ApiRequestError(response.status, await parseErrorMessage(response));
  }

  const responseBody = await response.text();
  return (responseBody ? JSON.parse(responseBody) : undefined) as T;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = 'Erro ao comunicar com a API';
  const responseBody = await response.text();

  if (!responseBody) {
    return fallbackMessage;
  }

  try {
    const parsedBody = JSON.parse(responseBody) as { message?: string | string[] };

    if (Array.isArray(parsedBody.message)) {
      return parsedBody.message.join(' ');
    }

    return parsedBody.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function login(credentials: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function getStudents(): Promise<Student[]> {
  return request<Student[]>('/students', {
    method: 'GET',
    authenticated: true,
  });
}

export function createStudent(studentData: StudentPayload): Promise<Student> {
  return request<Student>('/students', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(studentData),
  });
}

export function updateStudent(id: number, studentData: StudentPayload): Promise<Student> {
  return request<Student>(`/students/${id}`, {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(studentData),
  });
}

export function deleteStudent(id: number): Promise<void> {
  return request<void>(`/students/${id}`, {
    method: 'DELETE',
    authenticated: true,
  });
}

export function getStudentObservations(studentId: number): Promise<Observation[]> {
  return request<Observation[]>(`/students/${studentId}/observations`, {
    method: 'GET',
    authenticated: true,
  });
}

export function createStudentObservation(
  studentId: number,
  observationData: ObservationPayload,
): Promise<Observation> {
  return request<Observation>(`/students/${studentId}/observations`, {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(observationData),
  });
}

export function getMyObservations(): Promise<Observation[]> {
  return request<Observation[]>('/observations/me', {
    method: 'GET',
    authenticated: true,
  });
}

export function getWorkouts(): Promise<Workout[]> {
  return request<Workout[]>('/workouts', {
    method: 'GET',
    authenticated: true,
  });
}

export function getStudentWorkouts(studentId: number): Promise<Workout[]> {
  return request<Workout[]>(`/students/${studentId}/workouts`, {
    method: 'GET',
    authenticated: true,
  });
}

export function createStudentWorkout(
  studentId: number,
  workoutData: WorkoutPayload,
): Promise<Workout> {
  return request<Workout>(`/students/${studentId}/workouts`, {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(workoutData),
  });
}

export function updateStudentWorkout(
  studentId: number,
  workoutId: number,
  workoutData: WorkoutUpdatePayload,
): Promise<Workout> {
  return request<Workout>(`/students/${studentId}/workouts/${workoutId}`, {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(workoutData),
  });
}

export function deleteStudentWorkout(studentId: number, workoutId: number): Promise<void> {
  return request<void>(`/students/${studentId}/workouts/${workoutId}`, {
    method: 'DELETE',
    authenticated: true,
  });
}

export function getMyWorkouts(): Promise<Workout[]> {
  return request<Workout[]>('/workouts/me', {
    method: 'GET',
    authenticated: true,
  });
}

export function getMetrics(): Promise<Metric[]> {
  return request<Metric[]>('/metrics', {
    method: 'GET',
    authenticated: true,
  });
}

export function getStudentMetrics(studentId: number): Promise<Metric[]> {
  return request<Metric[]>(`/students/${studentId}/metrics`, {
    method: 'GET',
    authenticated: true,
  });
}

export function createStudentMetric(
  studentId: number,
  metricData: MetricPayload,
): Promise<Metric> {
  return request<Metric>(`/students/${studentId}/metrics`, {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(metricData),
  });
}

export function updateStudentMetric(
  studentId: number,
  metricId: number,
  metricData: MetricUpdatePayload,
): Promise<Metric> {
  return request<Metric>(`/students/${studentId}/metrics/${metricId}`, {
    method: 'PUT',
    authenticated: true,
    body: JSON.stringify(metricData),
  });
}

export function deleteStudentMetric(studentId: number, metricId: number): Promise<void> {
  return request<void>(`/students/${studentId}/metrics/${metricId}`, {
    method: 'DELETE',
    authenticated: true,
  });
}

export function getMyMetrics(): Promise<Metric[]> {
  return request<Metric[]>('/metrics/me', {
    method: 'GET',
    authenticated: true,
  });
}

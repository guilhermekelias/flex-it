export type UserRole = 'professional' | 'student';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  goal: string;
  userId?: number | null;
};

export type StudentPayload = Pick<Student, 'name' | 'email' | 'age' | 'goal'>;

export type ObservationSenderRole = 'professional' | 'student';

export type Observation = {
  id: number;
  message: string;
  studentId: number;
  professionalId: number;
  senderRole?: ObservationSenderRole | null;
  createdAt: string;
};

export type ObservationPayload = {
  message: string;
};

export type StudentObservationPayload = ObservationPayload & {
  studentId: number;
};

export type ObservationThread = {
  studentId: number;
  professionalId: number | null;
  messages: Observation[];
};

export type WorkoutExercise = {
  name: string;
  sets?: number | null;
  reps?: string | null;
  rest?: string | null;
  notes?: string | null;
};

export type Workout = {
  id: number;
  name: string;
  description: string | null;
  type: string;
  durationMinutes: number;
  exercisesCount: number;
  exercises?: WorkoutExercise[] | null;
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
  exercisesCount?: number;
  exercises?: WorkoutExercise[];
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

export type NutritionPlanFood = {
  name: string;
  quantity?: string | null;
  calories?: number | null;
};

export type NutritionPlanMeal = {
  name: string;
  time?: string | null;
  foods: NutritionPlanFood[];
};

export type NutritionPlan = {
  id: number;
  name: string;
  objective: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealsCount: number;
  meals?: NutritionPlanMeal[] | null;
  notes: string | null;
  studentId: number;
  professionalId: number;
  createdAt: string;
  updatedAt: string;
};

export type NutritionPlanPayload = {
  name: string;
  objective: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealsCount: number;
  meals?: NutritionPlanMeal[];
  notes?: string | null;
};

export type NutritionPlanUpdatePayload = Partial<NutritionPlanPayload>;

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
  role: UserRole;
};

export type LoginResponse = {
  message: string;
  user?: User;
  accessToken?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const AUTH_TOKEN_STORAGE_KEY = 'flexit_token';

function buildObservationThreadsFromMessages(
  observations: Observation[],
): ObservationThread[] {
  const threads = new Map<number, ObservationThread>();

  observations.forEach((observation) => {
    const currentThread = threads.get(observation.studentId);

    if (currentThread) {
      currentThread.messages.push(observation);

      if (!currentThread.professionalId) {
        currentThread.professionalId = observation.professionalId;
      }

      return;
    }

    threads.set(observation.studentId, {
      studentId: observation.studentId,
      professionalId: observation.professionalId,
      messages: [observation],
    });
  });

  return Array.from(threads.values());
}

type RequestOptions = RequestInit & {
  authenticated?: boolean;
};

export class ApiUnauthorizedError extends Error {
  constructor() {
    super('Sessão expirada ou não autorizada');
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

export function register(userData: RegisterPayload): Promise<User> {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
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

export async function getMyObservationThreads(): Promise<ObservationThread[]> {
  try {
    return await request<ObservationThread[]>('/observations/me/threads', {
      method: 'GET',
      authenticated: true,
    });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      // Keep the student portal readable with deployments that only expose /observations/me.
      return buildObservationThreadsFromMessages(await getMyObservations());
    }

    throw error;
  }
}

export function createMyObservation(
  observationData: StudentObservationPayload,
): Promise<Observation> {
  return request<Observation>('/observations/me', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(observationData),
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

export function getNutritionPlans(): Promise<NutritionPlan[]> {
  return request<NutritionPlan[]>('/nutrition-plans', {
    method: 'GET',
    authenticated: true,
  });
}

export function getStudentNutritionPlans(studentId: number): Promise<NutritionPlan[]> {
  return request<NutritionPlan[]>(`/students/${studentId}/nutrition-plans`, {
    method: 'GET',
    authenticated: true,
  });
}

export function createStudentNutritionPlan(
  studentId: number,
  nutritionPlanData: NutritionPlanPayload,
): Promise<NutritionPlan> {
  return request<NutritionPlan>(`/students/${studentId}/nutrition-plans`, {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify(nutritionPlanData),
  });
}

export function updateStudentNutritionPlan(
  studentId: number,
  nutritionPlanId: number,
  nutritionPlanData: NutritionPlanUpdatePayload,
): Promise<NutritionPlan> {
  return request<NutritionPlan>(
    `/students/${studentId}/nutrition-plans/${nutritionPlanId}`,
    {
      method: 'PUT',
      authenticated: true,
      body: JSON.stringify(nutritionPlanData),
    },
  );
}

export function deleteStudentNutritionPlan(
  studentId: number,
  nutritionPlanId: number,
): Promise<void> {
  return request<void>(`/students/${studentId}/nutrition-plans/${nutritionPlanId}`, {
    method: 'DELETE',
    authenticated: true,
  });
}

export function getMyNutritionPlans(): Promise<NutritionPlan[]> {
  return request<NutritionPlan[]>('/nutrition-plans/me', {
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

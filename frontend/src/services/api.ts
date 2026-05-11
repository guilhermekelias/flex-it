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
    throw new Error('Erro ao comunicar com a API');
  }

  const responseBody = await response.text();
  return (responseBody ? JSON.parse(responseBody) : undefined) as T;
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

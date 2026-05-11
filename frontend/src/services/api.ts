export type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  goal: string;
};

export type StudentPayload = Omit<Student, 'id'>;

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao comunicar com a API');
  }

  return response.json() as Promise<T>;
}

export function updateStudent(id: number, studentData: StudentPayload): Promise<Student> {
  return request<Student>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });
}

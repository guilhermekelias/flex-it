import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import {
  ApiUnauthorizedError,
  createStudent as createStudentRequest,
  deleteStudent as deleteStudentRequest,
  getStudents,
  login,
  updateStudent as updateStudentRequest,
  type Student,
  type User,
} from './services/api';

const AUTH_USER_STORAGE_KEY = 'flexit_user';
const AUTH_TOKEN_STORAGE_KEY = 'flexit_token';

export function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    const savedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (savedUser && savedToken) {
      try {
        setLoggedUser(JSON.parse(savedUser) as User);
      } catch {
        clearSession();
      }
    }
  }, []);

  useEffect(() => {
    if (loggedUser) {
      fetchStudents();
    }
  }, [loggedUser]);

  const clearSession = (nextMessage = '') => {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setLoggedUser(null);
    setStudents([]);
    setMessage(nextMessage);
  };

  const handleApiError = (error: unknown) => {
    if (error instanceof ApiUnauthorizedError) {
      clearSession('Sessao expirada. Faca login novamente.');
      return;
    }

    console.error(error);
  };

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      handleApiError(error);
    }
  };

  const createStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      await createStudentRequest(studentData);
      await fetchStudents();
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateStudent = async (id: number, studentData: Omit<Student, 'id'>) => {
    try {
      const updatedStudent = await updateStudentRequest(id, studentData);

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student,
        ),
      );

      return updatedStudent;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      await deleteStudentRequest(id);
      await fetchStudents();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleLogin = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    setMessage('');

    try {
      const data = await login({ email, password });

      setMessage(data.message);

      if (data.user && data.accessToken) {
        setLoggedUser(data.user);
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(data.user));
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.accessToken);
        setEmail('');
        setPassword('');
      }
    } catch {
      setMessage('Erro ao conectar com o servidor');
    }
  };

  const handleLogout = () => {
    clearSession();
  };

  if (loggedUser) {
    return (
      <DashboardPage
        user={loggedUser}
        students={students}
        onCreateStudent={createStudent}
        onUpdateStudent={updateStudent}
        onDeleteStudent={deleteStudent}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LoginPage
      email={email}
      password={password}
      message={message}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleLogin}
    />
  );
}

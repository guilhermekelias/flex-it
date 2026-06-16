import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardPage } from './components/DashboardPage';
import { StudentPortal } from './components/StudentPortal';
import {
  ApiRequestError,
  ApiUnauthorizedError,
  createStudent as createStudentRequest,
  deleteStudent as deleteStudentRequest,
  getStudents,
  login,
  register,
  updateStudent as updateStudentRequest,
  type RegisterPayload,
  type Student,
  type StudentPayload,
  type User,
} from './services/api';

const AUTH_USER_STORAGE_KEY = 'flexit_user';
const AUTH_TOKEN_STORAGE_KEY = 'flexit_token';

function getUserExperience(user: User) {
  return user.role === 'student' ? 'student' : 'professional';
}

type AuthView = 'login' | 'register';

export function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [authView, setAuthView] = useState<AuthView>('login');
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
    if (!loggedUser) {
      return;
    }

    if (getUserExperience(loggedUser) === 'professional') {
      fetchStudents();
      return;
    }

    setStudents([]);
  }, [loggedUser]);

  const clearSession = (nextMessage = '') => {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setLoggedUser(null);
    setStudents([]);
    setMessage(nextMessage);
    setAuthView('login');
  };

  const saveSession = (user: User, accessToken: string) => {
    setLoggedUser(user);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
  };

  const handleSessionExpired = () => {
    clearSession('Sessao expirada. Faca login novamente.');
  };

  const handleApiError = (error: unknown) => {
    if (error instanceof ApiUnauthorizedError) {
      handleSessionExpired();
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

  const createStudent = async (studentData: StudentPayload) => {
    try {
      await createStudentRequest(studentData);
      await fetchStudents();
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateStudent = async (id: number, studentData: StudentPayload) => {
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
        saveSession(data.user, data.accessToken);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setMessage(
        error instanceof ApiRequestError ? error.message : 'Erro ao conectar com o servidor',
      );
    }
  };

  const handleRegister = async (payload: RegisterPayload) => {
    setMessage('');

    try {
      await register(payload);
      const data = await login({
        email: payload.email,
        password: payload.password,
      });

      if (data.user && data.accessToken) {
        saveSession(data.user, data.accessToken);
        setEmail('');
        setPassword('');
        return;
      }

      setAuthView('login');
      setMessage(data.message || 'Conta criada. Faca login para continuar.');
    } catch (error) {
      setMessage(
        error instanceof ApiRequestError ? error.message : 'Erro ao conectar com o servidor',
      );
    }
  };

  const handleLogout = () => {
    clearSession();
  };

  if (loggedUser) {
    if (getUserExperience(loggedUser) === 'student') {
      return (
        <StudentPortal
          user={loggedUser}
          onLogout={handleLogout}
          onSessionExpired={handleSessionExpired}
        />
      );
    }

    return (
      <DashboardPage
        user={loggedUser}
        students={students}
        onCreateStudent={createStudent}
        onUpdateStudent={updateStudent}
        onDeleteStudent={deleteStudent}
        onSessionExpired={handleSessionExpired}
        onLogout={handleLogout}
      />
    );
  }

  if (authView === 'register') {
    return (
      <RegisterPage
        message={message}
        onBackToLogin={() => {
          setMessage('');
          setAuthView('login');
        }}
        onSubmit={handleRegister}
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
      onCreateAccountClick={() => {
        setMessage('');
        setAuthView('register');
      }}
    />
  );
}

import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  goal: string;
};

type LoginResponse = {
  message: string;
  user?: User;
};

export function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('flexit_user');

    if (savedUser) {
      setLoggedUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (loggedUser) {
      fetchStudents();
    }
  }, [loggedUser]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:3000/students');
      const data = await response.json();
      setStudents(data);
    } catch {
      console.error('Erro ao buscar alunos');
    }
  };

  const createStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const response = await fetch('http://localhost:3000/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar aluno');
      }

      await fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteStudent = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:3000/students/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar aluno');
    }

    await fetchStudents();
  } catch (error) {
    console.error(error);
  }
};

  const handleLogin = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      setMessage(data.message);

      if (data.user) {
        setLoggedUser(data.user);
        localStorage.setItem('flexit_user', JSON.stringify(data.user));
        setEmail('');
        setPassword('');
      }
    } catch {
      setMessage('Erro ao conectar com o servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('flexit_user');
    setLoggedUser(null);
    setStudents([]);
    setMessage('');
  };

  if (loggedUser) {
    return (
      <DashboardPage
        user={loggedUser}
        students={students}
        onCreateStudent={createStudent}
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
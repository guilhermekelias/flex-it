import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

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

type DashboardPageProps = {
  user: User;
  students: Student[];
  onCreateStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  onLogout: () => void;
};

export function DashboardPage({
  user,
  students,
  onCreateStudent,
  onLogout,
}: DashboardPageProps) {
  const [name, setName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    await onCreateStudent({
      name,
      email: studentEmail,
      age: Number(age),
      goal,
    });

    setName('');
    setStudentEmail('');
    setAge('');
    setGoal('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.headerCard}>
          <h1 style={styles.title}>FlexIt</h1>
          <p style={styles.subtitle}>Dashboard inicial</p>
          <p style={styles.welcome}>Bem-vindo, {user.name}</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Alunos</h3>
            <p style={styles.cardValue}>{students.length}</p>
            <span style={styles.cardText}>Cadastrados</span>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Treinos</h3>
            <p style={styles.cardValue}>--</p>
            <span style={styles.cardText}>Em breve</span>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Métricas</h3>
            <p style={styles.cardValue}>--</p>
            <span style={styles.cardText}>Em breve</span>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.sectionTitle}>Cadastrar aluno</h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Nome do aluno"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              style={styles.input}
            />

            <input
              type="email"
              placeholder="Email do aluno"
              value={studentEmail}
              onInput={(e) => setStudentEmail((e.target as HTMLInputElement).value)}
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Idade"
              value={age}
              onInput={(e) => setAge((e.target as HTMLInputElement).value)}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Objetivo"
              value={goal}
              onInput={(e) => setGoal((e.target as HTMLInputElement).value)}
              style={styles.input}
            />

            <button type="submit" style={styles.button}>
              Cadastrar aluno
            </button>
          </form>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.sectionTitle}>Alunos cadastrados</h3>

          {students.length === 0 ? (
            <p>Nenhum aluno cadastrado</p>
          ) : (
            <ul style={styles.list}>
              {students.map((student) => (
                <li key={student.id}>
                  <strong>{student.name}</strong> - {student.goal}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.sectionTitle}>Informações do usuário</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Perfil:</strong> {user.role}</p>
        </div>

        <button onClick={onLogout} style={styles.logoutButton}>
          Sair
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, JSX.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: 'Arial, sans-serif',
    padding: '40px 20px',
  },
  wrapper: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    color: '#111827',
    fontSize: '2.2rem',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '8px',
    marginBottom: '12px',
  },
  welcome: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
  },
  cardTitle: {
    margin: 0,
    color: '#374151',
    fontSize: '1rem',
  },
  cardValue: {
    margin: '12px 0 6px 0',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  cardText: {
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
    marginBottom: '20px',
  },
  sectionTitle: {
    marginTop: 0,
    color: '#111827',
  },
  list: {
    margin: '10px 0 0 18px',
    padding: 0,
    color: '#374151',
  },
  form: {
    display: 'grid',
    gap: '12px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  logoutButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '16px',
    cursor: 'pointer',
  },
};
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
  onDeleteStudent: (id: number) => Promise<void>;
  onLogout: () => void;
};

function getFirstName(name: string) {
  return name.trim().split(' ')[0] || 'profissional';
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'AL';
}

function formatAge(age: number) {
  return Number.isFinite(age) && age > 0 ? `${age} anos` : 'Idade não informada';
}

export function DashboardPage({
  user,
  students,
  onCreateStudent,
  onDeleteStudent,
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

  const stats = [
    {
      label: 'Alunos',
      value: students.length,
      helper: 'Cadastrados',
      tone: 'primary',
    },
    {
      label: 'Treinos',
      value: '--',
      helper: 'Em breve',
      tone: 'violet',
    },
    {
      label: 'Métricas',
      value: '--',
      helper: 'Em breve',
      tone: 'amber',
    },
  ];

  return (
    <div className="dashboard-shell">
      <main className="dashboard-page">
        <header className="dashboard-hero">
          <div className="dashboard-topbar">
            <div className="dashboard-brand" aria-label="FlexIt">
              <span className="dashboard-brand-mark">F</span>
              <span>FlexIt</span>
            </div>

            <button className="dashboard-logout-compact" onClick={onLogout} type="button">
              Sair
            </button>
          </div>

          <div className="dashboard-hero-content">
            <span className="dashboard-eyebrow">Dashboard profissional</span>
            <h1>Olá, {getFirstName(user.name)}</h1>
            <p>
              Acompanhe seus alunos, organize novos cadastros e prepare a evolução do app.
            </p>
          </div>
        </header>

        <section className="dashboard-stats" aria-label="Resumo da dashboard">
          {stats.map((stat) => (
            <article className={`dashboard-stat dashboard-stat-${stat.tone}`} key={stat.label}>
              <span className="dashboard-stat-label">{stat.label}</span>
              <strong>{stat.value}</strong>
              <span className="dashboard-stat-helper">{stat.helper}</span>
            </article>
          ))}
        </section>

        <section className="dashboard-content-grid">
          <article className="dashboard-panel">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-section-kicker">Novo acompanhamento</span>
                <h2>Cadastrar aluno</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="student-form">
              <label>
                <span>Nome do aluno</span>
                <input
                  type="text"
                  placeholder="Ex: Ana Silva"
                  value={name}
                  onInput={(e) => setName((e.target as HTMLInputElement).value)}
                />
              </label>

              <label>
                <span>Email do aluno</span>
                <input
                  type="email"
                  placeholder="ana@email.com"
                  value={studentEmail}
                  onInput={(e) => setStudentEmail((e.target as HTMLInputElement).value)}
                />
              </label>

              <div className="student-form-row">
                <label>
                  <span>Idade</span>
                  <input
                    type="number"
                    placeholder="28"
                    value={age}
                    onInput={(e) => setAge((e.target as HTMLInputElement).value)}
                  />
                </label>

                <label>
                  <span>Objetivo</span>
                  <input
                    type="text"
                    placeholder="Hipertrofia"
                    value={goal}
                    onInput={(e) => setGoal((e.target as HTMLInputElement).value)}
                  />
                </label>
              </div>

              <button className="dashboard-primary-button" type="submit">
                Cadastrar aluno
              </button>
            </form>
          </article>

          <article className="dashboard-panel dashboard-students-panel">
            <div className="dashboard-section-heading dashboard-section-heading-row">
              <div>
                <span className="dashboard-section-kicker">Carteira ativa</span>
                <h2>Alunos cadastrados</h2>
              </div>
              <span className="dashboard-count-pill">{students.length}</span>
            </div>

            {students.length === 0 ? (
              <div className="dashboard-empty-state">
                <span>Nenhum aluno cadastrado</span>
                <p>Quando um aluno for criado, ele aparecerá aqui em formato de card.</p>
              </div>
            ) : (
              <ul className="student-card-list">
                {students.map((student) => (
                  <li className="student-card" key={student.id}>
                    <div className="student-avatar" aria-hidden="true">
                      {getInitials(student.name)}
                    </div>

                    <div className="student-card-body">
                      <div className="student-card-main">
                        <div>
                          <h3>{student.name}</h3>
                          <p>{student.goal || 'Objetivo não informado'}</p>
                        </div>

                        <button
                          className="student-remove-button"
                          onClick={() => onDeleteStudent(student.id)}
                          type="button"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="student-card-meta">
                        <span>{formatAge(student.age)}</span>
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section className="dashboard-panel dashboard-user-panel">
          <div>
            <span className="dashboard-section-kicker">Sessão atual</span>
            <h2>Informações do usuário</h2>
          </div>

          <div className="dashboard-user-details">
            <p>
              <span>Email</span>
              <strong>{user.email}</strong>
            </p>
            <p>
              <span>Perfil</span>
              <strong>{user.role}</strong>
            </p>
          </div>

          <button className="dashboard-secondary-button" onClick={onLogout} type="button">
            Sair da conta
          </button>
        </section>
      </main>
    </div>
  );
}

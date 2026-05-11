import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { BottomNavigation, type DashboardTab } from './BottomNavigation';

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

type ComingSoonPanelProps = {
  id: string;
  title: string;
  description: string;
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
  return Number.isFinite(age) && age > 0 ? `${age} anos` : 'Idade n\u00e3o informada';
}

function ComingSoonPanel({ id, title, description }: ComingSoonPanelProps) {
  return (
    <section className="dashboard-tab-page" aria-labelledby={`${id}-title`}>
      <article className="dashboard-coming-soon-panel">
        <span className="dashboard-coming-soon-badge">Em breve</span>
        <h1 id={`${id}-title`}>{title}</h1>
        <p>{description}</p>
      </article>
    </section>
  );
}

export function DashboardPage({
  user,
  students,
  onCreateStudent,
  onDeleteStudent,
  onLogout,
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
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
      tone: 'green',
    },
    {
      label: 'Dietas',
      value: '--',
      helper: 'Em breve',
      tone: 'amber',
    },
    {
      label: 'M\u00e9tricas',
      value: '--',
      helper: 'Em breve',
      tone: 'rose',
    },
  ];

  const renderHomeTab = () => (
    <section className="dashboard-tab-page" aria-labelledby="home-title">
      <header className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">Dashboard profissional</span>
          <h1 id="home-title">{'Ol\u00e1'}, {getFirstName(user.name)}</h1>
          <p>
            {
              'Acompanhe seus alunos, organize novos cadastros e prepare a evolu\u00e7\u00e3o dos pr\u00f3ximos m\u00f3dulos do FlexIt.'
            }
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

      <section className="dashboard-panel dashboard-user-panel">
        <div>
          <span className="dashboard-section-kicker">{'Sess\u00e3o atual'}</span>
          <h2>{'Informa\u00e7\u00f5es do usu\u00e1rio'}</h2>
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
    </section>
  );

  const renderStudentsTab = () => (
    <section className="dashboard-tab-page" aria-labelledby="students-title">
      <div className="dashboard-page-heading">
        <span className="dashboard-section-kicker">Carteira de acompanhamento</span>
        <h1 id="students-title">Alunos</h1>
        <p>Cadastre novos alunos e acompanhe a lista ativa do profissional.</p>
      </div>

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
              <p>{'Quando um aluno for criado, ele aparecer\u00e1 aqui em formato de card.'}</p>
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
                        <p>{student.goal || 'Objetivo n\u00e3o informado'}</p>
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
    </section>
  );

  return (
    <div className="dashboard-shell">
      <main className="dashboard-page">
        <header className="dashboard-app-header">
          <div className="dashboard-brand" aria-label="FlexIt">
            <span className="dashboard-brand-mark">F</span>
            <span>FlexIt</span>
          </div>

          <div className="dashboard-app-actions">
            <span className="dashboard-user-chip">{getFirstName(user.name)}</span>
            <button className="dashboard-logout-compact" onClick={onLogout} type="button">
              Sair
            </button>
          </div>
        </header>

        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'students' && renderStudentsTab()}
        {activeTab === 'workouts' && (
          <ComingSoonPanel
            id="workouts"
            title="Treinos"
            description={
              'O m\u00f3dulo de prescri\u00e7\u00e3o e organiza\u00e7\u00e3o de treinos ser\u00e1 preparado em uma pr\u00f3xima sprint.'
            }
          />
        )}
        {activeTab === 'diets' && (
          <ComingSoonPanel
            id="diets"
            title="Dietas"
            description={
              'O acompanhamento nutricional ainda n\u00e3o foi implementado e permanecer\u00e1 como placeholder nesta entrega.'
            }
          />
        )}
        {activeTab === 'metrics' && (
          <ComingSoonPanel
            id="metrics"
            title={'M\u00e9tricas'}
            description={
              'A evolu\u00e7\u00e3o corporal e os indicadores de progresso ser\u00e3o adicionados depois.'
            }
          />
        )}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

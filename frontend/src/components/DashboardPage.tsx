import { useEffect, useState } from 'preact/hooks';
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
  onUpdateStudent: (id: number, student: Omit<Student, 'id'>) => Promise<Student>;
  onDeleteStudent: (id: number) => Promise<void>;
  onLogout: () => void;
};

type WorkoutPlan = {
  id: number;
  studentName: string;
  title: string;
  duration: string;
  exercises: number;
  category: string;
  date: string;
  intensity: string;
  focus: string;
  progress: number;
};

type DietPlan = {
  id: number;
  studentName: string;
  title: string;
  calories: number;
  meals: number;
  goal: string;
  date: string;
  protein: string;
  carbs: string;
  fats: string;
};

type MetricSnapshot = {
  id: number;
  studentName: string;
  initials: string;
  updatedAt: string;
  weight: string;
  bodyFat: string;
  muscleMass: string;
  imc: string;
  trend: string;
  points: number[];
  measurements: Array<{
    label: string;
    value: string;
    change: string;
    tone: 'positive' | 'negative' | 'neutral';
  }>;
};

const workoutPlans: WorkoutPlan[] = [
  {
    id: 1,
    studentName: 'Ana Silva',
    title: 'Treino A - Peito e Triceps',
    duration: '60 min',
    exercises: 8,
    category: 'Superior',
    date: '10/05/2026',
    intensity: 'Moderada',
    focus: 'Hipertrofia',
    progress: 72,
  },
  {
    id: 2,
    studentName: 'Carlos Santos',
    title: 'Treino B - Costas e Biceps',
    duration: '55 min',
    exercises: 7,
    category: 'Superior',
    date: '09/05/2026',
    intensity: 'Alta',
    focus: 'Forca',
    progress: 64,
  },
  {
    id: 3,
    studentName: 'Beatriz Costa',
    title: 'Treino C - Pernas',
    duration: '70 min',
    exercises: 10,
    category: 'Inferior',
    date: '08/05/2026',
    intensity: 'Alta',
    focus: 'Resistencia',
    progress: 86,
  },
];

const dietPlans: DietPlan[] = [
  {
    id: 1,
    studentName: 'Ana Silva',
    title: 'Plano para Emagrecimento',
    calories: 1800,
    meals: 6,
    goal: 'Perda de peso',
    date: '01/05/2026',
    protein: '120g',
    carbs: '185g',
    fats: '58g',
  },
  {
    id: 2,
    studentName: 'Carlos Santos',
    title: 'Plano de Ganho de Massa',
    calories: 3200,
    meals: 6,
    goal: 'Hipertrofia',
    date: '28/04/2026',
    protein: '180g',
    carbs: '410g',
    fats: '88g',
  },
  {
    id: 3,
    studentName: 'Beatriz Costa',
    title: 'Plano Equilibrado',
    calories: 2200,
    meals: 5,
    goal: 'Manutencao',
    date: '15/04/2026',
    protein: '135g',
    carbs: '250g',
    fats: '72g',
  },
];

const metricSnapshots: MetricSnapshot[] = [
  {
    id: 1,
    studentName: 'Ana Silva',
    initials: 'AS',
    updatedAt: '10/05/2026',
    weight: '68,9 kg',
    bodyFat: '24,5%',
    muscleMass: '52,1 kg',
    imc: '25,3',
    trend: '-3,1 kg em 10 semanas',
    points: [34, 42, 50, 58, 68, 78],
    measurements: [
      { label: 'Cintura', value: '72 cm', change: '-3 cm', tone: 'positive' },
      { label: 'Quadril', value: '98 cm', change: '-2 cm', tone: 'positive' },
      { label: 'Braco direito', value: '32 cm', change: '+1 cm', tone: 'positive' },
    ],
  },
  {
    id: 2,
    studentName: 'Carlos Santos',
    initials: 'CS',
    updatedAt: '08/05/2026',
    weight: '84,2 kg',
    bodyFat: '18,8%',
    muscleMass: '66,4 kg',
    imc: '26,1',
    trend: '+1,8 kg de massa magra',
    points: [45, 48, 56, 60, 72, 84],
    measurements: [
      { label: 'Peito', value: '104 cm', change: '+2 cm', tone: 'positive' },
      { label: 'Coxa direita', value: '61 cm', change: '+1 cm', tone: 'positive' },
      { label: 'Cintura', value: '84 cm', change: '0 cm', tone: 'neutral' },
    ],
  },
];

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

export function DashboardPage({
  user,
  students,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onLogout,
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [name, setName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [visibleStudents, setVisibleStudents] = useState<Student[]>(students);
  const [selectedMetricId, setSelectedMetricId] = useState(metricSnapshots[0].id);

  useEffect(() => {
    setVisibleStudents(students);
  }, [students]);

  const resetStudentForm = () => {
    setName('');
    setStudentEmail('');
    setAge('');
    setGoal('');
    setEditingStudentId(null);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setName(student.name);
    setStudentEmail(student.email);
    setAge(String(student.age));
    setGoal(student.goal);
  };

  const handleDeleteStudent = async (id: number) => {
    await onDeleteStudent(id);

    if (editingStudentId === id) {
      resetStudentForm();
    }
  };

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    const studentData = {
      name,
      email: studentEmail,
      age: Number(age),
      goal,
    };

    if (editingStudentId !== null) {
      try {
        const updatedStudent = await onUpdateStudent(editingStudentId, studentData);
        setVisibleStudents((currentStudents) =>
          currentStudents.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student,
          ),
        );
        resetStudentForm();
      } catch (error) {
        console.error(error);
      }

      return;
    }

    await onCreateStudent(studentData);
    resetStudentForm();
  };

  const stats = [
    {
      label: 'Alunos',
      value: visibleStudents.length,
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
              <h2>{editingStudentId !== null ? 'Editar aluno' : 'Cadastrar aluno'}</h2>
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
              {editingStudentId !== null ? 'Salvar alterações' : 'Cadastrar aluno'}
            </button>

            {editingStudentId !== null && (
              <button className="dashboard-secondary-button" onClick={resetStudentForm} type="button">
                Cancelar edição
              </button>
            )}
          </form>
        </article>

        <article className="dashboard-panel dashboard-students-panel">
          <div className="dashboard-section-heading dashboard-section-heading-row">
            <div>
              <span className="dashboard-section-kicker">Carteira ativa</span>
              <h2>Alunos cadastrados</h2>
            </div>
            <span className="dashboard-count-pill">{visibleStudents.length}</span>
          </div>

          {visibleStudents.length === 0 ? (
            <div className="dashboard-empty-state">
              <span>Nenhum aluno cadastrado</span>
              <p>{'Quando um aluno for criado, ele aparecer\u00e1 aqui em formato de card.'}</p>
            </div>
          ) : (
            <ul className="student-card-list">
              {visibleStudents.map((student) => (
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

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="student-remove-button"
                          onClick={() => handleEditStudent(student)}
                          style={{
                            borderColor: '#bfdbfe',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                          }}
                          type="button"
                        >
                          Editar
                        </button>

                        <button
                          className="student-remove-button"
                          onClick={() => handleDeleteStudent(student.id)}
                          type="button"
                        >
                          Remover
                        </button>
                      </div>
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

  const renderWorkoutsTab = () => (
    <section className="dashboard-tab-page" aria-labelledby="workouts-title">
      <div className="dashboard-page-heading feature-page-heading feature-page-heading-workouts">
        <span className="dashboard-section-kicker">Prescricao de treinos</span>
        <h1 id="workouts-title">Treinos</h1>
        <p>
          Organize treinos por aluno, foco muscular e intensidade. Nesta sprint os dados sao
          demonstrativos.
        </p>
      </div>

      <section className="feature-summary-grid" aria-label="Resumo de treinos">
        <article className="feature-summary-card">
          <span>Ativos</span>
          <strong>{workoutPlans.length}</strong>
          <small>planos mockados</small>
        </article>
        <article className="feature-summary-card">
          <span>Media</span>
          <strong>62 min</strong>
          <small>por sessao</small>
        </article>
        <article className="feature-summary-card">
          <span>Foco</span>
          <strong>3</strong>
          <small>categorias</small>
        </article>
      </section>

      <div className="feature-filter-row" aria-label="Filtros visuais de treino">
        {['Superior', 'Inferior', 'Full Body', 'Cardio'].map((category) => (
          <button className="feature-filter-chip feature-filter-chip-workouts" key={category} type="button">
            {category}
          </button>
        ))}
      </div>

      <section className="feature-card-list" aria-label="Treinos cadastrados">
        {workoutPlans.map((workout) => (
          <article className="feature-card" key={workout.id}>
            <div className="feature-card-header">
              <div>
                <span className="feature-student-name">{workout.studentName}</span>
                <h2>{workout.title}</h2>
              </div>
              <span className="feature-status-pill">{workout.category}</span>
            </div>

            <div className="feature-meta-grid">
              <span>{workout.duration}</span>
              <span>{workout.exercises} exercicios</span>
              <span>{workout.intensity}</span>
            </div>

            <div className="feature-progress-block">
              <div>
                <span>Foco</span>
                <strong>{workout.focus}</strong>
              </div>
              <div className="feature-progress-track" aria-hidden="true">
                <span style={{ width: `${workout.progress}%` }} />
              </div>
              <small>{workout.progress}% da rotina planejada</small>
            </div>

            <div className="feature-card-footer">
              <span>Criado em {workout.date}</span>
              <div>
                <button type="button">Editar</button>
                <button type="button">Duplicar</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );

  const renderDietsTab = () => (
    <section className="dashboard-tab-page" aria-labelledby="diets-title">
      <div className="dashboard-page-heading feature-page-heading feature-page-heading-diets">
        <span className="dashboard-section-kicker">Planejamento alimentar</span>
        <h1 id="diets-title">Dietas</h1>
        <p>
          Visualize planos alimentares, calorias e distribuicao de macros. Os cards ainda usam
          dados mockados.
        </p>
      </div>

      <section className="feature-summary-grid" aria-label="Resumo de dietas">
        <article className="feature-summary-card">
          <span>Ativas</span>
          <strong>{dietPlans.length}</strong>
          <small>dietas mockadas</small>
        </article>
        <article className="feature-summary-card">
          <span>Refeicoes</span>
          <strong>5-6</strong>
          <small>por dia</small>
        </article>
        <article className="feature-summary-card">
          <span>Objetivos</span>
          <strong>3</strong>
          <small>em acompanhamento</small>
        </article>
      </section>

      <div className="feature-filter-row" aria-label="Filtros visuais de dieta">
        {['Perda de peso', 'Hipertrofia', 'Manutencao', 'Definicao'].map((goalName) => (
          <button className="feature-filter-chip feature-filter-chip-diets" key={goalName} type="button">
            {goalName}
          </button>
        ))}
      </div>

      <section className="feature-card-list" aria-label="Planos alimentares">
        {dietPlans.map((diet) => (
          <article className="feature-card nutrition-card" key={diet.id}>
            <div className="feature-card-header">
              <div>
                <span className="feature-student-name">{diet.studentName}</span>
                <h2>{diet.title}</h2>
              </div>
              <span className="feature-status-pill feature-status-pill-green">{diet.goal}</span>
            </div>

            <div className="feature-meta-grid">
              <span>{diet.calories} kcal/dia</span>
              <span>{diet.meals} refeicoes</span>
              <span>Atualizado</span>
            </div>

            <div className="nutrition-macro-grid" aria-label={`Macros do plano de ${diet.studentName}`}>
              <div>
                <span>Proteinas</span>
                <strong>{diet.protein}</strong>
              </div>
              <div>
                <span>Carboidratos</span>
                <strong>{diet.carbs}</strong>
              </div>
              <div>
                <span>Gorduras</span>
                <strong>{diet.fats}</strong>
              </div>
            </div>

            <div className="feature-card-footer">
              <span>Criado em {diet.date}</span>
              <div>
                <button type="button">Editar</button>
                <button type="button">Duplicar</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </section>
  );

  const renderMetricsTab = () => {
    const selectedMetric =
      metricSnapshots.find((metric) => metric.id === selectedMetricId) ?? metricSnapshots[0];

    return (
      <section className="dashboard-tab-page" aria-labelledby="metrics-title">
        <div className="dashboard-page-heading feature-page-heading feature-page-heading-metrics">
          <span className="dashboard-section-kicker">Evolucao corporal</span>
          <h1 id="metrics-title">Metricas</h1>
          <p>
            Acompanhe peso, composicao corporal e medidas principais com visual inicial para o
            modulo de evolucao.
          </p>
        </div>

        <div className="metrics-student-row" aria-label="Selecionar aluno para metricas">
          {metricSnapshots.map((metric) => (
            <button
              className={`metrics-student-chip${
                selectedMetric.id === metric.id ? ' metrics-student-chip-active' : ''
              }`}
              key={metric.id}
              onClick={() => setSelectedMetricId(metric.id)}
              type="button"
            >
              <span>{metric.initials}</span>
              {metric.studentName}
            </button>
          ))}
        </div>

        <section className="metrics-card-grid" aria-label={`Metricas de ${selectedMetric.studentName}`}>
          <article className="metric-card">
            <span>Peso atual</span>
            <strong>{selectedMetric.weight}</strong>
            <small>{selectedMetric.trend}</small>
          </article>
          <article className="metric-card">
            <span>Gordura corporal</span>
            <strong>{selectedMetric.bodyFat}</strong>
            <small>queda consistente</small>
          </article>
          <article className="metric-card">
            <span>Massa muscular</span>
            <strong>{selectedMetric.muscleMass}</strong>
            <small>ganho monitorado</small>
          </article>
          <article className="metric-card">
            <span>IMC</span>
            <strong>{selectedMetric.imc}</strong>
            <small>referencia clinica</small>
          </article>
        </section>

        <article className="dashboard-panel metrics-chart-panel">
          <div className="dashboard-section-heading dashboard-section-heading-row">
            <div>
              <span className="dashboard-section-kicker">Historico visual</span>
              <h2>Evolucao do acompanhamento</h2>
            </div>
            <span className="feature-status-pill">Atualizado em {selectedMetric.updatedAt}</span>
          </div>

          <div className="metrics-chart-bars" aria-label="Grafico visual de evolucao mockado">
            {selectedMetric.points.map((point, index) => (
              <span
                className="metrics-chart-bar"
                key={`${selectedMetric.id}-${point}-${index}`}
                style={{ height: `${point}%` }}
              />
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-section-heading">
            <span className="dashboard-section-kicker">Medidas corporais</span>
            <h2>Ultimas afericoes</h2>
          </div>

          <div className="measurement-list">
            {selectedMetric.measurements.map((measurement) => (
              <div className="measurement-item" key={measurement.label}>
                <span>{measurement.label}</span>
                <strong>{measurement.value}</strong>
                <small className={`measurement-change measurement-change-${measurement.tone}`}>
                  {measurement.change}
                </small>
              </div>
            ))}
          </div>
        </article>
      </section>
    );
  };

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
        {activeTab === 'workouts' && renderWorkoutsTab()}
        {activeTab === 'diets' && renderDietsTab()}
        {activeTab === 'metrics' && renderMetricsTab()}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import {
  ApiUnauthorizedError,
  getMetrics,
  getNutritionPlans,
  getWorkouts,
  type Metric,
  type NutritionPlan,
  type Workout,
} from '../services/api';
import { formatObservationDate } from '../utils/formatObservationDate';
import {
  calculateBmi,
  formatMetricValue,
  getMetricChartPoints,
  getWeightTrend,
} from '../utils/metricDisplay';
import { formatAge, getInitials } from '../utils/studentDisplay';
import { BottomNavigation, type DashboardTab } from './BottomNavigation';
import { StudentDetail } from './StudentDetail';

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
  onSessionExpired: () => void;
  onLogout: () => void;
};

function getFirstName(name: string) {
  return name.trim().split(' ')[0] || 'profissional';
}

function formatAverageDuration(workouts: Workout[]) {
  if (workouts.length === 0) {
    return '--';
  }

  const totalDuration = workouts.reduce((total, workout) => total + workout.durationMinutes, 0);
  return `${Math.round(totalDuration / workouts.length)} min`;
}

function getWorkoutTypes(workouts: Workout[]) {
  return Array.from(new Set(workouts.map((workout) => workout.type).filter(Boolean)));
}

function formatAverageMeals(nutritionPlans: NutritionPlan[]) {
  if (nutritionPlans.length === 0) {
    return '--';
  }

  const totalMeals = nutritionPlans.reduce(
    (total, nutritionPlan) => total + nutritionPlan.mealsCount,
    0,
  );
  return `${Math.round(totalMeals / nutritionPlans.length)} ao dia`;
}

function getNutritionObjectives(nutritionPlans: NutritionPlan[]) {
  return Array.from(
    new Set(nutritionPlans.map((nutritionPlan) => nutritionPlan.objective).filter(Boolean)),
  );
}

function getStudentName(students: Student[], studentId: number) {
  return students.find((student) => student.id === studentId)?.name || 'Aluno não encontrado';
}

function getMetricsForStudent(metrics: Metric[], studentId: number) {
  return metrics.filter((metric) => metric.studentId === studentId);
}

export function DashboardPage({
  user,
  students,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onSessionExpired,
  onLogout,
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [name, setName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [visibleStudents, setVisibleStudents] = useState<Student[]>(students);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedMetricStudentId, setSelectedMetricStudentId] = useState<number | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutsError, setWorkoutsError] = useState('');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState('');
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [isLoadingNutritionPlans, setIsLoadingNutritionPlans] = useState(false);
  const [nutritionPlansError, setNutritionPlansError] = useState('');

  const fetchWorkouts = async () => {
    setIsLoadingWorkouts(true);
    setWorkoutsError('');

    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setWorkoutsError('Não foi possível carregar os treinos.');
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);
    setMetricsError('');

    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setMetricsError('Não foi possível carregar as métricas.');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const fetchNutritionPlans = async () => {
    setIsLoadingNutritionPlans(true);
    setNutritionPlansError('');

    try {
      const data = await getNutritionPlans();
      setNutritionPlans(data);
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        onSessionExpired();
        return;
      }

      console.error(error);
      setNutritionPlansError('Não foi possível carregar as dietas.');
    } finally {
      setIsLoadingNutritionPlans(false);
    }
  };

  useEffect(() => {
    setVisibleStudents(students);
    setSelectedStudentId((currentStudentId) => {
      if (currentStudentId === null) {
        return null;
      }

      return students.some((student) => student.id === currentStudentId) ? currentStudentId : null;
    });
  }, [students]);

  useEffect(() => {
    void fetchWorkouts();
    void fetchMetrics();
    void fetchNutritionPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'workouts') {
      void fetchWorkouts();
    }

    if (activeTab === 'metrics') {
      void fetchMetrics();
    }

    if (activeTab === 'diets') {
      void fetchNutritionPlans();
    }
  }, [activeTab]);

  useEffect(() => {
    setSelectedMetricStudentId((currentStudentId) => {
      if (
        currentStudentId !== null &&
        visibleStudents.some((student) => student.id === currentStudentId) &&
        metrics.some((metric) => metric.studentId === currentStudentId)
      ) {
        return currentStudentId;
      }

      const firstMetricStudent = visibleStudents.find((student) =>
        metrics.some((metric) => metric.studentId === student.id),
      );

      return firstMetricStudent?.id ?? null;
    });
  }, [metrics, visibleStudents]);

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

    if (selectedStudentId === id) {
      setSelectedStudentId(null);
    }
  };

  const handleViewStudentDetails = (studentId: number) => {
    resetStudentForm();
    setSelectedStudentId(studentId);
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
      value: isLoadingWorkouts ? '...' : workouts.length,
      helper: workoutsError ? 'Erro ao carregar' : 'Ativos',
      tone: 'green',
    },
    {
      label: 'Dietas',
      value: isLoadingNutritionPlans ? '...' : nutritionPlans.length,
      helper: nutritionPlansError ? 'Erro ao carregar' : 'Ativas',
      tone: 'amber',
    },
    {
      label: 'M\u00e9tricas',
      value: isLoadingMetrics ? '...' : metrics.length,
      helper: metricsError ? 'Erro ao carregar' : 'Registros',
      tone: 'rose',
    },
  ];

  const selectedStudent =
    selectedStudentId !== null
      ? visibleStudents.find((student) => student.id === selectedStudentId) ?? null
      : null;

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
            <span>E-mail</span>
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

  const renderStudentsTab = () => {
    if (selectedStudent) {
      return (
        <section className="dashboard-tab-page" aria-labelledby="student-detail-title">
          <StudentDetail
            onMetricsChanged={() => {
              void fetchMetrics();
            }}
            onNutritionPlansChanged={() => {
              void fetchNutritionPlans();
            }}
            onWorkoutsChanged={() => {
              void fetchWorkouts();
            }}
            student={selectedStudent}
            onBack={() => setSelectedStudentId(null)}
            onSessionExpired={onSessionExpired}
          />
        </section>
      );
    }

    return (
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
              <span>E-mail do aluno</span>
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

                      <div className="student-card-actions">
                        <button
                          className="student-detail-button"
                          onClick={() => handleViewStudentDetails(student.id)}
                          type="button"
                        >
                          Ver detalhes
                        </button>

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
  };

  const renderWorkoutsTab = () => {
    const workoutTypes = getWorkoutTypes(workouts);

    return (
      <section className="dashboard-tab-page" aria-labelledby="workouts-title">
        <div className="dashboard-page-heading feature-page-heading feature-page-heading-workouts">
          <span className="dashboard-section-kicker">Prescrição de treinos</span>
          <h1 id="workouts-title">Treinos</h1>
          <p>Visualize os treinos reais cadastrados para os alunos do profissional.</p>
        </div>

        <section className="feature-summary-grid" aria-label="Resumo de treinos">
          <article className="feature-summary-card">
            <span>Ativos</span>
            <strong>{isLoadingWorkouts ? '...' : workouts.length}</strong>
            <small>treinos cadastrados</small>
          </article>
          <article className="feature-summary-card">
            <span>Média</span>
            <strong>{formatAverageDuration(workouts)}</strong>
            <small>por treino</small>
          </article>
          <article className="feature-summary-card">
            <span>Tipos</span>
            <strong>{workoutTypes.length}</strong>
            <small>em acompanhamento</small>
          </article>
        </section>

        <div className="feature-filter-row" aria-label="Tipos de treino cadastrados">
          {workoutTypes.length === 0 ? (
            <button className="feature-filter-chip feature-filter-chip-workouts" disabled type="button">
              Sem tipos cadastrados
            </button>
          ) : (
            workoutTypes.map((category) => (
              <button
                className="feature-filter-chip feature-filter-chip-workouts"
                key={category}
                type="button"
              >
                {category}
              </button>
            ))
          )}
        </div>

        <section className="feature-card-list" aria-label="Treinos cadastrados">
          {isLoadingWorkouts ? (
            <article className="feature-card">
              <p>Carregando treinos...</p>
            </article>
          ) : workoutsError ? (
            <article className="feature-card">
              <p>{workoutsError}</p>
            </article>
          ) : workouts.length === 0 ? (
            <article className="feature-card">
              <p>Nenhum treino cadastrado.</p>
            </article>
          ) : (
            workouts.map((workout) => (
              <article className="feature-card" key={workout.id}>
                <div className="feature-card-header">
                  <div>
                    <span className="feature-student-name">
                      {getStudentName(visibleStudents, workout.studentId)}
                    </span>
                    <h2>{workout.name}</h2>
                  </div>
                  <span className="feature-status-pill">{workout.type}</span>
                </div>

                <div className="feature-meta-grid">
                  <span>{workout.durationMinutes} min</span>
                  <span>{workout.exercisesCount} exercícios</span>
                  <span>Atualizado</span>
                </div>

                <div className="feature-progress-block">
                  <div>
                    <span>Descrição</span>
                    <strong>{workout.description || 'Sem descrição'}</strong>
                  </div>
                </div>

                <div className="feature-card-footer">
                  <span>Criado em {formatObservationDate(workout.createdAt)}</span>
                  <div>
                    <button
                      onClick={() => {
                        setSelectedStudentId(workout.studentId);
                        setActiveTab('students');
                      }}
                      type="button"
                    >
                      Abrir aluno
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    );
  };

  const renderDietsTab = () => {
    const nutritionObjectives = getNutritionObjectives(nutritionPlans);

    return (
      <section className="dashboard-tab-page" aria-labelledby="diets-title">
        <div className="dashboard-page-heading feature-page-heading feature-page-heading-diets">
          <span className="dashboard-section-kicker">Planejamento alimentar</span>
          <h1 id="diets-title">Dietas</h1>
          <p>Visualize os planos alimentares reais cadastrados para seus alunos.</p>
        </div>

        <section className="feature-summary-grid" aria-label="Resumo de dietas">
          <article className="feature-summary-card">
            <span>Ativas</span>
            <strong>{isLoadingNutritionPlans ? '...' : nutritionPlans.length}</strong>
            <small>planos cadastrados</small>
          </article>
          <article className="feature-summary-card">
            <span>Refeições</span>
            <strong>{formatAverageMeals(nutritionPlans)}</strong>
            <small>média por plano</small>
          </article>
          <article className="feature-summary-card">
            <span>Objetivos</span>
            <strong>{nutritionObjectives.length}</strong>
            <small>em acompanhamento</small>
          </article>
        </section>

        <div className="feature-filter-row" aria-label="Objetivos de dieta cadastrados">
          {nutritionObjectives.length === 0 ? (
            <button className="feature-filter-chip feature-filter-chip-diets" disabled type="button">
              Sem objetivos cadastrados
            </button>
          ) : (
            nutritionObjectives.map((objective) => (
              <button
                className="feature-filter-chip feature-filter-chip-diets"
                key={objective}
                type="button"
              >
                {objective}
              </button>
            ))
          )}
        </div>

        <section className="feature-card-list" aria-label="Planos alimentares">
          {isLoadingNutritionPlans ? (
            <article className="feature-card">
              <p>Carregando dietas...</p>
            </article>
          ) : nutritionPlansError ? (
            <article className="feature-card">
              <p>{nutritionPlansError}</p>
            </article>
          ) : nutritionPlans.length === 0 ? (
            <article className="feature-card">
              <p>Nenhum plano alimentar cadastrado ainda.</p>
            </article>
          ) : (
            nutritionPlans.map((nutritionPlan) => (
              <article className="feature-card nutrition-card" key={nutritionPlan.id}>
                <div className="feature-card-header">
                  <div>
                    <span className="feature-student-name">
                      {getStudentName(visibleStudents, nutritionPlan.studentId)}
                    </span>
                    <h2>{nutritionPlan.name}</h2>
                  </div>
                  <span className="feature-status-pill feature-status-pill-green">
                    {nutritionPlan.objective}
                  </span>
                </div>

                <div className="feature-meta-grid">
                  <span>{nutritionPlan.calories} kcal/dia</span>
                  <span>{nutritionPlan.mealsCount} refeições</span>
                  <span>Atualizado</span>
                </div>

                <div
                  className="nutrition-macro-grid"
                  aria-label={`Macros do plano de ${getStudentName(
                    visibleStudents,
                    nutritionPlan.studentId,
                  )}`}
                >
                  <div>
                    <span>Proteínas</span>
                    <strong>{nutritionPlan.proteinGrams}g</strong>
                  </div>
                  <div>
                    <span>Carboidratos</span>
                    <strong>{nutritionPlan.carbsGrams}g</strong>
                  </div>
                  <div>
                    <span>Gorduras</span>
                    <strong>{nutritionPlan.fatGrams}g</strong>
                  </div>
                </div>

                <div className="feature-progress-block">
                  <div>
                    <span>Observações</span>
                    <strong>{nutritionPlan.notes || 'Sem observações'}</strong>
                  </div>
                </div>

                <div className="feature-card-footer">
                  <span>Criado em {formatObservationDate(nutritionPlan.createdAt)}</span>
                  <div>
                    <button
                      onClick={() => {
                        setSelectedStudentId(nutritionPlan.studentId);
                        setActiveTab('students');
                      }}
                      type="button"
                    >
                      Abrir aluno
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    );
  };

  const renderMetricsTab = () => {
    const studentsWithMetrics = visibleStudents.filter((student) =>
      metrics.some((metric) => metric.studentId === student.id),
    );
    const currentMetricStudentId =
      selectedMetricStudentId !== null &&
      studentsWithMetrics.some((student) => student.id === selectedMetricStudentId)
        ? selectedMetricStudentId
        : studentsWithMetrics[0]?.id ?? null;
    const selectedMetricStudent =
      currentMetricStudentId !== null
        ? visibleStudents.find((student) => student.id === currentMetricStudentId) ?? null
        : null;
    const selectedStudentMetrics =
      currentMetricStudentId !== null ? getMetricsForStudent(metrics, currentMetricStudentId) : [];
    const selectedMetric = selectedStudentMetrics[0] ?? null;
    const chartPoints = getMetricChartPoints(selectedStudentMetrics);

    return (
      <section className="dashboard-tab-page" aria-labelledby="metrics-title">
        <div className="dashboard-page-heading feature-page-heading feature-page-heading-metrics">
          <span className="dashboard-section-kicker">Evolução corporal</span>
          <h1 id="metrics-title">Métricas</h1>
          <p>
            Acompanhe peso, composição corporal e medidas principais registradas para seus alunos.
          </p>
        </div>

        {isLoadingMetrics ? (
          <article className="feature-card">
            <p>Carregando métricas...</p>
          </article>
        ) : metricsError ? (
          <article className="feature-card">
            <p>{metricsError}</p>
          </article>
        ) : metrics.length === 0 ? (
          <article className="feature-card">
            <p>Nenhuma métrica cadastrada.</p>
          </article>
        ) : (
          <>
            <div className="metrics-student-row" aria-label="Selecionar aluno para métricas">
              {studentsWithMetrics.map((student) => (
                <button
                  className={`metrics-student-chip${
                    currentMetricStudentId === student.id ? ' metrics-student-chip-active' : ''
                  }`}
                  key={student.id}
                  onClick={() => setSelectedMetricStudentId(student.id)}
                  type="button"
                >
                  <span>{getInitials(student.name)}</span>
                  {student.name}
                </button>
              ))}
            </div>

            <section
              className="metrics-card-grid"
              aria-label={`Métricas de ${selectedMetricStudent?.name || 'aluno'}`}
            >
              <article className="metric-card">
                <span>Peso atual</span>
                <strong>{selectedMetric ? formatMetricValue(selectedMetric.weightKg, 'kg') : '--'}</strong>
                <small>{getWeightTrend(selectedStudentMetrics)}</small>
              </article>
              <article className="metric-card">
                <span>Gordura corporal</span>
                <strong>
                  {selectedMetric ? formatMetricValue(selectedMetric.bodyFatPercentage, '%') : '--'}
                </strong>
                <small>última avaliação registrada</small>
              </article>
              <article className="metric-card">
                <span>Massa muscular</span>
                <strong>
                  {selectedMetric ? formatMetricValue(selectedMetric.muscleMassKg, 'kg') : '--'}
                </strong>
                <small>composição corporal</small>
              </article>
              <article className="metric-card">
                <span>IMC</span>
                <strong>
                  {selectedMetric
                    ? calculateBmi(selectedMetric.weightKg, selectedMetric.heightCm)
                    : '--'}
                </strong>
                <small>calculado por peso e altura</small>
              </article>
            </section>

            <article className="dashboard-panel metrics-chart-panel">
              <div className="dashboard-section-heading dashboard-section-heading-row">
                <div>
                  <span className="dashboard-section-kicker">Histórico visual</span>
                  <h2>{selectedMetricStudent?.name || 'Aluno selecionado'}</h2>
                </div>
                <span className="feature-status-pill">
                  Atualizado em{' '}
                  {selectedMetric ? formatObservationDate(selectedMetric.recordedAt) : '--'}
                </span>
              </div>

              <div className="metrics-chart-bars" aria-label="Histórico visual de peso">
                {chartPoints.map((point, index) => (
                  <span
                    className="metrics-chart-bar"
                    key={`${currentMetricStudentId}-${point}-${index}`}
                    style={{ height: `${point}%` }}
                  />
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-section-heading">
                <span className="dashboard-section-kicker">Medidas corporais</span>
                <h2>Últimas aferições</h2>
              </div>

              <div className="measurement-list">
                <div className="measurement-item">
                  <span>Peso</span>
                  <strong>{selectedMetric ? formatMetricValue(selectedMetric.weightKg, 'kg') : '--'}</strong>
                  <small className="measurement-change measurement-change-neutral">
                    {getWeightTrend(selectedStudentMetrics)}
                  </small>
                </div>
                <div className="measurement-item">
                  <span>Altura</span>
                  <strong>{selectedMetric ? formatMetricValue(selectedMetric.heightCm, 'cm') : '--'}</strong>
                  <small className="measurement-change measurement-change-neutral">
                    dado de referência
                  </small>
                </div>
                <div className="measurement-item">
                  <span>Gordura</span>
                  <strong>
                    {selectedMetric ? formatMetricValue(selectedMetric.bodyFatPercentage, '%') : '--'}
                  </strong>
                  <small className="measurement-change measurement-change-neutral">
                    composição
                  </small>
                </div>
                <div className="measurement-item">
                  <span>Massa muscular</span>
                  <strong>{selectedMetric ? formatMetricValue(selectedMetric.muscleMassKg, 'kg') : '--'}</strong>
                  <small className="measurement-change measurement-change-neutral">
                    composição
                  </small>
                </div>
                <div className="measurement-item">
                  <span>IMC</span>
                  <strong>
                    {selectedMetric
                      ? calculateBmi(selectedMetric.weightKg, selectedMetric.heightCm)
                      : '--'}
                  </strong>
                  <small className="measurement-change measurement-change-neutral">
                    calculado
                  </small>
                </div>
              </div>
            </article>

            <section className="feature-card-list" aria-label="Histórico de métricas">
              {selectedStudentMetrics.map((metric) => (
                <article className="feature-card" key={metric.id}>
                  <div className="feature-card-header">
                    <div>
                      <span className="feature-student-name">
                        {selectedMetricStudent?.name || getStudentName(visibleStudents, metric.studentId)}
                      </span>
                      <h2>Avaliação de {formatObservationDate(metric.recordedAt)}</h2>
                    </div>
                    <span className="feature-status-pill">
                      IMC {calculateBmi(metric.weightKg, metric.heightCm)}
                    </span>
                  </div>

                  <div className="feature-meta-grid">
                    <span>{formatMetricValue(metric.weightKg, 'kg')}</span>
                    <span>{formatMetricValue(metric.bodyFatPercentage, '%')}</span>
                    <span>{formatMetricValue(metric.muscleMassKg, 'kg')}</span>
                  </div>

                  <div className="feature-progress-block">
                    <div>
                      <span>Observações</span>
                      <strong>{metric.notes || 'Sem observações'}</strong>
                    </div>
                  </div>

                  <div className="feature-card-footer">
                    <span>Atualizado em {formatObservationDate(metric.updatedAt)}</span>
                    <div>
                      <button
                        onClick={() => {
                          setSelectedStudentId(metric.studentId);
                          setActiveTab('students');
                        }}
                        type="button"
                      >
                        Abrir aluno
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </section>
    );
  };

  return (
    <div className="dashboard-shell">
      <main className="dashboard-page">
        <header className="dashboard-app-header">
          <div className="dashboard-brand" aria-label="Flex-It">
            <img className="dashboard-brand-mark" src="/Icone.png" alt="" aria-hidden="true" />
            <span>Flex-It</span>
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

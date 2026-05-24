type StudentDetailStudent = {
  id: number;
  name: string;
  email: string;
  age: number;
  goal: string;
};

type StudentDetailProps = {
  student: StudentDetailStudent;
  onBack: () => void;
};

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
  return Number.isFinite(age) && age > 0 ? `${age} anos` : 'Idade nao informada';
}

function getDisplayGoal(goal: string) {
  return goal.trim() || 'Objetivo nao informado';
}

export function StudentDetail({ student, onBack }: StudentDetailProps) {
  const displayGoal = getDisplayGoal(student.goal);

  return (
    <section className="student-detail-view" aria-labelledby="student-detail-title">
      <button className="student-detail-back-button" onClick={onBack} type="button">
        Voltar para alunos
      </button>

      <header className="student-detail-hero">
        <div className="student-detail-avatar-large" aria-hidden="true">
          {getInitials(student.name)}
        </div>

        <div className="student-detail-hero-content">
          <span className="dashboard-section-kicker">Perfil do aluno</span>
          <h1 id="student-detail-title">{student.name}</h1>
          <p>{displayGoal}</p>
        </div>
      </header>

      <section className="student-detail-info-grid" aria-label="Dados principais do aluno">
        <article>
          <span>Email</span>
          <strong>{student.email || 'Email nao informado'}</strong>
        </article>
        <article>
          <span>Idade</span>
          <strong>{formatAge(student.age)}</strong>
        </article>
        <article>
          <span>Objetivo</span>
          <strong>{displayGoal}</strong>
        </article>
      </section>

      <section className="student-detail-grid" aria-label="Acompanhamento do aluno">
        <article className="dashboard-panel student-detail-card student-detail-card-workout">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Treino atual</span>
            <h2>Treino A - Base semanal</h2>
          </div>

          <div className="student-detail-card-meta">
            <span>4 sessoes/semana</span>
            <span>55 min</span>
            <span>Moderado</span>
          </div>

          <div className="student-detail-progress">
            <div>
              <span>Adesao planejada</span>
              <strong>72%</strong>
            </div>
            <div className="student-detail-progress-track" aria-hidden="true">
              <span style={{ width: '72%' }} />
            </div>
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-diet">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Dieta atual</span>
            <h2>Plano alimentar inicial</h2>
          </div>

          <div className="student-detail-nutrition-grid">
            <div>
              <span>Calorias</span>
              <strong>2.200 kcal</strong>
            </div>
            <div>
              <span>Refeicoes</span>
              <strong>5 ao dia</strong>
            </div>
            <div>
              <span>Foco</span>
              <strong>{displayGoal}</strong>
            </div>
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-metrics">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">Metricas</span>
            <h2>Ultima avaliacao</h2>
          </div>

          <div className="student-detail-metric-grid">
            <div>
              <span>Peso</span>
              <strong>72,4 kg</strong>
            </div>
            <div>
              <span>Gordura</span>
              <strong>21,8%</strong>
            </div>
            <div>
              <span>IMC</span>
              <strong>24,9</strong>
            </div>
          </div>
        </article>

        <article className="dashboard-panel student-detail-card student-detail-card-message">
          <div className="student-detail-card-heading">
            <span className="dashboard-section-kicker">{'Comunica\u00e7\u00e3o'}</span>
            <h2>{'Observa\u00e7\u00f5es'}</h2>
          </div>

          <div className="student-detail-note-list">
            <p>
              Aluno em acompanhamento inicial. Reforcar registro de treinos concluidos e retorno
              semanal sobre dificuldade das series.
            </p>
            <p>
              Proxima conversa sugerida para revisar energia, sono e aderencia ao plano alimentar.
            </p>
          </div>
        </article>
      </section>
    </section>
  );
}

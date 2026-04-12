import type { JSX } from 'preact';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type DashboardPageProps = {
  user: User;
  onLogout: () => void;
};

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
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
            <p style={styles.cardValue}>12</p>
            <span style={styles.cardText}>Cadastrados</span>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Treinos</h3>
            <p style={styles.cardValue}>8</p>
            <span style={styles.cardText}>Ativos</span>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Métricas</h3>
            <p style={styles.cardValue}>24</p>
            <span style={styles.cardText}>Registradas</span>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.sectionTitle}>Informações do usuário</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Perfil:</strong> {user.role}</p>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.sectionTitle}>Módulos da Sprint 1</h3>
          <ul style={styles.list}>
            <li>Login funcional</li>
            <li>Integração com backend</li>
            <li>Persistência com PostgreSQL</li>
            <li>Dashboard inicial</li>
          </ul>
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
import type { JSX } from 'preact';

type LoginPageProps = {
  email: string;
  password: string;
  message: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: JSX.TargetedEvent<HTMLFormElement, Event>) => void;
};

export function LoginPage({
  email,
  password,
  message,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginPageProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>FlexIt</h1>
        <p style={styles.subtitle}>Login do sistema</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onInput={(e) => onEmailChange((e.target as HTMLInputElement).value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onInput={(e) => onPasswordChange((e.target as HTMLInputElement).value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Entrar
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles: Record<string, JSX.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '14px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: '0',
    textAlign: 'center',
    color: '#111827',
    fontSize: '2rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
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
  message: {
    marginTop: '16px',
    textAlign: 'center',
    color: '#111827',
  },
};
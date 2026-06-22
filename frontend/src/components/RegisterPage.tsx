import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { RegisterPayload, UserRole } from '../services/api';

type RegisterPageProps = {
  message: string;
  onBackToLogin: () => void;
  onSubmit: (payload: RegisterPayload) => void;
};

const INVALID_PASSWORD_MESSAGE =
  'A senha deve ter no mínimo 8 caracteres, incluindo letras, números e caracteres especiais.';

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /\p{L}/u.test(password) &&
    /\p{N}/u.test(password) &&
    /[^\p{L}\p{N}\s]/u.test(password)
  );
}

export function RegisterPage({ message, onBackToLogin, onSubmit }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('professional');
  const [passwordError, setPasswordError] = useState('');
  const displayedMessage = passwordError || message;

  const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault();

    if (!isStrongPassword(password)) {
      setPasswordError(INVALID_PASSWORD_MESSAGE);
      return;
    }

    setPasswordError('');
    onSubmit({
      name,
      email,
      password,
      role,
    });
  };

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="register-title">
        <div className="login-brand">
          <img className="login-brand-mark" src="/Icone.png" alt="Flex-It" />
          <p className="login-eyebrow">Flex-It PWA</p>
          <h1 id="register-title">Crie sua conta</h1>
          <p className="login-subtitle">
            Escolha seu perfil para acessar o ambiente correto no Flex-It.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Cadastro</h2>
            <p>Use o mesmo e-mail informado pelo profissional para vincular sua conta de aluno.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Nome</span>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                autoComplete="name"
                onInput={(event) => setName((event.target as HTMLInputElement).value)}
                className="login-input"
                required
              />
            </label>

            <label className="login-field">
              <span>E-mail</span>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                autoComplete="email"
                onInput={(event) => setEmail((event.target as HTMLInputElement).value)}
                className="login-input"
                required
              />
            </label>

            <label className="login-field">
              <span>Senha</span>
              <input
                type="password"
                placeholder="Crie uma senha"
                value={password}
                autoComplete="new-password"
                aria-invalid={passwordError ? 'true' : undefined}
                aria-describedby={passwordError ? 'register-password-error' : undefined}
                onInput={(event) => {
                  setPassword((event.target as HTMLInputElement).value);
                  setPasswordError('');
                }}
                className="login-input"
                required
              />
            </label>

            <fieldset className="register-role-field">
              <legend>Tipo de conta</legend>
              <div className="register-role-group">
                <button
                  type="button"
                  className={`register-role-option ${
                    role === 'professional' ? 'register-role-option-active' : ''
                  }`}
                  aria-pressed={role === 'professional'}
                  onClick={() => setRole('professional')}
                >
                  Profissional
                </button>
                <button
                  type="button"
                  className={`register-role-option ${
                    role === 'student' ? 'register-role-option-active' : ''
                  }`}
                  aria-pressed={role === 'student'}
                  onClick={() => setRole('student')}
                >
                  Aluno
                </button>
              </div>
            </fieldset>

            <button type="submit" className="login-button">
              Criar conta
            </button>
          </form>

          {displayedMessage && (
            <p
              className="login-message"
              id={passwordError ? 'register-password-error' : undefined}
              role="alert"
            >
              {displayedMessage}
            </p>
          )}

          <button className="auth-switch-button" onClick={onBackToLogin} type="button">
            Já tenho conta
          </button>
        </div>
      </section>
    </main>
  );
}

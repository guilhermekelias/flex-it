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
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="login-brand-mark" aria-hidden="true">
            F
          </div>
          <p className="login-eyebrow">FlexIt PWA</p>
          <h1 id="login-title">Acesse o FlexIt</h1>
          <p className="login-subtitle">
            Gerencie alunos, treinos e evolucao em um painel profissional.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Login profissional</h2>
            <p>Entre com suas credenciais atuais.</p>
          </div>

          <form onSubmit={onSubmit} className="login-form">
            <label className="login-field">
              <span>E-mail</span>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                autoComplete="email"
                onInput={(e) => onEmailChange((e.target as HTMLInputElement).value)}
                className="login-input"
              />
            </label>

            <label className="login-field">
              <span>Senha</span>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                autoComplete="current-password"
                onInput={(e) => onPasswordChange((e.target as HTMLInputElement).value)}
                className="login-input"
              />
            </label>

            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>

          {message && (
            <p className="login-message" role="alert">
              {message}
            </p>
          )}
        </div>

        <p className="login-footnote">Acesso reservado para profissionais FlexIt.</p>
      </section>
    </main>
  );
}

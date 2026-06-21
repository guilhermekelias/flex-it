import type { JSX } from 'preact';

type LoginPageProps = {
  email: string;
  password: string;
  message: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: JSX.TargetedEvent<HTMLFormElement, Event>) => void;
  onCreateAccountClick: () => void;
};

export function LoginPage({
  email,
  password,
  message,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onCreateAccountClick,
}: LoginPageProps) {
  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <img className="login-brand-mark" src="/Icone.png" alt="Flex-It" />
          <p className="login-eyebrow">Flex-It</p>
          <h1 id="login-title">Acesse o Flex-It</h1>
          <p className="login-subtitle">
            Entre como profissional ou aluno para acompanhar treinos, dietas e evolucao.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Login</h2>
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

          <button className="auth-switch-button" onClick={onCreateAccountClick} type="button">
            Criar conta
          </button>
        </div>

        <p className="login-footnote">Acesso para profissionais e alunos Flex-It.</p>
      </section>
    </main>
  );
}

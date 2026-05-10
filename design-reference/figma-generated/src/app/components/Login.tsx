import { useState } from 'react';
import { Dumbbell, Lock, Mail } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Dumbbell className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl mb-2 text-foreground">FitManager</h1>
          <p className="text-muted-foreground">Gestão completa de academia</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-[38px] w-5 h-5 text-muted-foreground" />
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-muted-foreground" />
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" />
                <span className="text-foreground/70">Lembrar-me</span>
              </label>
              <a href="#" className="text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" fullWidth size="lg" className="mt-6">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <a href="#" className="text-primary hover:underline">
              Cadastre-se
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

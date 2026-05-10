import { useState } from 'react';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Home } from './components/Home';
import { Students } from './components/Students';
import { Workouts } from './components/Workouts';
import { Nutrition } from './components/Nutrition';
import { Metrics } from './components/Metrics';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('home');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const viewTitles: Record<string, string> = {
    home: 'Início',
    students: 'Alunos',
    workouts: 'Treinos',
    nutrition: 'Nutrição',
    metrics: 'Métricas',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title={viewTitles[currentView]} onLogout={handleLogout} />

      <main className="pt-2">
        {currentView === 'home' && <Home />}
        {currentView === 'students' && <Students />}
        {currentView === 'workouts' && <Workouts />}
        {currentView === 'nutrition' && <Nutrition />}
        {currentView === 'metrics' && <Metrics />}
      </main>

      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
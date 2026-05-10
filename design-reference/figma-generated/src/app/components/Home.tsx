import { Users, Dumbbell, Apple, TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent } from './Card';

export function Home() {
  const stats = [
    { label: 'Alunos Ativos', value: '156', icon: Users, color: 'bg-blue-500' },
    { label: 'Treinos Criados', value: '89', icon: Dumbbell, color: 'bg-purple-500' },
    { label: 'Dietas Ativas', value: '124', icon: Apple, color: 'bg-green-500' },
    { label: 'Meta do Mês', value: '92%', icon: Award, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { name: 'Ana Silva', action: 'completou treino de pernas', time: '10 min atrás', avatar: 'AS' },
    { name: 'Carlos Santos', action: 'registrou peso: 78kg', time: '25 min atrás', avatar: 'CS' },
    { name: 'Beatriz Costa', action: 'iniciou nova dieta', time: '1h atrás', avatar: 'BC' },
    { name: 'Daniel Oliveira', action: 'completou treino de peito', time: '2h atrás', avatar: 'DO' },
  ];

  return (
    <div className="pb-20 px-4 space-y-6 max-w-2xl mx-auto">
      <div className="py-6">
        <h3 className="text-lg mb-1 text-foreground/80">Olá, Personal! 👋</h3>
        <p className="text-2xl text-foreground">Painel de Controle</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl mb-1 text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h4 className="text-foreground">Atividades Recentes</h4>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-primary-foreground">{activity.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span className="font-medium">{activity.name}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary to-primary/80 border-0">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/90 mb-1">Meta deste mês</p>
              <p className="text-2xl text-primary-foreground">200 treinos</p>
              <p className="text-sm text-primary-foreground/80 mt-1">Faltam apenas 16!</p>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-primary-foreground/30 flex items-center justify-center">
              <span className="text-2xl text-primary-foreground">92%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { TrendingUp, TrendingDown, Weight, Ruler, Activity } from 'lucide-react';
import { Card, CardContent } from './Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Student {
  id: number;
  name: string;
  initials: string;
}

export function Metrics() {
  const [selectedStudent, setSelectedStudent] = useState<number>(1);

  const students: Student[] = [
    { id: 1, name: 'Ana Silva', initials: 'AS' },
    { id: 2, name: 'Carlos Santos', initials: 'CS' },
    { id: 3, name: 'Beatriz Costa', initials: 'BC' },
    { id: 4, name: 'Daniel Oliveira', initials: 'DO' },
  ];

  const weightData = [
    { date: '01/03', peso: 72 },
    { date: '15/03', peso: 71.5 },
    { date: '01/04', peso: 70.8 },
    { date: '15/04', peso: 70.2 },
    { date: '01/05', peso: 69.5 },
    { date: '10/05', peso: 68.9 },
  ];

  const bodyFatData = [
    { date: '01/03', bf: 28 },
    { date: '15/03', bf: 27.2 },
    { date: '01/04', bf: 26.5 },
    { date: '15/04', bf: 25.8 },
    { date: '01/05', bf: 25.1 },
    { date: '10/05', bf: 24.5 },
  ];

  const currentMetrics = {
    weight: 68.9,
    bodyFat: 24.5,
    muscleMass: 52.1,
    height: 165,
    imc: 25.3,
  };

  const measurements = [
    { part: 'Peito', value: 92, change: +2 },
    { part: 'Cintura', value: 72, change: -3 },
    { part: 'Quadril', value: 98, change: -2 },
    { part: 'Braço Direito', value: 32, change: +1 },
    { part: 'Coxa Direita', value: 56, change: 0 },
  ];

  const currentStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="pb-20 px-4 space-y-4 max-w-2xl mx-auto">
      <div className="py-4">
        <h3 className="text-lg text-foreground/80 mb-3">Acompanhamento de Métricas</h3>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedStudent === student.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                selectedStudent === student.id ? 'bg-primary-foreground/20' : 'bg-primary/20'
              }`}>
                {student.initials}
              </span>
              {student.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Peso Atual</span>
            </div>
            <p className="text-2xl text-foreground">{currentMetrics.weight} kg</p>
            <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>-3.1 kg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">% Gordura</span>
            </div>
            <p className="text-2xl text-foreground">{currentMetrics.bodyFat}%</p>
            <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>-3.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Massa Muscular</span>
            </div>
            <p className="text-2xl text-foreground">{currentMetrics.muscleMass} kg</p>
            <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+1.2 kg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">IMC</span>
            </div>
            <p className="text-2xl text-foreground">{currentMetrics.imc}</p>
            <span className="text-sm text-muted-foreground">Normal</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="text-foreground mb-4">Evolução do Peso</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis domain={[68, 73]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="peso" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="text-foreground mb-4">Evolução de % Gordura</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bodyFatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis domain={[24, 29]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="bf" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="text-foreground mb-4">Medidas Corporais (cm)</h4>
          <div className="space-y-3">
            {measurements.map((measurement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-foreground">{measurement.part}</span>
                <div className="flex items-center gap-3">
                  <span className="text-foreground">{measurement.value} cm</span>
                  <span className={`flex items-center gap-1 text-sm ${
                    measurement.change > 0 ? 'text-green-600' : measurement.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {measurement.change > 0 && <TrendingUp className="w-4 h-4" />}
                    {measurement.change < 0 && <TrendingDown className="w-4 h-4" />}
                    {measurement.change !== 0 ? `${measurement.change > 0 ? '+' : ''}${measurement.change}` : '0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

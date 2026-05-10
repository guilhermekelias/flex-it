import { useState } from 'react';
import { Plus, Dumbbell, Clock, Target, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';

interface Workout {
  id: number;
  studentName: string;
  workoutName: string;
  duration: string;
  exercises: number;
  category: string;
  date: string;
}

export function Workouts() {
  const [showAddModal, setShowAddModal] = useState(false);

  const workouts: Workout[] = [
    { id: 1, studentName: 'Ana Silva', workoutName: 'Treino A - Peito e Tríceps', duration: '60 min', exercises: 8, category: 'Superior', date: '10/05/2026' },
    { id: 2, studentName: 'Carlos Santos', workoutName: 'Treino B - Costas e Bíceps', duration: '55 min', exercises: 7, category: 'Superior', date: '09/05/2026' },
    { id: 3, studentName: 'Beatriz Costa', workoutName: 'Treino C - Pernas', duration: '70 min', exercises: 10, category: 'Inferior', date: '08/05/2026' },
    { id: 4, studentName: 'Daniel Oliveira', workoutName: 'Treino D - Ombros e Abdômen', duration: '50 min', exercises: 6, category: 'Superior', date: '07/05/2026' },
  ];

  const categories = ['Superior', 'Inferior', 'Full Body', 'Cardio'];

  return (
    <div className="pb-20 px-4 space-y-4 max-w-2xl mx-auto">
      <div className="py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg text-foreground/80">Treinos Cadastrados</h3>
          <p className="text-sm text-muted-foreground">{workouts.length} treinos ativos</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Novo
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm whitespace-nowrap hover:bg-primary/20 transition-colors"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {workouts.map((workout) => (
          <Card key={workout.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{workout.studentName}</p>
                  <h4 className="text-foreground mb-2">{workout.workoutName}</h4>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{workout.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4" />
                      <span>{workout.exercises} exercícios</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      <span>{workout.category}</span>
                    </div>
                  </div>
                </div>

                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Criado em {workout.date}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    Duplicar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-t-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl mb-6 text-foreground">Criar Novo Treino</h3>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
              <div>
                <label className="block mb-1.5 text-sm text-foreground/80">Selecionar Aluno</label>
                <select className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Ana Silva</option>
                  <option>Carlos Santos</option>
                  <option>Beatriz Costa</option>
                  <option>Daniel Oliveira</option>
                </select>
              </div>

              <Input label="Nome do Treino" placeholder="Ex: Treino A - Peito e Tríceps" required />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Duração (min)" type="number" placeholder="60" required />
                <div>
                  <label className="block mb-1.5 text-sm text-foreground/80">Categoria</label>
                  <select className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Superior</option>
                    <option>Inferior</option>
                    <option>Full Body</option>
                    <option>Cardio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm text-foreground/80">Exercícios</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={6}
                  placeholder="1. Supino reto - 4x12&#10;2. Crucifixo - 3x15&#10;3. Tríceps testa - 4x12"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" fullWidth>
                  Criar Treino
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

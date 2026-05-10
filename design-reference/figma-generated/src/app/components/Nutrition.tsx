import { useState } from 'react';
import { Plus, Apple, Flame, Utensils, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';

interface Diet {
  id: number;
  studentName: string;
  planName: string;
  calories: number;
  meals: number;
  goal: string;
  date: string;
}

export function Nutrition() {
  const [showAddModal, setShowAddModal] = useState(false);

  const diets: Diet[] = [
    { id: 1, studentName: 'Ana Silva', planName: 'Dieta para Emagrecimento', calories: 1800, meals: 6, goal: 'Perda de peso', date: '01/05/2026' },
    { id: 2, studentName: 'Carlos Santos', planName: 'Dieta para Ganho de Massa', calories: 3200, meals: 6, goal: 'Hipertrofia', date: '28/04/2026' },
    { id: 3, studentName: 'Beatriz Costa', planName: 'Dieta Equilibrada', calories: 2200, meals: 5, goal: 'Manutenção', date: '15/04/2026' },
    { id: 4, studentName: 'Daniel Oliveira', planName: 'Dieta Low Carb', calories: 2000, meals: 4, goal: 'Definição', date: '10/04/2026' },
  ];

  const goals = ['Perda de peso', 'Hipertrofia', 'Manutenção', 'Definição'];

  return (
    <div className="pb-20 px-4 space-y-4 max-w-2xl mx-auto">
      <div className="py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg text-foreground/80">Planos Nutricionais</h3>
          <p className="text-sm text-muted-foreground">{diets.length} dietas ativas</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {goals.map((goal) => (
          <button
            key={goal}
            className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm whitespace-nowrap hover:bg-green-500/20 transition-colors"
          >
            {goal}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {diets.map((diet) => (
          <Card key={diet.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{diet.studentName}</p>
                  <h4 className="text-foreground mb-2">{diet.planName}</h4>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{diet.calories} kcal/dia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-green-600" />
                      <span>{diet.meals} refeições</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-red-500" />
                      <span>{diet.goal}</span>
                    </div>
                  </div>
                </div>

                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                  <p className="text-xs text-blue-600 mb-0.5">Proteínas</p>
                  <p className="text-sm text-foreground">120g</p>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-2 text-center">
                  <p className="text-xs text-orange-600 mb-0.5">Carboidratos</p>
                  <p className="text-sm text-foreground">200g</p>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                  <p className="text-xs text-yellow-600 mb-0.5">Gorduras</p>
                  <p className="text-sm text-foreground">60g</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Criada em {diet.date}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs text-green-600 hover:bg-green-500/10 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-xs text-green-600 hover:bg-green-500/10 rounded-lg transition-colors">
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
            <h3 className="text-xl mb-6 text-foreground">Criar Nova Dieta</h3>

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

              <Input label="Nome do Plano" placeholder="Ex: Dieta para Emagrecimento" required />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Calorias (kcal)" type="number" placeholder="2000" required />
                <Input label="Nº de Refeições" type="number" placeholder="6" required />
              </div>

              <div>
                <label className="block mb-1.5 text-sm text-foreground/80">Objetivo</label>
                <select className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Perda de peso</option>
                  <option>Hipertrofia</option>
                  <option>Manutenção</option>
                  <option>Definição</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input label="Proteínas (g)" type="number" placeholder="120" required />
                <Input label="Carboidratos (g)" type="number" placeholder="200" required />
                <Input label="Gorduras (g)" type="number" placeholder="60" required />
              </div>

              <div>
                <label className="block mb-1.5 text-sm text-foreground/80">Refeições</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={6}
                  placeholder="Café da manhã: ...&#10;Lanche da manhã: ...&#10;Almoço: ..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" fullWidth>
                  Criar Dieta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

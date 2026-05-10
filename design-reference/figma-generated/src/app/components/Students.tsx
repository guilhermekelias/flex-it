import { useState } from 'react';
import { Search, Plus, MoreVertical, Mail, Phone, Calendar } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  initials: string;
  planType: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const students: Student[] = [
    { id: 1, name: 'Ana Silva', email: 'ana@email.com', phone: '(11) 98765-4321', initials: 'AS', planType: 'Premium', joinDate: '01/03/2026', status: 'active' },
    { id: 2, name: 'Carlos Santos', email: 'carlos@email.com', phone: '(11) 97654-3210', initials: 'CS', planType: 'Básico', joinDate: '15/02/2026', status: 'active' },
    { id: 3, name: 'Beatriz Costa', email: 'beatriz@email.com', phone: '(11) 96543-2109', initials: 'BC', planType: 'Premium', joinDate: '10/04/2026', status: 'active' },
    { id: 4, name: 'Daniel Oliveira', email: 'daniel@email.com', phone: '(11) 95432-1098', initials: 'DO', planType: 'Intermediário', joinDate: '22/01/2026', status: 'active' },
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 px-4 space-y-4 max-w-2xl mx-auto">
      <div className="sticky top-[57px] bg-background py-4 z-10">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex-shrink-0">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground">{student.initials}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-foreground truncate">{student.name}</h4>
                    <button className="p-1 hover:bg-muted rounded-lg">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Início: {student.joinDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {student.planType}
                    </span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-xs rounded-full">
                      Ativo
                    </span>
                  </div>
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
            <h3 className="text-xl mb-6 text-foreground">Adicionar Novo Aluno</h3>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
              <Input label="Nome Completo" placeholder="Digite o nome" required />
              <Input label="E-mail" type="email" placeholder="email@exemplo.com" required />
              <Input label="Telefone" type="tel" placeholder="(00) 00000-0000" required />

              <div>
                <label className="block mb-1.5 text-sm text-foreground/80">Tipo de Plano</label>
                <select className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Básico</option>
                  <option>Intermediário</option>
                  <option>Premium</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" fullWidth>
                  Adicionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { Bell, Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  onLogout?: () => void;
}

export function Header({ title, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <h2 className="text-xl text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="w-6 h-6 text-foreground" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export type DashboardTab = 'home' | 'students' | 'workouts' | 'diets' | 'metrics';

type BottomNavigationProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
};

type NavigationItem = {
  id: DashboardTab;
  label: string;
  icon: 'home' | 'students' | 'workouts' | 'diets' | 'metrics';
};

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'In\u00edcio', icon: 'home' },
  { id: 'students', label: 'Alunos', icon: 'students' },
  { id: 'workouts', label: 'Treinos', icon: 'workouts' },
  { id: 'diets', label: 'Dietas', icon: 'diets' },
  { id: 'metrics', label: 'M\u00e9tricas', icon: 'metrics' },
];

function NavigationIcon({ icon }: Pick<NavigationItem, 'icon'>) {
  if (icon === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.2Z" />
      </svg>
    );
  }

  if (icon === 'students') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M16.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path d="M3.5 20a4.5 4.5 0 0 1 9 0" />
        <path d="M14 18.5a3.5 3.5 0 0 1 6.5 1.5" />
      </svg>
    );
  }

  if (icon === 'workouts') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 8v8" />
        <path d="M18 8v8" />
        <path d="M3.5 10v4" />
        <path d="M20.5 10v4" />
        <path d="M6 12h12" />
      </svg>
    );
  }

  if (icon === 'diets') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4v8a4 4 0 0 0 8 0V4" />
        <path d="M10 4v17" />
        <path d="M17 4v17" />
        <path d="M17 4c2.2 1.3 3.5 3.6 3.5 6.2V12H17" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label={'Navega\u00e7\u00e3o principal'}>
      {navigationItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            aria-current={isActive ? 'page' : undefined}
            className={`bottom-navigation-item${
              isActive ? ' bottom-navigation-item-active' : ''
            }`}
            key={item.id}
            onClick={() => onTabChange(item.id)}
            type="button"
          >
            <span className="bottom-navigation-icon">
              <NavigationIcon icon={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

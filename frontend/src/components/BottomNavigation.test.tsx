import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomNavigation } from './BottomNavigation';

describe('BottomNavigation', () => {
  afterEach(cleanup);

  it('marca a aba ativa e notifica troca de aba', () => {
    const onTabChange = vi.fn();
    render(<BottomNavigation activeTab="students" onTabChange={onTabChange} />);

    expect(screen.getByRole('button', { name: /Alunos/i }).getAttribute('aria-current')).toBe(
      'page',
    );

    fireEvent.click(screen.getByRole('button', { name: /Treinos/i }));

    expect(onTabChange).toHaveBeenCalledWith('workouts');
  });
});

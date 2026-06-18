import { describe, expect, it } from 'vitest';
import { formatObservationDate } from './formatObservationDate';

describe('formatObservationDate', () => {
  it('interpreta datas da API sem timezone como UTC antes de formatar em Sao Paulo', () => {
    expect(formatObservationDate('2026-06-05T12:30:00')).toBe('05/06/2026, 09:30');
  });

  it('mantem datas ISO com timezone explicito', () => {
    expect(formatObservationDate('2026-06-05T12:30:00Z')).toBe('05/06/2026, 09:30');
  });

  it('retorna fallback para datas invalidas', () => {
    expect(formatObservationDate('data-invalida')).toBe('Data nao informada');
  });
});

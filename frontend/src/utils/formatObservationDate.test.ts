import { describe, expect, it } from 'vitest';
import { formatObservationDate } from './formatObservationDate';

describe('formatObservationDate', () => {
  it('formata datas validas no padrao brasileiro', () => {
    const formattedDate = formatObservationDate('2026-06-11T15:45:00.000Z');

    expect(formattedDate).toMatch(/11\/06\/2026/);
    expect(formattedDate).toMatch(/\d{2}:\d{2}/);
  });

  it('retorna mensagem padrao para datas invalidas', () => {
    expect(formatObservationDate('data-invalida')).toBe('Data nao informada');
  });
});

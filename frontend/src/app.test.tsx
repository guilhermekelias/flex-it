import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('deve renderizar a aplicacao sem quebrar', () => {
    render(<App />);

    expect(document.body).toBeTruthy();
  });
});

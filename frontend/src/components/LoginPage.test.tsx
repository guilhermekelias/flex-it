import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

function renderLoginPage() {
  const props: Parameters<typeof LoginPage>[0] = {
    email: 'pro@example.com',
    password: 'secret',
    message: 'Mensagem de teste',
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn((event) => event.preventDefault()),
  };

  render(<LoginPage {...props} />);

  return props;
}

describe('LoginPage', () => {
  afterEach(cleanup);

  it('renderiza campos, mensagem e envia o formulario', () => {
    const props = renderLoginPage();
    const form = screen.getByRole('button', { name: /Entrar/i }).closest('form');

    if (!form) {
      throw new Error('Formulario nao encontrado.');
    }

    expect(screen.getByText('Mensagem de teste')).toBeTruthy();

    fireEvent.input(screen.getByLabelText(/E-mail/i), {
      target: { value: 'novo@example.com' },
    });
    fireEvent.input(screen.getByLabelText(/Senha/i), {
      target: { value: 'nova-senha' },
    });
    fireEvent.submit(form);

    expect(props.onEmailChange).toHaveBeenCalledWith('novo@example.com');
    expect(props.onPasswordChange).toHaveBeenCalledWith('nova-senha');
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });
});

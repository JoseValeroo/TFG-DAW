import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './loginPage';
import { AuthProvider } from '../../context/AuthContext';
import { authApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  authApi: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Login (formulario)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('no llama a la API si se envía vacío (los campos son obligatorios)', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    // La validación nativa (required) impide el envío: la API no debe invocarse.
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('llama a la API con las credenciales introducidas', async () => {
    authApi.login.mockResolvedValue({
      token: 'tok',
      user: { id: 1, username: 'jose', email: 'jose@example.com' },
    });

    renderLogin();
    await userEvent.type(screen.getByLabelText('Usuario'), 'jose');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreto123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(authApi.login).toHaveBeenCalledWith({
      username: 'jose',
      password: 'secreto123',
    });
  });

  it('muestra el mensaje de error del servidor si las credenciales fallan', async () => {
    authApi.login.mockRejectedValue(new Error('Credenciales incorrectas'));

    renderLogin();
    await userEvent.type(screen.getByLabelText('Usuario'), 'jose');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText('Credenciales incorrectas')).toBeInTheDocument();
  });
});

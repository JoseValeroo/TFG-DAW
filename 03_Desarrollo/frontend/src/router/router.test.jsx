import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from './router';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  authApi: { login: vi.fn(), register: vi.fn(), me: vi.fn() },
}));

describe('Rutas', () => {
  beforeEach(() => localStorage.clear());

  it('redirige a /login al entrar a /profilePage sin sesión', async () => {
    render(
      <MemoryRouter initialEntries={['/profilePage']}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </MemoryRouter>,
    );
    // Las rutas se cargan con lazy(); esperamos a que aparezca el login.
    expect(await screen.findByText('Bienvenido de nuevo')).toBeInTheDocument();
  });

  it('una ruta desconocida redirige al inicio', async () => {
    render(
      <MemoryRouter initialEntries={['/ruta-que-no-existe']}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </MemoryRouter>,
    );
    // La home renderiza el contenedor principal con la clase "App".
    await waitFor(() => {
      expect(document.querySelector('.App')).toBeInTheDocument();
    });
  });
});

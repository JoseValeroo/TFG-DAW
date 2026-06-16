import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './auth-context';
import { authApi } from '../services/api';

vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('arranca sin sesión', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login guarda token + usuario y marca la sesión como autenticada', async () => {
    authApi.login.mockResolvedValue({
      token: 'tok-123',
      user: { id: 1, username: 'jose', email: 'jose@example.com' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login({ username: 'jose', password: 'secreto123' });
    });

    expect(authApi.login).toHaveBeenCalledWith({ username: 'jose', password: 'secreto123' });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.username).toBe('jose');
    expect(localStorage.getItem('lure_token')).toBe('tok-123');
  });

  it('logout limpia la sesión y el almacenamiento', async () => {
    authApi.login.mockResolvedValue({
      token: 'tok-123',
      user: { id: 1, username: 'jose', email: 'jose@example.com' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login({ username: 'jose', password: 'secreto123' });
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('lure_token')).toBeNull();
  });

  it('useAuth lanza error si se usa fuera de <AuthProvider>', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});

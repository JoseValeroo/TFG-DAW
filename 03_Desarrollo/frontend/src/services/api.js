// Cliente HTTP mínimo para la API del backend (NestJS).
// La URL base se puede configurar con VITE_API_URL; por defecto apunta al backend local.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // NestJS devuelve `message` como string o array (errores de validación).
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Error en la petición';
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
};

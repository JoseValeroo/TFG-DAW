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
    // Soporta varios formatos de error:
    // - { message: string | string[] }            (errores de negocio)
    // - { errors: { Campo: [..] } }                (validación ASP.NET / ProblemDetails)
    // - { title: string }                          (fallback ProblemDetails)
    let message;
    if (Array.isArray(data.message)) {
      message = data.message.join(', ');
    } else if (data.message) {
      message = data.message;
    } else if (data.errors && typeof data.errors === 'object') {
      message = Object.values(data.errors).flat().join(', ');
    } else {
      message = data.title || 'Error en la petición';
    }
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
};

export const feedApi = {
  forYou: () => request('/feed/tweets'),
  following: (token) => request('/feed/following', { token }),
  create: (text, token) => request('/feed/tweets', { method: 'POST', body: { text }, token }),
  suggestions: () => request('/feed/suggestions'),
  trends: () => request('/feed/trends'),
};

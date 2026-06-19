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
  forYou: (token) => request('/feed/tweets', { token }),
  following: (token) => request('/feed/following', { token }),
  create: (text, token) => request('/feed/tweets', { method: 'POST', body: { text }, token }),
  suggestions: () => request('/feed/suggestions'),
  trends: () => request('/feed/trends'),
  search: (q, token) => request(`/feed/search?q=${encodeURIComponent(q)}`, { token }),
  toggleLike: (id, token) => request(`/feed/tweets/${id}/like`, { method: 'POST', token }),
  toggleRetweet: (id, token) => request(`/feed/tweets/${id}/retweet`, { method: 'POST', token }),
  toggleSave: (id, token) => request(`/feed/tweets/${id}/save`, { method: 'POST', token }),
  follow: (id, token) => request(`/feed/users/${id}/follow`, { method: 'POST', token }),
  getSaved: (token) => request('/feed/saved', { token }),
  getComments: (id) => request(`/feed/tweets/${id}/comments`),
  addComment: (id, text, token) => request(`/feed/tweets/${id}/comments`, { method: 'POST', body: { text }, token }),
};

export const profileApi = {
  me: (token) => request('/profile/me', { token }),
  tweets: (token) => request('/profile/me/tweets', { token }),
  replies: (token) => request('/profile/me/replies', { token }),
  likes: (token) => request('/profile/me/likes', { token }),
  followers: (token) => request('/profile/me/followers', { token }),
  following: (token) => request('/profile/me/following', { token }),
  update: (data, token) => request('/profile/me', { method: 'PATCH', body: data, token }),
  uploadAvatar: async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/profile/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'No se pudo subir la imagen');
    return data;
  },
};

export const usersApi = {
  get: (id, token) => request(`/users/${id}`, { token }),
  tweets: (id, token) => request(`/users/${id}/tweets`, { token }),
  replies: (id, token) => request(`/users/${id}/replies`, { token }),
  likes: (id, token) => request(`/users/${id}/likes`, { token }),
  followers: (id, token) => request(`/users/${id}/followers`, { token }),
  following: (id, token) => request(`/users/${id}/following`, { token }),
};

export const messagesApi = {
  conversations: (token) => request('/messages/conversations', { token }),
  thread: (otherId, token) => request(`/messages/thread/${otherId}`, { token }),
  send: (toUserId, content, token) =>
    request('/messages', { method: 'POST', body: { toUserId, content }, token }),
};

export const communitiesApi = {
  list: (token) => request('/communities', { token }),
  toggle: (id, token) => request(`/communities/${id}/membership`, { method: 'POST', token }),
};

export const notificationsApi = {
  list: (token) => request('/notifications', { token }),
};

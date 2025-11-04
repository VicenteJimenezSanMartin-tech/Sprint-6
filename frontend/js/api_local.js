// frontend/js/api_real.js

const API_URL = 'http://localhost:3000/api'; // La URL de tu backend

// Helper para guardar y leer el token JWT
function getToken() {
  return localStorage.getItem('tokyo_token');
}
function setToken(token) {
  if (token) {
    localStorage.setItem('tokyo_token', token);
  } else {
    localStorage.removeItem('tokyo_token');
  }
}

// Helper para gestionar las peticiones
async function request(path, options = {}) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(API_URL + path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // Si el token es inválido (401 o 403), deslogueamos
    if (res.status === 401 || res.status === 403) {
      setToken(null);
      // Opcional: Redirigir a login
      // location.hash = 'b02_login';
    }
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

// --- La API que usará tu aplicación ---
export const api = {
  get(path) {
    return request(path, { method: 'GET' });
  },

  post(path, body) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  del(path) {
    return request(path, { method: 'DELETE' });
  },

  // Helpers de autenticación
  saveToken: setToken,
  isLoggedIn: () => !!getToken(),
  logout: () => setToken(null),
};
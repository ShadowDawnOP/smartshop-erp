const getToken = () => localStorage.getItem('token');

const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const requireAuth = () => {
  if (!getToken()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/login.html';
};

const authFetch = async (url, options = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }
  });
};

const highlightNav = () => {
  const current = window.location.pathname;
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === current) {
      link.style.color = '#111';
      link.style.fontWeight = '600';
    }
  });
};

highlightNav();
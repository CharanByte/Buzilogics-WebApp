const API = 'http://localhost:5000/api';

function showError(msg) {
  const el = document.getElementById('error');
  if (el) el.innerText = msg || '';
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      alert('Registration successful! Please login.');
      window.location = 'login.html';
    } catch (err) {
      showError(err.message);
    }
  });
}


const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location = 'dashboard.html';
    } catch (err) {
      showError(err.message);
    }
  });
}


const userJson = localStorage.getItem('user');
if (userJson) {
  const user = JSON.parse(userJson);
  const welcome = document.getElementById('welcome');
  if (welcome) welcome.innerText = `Hello, ${user.name} (${user.role})`;
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location = 'index.html';
  });
}

const btnProfile = document.getElementById('btnProfile');
if (btnProfile) {
  btnProfile.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in!');
      return;
    }

    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');

      document.getElementById('profileResult').innerText = JSON.stringify(data, null, 2);
    } catch (err) {
      alert(err.message);
    }
  });
}

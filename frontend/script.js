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
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
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
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (!res.ok || !data.token || !data.user) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error(err);
      showError(err.message);
    }
  });
}

const userJson = localStorage.getItem('user');
let allUsers = [];
let currentPage = 1;
const usersPerPage = 3;

if (userJson && window.location.pathname.endsWith('dashboard.html')) {
  const user = JSON.parse(userJson);
  const welcome = document.getElementById('welcome');
  if (welcome) welcome.innerText = `Hello, ${user.name}!`;

  if (user.role && user.role.toLowerCase() === 'admin') {
    document.getElementById('adminPanel').classList.remove('hidden');
  }
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });
}

const btnProfile = document.getElementById('btnProfile');
if (btnProfile) {
  btnProfile.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('You are not logged in.');

    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');

      const profileCard = document.getElementById('profileCard');
      const profileContent = document.getElementById('profileContent');
      profileContent.innerHTML = `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Joined:</strong> ${new Date(data.created_at).toLocaleString()}</p>
      `;

      profileCard.classList.remove('hidden');
    } catch (err) {
      alert(err.message);
    }
  });
}

const closeProfile = document.getElementById('closeProfile');
if (closeProfile) {
  closeProfile.addEventListener('click', () => {
    document.getElementById('profileCard').classList.add('hidden');
  });
}

const btnViewUsers = document.getElementById('btnViewUsers');
if (btnViewUsers) {
  btnViewUsers.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('You are not logged in.');

    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');

      allUsers = data;
      currentPage = 1;
      document.getElementById('userTableContainer').classList.remove('hidden');
      renderUsers();
    } catch (err) {
      alert(err.message);
    }
  });
}

function renderUsers() {
  const start = (currentPage - 1) * usersPerPage;
  const end = start + usersPerPage;
  const usersToShow = allUsers.slice(start, end);

  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';

   usersToShow.forEach((u, index) => {
    const slNo = start + index + 1;
    const row = `
      <tr>
        <td>${slNo}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${new Date(u.created_at).toLocaleString()}</td>
      </tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById('pageInfo').innerText =
    `Page ${currentPage} of ${Math.ceil(allUsers.length / usersPerPage)}`;

  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = end >= allUsers.length;
}

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderUsers();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage * usersPerPage < allUsers.length) {
    currentPage++;
    renderUsers();
  }
});

const closeUsers = document.getElementById('closeUsers');
if (closeUsers) {
  closeUsers.addEventListener('click', () => {
    document.getElementById('userTableContainer').classList.add('hidden');
  });
}


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

let allUsers = [];
let currentPage = 1;
const usersPerPage = 3;

if (window.location.pathname.endsWith('dashboard.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    checkAuthentication();
    initializeEventListeners();
  });
}

function checkAuthentication() {
  const userJson = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  console.log('User from localStorage:', userJson);
  console.log('Token from localStorage:', token ? 'Present' : 'Missing');

  if (!userJson || !token) {
    console.log('No user or token, redirecting to login');
    window.location.href = 'login.html';
    return;
  }

  try {
    const user = JSON.parse(userJson);
    console.log('Parsed user:', user);
    
    const welcome = document.getElementById('welcome');
    if (welcome) {
      welcome.innerText = `Hello, ${user.name}!`;
      console.log('Welcome message set for:', user.name);
    }

    if (user.role && user.role.toLowerCase() === 'admin') {
      addViewUsersButtonToHeader();
      console.log('View Users button added to header for admin');
    } else {
      console.log('User is not admin, role:', user.role);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    window.location.href = 'login.html';
  }
}

function addViewUsersButtonToHeader() {
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    const viewUsersBtn = document.createElement('button');
    viewUsersBtn.id = 'btnViewUsers';
    viewUsersBtn.className = 'btn-view-users';
    viewUsersBtn.textContent = 'View Users';
    
    const profileBtn = document.getElementById('btnProfile');
    if (profileBtn && profileBtn.nextSibling) {
      headerRight.insertBefore(viewUsersBtn, profileBtn.nextSibling);
    } else {
      const logoutBtn = document.getElementById('btnLogout');
      headerRight.insertBefore(viewUsersBtn, logoutBtn);
    }
    
    console.log('View Users button added to header');
  }
}

function initializeEventListeners() {
  console.log('Initializing event listeners');
  
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
    console.log('Logout button listener added');
  } else {
    console.error('Logout button not found');
  }

  const btnProfile = document.getElementById('btnProfile');
  if (btnProfile) {
    btnProfile.addEventListener('click', showProfile);
    console.log('Profile button listener added');
  } else {
    console.error('Profile button not found');
  }

  
  const closeProfile = document.getElementById('closeProfile');
  if (closeProfile) {
    closeProfile.addEventListener('click', () => {
      document.getElementById('profileCard').classList.add('hidden');
    });
  }

  const closeUpdateProfile = document.getElementById('closeUpdateProfile');
  if (closeUpdateProfile) {
    closeUpdateProfile.addEventListener('click', () => {
      document.getElementById('updateProfileModal').classList.add('hidden');
    });
  }

  const closeResetPassword = document.getElementById('closeResetPassword');
  if (closeResetPassword) {
    closeResetPassword.addEventListener('click', () => {
      document.getElementById('resetPasswordModal').classList.add('hidden');
    });
  }

  const updateProfileForm = document.getElementById('updateProfileForm');
  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', updateProfile);
  }

  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', resetPassword);
  }

  const closeUsers = document.getElementById('closeUsers');
  if (closeUsers) {
    closeUsers.addEventListener('click', () => {
      document.getElementById('userTableContainer').classList.add('hidden');
    });
  }

  const prevPage = document.getElementById('prevPage');
  if (prevPage) {
    prevPage.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderUsers();
      }
    });
  }

  const nextPage = document.getElementById('nextPage');
  if (nextPage) {
    nextPage.addEventListener('click', () => {
      if (currentPage * usersPerPage < allUsers.length) {
        currentPage++;
        renderUsers();
      }
    });
  }

  console.log('All event listeners initialized');
}

document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'btnViewUsers') {
    fetchUsers();
  }
});

function handleLogout() {
  console.log('Logout clicked');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

async function showProfile() {
  console.log('Show profile clicked');
  const token = localStorage.getItem('token');
  if (!token) {
    showMessage('You are not logged in.', 'error');
    return;
  }

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
      <div class="profile-actions">
        <button class="btn-primary" onclick="showUpdateProfileModal('${data.name}', '${data.email}')">Update Profile</button>
        <button class="btn-secondary" onclick="showResetPasswordModal()">Reset Password</button>
      </div>
    `;

    profileCard.classList.remove('hidden');
    console.log('Profile displayed successfully');
  } catch (err) {
    console.error('Profile error:', err);
    showMessage(err.message, 'error');
  }
}

function showUpdateProfileModal(name, email) {
  console.log('Show update profile modal');
  document.getElementById('updateName').value = name;
  document.getElementById('updateEmail').value = email;
  document.getElementById('updateProfileModal').classList.remove('hidden');
}

function showResetPasswordModal() {
  console.log('Show reset password modal');
  document.getElementById('resetPasswordForm').reset();
  document.getElementById('resetPasswordModal').classList.remove('hidden');
}

async function updateProfile(e) {
  e.preventDefault();
  console.log('Update profile submitted');
  
  const token = localStorage.getItem('token');
  const name = document.getElementById('updateName').value.trim();
  const email = document.getElementById('updateEmail').value.trim();

  if (!name || !email) {
    showMessage('Name and email are required', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');

    // Update local storage
    const user = JSON.parse(localStorage.getItem('user'));
    user.name = name;
    user.email = email;
    localStorage.setItem('user', JSON.stringify(user));

    // Update welcome message
    document.getElementById('welcome').innerText = `Hello, ${name}!`;

    showMessage('Profile updated successfully!', 'success');
    document.getElementById('updateProfileModal').classList.add('hidden');
    
    // Refresh profile view
    showProfile();
    console.log('Profile updated successfully');
  } catch (err) {
    console.error('Update profile error:', err);
    showMessage(err.message, 'error');
  }
}

async function resetPassword(e) {
  e.preventDefault();
  console.log('Reset password submitted');
  
  const token = localStorage.getItem('token');
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    showMessage('New passwords do not match', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showMessage('New password must be at least 6 characters long', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/users/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');

    showMessage('Password reset successfully!', 'success');
    document.getElementById('resetPasswordModal').classList.add('hidden');
    document.getElementById('resetPasswordForm').reset();
    console.log('Password reset successfully');
  } catch (err) {
    console.error('Reset password error:', err);
    showMessage(err.message, 'error');
  }
}

async function fetchUsers() {
  console.log('Fetch users clicked');
  const token = localStorage.getItem('token');
  if (!token) {
    showMessage('You are not logged in.', 'error');
    return;
  }

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
    console.log('Users fetched successfully:', data.length, 'users');
  } catch (err) {
    console.error('Fetch users error:', err);
    showMessage(err.message, 'error');
  }
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

  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.innerText = `Page ${currentPage} of ${Math.ceil(allUsers.length / usersPerPage)}`;
  }

  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  
  if (prevPage) prevPage.disabled = currentPage === 1;
  if (nextPage) nextPage.disabled = end >= allUsers.length;
}

function showMessage(message, type) {
  const existingMessages = document.querySelectorAll('.error-message, .success-message');
  existingMessages.forEach(msg => msg.remove());

  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
  messageDiv.textContent = message;

  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(messageDiv, container.firstChild);
  }

  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 5000);
}

window.showUpdateProfileModal = showUpdateProfileModal;
window.showResetPasswordModal = showResetPasswordModal;
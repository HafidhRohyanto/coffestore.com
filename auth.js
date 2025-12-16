// auth.js

// ------------------ GLOBAL ------------------
let users = JSON.parse(localStorage.getItem('users')) || [];

// Tambahkan user default jika tidak ada user
if (users.length === 0) {
  users.push({ 
    name: 'Hafidh Rohyanto',
    email: 'hafidhrohyanto@gmail.com', 
    password: 'srtsrt' 
  });
  localStorage.setItem('users', JSON.stringify(users));
}

// ------------------ HELPER FUNCTIONS ------------------
function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

function isLoggedIn() {
  return JSON.parse(localStorage.getItem('isLoggedIn')) || false;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
  const oldNotification = document.querySelector('.custom-notification');
  if (oldNotification) oldNotification.remove();

  const notification = document.createElement('div');
  notification.className = `custom-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  } text-white`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
      <span>${message}</span>
      <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
}

// ------------------ REGISTER ------------------
function register(event) {
  event.preventDefault();
  
  // Ambil data dari form register
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value.trim();

  // Validasi input
  if (!name || !email || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  // Cek apakah email sudah terdaftar
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    showNotification('Email already registered', 'error');
    return;
  }

  // Tambahkan user baru
  const newUser = {
    id: Date.now().toString(),
    name: name,
    email: email,
    password: password, // Catatan: Ini tidak aman untuk produksi
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers();

  // Simpan status login
  localStorage.setItem('isLoggedIn', JSON.stringify(true));
  localStorage.setItem('currentUser', JSON.stringify({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email
  }));

  showNotification(`Welcome ${name}! Registration successful`, 'success');
  
  // Redirect ke halaman utama
  setTimeout(() => {
    window.location.href = 'products.html';
  }, 1500);
}

// ------------------ LOGIN ------------------
function login(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showNotification('Please enter email and password', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  // Cari user berdasarkan email
  const user = users.find(u => u.email === email);
  
  if (!user) {
    showNotification('User not found. Please register first', 'error');
    return;
  }

  // Periksa password
  if (user.password !== password) {
    showNotification('Invalid password', 'error');
    return;
  }

  // Set status login
  localStorage.setItem('isLoggedIn', JSON.stringify(true));
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email
  }));
  
  showNotification(`Welcome back, ${user.name || user.email}!`, 'success');
  
  setTimeout(() => {
    window.location.href = 'products.html';
  }, 1500);
}

// ------------------ TOGGLE PASSWORD VISIBILITY ------------------
function setupPasswordToggle(formId = null) {
  // Untuk halaman login
  const loginToggle = document.querySelector('#login-form #toggle-password');
  if (loginToggle) {
    loginToggle.addEventListener('click', function() {
      const passwordInput = document.querySelector('#login-form #password');
      togglePasswordVisibility(passwordInput, this);
    });
  }

  // Untuk halaman register
  const registerToggle = document.querySelector('#register-form #toggle-password');
  if (registerToggle) {
    registerToggle.addEventListener('click', function() {
      const passwordInput = document.querySelector('#register-form #password');
      togglePasswordVisibility(passwordInput, this);
    });
  }
}

function togglePasswordVisibility(passwordInput, icon) {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// ------------------ LOGOUT ------------------
function logout() {
  localStorage.setItem('isLoggedIn', JSON.stringify(false));
  localStorage.removeItem('currentUser');
  showNotification('Logged out successfully', 'success');
  
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// ------------------ CHECK AUTH STATUS ------------------
function checkAuth() {
  const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn'));
  const currentPath = window.location.pathname;
  
  // Jika sudah login tapi mengakses login/register, redirect ke products
  if (isLoggedIn && (currentPath.includes('login.html') || currentPath.includes('register.html'))) {
    window.location.href = 'products.html';
  }
  
  // Jika belum login tapi mengakses products, redirect ke login
  if (!isLoggedIn && currentPath.includes('products.html')) {
    showNotification('Please login first', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  }
}

// ------------------ INITIALIZE ------------------
document.addEventListener('DOMContentLoaded', () => {
  // Setup login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }

  // Setup register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', register);
  }

  // Setup password toggle untuk semua form
  setupPasswordToggle();

  // Check authentication status
  checkAuth();
});
// Authentication State & UI Logic
const TOKEN_KEY = 'alphastore_token';
const USER_KEY = 'alphastore_user';

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getToken() && !!this.getUser();
  },

  setAuth(user, token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.updateNavUI();
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.updateNavUI();
    showToast('Logged out successfully', 'info');
    // If on orders page, redirect to auth or home
    if (window.location.pathname.includes('orders.html')) {
      window.location.href = 'auth.html';
    }
  },

  updateNavUI() {
    const userBox = document.getElementById('user-nav-box');
    if (!userBox) return;

    if (this.isLoggedIn()) {
      const user = this.getUser();
      userBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <a href="orders.html" class="nav-link" title="My Orders">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span>My Orders</span>
          </a>
          <div class="user-btn" title="Logged in as ${user.email}">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
            <span>${user.name}</span>
          </div>
          <button id="logout-btn" class="nav-link" style="color: var(--danger); font-size: 0.9rem;" title="Logout">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      `;

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    } else {
      userBox.innerHTML = `
        <a href="auth.html" class="user-btn">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
          <span>Sign In</span>
        </a>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavUI();
});

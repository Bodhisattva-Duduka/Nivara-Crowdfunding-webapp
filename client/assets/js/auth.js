// auth.js - handles register + login
document.addEventListener('DOMContentLoaded', () => {

    // LOGIN
    const loginForm = document.getElementById('loginForm');
    const loginMsg = document.getElementById('login-msg');
    if (loginForm){
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginMsg) loginMsg.textContent = '';
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        if (!email || !password) { if (loginMsg) loginMsg.textContent = 'Please fill all fields'; return; }
  
        const res = await apiFetch('/auth/login', { method:'POST', body: { email, password } });
        if (res.ok && res.data && res.data.token){
          setToken(res.data.token);
          setUser(res.data.user);
          window.location.href = '/dashboard.html';
        } else {
          if (loginMsg) loginMsg.textContent = (res.data && (res.data.message || JSON.stringify(res.data))) || 'Login failed';
        }
      });
    }
  
    // REGISTER
    const regForm = document.getElementById('registerForm');
    const regMsg = document.getElementById('reg-msg');
    if (regForm){
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (regMsg) regMsg.textContent = '';
  
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
  
        if (!name || !email || !password){ if (regMsg) regMsg.textContent = 'Please fill all fields'; return; }
  
        const res = await apiFetch('/auth/register', { method:'POST', body: { name, email, password, role } });
        if (res.ok && res.data && res.data.token){
          setToken(res.data.token);
          setUser(res.data.user);
          window.location.href = '/dashboard.html';
        } else {
          if (regMsg) regMsg.textContent = (res.data && (res.data.message || JSON.stringify(res.data))) || 'Registration failed';
        }
      });
    }
  
  });
  
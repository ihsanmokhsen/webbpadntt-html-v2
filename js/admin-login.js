// =========================================================
// Admin login page
// =========================================================
// File ini khusus untuk admin.html. Setelah login sukses,
// pengguna diarahkan ke admin-dashboard.html.
(function () {
  const admin = window.BPAD_ADMIN;
  const els = {
    form: document.getElementById('loginForm'),
    username: document.getElementById('loginUsername'),
    password: document.getElementById('loginPassword')
  };

  async function validateExistingSession() {
    if (!admin.token) return;

    try {
      const data = await admin.callRpc('web_admin_me', { p_token: admin.token });
      const result = admin.normalizeRpcRow(data);

      if (result && result.success) {
        admin.goToDashboard();
        return;
      }

      admin.token = null;
    } catch (error) {
      admin.token = null;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    const submitBtn = els.form.querySelector('button[type="submit"]');
    admin.setLoading(submitBtn, true, 'Masuk...');

    try {
      const data = await admin.callRpc('web_admin_login', {
        p_username: els.username.value,
        p_password: els.password.value
      });
      const result = admin.normalizeRpcRow(data);

      if (!result || !result.success || !result.token) {
        admin.showToast(result?.message || 'Username atau password salah.', 'error');
        return;
      }

      admin.token = result.token;
      els.password.value = '';
      admin.showToast('Login berhasil. Membuka dashboard...', 'success');

      window.setTimeout(() => {
        admin.goToDashboard();
      }, 350);
    } catch (error) {
      admin.showToast(error.message, 'error');
    } finally {
      admin.setLoading(submitBtn, false);
    }
  }

  async function bootLogin() {
    if (!admin.initSupabaseClient()) return;

    els.form.addEventListener('submit', handleLogin);
    await validateExistingSession();
  }

  document.addEventListener('DOMContentLoaded', bootLogin);
})();

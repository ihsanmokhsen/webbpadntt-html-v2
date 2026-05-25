// =========================================================
// Admin shared helpers
// =========================================================
// Password admin tidak dicek di file JavaScript ini. Proses login
// tetap dilakukan oleh fungsi SQL Supabase: web_admin_login.
(function () {
  const SESSION_KEY = 'bpad_admin_session_token';

  const core = {
    SESSION_KEY,
    config: null,
    get token() {
      return sessionStorage.getItem(SESSION_KEY);
    },
    set token(value) {
      if (value) {
        sessionStorage.setItem(SESSION_KEY, value);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  };

  function getToastElement() {
    return document.getElementById('toast');
  }

  function showToast(message, type = 'default') {
    const toast = getToastElement();

    if (!toast) {
      console.log(message);
      return;
    }

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.hidden = false;

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  function setLoading(button, isLoading, loadingText = 'Memproses...') {
    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<i class="ti ti-loader-2"></i> ${loadingText}`;
      button.disabled = true;
      return;
    }

    button.innerHTML = button.dataset.originalText || button.innerHTML;
    button.disabled = false;
  }

  function normalizeRpcRow(data) {
    if (Array.isArray(data)) return data[0] || null;
    return data || null;
  }

  function initSupabaseClient() {
    const config = window.BPAD_SUPABASE_CONFIG;
    const configAlert = document.getElementById('configAlert');

    if (!config || !config.url || !config.anonKey) {
      if (configAlert) configAlert.hidden = false;
      showToast('Konfigurasi Supabase belum aktif.', 'error');
      return false;
    }

    core.config = {
      url: String(config.url).replace(/\/$/, ''),
      anonKey: String(config.anonKey)
    };

    if (configAlert) configAlert.hidden = true;
    return true;
  }

  async function callRpc(name, params = {}) {
    if (!core.config) {
      throw new Error('Koneksi Supabase belum aktif.');
    }

    const response = await fetch(`${core.config.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: core.config.anonKey,
        Authorization: `Bearer ${core.config.anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = text;
      }
    }

    if (!response.ok) {
      const message = data?.message || data?.hint || data?.details || text || 'Terjadi kesalahan saat menghubungi database.';
      throw new Error(message);
    }

    return data;
  }

  function goToLogin(reason = '') {
    const suffix = reason ? `?${reason}` : '';
    window.location.href = `admin.html${suffix}`;
  }

  function goToDashboard() {
    window.location.href = 'admin-dashboard.html';
  }

  core.showToast = showToast;
  core.setLoading = setLoading;
  core.normalizeRpcRow = normalizeRpcRow;
  core.initSupabaseClient = initSupabaseClient;
  core.callRpc = callRpc;
  core.goToLogin = goToLogin;
  core.goToDashboard = goToDashboard;

  window.BPAD_ADMIN = core;
})();

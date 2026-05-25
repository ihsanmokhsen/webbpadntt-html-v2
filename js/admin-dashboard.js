// =========================================================
// Admin dashboard page
// =========================================================
// File ini khusus untuk admin-dashboard.html. Jika token sesi
// tidak valid, halaman akan kembali ke admin.html.
(function () {
  const admin = window.BPAD_ADMIN;

  const state = {
    user: null,
    posts: [],
    settings: [],
    activePostId: null,
    activeSettingKey: null
  };

  const CONTENT_TYPE_META = [
    { key: 'berita', label: 'Berita' },
    { key: 'pengumuman', label: 'Pengumuman' },
    { key: 'agenda', label: 'Agenda' }
  ];

  const COVER_MAX_FILE_SIZE = 6 * 1024 * 1024;
  const COVER_MAX_WIDTH = 1280;
  const COVER_QUALITY = 0.82;

  const els = {
    dashboardPanel: document.getElementById('dashboardPanel'),
    logoutBtn: document.getElementById('logoutBtn'),
    sessionInfo: document.getElementById('sessionInfo'),
    contentTabBtn: document.getElementById('contentTabBtn'),
    settingsTabBtn: document.getElementById('settingsTabBtn'),
    contentSection: document.getElementById('contentSection'),
    settingsSection: document.getElementById('settingsSection'),
    postForm: document.getElementById('postForm'),
    postId: document.getElementById('postId'),
    postType: document.getElementById('postType'),
    postTitle: document.getElementById('postTitle'),
    postSlug: document.getElementById('postSlug'),
    postCategory: document.getElementById('postCategory'),
    postPublishedAt: document.getElementById('postPublishedAt'),
    postCoverImage: document.getElementById('postCoverImage'),
    postCoverFile: document.getElementById('postCoverFile'),
    coverPreview: document.getElementById('coverPreview'),
    coverPreviewImage: document.getElementById('coverPreviewImage'),
    clearCoverBtn: document.getElementById('clearCoverBtn'),
    postSummary: document.getElementById('postSummary'),
    postContent: document.getElementById('postContent'),
    resetFormBtn: document.getElementById('resetFormBtn'),
    deletePostBtn: document.getElementById('deletePostBtn'),
    filterType: document.getElementById('filterType'),
    postList: document.getElementById('postList'),
    editorMode: document.getElementById('editorMode'),
    settingForm: document.getElementById('settingForm'),
    settingKey: document.getElementById('settingKey'),
    settingGroup: document.getElementById('settingGroup'),
    settingPublic: document.getElementById('settingPublic'),
    settingValue: document.getElementById('settingValue'),
    settingMode: document.getElementById('settingMode'),
    filterSettingGroup: document.getElementById('filterSettingGroup'),
    settingList: document.getElementById('settingList')
  };

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function formatDateTimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  }

  function formatReadableDate(value) {
    if (!value) return 'Belum dijadwalkan';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Tanggal tidak valid';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function normalizeType(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getTypeLabel(typeKey) {
    const normalizedType = normalizeType(typeKey);
    const found = CONTENT_TYPE_META.find((item) => item.key === normalizedType);
    if (found) return found.label;
    return normalizedType ? normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1) : 'Lainnya';
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('File gambar tidak valid.'));
      image.src = dataUrl;
    });
  }

  async function compressCoverFile(file) {
    if (!file.type.startsWith('image/')) {
      throw new Error('File harus berupa gambar.');
    }

    if (file.size > COVER_MAX_FILE_SIZE) {
      throw new Error('Ukuran gambar maksimal 6 MB.');
    }

    const originalDataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(originalDataUrl);
    const scale = Math.min(1, COVER_MAX_WIDTH / image.width);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', COVER_QUALITY);
  }

  function updateCoverPreview() {
    const value = els.postCoverImage.value.trim();

    if (!value) {
      els.coverPreview.hidden = true;
      els.coverPreviewImage.removeAttribute('src');
      return;
    }

    els.coverPreviewImage.src = value;
    els.coverPreview.hidden = false;
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      admin.showToast('Memproses gambar...', 'default');
      els.postCoverImage.value = await compressCoverFile(file);
      updateCoverPreview();
      admin.showToast('Gambar siap disimpan.', 'success');
    } catch (error) {
      admin.showToast(error.message, 'error');
      els.postCoverFile.value = '';
    }
  }

  function clearCoverImage() {
    els.postCoverImage.value = '';
    els.postCoverFile.value = '';
    updateCoverPreview();
  }

  async function validateSession() {
    if (!admin.token) {
      admin.goToLogin('session=required');
      return false;
    }

    try {
      const data = await admin.callRpc('web_admin_me', { p_token: admin.token });
      const result = admin.normalizeRpcRow(data);

      if (!result || !result.success) {
        admin.token = null;
        admin.goToLogin('session=expired');
        return false;
      }

      state.user = result;
      els.sessionInfo.textContent = `Login sebagai ${result.name || result.username || 'Admin'}. Token sesi berlaku sementara.`;
      els.dashboardPanel.hidden = false;
      return true;
    } catch (error) {
      admin.token = null;
      admin.goToLogin('session=expired');
      return false;
    }
  }

  async function loadPosts() {
    els.postList.innerHTML = '<div class="empty-state">Memuat konten...</div>';

    try {
      const data = await admin.callRpc('web_admin_list_posts', {
        p_token: admin.token,
        p_type: els.filterType.value || null
      });

      state.posts = Array.isArray(data) ? data : [];
      renderPostList();
    } catch (error) {
      els.postList.innerHTML = '<div class="empty-state">Gagal memuat konten.</div>';
      admin.showToast(error.message, 'error');
    }
  }

  async function loadSettings() {
    els.settingList.innerHTML = '<div class="empty-state">Memuat setting...</div>';

    try {
      const data = await admin.callRpc('web_admin_list_settings', {
        p_token: admin.token
      });

      state.settings = Array.isArray(data) ? data : [];
      renderSettingGroupOptions();
      renderSettingList();
    } catch (error) {
      els.settingList.innerHTML = '<div class="empty-state">Gagal memuat setting.</div>';
      admin.showToast(error.message, 'error');
    }
  }

  async function handleSavePost(event) {
    event.preventDefault();

    const submitBtn = els.postForm.querySelector('button[type="submit"]');
    admin.setLoading(submitBtn, true, 'Menyimpan...');

    try {
      const publishedAt = els.postPublishedAt.value
        ? new Date(els.postPublishedAt.value).toISOString()
        : null;

      const savedId = await admin.callRpc('web_admin_save_post', {
        p_token: admin.token,
        p_id: els.postId.value ? Number(els.postId.value) : null,
        p_type: els.postType.value,
        p_title: els.postTitle.value,
        p_slug: els.postSlug.value,
        p_summary: els.postSummary.value,
        p_content: els.postContent.value,
        p_category: els.postCategory.value,
        p_cover_image: els.postCoverImage.value,
        p_status: 'published',
        p_published_at: publishedAt
      });

      state.activePostId = Number(savedId);
      await loadPosts();
      admin.showToast('Konten berhasil disimpan ke database.', 'success');
    } catch (error) {
      admin.showToast(error.message, 'error');
    } finally {
      admin.setLoading(submitBtn, false);
    }
  }

  async function handleDeletePost() {
    if (!state.activePostId) return;

    const activePost = state.posts.find((post) => Number(post.id) === Number(state.activePostId));
    const title = activePost?.title || 'konten ini';
    const confirmed = window.confirm(`Hapus "${title}" dari database?`);

    if (!confirmed) return;

    admin.setLoading(els.deletePostBtn, true, 'Menghapus...');

    try {
      await admin.callRpc('web_admin_delete_post', {
        p_token: admin.token,
        p_id: state.activePostId
      });

      resetPostForm();
      await loadPosts();
      admin.showToast('Konten berhasil dihapus.', 'success');
    } catch (error) {
      admin.showToast(error.message, 'error');
    } finally {
      admin.setLoading(els.deletePostBtn, false);
    }
  }

  async function handleSaveSetting(event) {
    event.preventDefault();

    if (!els.settingKey.value.trim()) {
      admin.showToast('Pilih setting yang ingin diubah dulu.', 'error');
      return;
    }

    const submitBtn = els.settingForm.querySelector('button[type="submit"]');
    admin.setLoading(submitBtn, true, 'Menyimpan...');

    try {
      await admin.callRpc('web_admin_save_setting', {
        p_token: admin.token,
        p_key: els.settingKey.value,
        p_value: els.settingValue.value,
        p_group_name: els.settingGroup.value,
        p_is_public: els.settingPublic.checked
      });

      state.activeSettingKey = els.settingKey.value;
      await loadSettings();
      admin.showToast('Web setting berhasil disimpan.', 'success');
    } catch (error) {
      admin.showToast(error.message, 'error');
    } finally {
      admin.setLoading(submitBtn, false);
    }
  }

  async function handleLogout() {
    try {
      if (admin.token) {
        await admin.callRpc('web_admin_logout', { p_token: admin.token });
      }
    } catch (error) {
      console.warn('Logout RPC gagal:', error);
    }

    admin.token = null;
    admin.goToLogin('logout=1');
  }

  function resetPostForm() {
    state.activePostId = null;
    els.postForm.reset();
    els.postId.value = '';
    els.postType.value = 'berita';
    clearCoverImage();
    els.editorMode.textContent = 'Konten Baru';
    els.deletePostBtn.hidden = true;
    renderPostList();
  }

  function editPost(post) {
    state.activePostId = Number(post.id);
    els.postId.value = post.id || '';
    els.postType.value = post.post_type || 'berita';
    els.postTitle.value = post.title || '';
    els.postSlug.value = post.slug || '';
    els.postCategory.value = post.category || '';
    els.postPublishedAt.value = formatDateTimeLocal(post.published_at);
    els.postCoverImage.value = post.cover_image || '';
    els.postCoverFile.value = '';
    updateCoverPreview();
    els.postSummary.value = post.summary || '';
    els.postContent.value = post.content || '';
    els.editorMode.textContent = 'Edit Konten';
    els.deletePostBtn.hidden = false;
    renderPostList();
    els.postTitle.focus();
  }

  function switchDashboardTab(tabName) {
    const isSettings = tabName === 'settings';

    els.contentTabBtn.classList.toggle('is-active', !isSettings);
    els.settingsTabBtn.classList.toggle('is-active', isSettings);
    els.contentSection.hidden = isSettings;
    els.settingsSection.hidden = !isSettings;

    if (isSettings && !state.settings.length) {
      loadSettings();
    }
  }

  function renderPostList() {
    els.postList.replaceChildren();

    if (!state.posts.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Belum ada konten di database.';
      els.postList.appendChild(empty);
      return;
    }

    const selectedType = normalizeType(els.filterType.value);
    const groups = [];

    if (selectedType) {
      const groupItems = state.posts.filter((post) => normalizeType(post.post_type) === selectedType);
      groups.push({
        key: selectedType,
        label: getTypeLabel(selectedType),
        items: groupItems
      });
    } else {
      CONTENT_TYPE_META.forEach((meta) => {
        const groupItems = state.posts.filter((post) => normalizeType(post.post_type) === meta.key);
        groups.push({
          key: meta.key,
          label: meta.label,
          items: groupItems
        });
      });

      const otherItems = state.posts.filter((post) => {
        const type = normalizeType(post.post_type);
        return type && !CONTENT_TYPE_META.some((meta) => meta.key === type);
      });

      if (otherItems.length) {
        groups.push({
          key: 'lainnya',
          label: 'Lainnya',
          items: otherItems
        });
      }
    }

    const availableGroups = groups.filter((group) => group.items.length);

    if (!availableGroups.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Konten untuk kategori ini belum ada.';
      els.postList.appendChild(empty);
      return;
    }

    availableGroups.forEach((group) => {
      const wrapper = document.createElement('section');
      wrapper.className = 'content-group';

      const heading = document.createElement('h4');
      heading.className = 'content-group-title';
      heading.textContent = `${group.label} (${group.items.length})`;
      wrapper.appendChild(heading);

      const tableWrap = document.createElement('div');
      tableWrap.className = 'content-table-wrap';

      const table = document.createElement('table');
      table.className = 'content-table';

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th scope="col">Judul</th>
          <th scope="col">Kategori</th>
          <th scope="col">Publikasi</th>
          <th scope="col">Aksi</th>
        </tr>
      `;

      const tbody = document.createElement('tbody');

      group.items.forEach((post) => {
        const row = document.createElement('tr');
        row.className = 'content-row';
        row.tabIndex = 0;

        if (Number(post.id) === Number(state.activePostId)) {
          row.classList.add('is-active');
        }

        const title = post.title || '(Tanpa judul)';
        const slugText = post.slug ? `/${post.slug}` : '-';
        const categoryText = post.category || '-';
        const dateText = formatReadableDate(post.published_at);

        const titleCell = document.createElement('td');
        titleCell.className = 'cell-title';
        const titleMain = document.createElement('span');
        titleMain.className = 'title-main';
        titleMain.textContent = title;
        const titleSub = document.createElement('span');
        titleSub.className = 'title-sub';
        titleSub.textContent = slugText;
        titleCell.append(titleMain, titleSub);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = categoryText;

        const dateCell = document.createElement('td');
        dateCell.textContent = dateText;

        const actionCell = document.createElement('td');
        actionCell.className = 'cell-action';
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'soft-btn compact-btn table-edit-btn';
        editButton.textContent = 'Edit';
        actionCell.appendChild(editButton);

        row.append(titleCell, categoryCell, dateCell, actionCell);

        const goEdit = () => editPost(post);
        row.addEventListener('click', goEdit);
        row.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goEdit();
          }
        });
        editButton.addEventListener('click', (event) => {
          event.stopPropagation();
          goEdit();
        });

        tbody.appendChild(row);
      });

      table.append(thead, tbody);
      tableWrap.appendChild(table);
      wrapper.appendChild(tableWrap);
      els.postList.appendChild(wrapper);
    });
  }

  function renderSettingGroupOptions() {
    const selectedGroup = els.filterSettingGroup.value;
    const groups = Array.from(new Set(
      state.settings
        .map((setting) => setting.group_name)
        .filter(Boolean)
    )).sort();

    els.filterSettingGroup.replaceChildren();

    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Semua';
    els.filterSettingGroup.appendChild(allOption);

    groups.forEach((group) => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = group;
      els.filterSettingGroup.appendChild(option);
    });

    if (groups.includes(selectedGroup)) {
      els.filterSettingGroup.value = selectedGroup;
    }
  }

  function editSetting(setting) {
    state.activeSettingKey = setting.setting_key;
    els.settingKey.value = setting.setting_key || '';
    els.settingGroup.value = setting.group_name || '';
    els.settingPublic.checked = setting.is_public !== false;
    els.settingValue.value = setting.value || '';
    els.settingMode.textContent = `Edit ${setting.group_name || 'setting'}`;
    renderSettingList();
    els.settingValue.focus();
  }

  function renderSettingList() {
    els.settingList.replaceChildren();

    const selectedGroup = els.filterSettingGroup.value;
    const filteredSettings = selectedGroup
      ? state.settings.filter((setting) => setting.group_name === selectedGroup)
      : state.settings;

    if (!filteredSettings.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Belum ada setting di database.';
      els.settingList.appendChild(empty);
      return;
    }

    const groupedSettings = new Map();

    filteredSettings.forEach((setting) => {
      const groupName = String(setting.group_name || '').trim() || 'lainnya';
      if (!groupedSettings.has(groupName)) {
        groupedSettings.set(groupName, []);
      }
      groupedSettings.get(groupName).push(setting);
    });

    const sortedGroupNames = Array.from(groupedSettings.keys())
      .sort((a, b) => a.localeCompare(b, 'id-ID'));

    sortedGroupNames.forEach((groupName) => {
      const settings = groupedSettings.get(groupName) || [];
      const wrapper = document.createElement('section');
      wrapper.className = 'content-group setting-group';

      const heading = document.createElement('h4');
      heading.className = 'content-group-title';
      heading.textContent = `${groupName} (${settings.length})`;
      wrapper.appendChild(heading);

      const tableWrap = document.createElement('div');
      tableWrap.className = 'content-table-wrap';

      const table = document.createElement('table');
      table.className = 'content-table settings-table';

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Value</th>
          <th scope="col">Akses</th>
          <th scope="col">Aksi</th>
        </tr>
      `;

      const tbody = document.createElement('tbody');

      settings.forEach((setting) => {
        const row = document.createElement('tr');
        row.className = 'content-row setting-row';
        row.tabIndex = 0;

        if (setting.setting_key === state.activeSettingKey) {
          row.classList.add('is-active');
        }

        const keyCell = document.createElement('td');
        keyCell.className = 'setting-key-cell';
        keyCell.textContent = setting.setting_key || '(Tanpa key)';

        const valueCell = document.createElement('td');
        valueCell.className = 'setting-value-cell';
        valueCell.textContent = setting.value || '(Kosong)';

        const visibilityCell = document.createElement('td');
        visibilityCell.className = 'setting-visibility-cell';
        visibilityCell.textContent = setting.is_public ? 'Publik' : 'Internal';

        const actionCell = document.createElement('td');
        actionCell.className = 'cell-action';
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'soft-btn compact-btn table-edit-btn';
        editButton.textContent = 'Edit';
        actionCell.appendChild(editButton);

        row.append(keyCell, valueCell, visibilityCell, actionCell);

        const goEdit = () => editSetting(setting);
        row.addEventListener('click', goEdit);
        row.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goEdit();
          }
        });
        editButton.addEventListener('click', (event) => {
          event.stopPropagation();
          goEdit();
        });

        tbody.appendChild(row);
      });

      table.append(thead, tbody);
      tableWrap.appendChild(table);
      wrapper.appendChild(tableWrap);
      els.settingList.appendChild(wrapper);
    });
  }

  function bindDashboardEvents() {
    els.logoutBtn.addEventListener('click', handleLogout);
    els.contentTabBtn.addEventListener('click', () => switchDashboardTab('content'));
    els.settingsTabBtn.addEventListener('click', () => switchDashboardTab('settings'));
    els.postForm.addEventListener('submit', handleSavePost);
    els.settingForm.addEventListener('submit', handleSaveSetting);
    els.resetFormBtn.addEventListener('click', resetPostForm);
    els.deletePostBtn.addEventListener('click', handleDeletePost);
    els.filterType.addEventListener('change', loadPosts);
    els.filterSettingGroup.addEventListener('change', renderSettingList);
    els.postCoverImage.addEventListener('input', updateCoverPreview);
    els.postCoverFile.addEventListener('change', handleCoverUpload);
    els.clearCoverBtn.addEventListener('click', clearCoverImage);

    els.postTitle.addEventListener('blur', () => {
      if (!els.postSlug.value.trim()) {
        els.postSlug.value = slugify(els.postTitle.value);
      }
    });
  }

  async function bootDashboard() {
    if (!admin.initSupabaseClient()) return;

    bindDashboardEvents();

    const isValid = await validateSession();
    if (!isValid) return;

    await loadPosts();
    await loadSettings();
  }

  document.addEventListener('DOMContentLoaded', bootDashboard);
})();

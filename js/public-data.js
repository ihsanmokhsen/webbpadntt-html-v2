// =========================================================
// Public Supabase data helper
// =========================================================
// Helper ini dipakai halaman publik untuk membaca konten dari
// tabel web_posts. Jika konfigurasi Supabase tidak tersedia,
// halaman tetap memakai JSON/fallback yang sudah ada.
(function () {
  const config = window.BPAD_SUPABASE_CONFIG;
  const publicData = {
    enabled: Boolean(config && config.url && config.anonKey),
    url: config?.url ? String(config.url).replace(/\/$/, '') : '',
    anonKey: config?.anonKey ? String(config.anonKey) : ''
  };

  function getHeaders() {
    return {
      apikey: publicData.anonKey,
      Authorization: `Bearer ${publicData.anonKey}`,
      'Content-Type': 'application/json'
    };
  }

  function buildPostUrl(type, limit = 12) {
    const params = new URLSearchParams({
      select: 'id,type,title,slug,summary,content,category,cover_image,status,published_at,updated_at',
      type: `eq.${type}`,
      status: 'eq.published',
      order: 'published_at.desc.nullslast,updated_at.desc',
      limit: String(limit)
    });

    return `${publicData.url}/rest/v1/web_posts?${params.toString()}`;
  }

  function buildSettingsUrl() {
    const params = new URLSearchParams({
      select: 'key,value,group_name,is_public,updated_at',
      is_public: 'eq.true',
      order: 'key.asc'
    });

    return `${publicData.url}/rest/v1/web_settings?${params.toString()}`;
  }

  function toDateOnly(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
  }

  function postToBerita(post, index = 0) {
    const themes = ['blue', 'green', 'amber'];

    return {
      id: post.id,
      judul: post.title,
      kategori: post.category || 'Berita',
      tanggal: toDateOnly(post.published_at || post.updated_at),
      ikon: 'ti-news',
      tema: themes[index % themes.length],
      ringkasan: post.summary || post.content || '',
      isi: post.content || '',
      link: post.slug ? `berita.html?slug=${encodeURIComponent(post.slug)}` : 'berita.html',
      gambar: post.cover_image || ''
    };
  }

  function postToListItem(post) {
    return {
      id: post.id,
      judul: post.title,
      tanggal: toDateOnly(post.published_at || post.updated_at),
      ringkasan: post.summary || post.content || '',
      kategori: post.category || ''
    };
  }

  function postToNewsWidget(post, index = 0) {
    const tones = [
      ['#0f2640', '#d71920'],
      ['#183b56', '#d6a243'],
      ['#0f4c81', '#18a999'],
      ['#7a1f1f', '#f59e0b']
    ];

    return {
      id: post.id,
      title: post.title,
      summary: post.summary || post.content || '',
      content: post.content || '',
      category: post.category || 'Berita',
      date: toDateOnly(post.published_at || post.updated_at),
      readTime: '2 menit',
      image: post.cover_image || '',
      url: post.slug ? `berita.html?slug=${encodeURIComponent(post.slug)}` : 'berita.html',
      imageTone: tones[index % tones.length],
      isHeadline: index < 3,
      isBreaking: index < 2,
      views: 500 + (index * 40)
    };
  }

  async function fetchPosts(type, limit = 12) {
    if (!publicData.enabled) return null;

    try {
      const response = await fetch(buildPostUrl(type, limit), {
        headers: getHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Gagal memuat data ${type}`);

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(error);
      return null;
    }
  }

  async function fetchSettings() {
    if (!publicData.enabled) return null;

    try {
      const response = await fetch(buildSettingsUrl(), {
        headers: getHeaders(),
        cache: 'no-store'
      });

      if (!response.ok) throw new Error('Gagal memuat web settings');

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(error);
      return null;
    }
  }

  async function getSettingsMap() {
    const rows = await fetchSettings();
    if (!rows || !rows.length) return null;

    const map = {};
    rows.forEach((row) => {
      const key = String(row?.key || '').trim();
      if (!key) return;
      map[key] = row?.value == null ? '' : String(row.value);
    });
    return map;
  }

  async function getBerita(limit = 12) {
    const posts = await fetchPosts('berita', limit);
    if (!posts || !posts.length) return null;
    return posts.map(postToBerita);
  }

  async function getPengumuman(limit = 10) {
    const posts = await fetchPosts('pengumuman', limit);
    if (!posts || !posts.length) return null;
    return posts.map(postToListItem);
  }

  async function getAgenda(limit = 10) {
    const posts = await fetchPosts('agenda', limit);
    if (!posts || !posts.length) return null;
    return posts.map(postToListItem);
  }

  async function getNewsWidgetItems(limit = 12) {
    const posts = await fetchPosts('berita', limit);
    if (!posts || !posts.length) return null;
    return posts.map(postToNewsWidget);
  }

  window.BPADPublicData = {
    enabled: publicData.enabled,
    fetchPosts,
    fetchSettings,
    getSettingsMap,
    getBerita,
    getPengumuman,
    getAgenda,
    getNewsWidgetItems
  };
})();

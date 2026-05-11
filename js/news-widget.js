// =========================================================
// NEWS WIDGET - PORTAL BERITA MODERN
// =========================================================
// Komponen ini berdiri sendiri dan tidak bergantung pada backend.
// Untuk migrasi API/database nanti, ganti loadNewsData() agar fetch
// data dari endpoint, lalu kirim array berita ke renderNewsWidget().

(function () {
  const NEWS_WIDGET_CONFIG = {
    rootId: 'newsWidgetRoot',
    autoplayMs: 5200,
    // Nanti bisa diisi, contoh: '/api/news'
    apiEndpoint: ''
  };

  const NEWS_WIDGET_STATE = {
    items: [],
    activeSlide: 0,
    timer: null,
    touchStartX: 0,
    touchEndX: 0
  };

  const NEWS_DUMMY_DATA = [
    {
      id: 1,
      title: 'Portal Berita BPAD NTT Siap Menampilkan Informasi Resmi Daerah',
      summary: 'Kanal berita ini disiapkan sebagai ruang informasi resmi terkait pendapatan daerah, aset, layanan publik, dan agenda BPAD NTT.',
      category: 'Informasi Resmi',
      date: '2026-05-11',
      readTime: '3 menit',
      imageTone: ['#0f2640', '#d71920'],
      isHeadline: true,
      isBreaking: true,
      views: 1280
    },
    {
      id: 2,
      title: 'Permohonan Informasi PPID Terhubung Melalui Formulir Online',
      summary: 'Masyarakat dapat mengajukan permohonan informasi publik melalui formulir resmi yang tersedia pada kanal PPID.',
      category: 'PPID',
      date: '2026-05-10',
      readTime: '2 menit',
      imageTone: ['#183b56', '#d6a243'],
      isHeadline: true,
      isBreaking: true,
      views: 1090
    },
    {
      id: 3,
      title: 'Sebaran UPTD Mendukung Layanan Pendapatan Daerah di NTT',
      summary: 'Informasi sebaran UPTD disiapkan agar masyarakat lebih mudah mengetahui kanal layanan pendapatan daerah di kabupaten/kota.',
      category: 'Layanan',
      date: '2026-05-09',
      readTime: '4 menit',
      imageTone: ['#0f4c81', '#18a999'],
      isHeadline: true,
      views: 980
    },
    {
      id: 4,
      title: 'Informasi Target PAD 2026 Ditampilkan sebagai Ringkasan Layanan Publik',
      summary: 'Ringkasan target PAD 2026 disiapkan pada halaman depan sebagai informasi cepat bagi pengunjung website.',
      category: 'Pendapatan Daerah',
      date: '2026-05-08',
      readTime: '3 menit',
      imageTone: ['#5b2c6f', '#d6a243'],
      views: 760
    },
    {
      id: 5,
      title: 'Kotak Saran SKM Dibuka untuk Peningkatan Mutu Pelayanan Publik',
      summary: 'Aspirasi masyarakat menjadi masukan penting dalam perbaikan kualitas layanan BPAD NTT.',
      category: 'SKM',
      date: '2026-05-07',
      readTime: '2 menit',
      imageTone: ['#7a1f1f', '#f59e0b'],
      isBreaking: true,
      views: 720
    },
    {
      id: 6,
      title: 'Arsip Berita Menjadi Daftar Informasi dan Kegiatan BPAD',
      summary: 'Daftar berita tetap tersedia sebagai arsip agar pengunjung dapat melihat informasi yang pernah dipublikasikan.',
      category: 'Arsip Berita',
      date: '2026-05-06',
      readTime: '4 menit',
      imageTone: ['#0b1726', '#64748b'],
      views: 690
    },
    {
      id: 7,
      title: 'Video: Panduan Akses Informasi PPID BPAD NTT',
      summary: 'Video ini disiapkan sebagai contoh format video news untuk panduan akses layanan PPID.',
      category: 'Video',
      date: '2026-05-05',
      readTime: '1 menit',
      videoDuration: '01:35',
      imageTone: ['#d71920', '#0f2640'],
      isVideo: true,
      views: 640
    },
    {
      id: 8,
      title: 'Video: Mengenal Kanal Layanan BPAD NTT',
      summary: 'Ringkasan kanal layanan BPAD NTT untuk masyarakat dan pemangku kepentingan.',
      category: 'Video',
      date: '2026-05-04',
      readTime: '2 menit',
      videoDuration: '02:10',
      imageTone: ['#0f4c81', '#d6a243'],
      isVideo: true,
      views: 610
    }
  ];

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatNewsDate(value) {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(`${value}T00:00:00`));
  }

  function createNewsImage(item) {
    const [startColor, endColor] = item.imageTone || ['#0f2640', '#d71920'];
    const label = escapeHtml(item.category || 'Berita');
    const title = escapeHtml(item.title);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${startColor}"/>
            <stop offset="100%" stop-color="${endColor}"/>
          </linearGradient>
          <radialGradient id="r" cx="25%" cy="20%" r="80%">
            <stop offset="0%" stop-color="rgba(255,255,255,.32)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="760" fill="url(#g)"/>
        <rect width="1200" height="760" fill="url(#r)"/>
        <circle cx="980" cy="130" r="190" fill="rgba(255,255,255,.13)"/>
        <circle cx="160" cy="660" r="230" fill="rgba(0,0,0,.14)"/>
        <path d="M0 574 C230 500 390 650 612 574 C820 502 966 472 1200 540 L1200 760 L0 760 Z" fill="rgba(255,255,255,.13)"/>
        <text x="68" y="96" fill="rgba(255,255,255,.86)" font-family="Arial, sans-serif" font-size="34" font-weight="700">${label}</text>
        <foreignObject x="68" y="500" width="900" height="160">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Georgia, serif; color: white; font-size: 46px; font-weight: 700; line-height: 1.08;">${title}</div>
        </foreignObject>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  async function loadNewsData() {
    if (!NEWS_WIDGET_CONFIG.apiEndpoint) {
      return NEWS_DUMMY_DATA;
    }

    try {
      const response = await fetch(NEWS_WIDGET_CONFIG.apiEndpoint, { cache: 'no-store' });
      if (!response.ok) throw new Error('Gagal memuat data berita');
      const data = await response.json();
      return Array.isArray(data) ? data : NEWS_DUMMY_DATA;
    } catch (error) {
      console.warn(error);
      return NEWS_DUMMY_DATA;
    }
  }

  function renderNewsWidget(items) {
    const root = document.getElementById(NEWS_WIDGET_CONFIG.rootId);
    if (!root) return;

    NEWS_WIDGET_STATE.items = items;
    NEWS_WIDGET_STATE.activeSlide = 0;

    const headlines = items.filter((item) => item.isHeadline).slice(0, 3);
    const latest = items.filter((item) => !item.isHeadline && !item.isVideo).slice(0, 6);
    const videos = items.filter((item) => item.isVideo).slice(0, 3);
    const breaking = items.filter((item) => item.isBreaking).slice(0, 4);

    root.innerHTML = `
      <div class="nw-topbar">
        <div>
          <div class="nw-eyebrow"><i class="ti ti-bolt"></i> Portal Berita BPAD</div>
          <h2 class="nw-title">Kabar <span>Terkini</span> Daerah</h2>
        </div>
        <p class="nw-subtitle">Ringkasan informasi resmi BPAD NTT. Konten awal bersifat contoh dan siap diganti dengan data berita resmi.</p>
      </div>

      <div class="nw-breaking" aria-label="Breaking news">
        <div class="nw-breaking-label"><i class="ti ti-speakerphone"></i> Breaking News</div>
        <div class="nw-breaking-track">
          <div class="nw-breaking-inner">
            ${[...breaking, ...breaking].map((item) => `<span class="nw-breaking-item">${escapeHtml(item.title)}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="nw-layout">
        <main class="nw-main">
          ${renderSlider(headlines)}
          <div class="nw-section-head">
            <h3>Berita Terbaru</h3>
            <a href="#berita">Lihat Semua <i class="ti ti-arrow-right"></i></a>
          </div>
          <div class="nw-latest-grid">
            ${latest.map(renderNewsCard).join('')}
          </div>
        </main>

        <aside class="nw-sidebar">
          ${renderVideoNews(videos)}
        </aside>
      </div>
    `;

    setupSlider(headlines.length);
  }

  function renderSlider(items) {
    return `
      <div class="nw-slider" id="nwSlider">
        ${items.map((item, index) => `
          <article class="nw-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <img src="${createNewsImage(item)}" alt="${escapeHtml(item.title)}" loading="${index === 0 ? 'eager' : 'lazy'}">
            <div class="nw-slide-content">
              <div class="nw-meta">
                <span class="nw-badge"><i class="ti ti-news"></i> ${escapeHtml(item.category)}</span>
                <span class="nw-time">${formatNewsDate(item.date)} · ${escapeHtml(item.readTime)}</span>
              </div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.summary)}</p>
            </div>
          </article>
        `).join('')}
        <div class="nw-dots">
          ${items.map((_, index) => `<button class="nw-dot ${index === 0 ? 'active' : ''}" type="button" data-dot="${index}" aria-label="Berita utama ${index + 1}"></button>`).join('')}
        </div>
        <div class="nw-slider-controls">
          <button class="nw-slider-btn" type="button" data-slider-prev aria-label="Berita sebelumnya"><i class="ti ti-chevron-left"></i></button>
          <button class="nw-slider-btn" type="button" data-slider-next aria-label="Berita berikutnya"><i class="ti ti-chevron-right"></i></button>
        </div>
      </div>
    `;
  }

  function renderNewsCard(item) {
    return `
      <article class="nw-card">
        <div class="nw-card-media">
          <img src="${createNewsImage(item)}" alt="${escapeHtml(item.title)}" loading="lazy">
        </div>
        <div class="nw-card-body">
          <div class="nw-meta">
            <span class="nw-badge">${escapeHtml(item.category)}</span>
            <span class="nw-time" style="color:#667085">${formatNewsDate(item.date)}</span>
          </div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.summary)}</p>
        </div>
      </article>
    `;
  }

  function renderVideoNews(items) {
    return `
      <section class="nw-side-card">
        <div class="nw-side-head">
          <h3>Video News</h3>
          <span>Mini</span>
        </div>
        <div class="nw-video-list">
          ${items.map((item) => `
            <article class="nw-video-item">
              <div class="nw-video-thumb">
                <img src="${createNewsImage(item)}" alt="${escapeHtml(item.title)}" loading="lazy">
                <div class="nw-play"><span><i class="ti ti-player-play-filled"></i></span></div>
              </div>
              <div>
                <div class="nw-video-title">${escapeHtml(item.title)}</div>
                <div class="nw-video-time">${escapeHtml(item.videoDuration || '01:00')} · ${formatNewsDate(item.date)}</div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function setupSlider(totalSlides) {
    const slider = document.getElementById('nwSlider');
    if (!slider || totalSlides <= 1) return;

    const goTo = (index) => {
      NEWS_WIDGET_STATE.activeSlide = (index + totalSlides) % totalSlides;

      slider.querySelectorAll('.nw-slide').forEach((slide) => {
        slide.classList.toggle('active', Number(slide.dataset.slide) === NEWS_WIDGET_STATE.activeSlide);
      });

      slider.querySelectorAll('.nw-dot').forEach((dot) => {
        dot.classList.toggle('active', Number(dot.dataset.dot) === NEWS_WIDGET_STATE.activeSlide);
      });
    };

    const next = () => goTo(NEWS_WIDGET_STATE.activeSlide + 1);
    const prev = () => goTo(NEWS_WIDGET_STATE.activeSlide - 1);

    slider.querySelector('[data-slider-next]')?.addEventListener('click', () => {
      next();
      restartAutoplay(next);
    });

    slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => {
      prev();
      restartAutoplay(next);
    });

    slider.querySelectorAll('.nw-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        goTo(Number(dot.dataset.dot));
        restartAutoplay(next);
      });
    });

    slider.addEventListener('touchstart', (event) => {
      NEWS_WIDGET_STATE.touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (event) => {
      NEWS_WIDGET_STATE.touchEndX = event.changedTouches[0].clientX;
      const delta = NEWS_WIDGET_STATE.touchEndX - NEWS_WIDGET_STATE.touchStartX;

      if (Math.abs(delta) > 48) {
        delta < 0 ? next() : prev();
        restartAutoplay(next);
      }
    }, { passive: true });

    restartAutoplay(next);
  }

  function restartAutoplay(callback) {
    clearInterval(NEWS_WIDGET_STATE.timer);
    NEWS_WIDGET_STATE.timer = setInterval(callback, NEWS_WIDGET_CONFIG.autoplayMs);
  }

  async function initNewsWidget() {
    const root = document.getElementById(NEWS_WIDGET_CONFIG.rootId);
    if (!root) return;

    const items = await loadNewsData();
    setTimeout(() => renderNewsWidget(items), 320);
  }

  window.BPADNewsWidget = {
    init: initNewsWidget,
    render: renderNewsWidget,
    setData: renderNewsWidget,
    config: NEWS_WIDGET_CONFIG
  };

  initNewsWidget();
})();

const DATA_FILES = {
  berita: 'data/berita.json',
  pengumuman: 'data/pengumuman.json',
  ppid: 'data/ppid.json'
};

const FALLBACK_DATA = {
  berita: [
    {
      judul: 'Pembebasan Denda PKB dalam Rangka HUT Provinsi NTT ke-66',
      kategori: 'Pengumuman',
      tanggal: '2026-10-15',
      ikon: 'ti-news',
      tema: 'blue',
      ringkasan: 'Informasi pembebasan denda Pajak Kendaraan Bermotor bagi wajib pajak di Provinsi NTT.'
    },
    {
      judul: 'BAPENDA NTT Raih Penghargaan Terbaik Pengelolaan Aset Daerah 2026',
      kategori: 'Prestasi',
      tanggal: '2026-10-08',
      ikon: 'ti-award',
      tema: 'green',
      ringkasan: 'BPAD NTT memperoleh apresiasi atas peningkatan tata kelola aset daerah.'
    },
    {
      judul: 'Peluncuran Sistem e-Samsat Generasi Baru untuk Kemudahan Wajib Pajak',
      kategori: 'Inovasi',
      tanggal: '2026-10-01',
      ikon: 'ti-device-laptop',
      tema: 'amber',
      ringkasan: 'Layanan digital e-Samsat diperbarui untuk mempermudah pembayaran pajak kendaraan.'
    }
  ],
  pengumuman: [
    { judul: 'Jadwal Pemeliharaan Sistem e-Samsat — 20 Oktober 2026', tanggal: '2026-10-18' },
    { judul: 'Perubahan Jam Pelayanan UPTD Samsat Kupang Selama Masa Libur Nasional', tanggal: '2026-10-12' },
    { judul: 'Rekrutmen Tenaga Pendamping Pajak Daerah Kabupaten/Kota Tahun 2026', tanggal: '2026-10-05' },
    { judul: 'Sosialisasi Peraturan Daerah tentang Pajak Daerah bagi Pelaku Usaha di Kupang', tanggal: '2026-09-28' }
  ],
  ppid: [
    {
      judul: 'Informasi Berkala',
      jenis: 'Kategori PPID',
      deskripsi: 'Profil instansi, program kerja, laporan kinerja, dan informasi publik yang diperbarui secara rutin.',
      link: 'https://drive.google.com/drive/folders/1aLEX6QKuaZ_wDzXQDknX5IgSgD1kMX37?usp=drive_link'
    },
    {
      judul: 'Informasi Setiap Saat',
      jenis: 'Kategori PPID',
      deskripsi: 'Daftar informasi publik, regulasi, dokumen layanan, serta data yang dapat dimohonkan masyarakat.',
      link: ''
    },
    {
      judul: 'Permohonan Informasi',
      jenis: 'Layanan PPID',
      deskripsi: 'Layanan permintaan informasi publik melalui kontak resmi atau datang langsung ke kantor BAPENDA Provinsi NTT.',
      link: ''
    }
  ]
};

function formatTanggal(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}

async function loadJson(path) {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${path}${separator}v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Gagal memuat ${path}`);
  return response.json();
}

function getThemeClass(prefix, theme, fallback = 'blue') {
  return `${prefix}${theme || fallback}`;
}

function renderBerita(items) {
  const container = document.getElementById('beritaGrid');
  if (!container) return;

  container.innerHTML = items.map((item) => `
    <div class="berita-card">
      <div class="berita-thumb ${getThemeClass('bt', item.tema)}">
        <i class="ti ${item.ikon || 'ti-news'}"></i>
      </div>
      <div class="berita-body">
        <span class="berita-tag ${getThemeClass('tag-', item.tema)}">${item.kategori || 'Berita'}</span>
        <div class="berita-title">${item.judul}</div>
        <p class="berita-summary">${item.ringkasan || ''}</p>
        <div class="berita-date"><i class="ti ti-calendar"></i> ${formatTanggal(item.tanggal)}</div>
      </div>
    </div>
  `).join('');
}

function renderPengumuman(items) {
  const container = document.getElementById('pengumumanList');
  if (!container) return;

  container.innerHTML = items.map((item) => `
    <li class="pgm-item">
      <div class="pgm-dot"></div>
      <div class="pgm-content">
        <div class="pgm-title">${item.judul}</div>
        <div class="pgm-date">${formatTanggal(item.tanggal)}</div>
      </div>
    </li>
  `).join('');
}

function renderPpid(items) {
  const container = document.getElementById('ppidGrid');
  if (!container) return;

  container.innerHTML = items.map((item) => `
    <div class="detail-card">
      <div class="detail-label">${item.jenis || 'PPID'}</div>
      <h3>${item.judul}</h3>
      <p>${item.deskripsi || ''}</p>
      ${item.link ? `<a class="doc-link" href="${item.link}" target="_blank" rel="noopener noreferrer"><i class="ti ti-brand-google-drive"></i> Buka Link Google Drive</a>` : ''}
    </div>
  `).join('');
}

async function hydrateContent() {
  renderBerita(FALLBACK_DATA.berita);
  renderPengumuman(FALLBACK_DATA.pengumuman);
  renderPpid(FALLBACK_DATA.ppid);

  try {
    renderBerita(await loadJson(DATA_FILES.berita));
  } catch (error) {
    console.warn(error);
  }

  try {
    renderPengumuman(await loadJson(DATA_FILES.pengumuman));
  } catch (error) {
    console.warn(error);
  }

  try {
    renderPpid(await loadJson(DATA_FILES.ppid));
  } catch (error) {
    console.warn(error);
  }
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

function toggleAppMenu(event) {
  event.stopPropagation();
  document.getElementById('appDropdown').classList.toggle('open');
}

document.querySelectorAll('.mobile-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

document.addEventListener('click', () => {
  document.getElementById('appDropdown')?.classList.remove('open');
});

document.querySelectorAll('#appMenu a').forEach((link) => {
  link.addEventListener('click', () => {
    document.getElementById('appDropdown').classList.remove('open');
  });
});

hydrateContent();

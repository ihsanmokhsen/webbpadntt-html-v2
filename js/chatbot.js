// =========================================================
// CHATBOT FAQ STATIS
// =========================================================
// Chatbot ini tidak memakai database dan tidak memakai AI/API.
// Jawaban diambil dari data/chatbot.json, lalu dicocokkan
// berdasarkan keyword sederhana.

const CHATBOT_DATA_FILE = 'data/chatbot.json';

// Data cadangan agar chatbot tetap bisa dipakai saat halaman
// dibuka langsung lewat file:// atau file JSON gagal dimuat.
const CHATBOT_FALLBACK = [
  {
    id: 'ppid',
    label: 'PPID',
    keywords: ['ppid', 'dokumen', 'informasi publik', 'informasi berkala', 'informasi setiap saat'],
    answer: 'PPID menyediakan dokumen informasi publik BPAD NTT. Silakan buka bagian PPID untuk mengakses Informasi Berkala, Informasi Setiap Saat, atau formulir Permohonan Informasi.',
    links: [{ label: 'Ke Bagian PPID', url: '#ppid' }]
  },
  {
    id: 'permohonan',
    label: 'Permohonan Informasi',
    keywords: ['permohonan', 'formulir', 'ajukan', 'mohon informasi'],
    answer: 'Untuk mengajukan permohonan informasi, silakan isi formulir resmi Permohonan Informasi.',
    links: [{ label: 'Isi Formulir', url: 'https://forms.gle/sLJVuwdGrZnQTJ3N7' }]
  },
  {
    id: 'alamat',
    label: 'Alamat Kantor',
    keywords: ['alamat', 'lokasi', 'kantor', 'peta'],
    answer: 'Kantor BPAD NTT beralamat di Jl. El Tari No.52, Oebobo, Kec. Oebobo, Kota Kupang, Nusa Tenggara Timur 85111.',
    links: [{ label: 'Lihat Kontak', url: '#kontak' }]
  },
  {
    id: 'berita',
    label: 'Berita',
    keywords: ['berita', 'kegiatan', 'informasi terbaru', 'artikel'],
    answer: 'Berita dan kegiatan BPAD NTT dapat dilihat pada bagian Berita.',
    links: [{ label: 'Lihat Berita', url: '#berita' }]
  },
  {
    id: 'pengumuman',
    label: 'Pengumuman',
    keywords: ['pengumuman', 'jadwal', 'info penting', 'pemberitahuan'],
    answer: 'Pengumuman resmi BPAD NTT dapat dilihat pada bagian Pengumuman.',
    links: [{ label: 'Lihat Pengumuman', url: '#pengumuman' }]
  },
  {
    id: 'jam',
    label: 'Jam Layanan',
    keywords: ['jam', 'layanan', 'buka', 'tutup', 'hari kerja', 'operasional'],
    answer: 'Jam layanan BPAD NTT adalah Senin sampai Jumat, pukul 07.30 - 15.30 WITA.',
    links: [{ label: 'Lihat Kontak', url: '#kontak' }]
  },
  {
    id: 'layanan',
    label: 'Layanan',
    keywords: ['layanan', 'pajak', 'samsat', 'aset'],
    answer: 'Bagian Layanan memuat layanan utama BPAD NTT seperti pajak daerah, e-Samsat, retribusi, dan pengelolaan aset daerah.',
    links: [{ label: 'Lihat Layanan', url: '#layanan' }]
  },
  {
    id: 'aplikasi',
    label: 'Aplikasi',
    keywords: ['aplikasi', 'magang', 'pro ntt', 'kotak saran', 'skm', 'buku tamu'],
    answer: 'Menu Aplikasi berisi akses ke Magang Hub, Pro NTT, Kotak Saran (SKM), dan Buku Tamu.',
    links: [
      { label: 'Magang Hub', url: 'https://magangbpad.netlify.app/' },
      { label: 'Kotak Saran (SKM)', url: 'https://forms.gle/z5ru8iL955ekdrmK7' },
      { label: 'Buku Tamu', url: 'https://forms.gle/Us5L3Peh8N1L99iq7' }
    ]
  }
];

let chatbotFaq = CHATBOT_FALLBACK;

function isSafeChatbotUrl(url) {
  return url.startsWith('#') || url.startsWith('https://') || url.startsWith('mailto:');
}

function buildChatbot() {
  const widget = document.createElement('div');
  widget.className = 'chatbot-widget';
  widget.innerHTML = `
    <button class="chatbot-toggle" type="button" aria-label="Buka Tanya BPAD">
      <i class="ti ti-message-chatbot"></i>
      <span>Tanya BPAD</span>
    </button>
    <section class="chatbot-panel" aria-hidden="true">
      <div class="chatbot-head">
        <div>
          <div class="chatbot-kicker">Asisten Informasi</div>
          <h3>Tanya BPAD</h3>
        </div>
        <button class="chatbot-close" type="button" aria-label="Tutup Tanya BPAD">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div class="chatbot-body" id="chatbotMessages"></div>
      <div class="chatbot-quick" id="chatbotQuick"></div>
      <form class="chatbot-form" id="chatbotForm">
        <input id="chatbotInput" type="text" autocomplete="off" placeholder="Tulis pertanyaan singkat...">
        <button type="submit" aria-label="Kirim pertanyaan"><i class="ti ti-send"></i></button>
      </form>
    </section>
  `;

  document.body.appendChild(widget);

  const toggle = widget.querySelector('.chatbot-toggle');
  const close = widget.querySelector('.chatbot-close');
  const panel = widget.querySelector('.chatbot-panel');
  const form = widget.querySelector('#chatbotForm');
  const input = widget.querySelector('#chatbotInput');

  toggle.addEventListener('click', () => {
    const isOpen = widget.classList.toggle('open');
    panel.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) input.focus();
  });

  close.addEventListener('click', () => {
    widget.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addChatMessage('user', question);
    answerChatbotQuestion(question);
    input.value = '';
  });

  renderQuickQuestions();
  addChatMessage('bot', 'Halo. Saya Asisten BPAD. Silakan pilih topik cepat atau tulis pertanyaan singkat seputar PPID, layanan, pengumuman, alamat, dan aplikasi.');
}

function renderQuickQuestions() {
  const quickContainer = document.getElementById('chatbotQuick');
  if (!quickContainer) return;

  quickContainer.innerHTML = '';
  chatbotFaq.slice(0, 6).forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.addEventListener('click', () => {
      addChatMessage('user', item.label);
      addChatMessage('bot', item.answer, item.links);
    });
    quickContainer.appendChild(button);
  });
}

function addChatMessage(type, text, links = []) {
  const messages = document.getElementById('chatbotMessages');
  if (!messages) return;

  const bubble = document.createElement('div');
  bubble.className = `chatbot-message ${type}`;

  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  bubble.appendChild(paragraph);

  const safeLinks = links.filter((link) => link.url && isSafeChatbotUrl(link.url));
  if (safeLinks.length) {
    const actions = document.createElement('div');
    actions.className = 'chatbot-actions';

    safeLinks.forEach((link) => {
      const anchor = document.createElement('a');
      anchor.textContent = link.label;
      anchor.href = link.url;

      if (!link.url.startsWith('#')) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }

      actions.appendChild(anchor);
    });

    bubble.appendChild(actions);
  }

  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function answerChatbotQuestion(question) {
  const normalizedQuestion = question.toLowerCase();
  const scored = chatbotFaq.map((item) => {
    const score = item.keywords.reduce((total, keyword) => {
      return normalizedQuestion.includes(keyword.toLowerCase()) ? total + 1 : total;
    }, 0);

    return { item, score };
  }).sort((a, b) => b.score - a.score);

  const bestMatch = scored[0];
  if (bestMatch && bestMatch.score > 0) {
    addChatMessage('bot', bestMatch.item.answer, bestMatch.item.links);
    return;
  }

  addChatMessage(
    'bot',
    'Maaf, saya belum menemukan jawaban yang cocok. Coba gunakan kata kunci seperti PPID, permohonan informasi, alamat, layanan, berita, pengumuman, atau aplikasi.'
  );
}

async function loadChatbotData() {
  try {
    const response = await fetch(`${CHATBOT_DATA_FILE}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal memuat data chatbot');

    const data = await response.json();
    if (Array.isArray(data) && data.length) {
      chatbotFaq = data;
    }
  } catch (error) {
    console.warn(error);
  }
}

async function initChatbot() {
  await loadChatbotData();
  buildChatbot();
}

initChatbot();

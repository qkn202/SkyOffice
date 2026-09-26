// =========================================================
// TIỆM TRÀ NHỎ HOGSMEADE - LẬP MENU & PHA CHẾ THỦ CÔNG
// JavaScript Engine: Tactile Hands-on Making & R&D Menu Lab
// =========================================================

// --- 1. HỆ THỐNG ÂM THANH THAO TÁC THỦ CÔNG (TACTILE SFX) ---
class SoundFx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tiếng đặt ly nhựa lên quầy gỗ
  playCupPlace() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Tiếng múc trân châu rơi vào ly (plop plop)
  playScoop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [260, 320, 240].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.08);
    });
  }

  // Tiếng bơm siro / đường (squirt pump)
  playPump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Tiếng rót nước trà chảy róc rách
  playPourTea() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.45);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Tiếng xúc đá viên rơi lách cách
  playIceClink() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1400, 1900, 2600].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.14, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.09);
    });
  }

  // Tiếng máy dập nắp cạch một phát (sealing clamp)
  playSealClamp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Tiếng lắc shaker phép thuật
  playShaker() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450 + (i % 2) * 150, now + i * 0.09);
      gain.gain.setValueAtTime(0.12, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.07);
    }
  }

  // Tiếng chuông thu tiền Galleons
  playCash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.2, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.28);
    });
  }

  // Tiếng sôi lục bục nấu bếp
  playBoil() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 + Math.random() * 200, now + i * 0.1);
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.08);
    }
  }

  // Tiếng bùa chú quét đuổi khách (whoosh & zap)
  playWhoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

const sfx = new SoundFx();

// --- ĐỌC PARAMS TỪ SKYOFFICE NẾU CÓ ---
const urlParams = new URLSearchParams(window.location.search);
const initialPlayerName = urlParams.get('name') || urlParams.get('player') || 'Bạn';
const initialHouse = urlParams.get('house') || 'gryffindor';
const initialGalleons = parseInt(urlParams.get('galleons'), 10) || 350;

// --- 2. TRẠNG THÁI GAME (GAME STATE) ---
const state = {
  galleons: initialGalleons,
  reputation: 4.9,
  reviewsCount: 150,
  cupsSold: 175,
  totalRev: 4250,
  totalTips: 480,
  storeName: 'Tiệm Trà Nhỏ Hogsmeade',
  baristaName: initialPlayerName,
  playerHouse: initialHouse,

  // Kho nguyên liệu nấu sẵn
  pantry: {
    tea_gryffindor: 15,
    tea_slytherin: 12,
    tea_ravenclaw: 16,
    tea_hufflepuff: 18,
    boba_gold: 45,
    boba_star: 30,
    jelly_moon: 28,
    cheese_foam: 25,
    cups_M: 50,
    cups_L: 50
  },

  // Danh sách thực đơn Menu do người chơi lập ra
  menu: [
    {
      id: 'm1',
      name: '🦁 Hồng Trà Sư Tử Gryffindor',
      baseTea: 'gryffindor',
      milkBlend: 'fresh_milk',
      toppings: ['boba_gold'],
      icon: '🦁',
      cost: 13,
      price: 26,
      active: true
    },
    {
      id: 'm2',
      name: '🐍 Lục Trà Táo Xanh Slytherin',
      baseTea: 'slytherin',
      milkBlend: 'condensed',
      toppings: ['boba_star'],
      icon: '🐍',
      cost: 12,
      price: 24,
      active: true
    },
    {
      id: 'm3',
      name: '🦅 Trà Lam Hoa Đậu Biếc Ravenclaw',
      baseTea: 'ravenclaw',
      milkBlend: 'coconut',
      toppings: ['jelly_moon'],
      icon: '🦅',
      cost: 14,
      price: 28,
      active: true
    },
    {
      id: 'm4',
      name: '🦡 Trà Sữa Bơ Mật Ong Hufflepuff',
      baseTea: 'hufflepuff',
      milkBlend: 'caramel',
      toppings: ['boba_gold', 'cheese_foam'],
      icon: '🦡',
      cost: 16,
      price: 30,
      active: true
    }
  ],

  // Hàng đợi đơn khách đang chờ
  pendingOrders: [
    {
      id: 'ORD-101',
      customerName: 'Harry Potter',
      avatar: '⚡',
      house: 'gryf',
      houseName: 'Gryffindor',
      drinkName: 'Hồng Trà Gryffindor',
      size: 'L',
      tea: 'gryffindor',
      sugar: '50%',
      ice: '50%',
      toppings: ['boba_gold', 'cheese_foam'],
      quote: 'Pha đậm đà và nhiều kem cheese giúp mình nhé bạn ơi!',
      price: 29,
      patience: 100
    },
    {
      id: 'ORD-102',
      customerName: 'Draco Malfoy',
      avatar: '🐍',
      house: 'slyth',
      houseName: 'Slytherin',
      drinkName: 'Lục Trà Slytherin',
      size: 'M',
      tea: 'slytherin',
      sugar: '70%',
      ice: '100%',
      toppings: ['boba_star'],
      quote: 'Làm không đường nhưng phải ngọt lịm! Nhanh lên không thiếu gia mách ba tao đóng cửa tiệm!',
      price: 24,
      patience: 85,
      isUnreasonable: true,
      demandType: 'hach_dich'
    },
    {
      id: 'ORD-103',
      customerName: 'Luna Lovegood',
      avatar: '🌸',
      house: 'raven',
      houseName: 'Ravenclaw',
      drinkName: 'Trà Lam Ravenclaw',
      size: 'L',
      tea: 'ravenclaw',
      sugar: '30%',
      ice: '0%',
      toppings: ['jelly_moon', 'boba_star'],
      quote: 'Mình nghe nói hạt thạch này xua đuổi được Nargles đó...',
      price: 31,
      patience: 95
    }
  ],

  activeOrderIndex: 0,

  // Ly trà hiện tại trên bàn pha chế thủ công
  craftingCup: {
    hasCupOnTable: false,
    size: null,
    tea: null,
    sugar: '50%',
    ice: '0%',
    toppings: new Set(),
    shaken: false,
    sealed: false,
    customName: 'TRÀ SỮA PHÉP THUẬT'
  },

  // Sổ lưu niệm
  reviews: [
    {
      author: 'Hermione Granger',
      avatar: '📚',
      rating: 5,
      drink: '🦁 Hồng Trà Sư Tử Gryffindor (Size L)',
      comment: 'Trà pha đúng chuẩn tỉ lệ nhiệt độ và độ ngọt! Uống xong thấy minh mẫn hẳn trước giờ thi Lịch sử Pháp thuật.',
      tip: 10,
      time: '10 phút trước'
    },
    {
      author: 'Ron Weasley',
      avatar: '🍗',
      rating: 5,
      drink: '🦡 Trà Sữa Bơ Hufflepuff (Size L)',
      comment: 'Trân châu dẻo dai ngon tuyệt vời, ngọt lịm đúng ý mình! Đáng từng đồng Galleons bỏ ra.',
      tip: 5,
      time: '25 phút trước'
    },
    {
      author: 'Cho Chang',
      avatar: '🦅',
      rating: 5,
      drink: '🦅 Trà Lam Ravenclaw (Size M)',
      comment: 'Màu xanh hoa đậu biếc rất thơ mộng, kem cheese béo thơm mịn màng.',
      tip: 8,
      time: '1 giờ trước'
    }
  ],

  // Nâng cấp tiệm
  upgrades: [
    {
      id: 'up_auto_sealer',
      title: 'Máy Dập Nắp Phép Thuật Cấp 2',
      desc: 'Dập nắp tức thì chỉ bằng 1 cái gạt nhẹ, không bao giờ kẹt màng.',
      cost: 160,
      unlocked: false,
      icon: '🕹️'
    },
    {
      id: 'up_fast_brew',
      title: 'Bình Ủ Áp Suất Siêu Tốc',
      desc: 'Ủ mẻ cốt trà đậm đặc chỉ trong 2 giây.',
      cost: 220,
      unlocked: false,
      icon: '⚡'
    },
    {
      id: 'up_golden_sign',
      title: 'Biển Hiệu Vàng Hogsmeade',
      desc: 'Tăng 40% lượng khách ghé tiệm và thêm tiền Tip.',
      cost: 320,
      unlocked: false,
      icon: '✨'
    }
  ]
};

// Khôi phục reviews từ localStorage nếu có
try {
  const savedReviews = localStorage.getItem('hpvn_boba_reviews');
  if (savedReviews) {
    const parsed = JSON.parse(savedReviews);
    if (Array.isArray(parsed) && parsed.length > 0) {
      state.reviews = parsed;
      state.reviewsCount = parsed.length;
      const sum = parsed.reduce((acc, r) => acc + (r.rating || 5), 0);
      state.reputation = Math.round((sum / parsed.length) * 10) / 10;
    }
  }
} catch (err) {
  console.warn('Cannot load reviews from localStorage', err);
}

// Khôi phục menu từ localStorage nếu có
try {
  const savedMenu = localStorage.getItem('hpvn_boba_menu');
  if (savedMenu) {
    const parsedMenu = JSON.parse(savedMenu);
    if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
      state.menu = parsedMenu;
    }
  }
} catch (err) {}

// --- 3. TIỆN ÍCH & ĐỒNG BỘ GIAO DIỆN ---
function showToast(message) {
  const toast = document.getElementById('magicToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function updateHeaderStats() {
  document.getElementById('galleonBalance').textContent = state.galleons;
  document.getElementById('storeRating').textContent = state.reputation.toFixed(1);
  document.getElementById('reviewCount').textContent = `(${state.reviewsCount} khách)`;
  document.getElementById('pendingOrdersCount').textContent = state.pendingOrders.length;
  document.getElementById('finTotalCups').textContent = `${state.cupsSold} Ly`;
  document.getElementById('finTotalRev').textContent = `${state.totalRev} G`;
  document.getElementById('finTotalTips').textContent = `${state.totalTips} G`;
  document.getElementById('menuTotalActive').textContent = `${state.menu.filter(m => m.active).length} / ${state.menu.length} Món`;
  
  // Cập nhật số lượng kho trên quầy
  document.getElementById('qtyGoldBoba').textContent = `Còn ${state.pantry.boba_gold} phần`;
  document.getElementById('qtyStarBoba').textContent = `Còn ${state.pantry.boba_star} phần`;
  document.getElementById('qtyJelly').textContent = `Còn ${state.pantry.jelly_moon} phần`;
  document.getElementById('qtyCheese').textContent = `Còn ${state.pantry.cheese_foam} phần`;
  document.getElementById('qtyTeaGryf').textContent = `Còn ${state.pantry.tea_gryffindor} ly`;
  document.getElementById('qtyTeaSlyth').textContent = `Còn ${state.pantry.tea_slytherin} ly`;
  document.getElementById('qtyTeaRaven').textContent = `Còn ${state.pantry.tea_ravenclaw} ly`;
  document.getElementById('qtyTeaHuff').textContent = `Còn ${state.pantry.tea_hufflepuff} ly`;
}

// Chuyển Tab tính năng
function initTabs() {
  const tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.playIceClink();
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      if (targetId === 'counter') document.getElementById('panelCounter').classList.add('active');
      if (targetId === 'menuLab') document.getElementById('panelMenuLab').classList.add('active');
      if (targetId === 'kitchen') document.getElementById('panelKitchen').classList.add('active');
      if (targetId === 'reviews') document.getElementById('panelReviews').classList.add('active');
    });
  });
}

document.getElementById('soundToggleBtn').addEventListener('click', function() {
  sfx.enabled = !sfx.enabled;
  this.textContent = sfx.enabled ? '🔊' : '🔇';
  showToast(sfx.enabled ? 'Đã bật âm thanh game' : 'Đã tắt âm thanh');
});

// --- 4. LOGIC QUẦY PHA CHẾ THỦ CÔNG TỪNG BƯỚC (HANDS-ON COUNTER) ---

// Render hàng đợi đơn hàng
function renderOrderQueue() {
  const container = document.getElementById('orderQueueContainer');
  container.innerHTML = '';

  if (state.pendingOrders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 10px; color: var(--ink-soft); font-size: 0.85rem;">
        <span>🎉 Quán đang hết đơn chờ!</span><br>
        <small>Hãy bấm nút <strong>"+ Khách NPC"</strong> hoặc <strong>"🧙‍♂️ Đặt Món"</strong> nhé.</small>
      </div>
    `;
    updateActiveTicketRibbon(null);
    return;
  }

  state.pendingOrders.forEach((order, idx) => {
    const card = document.createElement('div');
    card.className = `order-ticket-card ${idx === state.activeOrderIndex ? 'selected' : ''} ${order.isPlayerOrder ? 'is-player-order' : ''} ${order.isUnreasonable ? 'is-unreasonable' : ''}`;
    card.innerHTML = `
      <div class="ticket-header">
        <div class="cust-info-group">
          <span class="cust-avatar">${order.avatar}</span>
          <div>
            <span class="cust-name">
              ${order.customerName}
              ${order.isPlayerOrder ? '<span class="player-order-badge">🧙‍♂️ ĐƠN CỦA BẠN</span>' : ''}
              ${order.isUnreasonable ? '<span class="unreasonable-badge" title="Yêu cầu kỳ quặc hoặc quá đáng!">⚠️ QUÁ ĐÁNG</span>' : ''}
            </span>
            <span class="cust-house-tag ${order.house}">${order.houseName}</span>
          </div>
        </div>
        <button class="ticket-kick-quick-btn" title="Từ chối phục vụ khách này" data-idx="${idx}" type="button">🚫 Đuổi</button>
      </div>
      <div class="ticket-drink-title">🧋 ${order.drinkName} (Size ${order.size})</div>
      <div class="ticket-specs">
        <span class="spec-chip">Đường: ${order.sugar}</span>
        <span class="spec-chip">Đá: ${order.ice}</span>
        <span class="spec-chip">Topping: ${order.toppings.map(t => getToppingName(t)).join(', ') || 'Không'}</span>
      </div>
      <div class="ticket-quote">"${order.quote}"</div>
      <div class="patience-bar-wrap">
        <div class="patience-fill" style="width: ${order.patience}%"></div>
      </div>
    `;

    // Nút đuổi nhanh trên từng vé
    const quickKickBtn = card.querySelector('.ticket-kick-quick-btn');
    if (quickKickBtn) {
      quickKickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openKickCustomerModal(idx);
      });
    }

    card.addEventListener('click', () => {
      sfx.playIceClink();
      state.activeOrderIndex = idx;
      renderOrderQueue();
      updateActiveTicketRibbon(order);
    });

    container.appendChild(card);
  });

  const activeOrder = state.pendingOrders[state.activeOrderIndex] || null;
  updateActiveTicketRibbon(activeOrder);
}

function updateActiveTicketRibbon(order) {
  const titleEl = document.getElementById('ribbonTicketTitle');
  const reqsEl = document.getElementById('ribbonTicketReqs');
  const kickBtn = document.getElementById('btnKickActiveCustomer');

  if (!order) {
    titleEl.textContent = 'Chưa chọn đơn nào. Hãy nhấp vào một vé bên trái!';
    reqsEl.innerHTML = '';
    if (kickBtn) kickBtn.style.display = 'none';
    return;
  }

  if (kickBtn) kickBtn.style.display = 'inline-flex';

  titleEl.innerHTML = `Đang pha cho <strong>${order.customerName}</strong>: ${order.drinkName} (Size ${order.size}) ${order.isUnreasonable ? '<span class="unreasonable-badge">⚠️ QUÁ ĐÁNG</span>' : ''}`;
  reqsEl.innerHTML = `
    <span class="req-tag">Size ${order.size}</span>
    <span class="req-tag">Đường ${order.sugar}</span>
    <span class="req-tag">Đá ${order.ice}</span>
    ${order.toppings.map(t => `<span class="req-tag">${getToppingName(t)}</span>`).join('')}
  `;
}

function getToppingName(key) {
  switch (key) {
    case 'boba_gold':
    case 'golden_boba': return 'Trân Châu Hoàng Kim';
    case 'boba_star':
    case 'night_star': return 'Trân Châu Tinh Tú';
    case 'jelly_moon':
    case 'moon_jelly': return 'Thạch Trăng Rằm';
    case 'cheese_foam': return 'Kem Cheese Tuyết';
    default: return key;
  }
}

function getTeaName(key) {
  switch (key) {
    case 'gryffindor': return 'Hồng Trà Gryffindor';
    case 'slytherin': return 'Lục Trà Slytherin';
    case 'ravenclaw': return 'Trà Lam Ravenclaw';
    case 'hufflepuff': return 'Trà Kim Hufflepuff';
    default: return key;
  }
}

// Cập nhật giao diện ly trà sữa trực quan
function updateVisualCup() {
  const cup = state.craftingCup;
  const cupEl = document.getElementById('magicCup');
  const liquidEl = document.getElementById('layerTeaLiquid');
  const iceEl = document.getElementById('layerIceCubes');
  const foamEl = document.getElementById('layerCheeseFoam');
  const bobaEl = document.getElementById('layerBobaBottom');
  const lidEl = document.getElementById('cupLid');
  const strawEl = document.getElementById('cupStraw');
  const stampNameEl = document.getElementById('stampDrinkName');
  const guideEl = document.getElementById('stepGuideText');

  if (!cup.hasCupOnTable) {
    cupEl.style.opacity = '0.35';
    cupEl.style.transform = 'scale(0.85)';
    liquidEl.style.height = '0%';
    iceEl.classList.remove('visible');
    foamEl.classList.remove('active');
    bobaEl.classList.remove('has-boba');
    lidEl.classList.remove('sealed');
    strawEl.style.display = 'none';
    guideEl.innerHTML = `👉 <em>Bước 1:</em> Nhấp vào ngăn lấy ly để đặt ly lên bàn!`;
    return;
  }

  cupEl.style.opacity = '1';
  cupEl.style.transform = 'scale(1)';

  // Kích thước
  if (cup.size === 'L') {
    cupEl.classList.add('size-L');
  } else {
    cupEl.classList.remove('size-L');
  }

  // Topping dưới đáy
  bobaEl.innerHTML = '';
  if (cup.toppings.size > 0) {
    bobaEl.classList.add('has-boba');
    cup.toppings.forEach(topKey => {
      for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.className = `boba-dot ${topKey === 'boba_gold' ? 'golden' : (topKey === 'boba_star' ? 'night_star' : 'moon_jelly')}`;
        bobaEl.appendChild(dot);
      }
    });
  } else {
    bobaEl.classList.remove('has-boba');
  }

  // Cốt trà
  liquidEl.className = 'layer-tea-liquid';
  if (cup.tea) {
    liquidEl.classList.add(cup.tea);
    liquidEl.style.height = cup.toppings.has('cheese_foam') ? '74%' : '84%';
  } else {
    liquidEl.style.height = '0%';
  }

  // Đá viên
  iceEl.innerHTML = '';
  if (cup.ice !== '0%') {
    iceEl.classList.add('visible');
    const cubeCount = cup.ice === '100%' ? 3 : 2;
    for (let i = 0; i < cubeCount; i++) {
      const cube = document.createElement('div');
      cube.className = 'ice-cube-item';
      iceEl.appendChild(cube);
    }
  } else {
    iceEl.classList.remove('visible');
  }

  // Kem Cheese
  if (cup.toppings.has('cheese_foam')) {
    foamEl.classList.add('active');
  } else {
    foamEl.classList.remove('active');
  }

  // Dập nắp
  if (cup.sealed) {
    lidEl.classList.add('sealed');
    strawEl.style.display = 'block';
  } else {
    lidEl.classList.remove('sealed');
    strawEl.style.display = 'none';
  }

  // Tem nhãn
  stampNameEl.textContent = cup.customName || 'TRÀ SỮA PHÉP THUẬT';

  // Hướng dẫn bước tiếp theo
  if (cup.toppings.size === 0) {
    guideEl.innerHTML = `👉 <em>Bước 2:</em> Dùng muỗng múc trân châu/thạch thả vào đáy ly!`;
  } else if (!cup.sugar) {
    guideEl.innerHTML = `👉 <em>Bước 3:</em> Bấm cần bơm siro đường theo yêu cầu khách!`;
  } else if (!cup.tea) {
    guideEl.innerHTML = `👉 <em>Bước 4:</em> Nhấp vòi gạt rót cốt trà vào ly!`;
  } else if (cup.ice === '0%' && !cup.toppings.has('cheese_foam')) {
    guideEl.innerHTML = `👉 <em>Bước 5:</em> Xúc đá viên hoặc phủ kem cheese!`;
  } else if (!cup.sealed) {
    guideEl.innerHTML = `👉 <em>Bước 6:</em> Kéo cần máy dập nắp phép thuật (CẬP)!`;
  } else {
    guideEl.innerHTML = `🎉 <em>Bước 7:</em> Ly trà sữa đã hoàn tất! Bấm "Giao Cho Khách" ngay!`;
  }
}

// Bắt sự kiện thao tác thủ công trên quầy
function initTactileCounterControls() {
  // 1. Lấy Ly đặt lên quầy
  document.getElementById('btnTakeCupM').addEventListener('click', function() {
    sfx.playCupPlace();
    state.craftingCup.hasCupOnTable = true;
    state.craftingCup.size = 'M';
    document.querySelectorAll('.cup-take-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    updateVisualCup();
    showToast('🥤 Đã đặt 1 Ly Vừa (Size M) lên mặt quầy!');
  });

  document.getElementById('btnTakeCupL').addEventListener('click', function() {
    sfx.playCupPlace();
    state.craftingCup.hasCupOnTable = true;
    state.craftingCup.size = 'L';
    document.querySelectorAll('.cup-take-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    updateVisualCup();
    showToast('🥤 Đã đặt 1 Ly Lớn (Size L) lên mặt quầy!');
  });

  // 2. Múc Topping
  document.getElementById('btnScoopGold').addEventListener('click', () => {
    if (!state.craftingCup.hasCupOnTable) { showToast('Hãy lấy ly đặt lên quầy trước!'); return; }
    if (state.pantry.boba_gold <= 0) { showToast('Hết trân châu hoàng kim rồi, hãy vào Bếp để nấu thêm!'); return; }
    sfx.playScoop();
    state.pantry.boba_gold--;
    state.craftingCup.toppings.add('boba_gold');
    updateVisualCup();
    updateHeaderStats();
    showToast('🥄 Đã múc 1 muỗng Trân Châu Hoàng Kim thả đáy ly!');
  });

  document.getElementById('btnScoopStar').addEventListener('click', () => {
    if (!state.craftingCup.hasCupOnTable) { showToast('Hãy lấy ly đặt lên quầy trước!'); return; }
    if (state.pantry.boba_star <= 0) { showToast('Hết trân châu tinh tú rồi!'); return; }
    sfx.playScoop();
    state.pantry.boba_star--;
    state.craftingCup.toppings.add('boba_star');
    updateVisualCup();
    updateHeaderStats();
    showToast('🥄 Đã múc 1 muỗng Trân Châu Tinh Tú thả đáy ly!');
  });

  document.getElementById('btnScoopJelly').addEventListener('click', () => {
    if (!state.craftingCup.hasCupOnTable) { showToast('Hãy lấy ly đặt lên quầy trước!'); return; }
    if (state.pantry.jelly_moon <= 0) { showToast('Hết thạch trăng rằm rồi!'); return; }
    sfx.playScoop();
    state.pantry.jelly_moon--;
    state.craftingCup.toppings.add('jelly_moon');
    updateVisualCup();
    updateHeaderStats();
    showToast('🥄 Đã múc 1 muỗng Thạch Trăng Rằm thả đáy ly!');
  });

  // 3. Bơm đường (Pump Syrup)
  document.querySelectorAll('.pump-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!state.craftingCup.hasCupOnTable) { showToast('Hãy lấy ly đặt lên quầy trước!'); return; }
      sfx.playPump();
      document.querySelectorAll('.pump-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      state.craftingCup.sugar = this.dataset.sugar;
      updateVisualCup();
      showToast(`🍯 Đã bơm lượng đường: ${state.craftingCup.sugar}!`);
    });
  });

  // 4. Rót cốt trà từ 4 bình ủ
  document.querySelectorAll('.dispenser-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!state.craftingCup.hasCupOnTable) { showToast('Hãy lấy ly đặt lên quầy trước!'); return; }
      const teaKey = this.dataset.pourTea;
      const pantryKey = `tea_${teaKey}`;
      if (state.pantry[pantryKey] <= 0) {
        showToast(`Bình ${getTeaName(teaKey)} đã cạn! Hãy vào tab Bếp để ủ thêm nhé.`);
        return;
      }
      sfx.playPourTea();
      state.pantry[pantryKey]--;
      state.craftingCup.tea = teaKey;
      state.craftingCup.customName = getTeaName(teaKey).toUpperCase();
      updateVisualCup();
      updateHeaderStats();
      showToast(`🫖 Đang gạt vòi rót ${getTeaName(teaKey)} róc rách vào ly...`);
    });
  });

  // 5. Xúc đá & Phủ kem cheese
  document.querySelectorAll('.action-box .scoop-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!state.craftingCup.hasCupOnTable) { showToast('Hãy lấy ly đặt lên quầy trước!'); return; }
      const action = this.dataset.action;
      if (action === 'ice_none') {
        state.craftingCup.ice = '0%';
        updateVisualCup();
        showToast('🔥 Tùy chọn không đá (uống ấm)!');
      } else if (action === 'ice_normal') {
        sfx.playIceClink();
        state.craftingCup.ice = '50%';
        updateVisualCup();
        showToast('🧊 Đã xúc xẻng đá viên vừa mát!');
      } else if (action === 'ice_full') {
        sfx.playIceClink();
        state.craftingCup.ice = '100%';
        updateVisualCup();
        showToast('🏔️ Đã xúc đầy đá viên lạnh buốt!');
      } else if (action === 'pour_cheese') {
        if (state.pantry.cheese_foam <= 0) { showToast('Hết kem cheese rồi!'); return; }
        sfx.playPourTea();
        state.pantry.cheese_foam--;
        state.craftingCup.toppings.add('cheese_foam');
        updateVisualCup();
        updateHeaderStats();
        showToast('🍦 Đã phủ lớp bọt Kem Cheese Tuyết mịn màng bồng bềnh!');
      }
    });
  });

  // 6. Kéo cần gạt dập nắp
  document.getElementById('btnPressSealer').addEventListener('click', function() {
    if (!state.craftingCup.hasCupOnTable) { showToast('Chưa có ly nào trên bàn!'); return; }
    if (!state.craftingCup.tea) { showToast('Ly chưa có nước trà! Hãy rót trà trước khi dập nắp.'); return; }
    
    sfx.playSealClamp();
    const head = document.getElementById('sealerHead');
    head.classList.add('pressed');
    setTimeout(() => head.classList.remove('pressed'), 250);

    state.craftingCup.sealed = true;
    updateVisualCup();
    showToast('🕹️ CẠCH! Màng nắp đã dập kín miệng ly và dán tem hoàn chỉnh!');
  });

  // 7. Cầm ly lắc shaker
  document.getElementById('btnShakeCup').addEventListener('click', function() {
    if (!state.craftingCup.hasCupOnTable || !state.craftingCup.tea) {
      showToast('Hãy rót trà vào ly trước khi lắc!');
      return;
    }
    sfx.playShaker();
    const cupEl = document.getElementById('magicCup');
    cupEl.classList.add('shaking');
    state.craftingCup.shaken = true;
    showToast('🪇 Đang lắc đều trà, đường, đá và hương vị hòa quyện!');
    setTimeout(() => cupEl.classList.remove('shaking'), 600);
  });

  // 8. Đổ đi làm lại
  document.getElementById('btnDiscardCup').addEventListener('click', function() {
    sfx.playPourTea();
    resetCraftingCup();
    showToast('🗑️ Đã đổ ly đi làm lại mẻ mới!');
  });

  // 9. Giao cho khách
  document.getElementById('btnDeliverCup').addEventListener('click', deliverCraftedCup);

  // Thêm khách mới
  document.getElementById('btnSpawnOrder').addEventListener('click', () => {
    sfx.playIceClink();
    spawnCustomerOrder();
    showToast('🛎️ Một vị khách phù thủy mới vừa bước vào hàng!');
  });
}

function resetCraftingCup() {
  state.craftingCup = {
    hasCupOnTable: false,
    size: null,
    tea: null,
    sugar: '50%',
    ice: '0%',
    toppings: new Set(),
    shaken: false,
    sealed: false,
    customName: 'TRÀ SỮA PHÉP THUẬT'
  };
  document.querySelectorAll('.cup-take-btn').forEach(b => b.classList.remove('selected'));
  updateVisualCup();
}

// Xử lý giao nước
function deliverCraftedCup() {
  const cup = state.craftingCup;
  if (!cup.hasCupOnTable) { showToast('Chưa có ly nào trên quầy để giao!'); return; }
  if (!cup.sealed) { showToast('Hãy gạt cần dập nắp miệng ly trước khi giao cho khách nhé!'); return; }
  if (state.pendingOrders.length === 0) { showToast('Không có đơn hàng nào đang chờ!'); return; }

  const order = state.pendingOrders[state.activeOrderIndex];
  if (!order) return;

  // So sánh công thức
  let score = 100;
  if (cup.tea !== order.tea) score -= 35;
  if (cup.size !== order.size) score -= 15;
  if (cup.sugar !== order.sugar) score -= 10;
  if (cup.ice !== order.ice) score -= 10;

  let earning = order.price;
  let tip = 0;
  if (score >= 90) {
    tip = Math.floor(Math.random() * 6) + 4; // Tip 4-9 G
  }

  state.galleons += (earning + tip);
  state.cupsSold++;
  state.totalRev += earning;
  state.totalTips += tip;

  sfx.playCash();

  // Thêm review
  const rating = score >= 85 ? 5 : (score >= 60 ? 4 : 3);
  const newRev = {
    author: order.customerName,
    avatar: order.avatar,
    house: order.houseName,
    rating: rating,
    drink: `🧋 ${order.drinkName} (Size ${order.size})`,
    comment: score >= 90
      ? `Trà ngon xuất sắc! Thao tác pha chế rất điêu luyện, đúng ý mình từng hạt trân châu ❤️.`
      : `Uống khá ngon, phục vụ nhanh nhẹn.`,
    tip: tip,
    time: 'Vừa xong',
    isHogwartsStudent: !!order.isPlayerOrder
  };
  state.reviews.unshift(newRev);
  state.reviewsCount = state.reviews.length;
  try {
    localStorage.setItem('hpvn_boba_reviews', JSON.stringify(state.reviews));
  } catch (e) {}

  showToast(`🎉 Giao thành công cho ${order.customerName}! Nhận +${earning} G ${tip > 0 ? `(+${tip} G Tip)` : ''}!`);

  // Bắn thông điệp ra ngoài SkyOffice nếu đang nhúng trong iframe
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'BOBA_DRINK_SERVED',
        drinkName: order.drinkName,
        customerName: order.customerName,
        earning: earning,
        tip: tip,
        score: score,
        isPlayerOrder: !!order.isPlayerOrder,
        totalGalleons: state.galleons
      }, '*');
    }
  } catch (err) {
    console.warn('postMessage error:', err);
  }

  state.pendingOrders.splice(state.activeOrderIndex, 1);
  state.activeOrderIndex = 0;

  resetCraftingCup();
  renderOrderQueue();
  renderReviews();
  updateHeaderStats();
}

function spawnCustomerOrder() {
  const npcs = [
    { name: 'Neville Longbottom', avatar: '🌱', house: 'huff', houseName: 'Hufflepuff', drinkName: 'Trà Kim Hufflepuff', tea: 'hufflepuff', quote: 'Cho mình nhiều vị mật ong ngọt ấm nhé!' },
    { name: 'Ginny Weasley', avatar: '🦁', house: 'gryf', houseName: 'Gryffindor', drinkName: 'Hồng Trà Gryffindor', tea: 'gryffindor', quote: 'Pha nhanh giúp mình nha, sắp có trận tập Quidditch rồi.' },
    { name: 'Cho Chang', avatar: '🦅', house: 'raven', houseName: 'Ravenclaw', drinkName: 'Trà Lam Ravenclaw', tea: 'ravenclaw', quote: 'Ít đường nhiều đá giúp mình nhé bạn Barista!' },
    { name: 'Pansy Parkinson', avatar: '🎀', house: 'slyth', houseName: 'Slytherin', drinkName: 'Lục Trà Slytherin', tea: 'slytherin', quote: 'Thêm thạch trăng rằm và kem cheese đậm vị.' },
    // KHÁCH YÊU CẦU QUÁ ĐÁNG / THÁI ĐỘ HÁCH DỊCH / PHÁ PHÁCH:
    { name: 'Draco Malfoy', avatar: '🐍', house: 'slyth', houseName: 'Slytherin', drinkName: 'Lục Trà Slytherin', tea: 'slytherin', quote: 'Đòi không đường nhưng phải ngọt lịm! Nhanh lên không thiếu gia mách ba tao đóng cửa tiệm!', isUnreasonable: true, demandType: 'hach_dich' },
    { name: 'Peeves Con Ma', avatar: '👻', house: 'huff', houseName: 'Hogwarts', drinkName: 'Trà Sữa Ma Quái', tea: 'hufflepuff', quote: 'Lấy cho ta 1 ly trà thả đầy bùn và ốc sên, không thì ta ném phấn vào đầu!', isUnreasonable: true, demandType: 'pha_phach' },
    { name: 'Rita Skeeter', avatar: '🪲', house: 'raven', houseName: 'Nhật Báo', drinkName: 'Trà Lam Ravenclaw', tea: 'ravenclaw', quote: 'Pha trà kèm tin đồn mật, và dĩ nhiên ta là phóng viên nổi tiếng nên phải MIỄN PHÍ!', isUnreasonable: true, demandType: 'uong_chua' },
    { name: 'Gilderoy Lockhart', avatar: '✨', house: 'raven', houseName: 'Ravenclaw', drinkName: 'Trà Sữa Nụ Cười Vàng', tea: 'ravenclaw', quote: 'Ta trả tiền bằng chữ ký và nụ cười quyến rũ được giải tuần san Phù Thủy nhé!', isUnreasonable: true, demandType: 'uong_chua' },
    { name: 'Bà Pince Thủ Thư', avatar: '📚', house: 'gryf', houseName: 'Thư Viện', drinkName: 'Hồng Trà Gryffindor', tea: 'gryffindor', quote: 'Uống trà cấm phát ra tiếng rột rột, cấm nhai trân châu lóp bóp làm ồn!', isUnreasonable: true, demandType: 'kho_tinh' }
  ];

  const randomNpc = npcs[Math.floor(Math.random() * npcs.length)];
  const sizes = ['M', 'L'];
  const sugars = ['30%', '50%', '70%'];
  const ices = ['0%', '50%', '100%'];
  const topsPool = ['boba_gold', 'boba_star', 'jelly_moon', 'cheese_foam'];

  const order = {
    id: `ORD-${Math.floor(Math.random() * 800) + 200}`,
    customerName: randomNpc.name,
    avatar: randomNpc.avatar,
    house: randomNpc.house,
    houseName: randomNpc.houseName,
    drinkName: randomNpc.drinkName,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    tea: randomNpc.tea,
    sugar: sugars[Math.floor(Math.random() * sugars.length)],
    ice: ices[Math.floor(Math.random() * ices.length)],
    toppings: [topsPool[Math.floor(Math.random() * topsPool.length)]],
    quote: randomNpc.quote,
    price: 26,
    patience: 100,
    isUnreasonable: !!randomNpc.isUnreasonable,
    demandType: randomNpc.demandType || 'normal'
  };

  state.pendingOrders.push(order);
  renderOrderQueue();
  updateHeaderStats();
}

// --- 5. LOGIC PHÒNG SÁNG CHẾ & LẬP MENU (MENU LAB & PRICING) ---

let rBaseTea = 'gryffindor';
let rMilkBlend = 'fresh_milk';
let rStampIcon = '🧋';

function initMenuLabControls() {
  // Chọn cốt trà nền
  document.querySelectorAll('#baseTeaSelector .chip-select').forEach(chip => {
    chip.addEventListener('click', function() {
      sfx.playIceClink();
      document.querySelectorAll('#baseTeaSelector .chip-select').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      rBaseTea = this.dataset.val;
      recalculateDrinkCost();
    });
  });

  // Chọn loại sữa
  document.querySelectorAll('#milkBlendSelector .chip-select').forEach(chip => {
    chip.addEventListener('click', function() {
      sfx.playIceClink();
      document.querySelectorAll('#milkBlendSelector .chip-select').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      rMilkBlend = this.dataset.val;
      recalculateDrinkCost();
    });
  });

  // Topping checkbox
  document.querySelectorAll('.toppings-checkboxes-grid input').forEach(input => {
    input.addEventListener('change', recalculateDrinkCost);
  });

  // Chọn icon tem
  document.querySelectorAll('#stampIconPicker .icon-pick-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      sfx.playIceClink();
      document.querySelectorAll('#stampIconPicker .icon-pick-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      rStampIcon = this.dataset.icon;
    });
  });

  // Slider định giá bán
  const slider = document.getElementById('sellingPriceSlider');
  slider.addEventListener('input', function() {
    const price = parseInt(this.value, 10);
    document.getElementById('displaySellingPrice').textContent = `${price} G`;
    updatePricingSentiment(price);
  });

  // Lưu món mới vào Menu
  document.getElementById('btnSaveNewRecipe').addEventListener('click', saveNewMenuRecipe);

  recalculateDrinkCost();
  renderActiveMenuTable();
}

function recalculateDrinkCost() {
  let cost = 8; // Cốt trà cơ bản
  if (rMilkBlend === 'condensed' || rMilkBlend === 'caramel') cost += 4;
  else cost += 3;

  document.querySelectorAll('.toppings-checkboxes-grid input:checked').forEach(() => {
    cost += 2;
  });

  document.getElementById('calcDrinkCost').textContent = `${cost} Galleons`;
  updatePricingSentiment(parseInt(document.getElementById('sellingPriceSlider').value, 10));
  return cost;
}

function updatePricingSentiment(sellingPrice) {
  const cost = parseInt(document.getElementById('calcDrinkCost').textContent, 10) || 14;
  const sentimentEl = document.getElementById('pricingSentimentText');
  const margin = sellingPrice - cost;

  if (margin < 4) {
    sentimentEl.innerHTML = `🟢 <em>Mức giá hạt dẻ:</em> Khách học sinh sẽ mua rất đông, nhưng lợi nhuận quán thu về hơi mỏng.`;
  } else if (margin <= 14) {
    sentimentEl.innerHTML = `😊 <em>Mức giá vàng (Hoàn hảo):</em> Tỉ lệ doanh thu và sự hài lòng của khách đạt đỉnh cao 5 sao!`;
  } else {
    sentimentEl.innerHTML = `⚠️ <em>Giá hơi đắt:</em> Khách hàng sẽ ngập ngừng khi nhìn giá, trừ khi đây là món trà thượng hạng!`;
  }
}

function saveNewMenuRecipe() {
  const drinkName = document.getElementById('customDrinkName').value.trim() || 'Trà Sữa Sáng Chế Mới';
  const price = parseInt(document.getElementById('sellingPriceSlider').value, 10) || 25;
  const cost = parseInt(document.getElementById('calcDrinkCost').textContent, 10) || 14;

  const checkedTops = [];
  document.querySelectorAll('.toppings-checkboxes-grid input:checked').forEach(c => checkedTops.push(c.value));

  const newDish = {
    id: `m_${Date.now()}`,
    name: `${rStampIcon} ${drinkName}`,
    baseTea: rBaseTea,
    milkBlend: rMilkBlend,
    toppings: checkedTops,
    icon: rStampIcon,
    cost: cost,
    price: price,
    active: true
  };

  state.menu.push(newDish);
  sfx.playCash();
  renderActiveMenuTable();
  updateHeaderStats();
  showToast(`✨ Đã thêm "${drinkName}" vào Bảng Menu chính thức của quán!`);
}

function renderActiveMenuTable() {
  const container = document.getElementById('menuItemsTableContainer');
  container.innerHTML = '';

  state.menu.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'menu-dish-row';
    row.innerHTML = `
      <div class="menu-dish-icon">${item.icon}</div>
      <div class="menu-dish-meta">
        <span class="menu-dish-name">${item.name}</span>
        <span class="menu-dish-cost">Giá vốn: ${item.cost} G · Lãi: +${item.price - item.cost} G</span>
      </div>
      <span class="menu-dish-price">${item.price} G</span>
      <button class="toggle-serve-btn ${item.active ? 'on' : ''}" data-idx="${idx}">
        ${item.active ? 'Đang Bán' : 'Tắt'}
      </button>
    `;

    row.querySelector('.toggle-serve-btn').addEventListener('click', function() {
      sfx.playIceClink();
      item.active = !item.active;
      renderActiveMenuTable();
      updateHeaderStats();
      showToast(`${item.active ? 'Đã bật' : 'Đã tạm ngưng'} món "${item.name}" trên Menu!`);
    });

    container.appendChild(row);
  });
}

// --- 6. LOGIC BẾP NẤU NGUYÊN LIỆU (KITCHEN BATCH COOKING) ---

function initKitchenControls() {
  // 1. Luộc trân châu
  document.getElementById('btnCookBobaGold').addEventListener('click', function() {
    if (state.galleons < 15) { showToast('Cần 15 Galleons tiền mua hạt trân châu thô!'); return; }
    state.galleons -= 15;
    updateHeaderStats();
    sfx.playBoil();

    const pot = document.querySelector('.boba-pot-visual');
    const status = document.getElementById('potStatus1');
    pot.classList.add('cooking');
    status.textContent = '🔥 Đang sôi ùng ục & ngào đường đen... (3s)';

    setTimeout(() => {
      pot.classList.remove('cooking');
      status.textContent = '✅ Đã nấu chín! Thu được +25 phần trân châu dẻo thơm!';
      state.pantry.boba_gold += 25;
      updateHeaderStats();
      sfx.playCash();
      showToast('🫕 Trân Châu Hoàng Kim đã chín mềm óng ả! (+25 phần vào kho)');
    }, 3000);
  });

  // 2. Ủ mẻ cốt trà
  document.getElementById('btnBrewTeaBatch').addEventListener('click', function() {
    if (state.galleons < 12) { showToast('Cần 12 Galleons để nhập lá trà phương Đông!'); return; }
    state.galleons -= 12;
    updateHeaderStats();
    sfx.playBoil();

    const pot = document.querySelector('.tea-pot-visual');
    const status = document.getElementById('potStatus2');
    pot.classList.add('cooking');
    status.textContent = '🌿 Đang ủ chiết xuất hương vị trà... (3s)';

    setTimeout(() => {
      pot.classList.remove('cooking');
      status.textContent = '✅ Cốt trà thơm lừng! Thu được +15 ly mỗi Nhà!';
      state.pantry.tea_gryffindor += 15;
      state.pantry.tea_slytherin += 15;
      state.pantry.tea_ravenclaw += 15;
      state.pantry.tea_hufflepuff += 15;
      updateHeaderStats();
      sfx.playCash();
      showToast('🍵 4 Bình Ủ Trà đã được nạp đầy cốt trà đậm đà!');
    }, 3000);
  });

  // 3. Đánh kem cheese
  document.getElementById('btnWhipFoamBatch').addEventListener('click', function() {
    if (state.galleons < 14) { showToast('Cần 14 Galleons để mua phô mai kem xốp!'); return; }
    state.galleons -= 14;
    updateHeaderStats();
    sfx.playShaker();

    const pot = document.querySelector('.foam-pot-visual');
    const status = document.getElementById('potStatus3');
    pot.classList.add('cooking');
    status.textContent = '🍦 Đang đánh bông phô mai kem xốp... (2s)';

    setTimeout(() => {
      pot.classList.remove('cooking');
      status.textContent = '✅ Kem cheese tuyết bông mịn màng! (+20 phần)';
      state.pantry.cheese_foam += 20;
      updateHeaderStats();
      sfx.playCash();
      showToast('🍦 Đã đánh xong 1 mẻ Kem Cheese Tuyết thơm béo ngậy! (+20 phần)');
    }, 2000);
  });
}

// --- 7. LOGIC SỔ ĐÁNH GIÁ & NÂNG CẤP ---

let currentReviewFilter = 'all';

function renderReviews(filter = currentReviewFilter) {
  currentReviewFilter = filter;
  const container = document.getElementById('reviewsFeedList');
  if (!container) return;
  container.innerHTML = '';

  let filtered = state.reviews;
  if (filter === 'student') {
    filtered = state.reviews.filter(r => r.isHogwartsStudent || r.avatar === '🧙‍♂️');
  } else if (filter === '5') {
    filtered = state.reviews.filter(r => r.rating === 5);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 10px; color: var(--ink-soft); font-size: 0.85rem;">
        <span>Chưa có nhận xét nào trong mục này.</span><br>
        <small>Hãy là người đầu tiên viết cảm nhận nhé! ✍️</small>
      </div>
    `;
    return;
  }

  filtered.forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-item-card';
    card.innerHTML = `
      <div class="review-author-avatar">${r.avatar}</div>
      <div class="review-content-col">
        <div class="review-top-meta">
          <span class="review-author-name">
            ${r.author}
            ${(r.isHogwartsStudent || r.avatar === '🧙‍♂️') ? '<span class="student-badge">👑 Học Viên Hogwarts</span>' : ''}
          </span>
          <span class="review-rating-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        </div>
        <span class="review-drink-tag">${r.drink} · <em>${r.time}</em></span>
        <p class="review-text-body">"${r.comment}"</p>
        ${r.tip > 0 ? `<span class="review-tip-tag">🪙 Đã tip thêm: +${r.tip} Galleons</span>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderUpgrades() {
  const container = document.getElementById('upgradesList');
  if (!container) return;
  container.innerHTML = '';

  state.upgrades.forEach((up, idx) => {
    const row = document.createElement('div');
    row.className = 'upgrade-row';
    row.innerHTML = `
      <span class="upgrade-icon">${up.icon}</span>
      <div class="upgrade-info">
        <strong>${up.title}</strong>
        <small>${up.desc}</small>
      </div>
      <button class="upgrade-btn ${up.unlocked ? 'unlocked' : ''}" data-idx="${idx}">
        ${up.unlocked ? 'Đã Mở' : `${up.cost} G`}
      </button>
    `;

    const btn = row.querySelector('.upgrade-btn');
    if (!up.unlocked) {
      btn.addEventListener('click', () => {
        if (state.galleons < up.cost) {
          showToast(`Bạn cần có đủ ${up.cost} Galleons để nâng cấp!`);
          return;
        }
        sfx.playCash();
        state.galleons -= up.cost;
        up.unlocked = true;
        renderUpgrades();
        updateHeaderStats();
        showToast(`🎉 Đã mở khóa: "${up.title}"!`);
      });
    }

    container.appendChild(row);
  });
}

// --- 7b. FORM VIẾT NHẬN XÉT CỦA NHÂN VẬT VÀO SỔ LƯU NIỆM ---
let currentCharRating = 5;
let currentCharTip = 0;

function populateReviewDrinkSelect() {
  const select = document.getElementById('charReviewDrinkSelect');
  if (!select) return;
  select.innerHTML = '';
  state.menu.filter(m => m.active).forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.name;
    opt.textContent = `${item.name} (${item.price} G)`;
    select.appendChild(opt);
  });
}

function initCharacterReviewControls() {
  const nameEl = document.getElementById('charReviewName');
  const houseEl = document.getElementById('charReviewHouse');
  if (nameEl) nameEl.textContent = state.baristaName;
  if (houseEl) houseEl.textContent = state.playerHouse.toUpperCase();

  populateReviewDrinkSelect();

  // Chấm sao tương tác
  const starBtns = document.querySelectorAll('#starPicker .star-btn');
  const starStatus = document.getElementById('starStatusText');

  const ratingTexts = {
    1: '1 / 5 sao (Chưa đạt chuẩn! 😢)',
    2: '2 / 5 sao (Hơi nhạt hoặc ngọt quá! 😕)',
    3: '3 / 5 sao (Khá ổn, uống được! 👍)',
    4: '4 / 5 sao (Rất ngon & hài lòng! 😊)',
    5: '5 / 5 sao (Tuyệt đỉnh xuất sắc! 🌟)'
  };

  function updateStarUI(val) {
    currentCharRating = val;
    starBtns.forEach(btn => {
      const bVal = parseInt(btn.dataset.rating, 10);
      btn.classList.toggle('active', bVal <= val);
    });
    if (starStatus) starStatus.textContent = ratingTexts[val] || `${val} sao`;
  }

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playIceClink();
      const val = parseInt(btn.dataset.rating, 10);
      updateStarUI(val);
    });
  });

  // Gợi ý nhanh
  document.querySelectorAll('.quick-rev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playCupPlace();
      const textarea = document.getElementById('charReviewInput');
      if (textarea) {
        textarea.value = btn.dataset.text;
        textarea.focus();
      }
    });
  });

  // Chọn tip
  const tipChips = document.querySelectorAll('#charTipChips .tip-chip');
  tipChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sfx.playCupPlace();
      tipChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCharTip = parseInt(chip.dataset.tip, 10) || 0;
    });
  });

  // Nút gửi nhận xét
  const submitBtn = document.getElementById('btnSubmitCharReview');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const inputEl = document.getElementById('charReviewInput');
      const comment = (inputEl ? inputEl.value.trim() : '') || 'Trà sữa hương vị rất thơm ngon, không gian ấm cúng 5 sao! 🧋✨';
      const drinkSelect = document.getElementById('charReviewDrinkSelect');
      const selectedDrink = drinkSelect ? drinkSelect.value : (state.menu[0]?.name || 'Trà Sữa Phép Thuật');

      const newReview = {
        author: state.baristaName,
        avatar: '🧙‍♂️',
        house: state.playerHouse.toUpperCase(),
        rating: currentCharRating,
        drink: `🧋 ${selectedDrink}`,
        comment: comment,
        tip: currentCharTip,
        time: 'Vừa xong',
        isHogwartsStudent: true
      };

      state.reviews.unshift(newReview);
      state.reviewsCount = state.reviews.length;
      if (currentCharTip > 0) {
        state.totalTips += currentCharTip;
        state.galleons += currentCharTip;
      }

      // Cập nhật rating trung bình
      const sum = state.reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
      state.reputation = Math.round((sum / state.reviews.length) * 10) / 10;

      // Lưu bền vững vào localStorage
      try {
        localStorage.setItem('hpvn_boba_reviews', JSON.stringify(state.reviews));
      } catch (e) {
        console.warn('Failed to save reviews', e);
      }

      sfx.playCash();
      if (inputEl) inputEl.value = '';
      updateStarUI(5);

      renderReviews();
      updateHeaderStats();
      showToast(`🌟 Cảm ơn ${state.baristaName} đã gửi nhận xét vào Sổ Lưu Niệm!`);

      // Bắn postMessage sang SkyOffice
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'BOBA_REVIEW_SUBMITTED',
            author: state.baristaName,
            house: state.playerHouse,
            rating: currentCharRating,
            drink: selectedDrink,
            comment: comment,
            tip: currentCharTip
          }, '*');
        }
      } catch (err) {
        console.warn('postMessage error:', err);
      }
    });
  }

  // Bộ lọc review
  const filterChips = document.querySelectorAll('.filter-stars .star-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sfx.playIceClink();
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderReviews(chip.dataset.filter || 'all');
    });
  });
}

// --- 7c. LOGIC ĐẶT MÓN CHO NHÂN VẬT (PLAYER ORDER CONTROLS) ---
let orderSelectedDrink = null;
let orderSelectedSize = 'M';
let orderSelectedSugar = '50%';
let orderSelectedIce = '50%';

function renderModalMenuChoices() {
  const container = document.getElementById('modalMenuChoiceGrid');
  if (!container) return;
  container.innerHTML = '';

  const activeMenu = state.menu.filter(m => m.active);
  if (activeMenu.length === 0) {
    container.innerHTML = '<span style="font-size:0.8rem; color:#888;">Quán đang tạm đóng Menu!</span>';
    return;
  }

  if (!orderSelectedDrink || !activeMenu.find(m => m.id === orderSelectedDrink.id)) {
    orderSelectedDrink = activeMenu[0];
  }

  activeMenu.forEach(item => {
    const card = document.createElement('div');
    card.className = `menu-choice-card ${orderSelectedDrink?.id === item.id ? 'active' : ''}`;
    card.innerHTML = `
      <span class="choice-icon">${item.icon}</span>
      <span class="choice-name">${item.name}</span>
      <span class="choice-price">${item.price} G</span>
    `;

    card.addEventListener('click', () => {
      sfx.playCupPlace();
      orderSelectedDrink = item;
      renderModalMenuChoices();
      updateModalOrderPrice();
    });

    container.appendChild(card);
  });
}

function updateModalOrderPrice() {
  if (!orderSelectedDrink) return;
  let price = orderSelectedDrink.price;
  if (orderSelectedSize === 'L') price += 3;

  const checkedTops = document.querySelectorAll('#orderToppingsGrid input:checked');
  price += checkedTops.length * 2;

  const priceEl = document.getElementById('modalOrderTotalPrice');
  if (priceEl) priceEl.textContent = `${price} Galleons`;
}

function initPlayerOrderControls() {
  const bannerName = document.getElementById('bannerPlayerName');
  if (bannerName) bannerName.textContent = `${state.baristaName}, bạn muốn uống gì?`;

  const modalCustName = document.getElementById('orderCustomerName');
  const modalCustHouse = document.getElementById('orderCustomerHouse');
  if (modalCustName) modalCustName.textContent = state.baristaName;
  if (modalCustHouse) modalCustHouse.textContent = state.playerHouse.toUpperCase();

  const modal = document.getElementById('playerOrderModal');

  function openOrderModal() {
    sfx.playIceClink();
    renderModalMenuChoices();
    updateModalOrderPrice();
    if (modal) modal.style.display = 'flex';
  }

  function closeOrderModal() {
    sfx.playCupPlace();
    if (modal) modal.style.display = 'none';
  }

  const btnOpen = document.getElementById('btnOpenPlayerOrderModal');
  const bannerOpen = document.getElementById('bannerOpenPlayerOrder');
  if (btnOpen) btnOpen.addEventListener('click', openOrderModal);
  if (bannerOpen) bannerOpen.addEventListener('click', openOrderModal);

  const btnClose = document.getElementById('btnCloseOrderModal');
  const btnCancel = document.getElementById('btnCancelOrderModal');
  if (btnClose) btnClose.addEventListener('click', closeOrderModal);
  if (btnCancel) btnCancel.addEventListener('click', closeOrderModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeOrderModal();
    });
  }

  // Chọn size
  document.querySelectorAll('#orderSizeOptions .opt-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      sfx.playCupPlace();
      document.querySelectorAll('#orderSizeOptions .opt-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      orderSelectedSize = this.dataset.size;
      updateModalOrderPrice();
    });
  });

  // Chọn đường
  document.querySelectorAll('#orderSugarOptions .opt-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      sfx.playPump();
      document.querySelectorAll('#orderSugarOptions .opt-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      orderSelectedSugar = this.dataset.val;
    });
  });

  // Chọn đá
  document.querySelectorAll('#orderIceOptions .opt-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      sfx.playIceClink();
      document.querySelectorAll('#orderIceOptions .opt-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      orderSelectedIce = this.dataset.val;
    });
  });

  // Topping checkbox
  document.querySelectorAll('#orderToppingsGrid input').forEach(input => {
    input.addEventListener('change', () => {
      sfx.playScoop();
      updateModalOrderPrice();
    });
  });

  // Ghi chú nhanh
  document.querySelectorAll('.quick-note-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      sfx.playCupPlace();
      const input = document.getElementById('orderCustomNote');
      if (input) {
        input.value = this.dataset.note;
        input.focus();
      }
    });
  });

  // Xác nhận gọi món
  const btnConfirm = document.getElementById('btnConfirmPlaceOrder');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (!orderSelectedDrink) {
        showToast('Vui lòng chọn 1 món thức uống trong Menu!');
        return;
      }

      let price = orderSelectedDrink.price;
      if (orderSelectedSize === 'L') price += 3;
      const checkedTops = [];
      document.querySelectorAll('#orderToppingsGrid input:checked').forEach(c => checkedTops.push(c.value));
      price += checkedTops.length * 2;

      const noteInput = document.getElementById('orderCustomNote');
      const note = (noteInput ? noteInput.value.trim() : '') || 'Cho mình trân châu dẻo thơm và pha thật ngon nhé!';

      const newOrder = {
        id: `ORD-VIP-${Date.now().toString().slice(-4)}`,
        customerName: state.baristaName,
        avatar: '🧙‍♂️',
        house: state.playerHouse.slice(0, 4),
        houseName: state.playerHouse.toUpperCase(),
        drinkName: orderSelectedDrink.name,
        size: orderSelectedSize,
        tea: orderSelectedDrink.baseTea,
        sugar: orderSelectedSugar,
        ice: orderSelectedIce,
        toppings: checkedTops,
        quote: note,
        price: price,
        patience: 100,
        isPlayerOrder: true
      };

      state.pendingOrders.unshift(newOrder);
      state.activeOrderIndex = 0;

      sfx.playCash();
      closeOrderModal();
      renderOrderQueue();
      updateHeaderStats();
      showToast(`🛎️ Đã đưa vé order của ${state.baristaName} lên Quầy Pha Chế!`);

      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'BOBA_ORDER_PLACED',
            customerName: state.baristaName,
            house: state.playerHouse,
            drinkName: orderSelectedDrink.name,
            size: orderSelectedSize,
            sugar: orderSelectedSugar,
            ice: orderSelectedIce,
            toppings: checkedTops,
            note: note,
            price: price
          }, '*');
        }
      } catch (err) {
        console.warn('postMessage error:', err);
      }
    });
  }
}

// --- 7d. LOGIC ĐUỔI KHÁCH & TỪ CHỐI PHỤC VỤ (EXPEL CUSTOMER CONTROLS) ---
let targetCustomerIndexToKick = -1;

function openKickCustomerModal(idx) {
  try {
    sfx.playWhoosh();
    const order = state.pendingOrders[idx];
    if (!order) return;

    targetCustomerIndexToKick = idx;
    const modal = document.getElementById('kickCustomerModal');
    if (!modal) return;

    const avatarEl = document.getElementById('kickTargetAvatar');
    if (avatarEl) avatarEl.textContent = order.avatar || '🧙‍♂️';

    const nameEl = document.getElementById('kickTargetName');
    if (nameEl) nameEl.textContent = order.customerName;

    const houseEl = document.getElementById('kickTargetHouse');
    if (houseEl) {
      const houseStr = (order.houseName || 'HOGWARTS').toUpperCase();
      houseEl.textContent = houseStr;
      houseEl.className = `target-house-badge ${houseStr}`;
    }

    const drinkEl = document.getElementById('kickTargetDrink');
    if (drinkEl) drinkEl.textContent = `🧋 Đang gọi: ${order.drinkName} (Size ${order.size})`;

    const quoteEl = document.getElementById('kickTargetQuote');
    if (quoteEl) quoteEl.textContent = `"${order.quote}"`;

    // Tùy theo loại yêu cầu, chọn sẵn lý do phù hợp
    const pills = document.querySelectorAll('#kickReasonsList .kick-reason-pill');
    pills.forEach(p => p.classList.remove('active'));

    const radios = document.querySelectorAll('input[name="kickReason"]');
    let matchedRadio = null;

    if (radios.length > 0) {
      if (order.demandType === 'pha_phach') {
        matchedRadio = Array.from(radios).find(r => r.value.includes('quấy rối'));
      } else if (order.demandType === 'uong_chua') {
        matchedRadio = Array.from(radios).find(r => r.value.includes('Mặc cả'));
      } else if (order.demandType === 'hach_dich') {
        matchedRadio = Array.from(radios).find(r => r.value.includes('hách dịch'));
      }

      if (!matchedRadio) {
        matchedRadio = radios[0];
      }

      if (matchedRadio) {
        matchedRadio.checked = true;
        const parentPill = matchedRadio.closest('.kick-reason-pill');
        if (parentPill) parentPill.classList.add('active');
      }
    }

    modal.style.display = 'flex';
  } catch (err) {
    console.error('Error opening kick customer modal:', err);
  }
}

function closeKickCustomerModal() {
  sfx.playCupPlace();
  const modal = document.getElementById('kickCustomerModal');
  if (modal) modal.style.display = 'none';
  targetCustomerIndexToKick = -1;
}

function initKickCustomerControls() {
  const modal = document.getElementById('kickCustomerModal');
  const btnClose = document.getElementById('btnCloseKickModal');
  const btnCancel = document.getElementById('btnCancelKickModal');
  const btnConfirm = document.getElementById('btnConfirmKickCustomer');
  const btnKickActive = document.getElementById('btnKickActiveCustomer');

  if (btnKickActive) {
    btnKickActive.addEventListener('click', () => {
      if (state.pendingOrders.length === 0 || state.activeOrderIndex < 0) {
        showToast('Không có đơn nào đang chọn để từ chối!');
        return;
      }
      openKickCustomerModal(state.activeOrderIndex);
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeKickCustomerModal);
  if (btnCancel) btnCancel.addEventListener('click', closeKickCustomerModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeKickCustomerModal();
    });
  }

  // Chuyển radio reason pills
  const reasonPills = document.querySelectorAll('#kickReasonsList .kick-reason-pill');
  reasonPills.forEach(pill => {
    pill.addEventListener('click', () => {
      reasonPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const radio = pill.querySelector('input');
      if (radio) radio.checked = true;
    });
  });

  // Chọn câu khẩu hiệu tống tiễn
  const shoutBtns = document.querySelectorAll('#quickExpelShouts .expel-shout-btn');
  const shoutInput = document.getElementById('kickCustomShout');
  shoutBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      sfx.playCupPlace();
      shoutBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (shoutInput) shoutInput.value = this.dataset.shout;
    });
  });

  // Xác nhận đuổi khách
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (targetCustomerIndexToKick < 0 || targetCustomerIndexToKick >= state.pendingOrders.length) {
        closeKickCustomerModal();
        return;
      }

      const targetOrder = state.pendingOrders[targetCustomerIndexToKick];
      const selectedRadio = document.querySelector('input[name="kickReason"]:checked');
      const reason = selectedRadio ? selectedRadio.value : 'Yêu cầu quá vô lý!';
      const shout = (shoutInput ? shoutInput.value.trim() : '') || 'Tiệm Trà Nhỏ xin phép từ chối phục vụ!';

      // Âm thanh bùa chú quét đuổi khách
      sfx.playWhoosh();

      // Nếu đang pha ly này trên bàn, dọn ly
      if (state.activeOrderIndex === targetCustomerIndexToKick) {
        resetCraftingCup();
      }

      // Xóa khách khỏi danh sách chờ
      state.pendingOrders.splice(targetCustomerIndexToKick, 1);
      if (state.activeOrderIndex >= state.pendingOrders.length) {
        state.activeOrderIndex = Math.max(0, state.pendingOrders.length - 1);
      }

      closeKickCustomerModal();
      renderOrderQueue();
      updateHeaderStats();

      // Phản ứng cay cú hài hước của khách bị đuổi
      let customerComeback = 'Hừ! Quán này chảnh quá, ta không bao giờ thèm quay lại!';
      if (targetOrder.customerName.includes('Draco')) {
        customerComeback = 'Draco Malfoy: "Mày dám đuổi tao?! Ba tao sẽ nghe về chuyện này, tiệm mày sẽ bị đóng cửa!" 🐍💨';
      } else if (targetOrder.customerName.includes('Peeves')) {
        customerComeback = 'Peeves: "Ái chà chà! Bị chổi ma thuật quét bay rồi, lêu lêu quán bủn xỉn!" 👻💨';
      } else if (targetOrder.customerName.includes('Rita')) {
        customerComeback = 'Rita Skeeter: "Các người sẽ hối hận vì dám từ chối nhà báo nổi tiếng của Nhật Báo Tiên Tri!" 🪲📰';
      } else if (targetOrder.customerName.includes('Lockhart')) {
        customerComeback = 'Gilderoy Lockhart: "Thật đáng tiếc cho các bạn vì bỏ lỡ cơ hội nhận chữ ký vàng của ta!" ✨📸';
      }

      showToast(`🧹 Đã từ chối phục vụ và tống tiễn ${targetOrder.customerName}! (${customerComeback})`);

      // Khách xung quanh và học sinh Hogwarts gửi lời khen ủng hộ quán vào Sổ Lưu Niệm
      const supportReview = {
        author: 'Khách Hàng Văn Minh',
        avatar: '🧙‍♂️',
        house: 'HOGWARTS',
        rating: 5,
        drink: `Ủng hộ tẩy chay yêu cầu quá đáng!`,
        comment: `Rất khâm phục bản lĩnh của Barista khi dũng cảm đuổi ${targetOrder.customerName}! Giữ không gian văn minh, ấm cúng cho mọi người. 👏✨`,
        tip: 5,
        time: 'Vừa xong',
        isHogwartsStudent: true
      };
      state.reviews.unshift(supportReview);
      state.reviewsCount = state.reviews.length;
      state.totalTips += 5;
      state.galleons += 5;
      try {
        localStorage.setItem('hpvn_boba_reviews', JSON.stringify(state.reviews));
      } catch (e) {}

      renderReviews();
      updateHeaderStats();

      // Bắn sự kiện sang SkyOffice qua postMessage
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'BOBA_CUSTOMER_EXPELLED',
            customerName: targetOrder.customerName,
            reason: reason,
            quote: targetOrder.quote,
            shout: shout
          }, '*');
        }
      } catch (err) {
        console.warn('postMessage error:', err);
      }
    });
  }
}

// --- 8. KHỞI TẠO TỔNG THỂ ---
window.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTactileCounterControls();
  initMenuLabControls();
  initKitchenControls();
  initCharacterReviewControls();
  initPlayerOrderControls();
  initKickCustomerControls();

  renderOrderQueue();
  updateVisualCup();
  renderReviews();
  renderUpgrades();
  updateHeaderStats();

  // Khách giảm kiên nhẫn
  setInterval(() => {
    state.pendingOrders.forEach(order => {
      if (order.patience > 5) order.patience -= 1;
    });
    const fills = document.querySelectorAll('.patience-fill');
    fills.forEach((fill, idx) => {
      const order = state.pendingOrders[idx];
      if (order) fill.style.width = `${order.patience}%`;
    });
  }, 1000);
});

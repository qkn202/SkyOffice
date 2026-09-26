// =========================================================
// TIỆM TRÀ NHỎ HOGSMEADE - QUÁN TRÀ SỮA PHÉP THUẬT 2 CHIỀU
// JavaScript Engine: 2-Way Roleplay (Barista & Customer)
// =========================================================

// --- 1. HỆ THỐNG ÂM THANH TỔNG HỢP (WEB AUDIO API SYNTHESIZER) ---
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

  // Tiếng chuông leng keng quầy trà
  playBell() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.6);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Tiếng rót nước trà thơm lừng
  playPour() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(540, now + 0.35);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Tiếng xúc đá viên lách cách
  playIce() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1200, 1600, 2200].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.1);
    });
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
      osc.frequency.setValueAtTime(400 + (i % 2) * 200, now + i * 0.1);
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.08);
    }
  }

  // Tiếng ting ting nhận tiền Galleons
  playCash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  // Tiếng hút rồn rột thưởng thức trà sữa
  playSlurp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.5);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

const sfx = new SoundFx();

// --- 2. TRẠNG THÁI GAME (GAME STATE) ---
const state = {
  galleons: 320,
  reputation: 4.9,
  reviewsCount: 142,
  cupsSold: 168,
  totalRev: 3850,
  totalTips: 420,
  baristaName: 'Bạn (Phù Thủy Barista)',
  
  // Kho nguyên liệu mini
  pantry: {
    gryffindor: 14,
    slytherin: 10,
    ravenclaw: 16,
    hufflepuff: 18,
    golden_boba: 45,
    night_star: 32,
    moon_jelly: 28,
    cheese_foam: 25
  },

  // Danh sách đơn hàng đang xếp hàng
  pendingOrders: [
    {
      id: 'ORD-101',
      customerName: 'Harry Potter',
      avatar: '⚡',
      house: 'gryf',
      houseName: 'Gryffindor',
      size: 'L',
      tea: 'gryffindor',
      teaName: 'Hồng Trà Gryffindor',
      sugar: '50%',
      ice: '50%',
      toppings: ['golden_boba', 'cheese_foam'],
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
      size: 'M',
      tea: 'slytherin',
      teaName: 'Lục Trà Slytherin',
      sugar: '70%',
      ice: '100%',
      toppings: ['night_star'],
      quote: 'Làm nhanh lên, thiếu gia nhà Malfoy không thích chờ đợi!',
      price: 23,
      patience: 85
    },
    {
      id: 'ORD-103',
      customerName: 'Luna Lovegood',
      avatar: '🌸',
      house: 'raven',
      houseName: 'Ravenclaw',
      size: 'L',
      tea: 'ravenclaw',
      teaName: 'Trà Lam Ravenclaw',
      sugar: '30%',
      ice: '0%',
      toppings: ['moon_jelly', 'night_star'],
      quote: 'Mình nghe nói hạt thạch này xua đuổi được Nargles đó...',
      price: 31,
      patience: 95
    }
  ],

  // Đơn hàng đang được chọn để pha chế trên bàn Barista
  activeOrderIndex: 0,

  // Ly trà hiện tại đang pha chế trên bàn Barista
  currentCup: {
    size: 'M',
    tea: null,
    sugar: '50%',
    ice: '50%',
    toppings: new Set(),
    shaken: false,
    sealed: false
  },

  // Đơn hàng của người dùng khi đóng vai Khách Hàng (Customer)
  customerMyOrder: null,

  // Danh sách đánh giá trong Sổ Lưu Niệm
  reviews: [
    {
      author: 'Hermione Granger',
      avatar: '📚',
      rating: 5,
      drink: '🦁 Hồng Trà Gryffindor (Size L)',
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
      comment: 'Màu xanh hoa đậu biếc rất thơ mộng, kem cheese béo thơm mịn màng. Sẽ ghé ủng hộ quán thường xuyên!',
      tip: 8,
      time: '1 giờ trước'
    },
    {
      author: 'Pansy Parkinson',
      avatar: '🎀',
      rating: 4,
      drink: '🐍 Lục Trà Slytherin (Size M)',
      comment: 'Trà the mát rất hợp gu mình, nhưng quán đông quá phải đợi mất hơn 2 phút.',
      tip: 3,
      time: '2 giờ trước'
    }
  ],

  // Nâng cấp tiệm trà
  upgrades: [
    {
      id: 'up_pot',
      title: 'Vạc Đồng Tự Khuấy',
      desc: 'Tự động nấu cốt trà nhanh gấp đôi, không lo thiếu trà.',
      cost: 150,
      unlocked: false,
      icon: '🫕'
    },
    {
      id: 'up_ice',
      title: 'Bùa Băng Hogsmeade',
      desc: 'Giữ đá lạnh suốt 24 giờ, tăng 20% độ the mát của trà.',
      cost: 220,
      unlocked: false,
      icon: '❄️'
    },
    {
      id: 'up_sign',
      title: 'Biển Hiệu Phát Sáng Phép Thuật',
      desc: 'Thu hút thêm 35% lượt khách học sinh ghé thăm tiệm.',
      cost: 300,
      unlocked: false,
      icon: '✨'
    }
  ]
};

// --- 3. ĐỒNG BỘ GIAO DIỆN & TIỆN ÍCH ---

function showToast(message) {
  const toast = document.getElementById('magicToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function updateHeaderStats() {
  document.getElementById('galleonBalance').textContent = state.galleons;
  document.getElementById('storeRating').textContent = state.reputation.toFixed(1);
  document.getElementById('reviewCount').textContent = `(${state.reviewsCount} khách)`;
  document.getElementById('pendingOrdersCount').textContent = state.pendingOrders.length;
  document.getElementById('finTotalCups').textContent = `${state.cupsSold} Ly`;
  document.getElementById('finTotalRev').textContent = `${state.totalRev} G`;
  document.getElementById('finTotalTips').textContent = `${state.totalTips} G`;
}

// Chuyển Tab (Role Switching: Barista / Customer / Reviews)
function initTabs() {
  const tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.playIce();
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      if (targetId === 'barista') {
        document.getElementById('panelBarista').classList.add('active');
      } else if (targetId === 'customer') {
        document.getElementById('panelCustomer').classList.add('active');
      } else if (targetId === 'reviews') {
        document.getElementById('panelReviews').classList.add('active');
      }
    });
  });
}

// Bật tắt âm thanh
document.getElementById('soundToggleBtn').addEventListener('click', function() {
  sfx.enabled = !sfx.enabled;
  this.textContent = sfx.enabled ? '🔊' : '🔇';
  showToast(sfx.enabled ? 'Đã bật âm thanh game' : 'Đã tắt âm thanh');
});

// --- 4. LOGIC GÓC NHÌN 🧑‍🍳 BARISTA ---

// Render hàng đợi đơn hàng
function renderOrderQueue() {
  const container = document.getElementById('orderQueueContainer');
  container.innerHTML = '';

  if (state.pendingOrders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 10px; color: var(--ink-soft); font-size: 0.85rem;">
        <span>🎉 Quán đang hết đơn chờ!</span><br>
        <small>Hãy bấm nút <strong>"+ Khách Mới"</strong> hoặc chuyển sang tab Khách để tự đặt đơn nhé.</small>
      </div>
    `;
    updateActiveTicketDisplay(null);
    return;
  }

  state.pendingOrders.forEach((order, idx) => {
    const card = document.createElement('div');
    card.className = `order-ticket-card ${idx === state.activeOrderIndex ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="ticket-header">
        <span class="cust-avatar">${order.avatar}</span>
        <div>
          <span class="cust-name">${order.customerName}</span>
          <span class="cust-house-tag ${order.house}">${order.houseName}</span>
        </div>
      </div>
      <div class="ticket-drink-title">🧋 ${order.teaName} (Size ${order.size})</div>
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

    card.addEventListener('click', () => {
      sfx.playIce();
      state.activeOrderIndex = idx;
      renderOrderQueue();
      updateActiveTicketDisplay(order);
    });

    container.appendChild(card);
  });

  const activeOrder = state.pendingOrders[state.activeOrderIndex] || null;
  updateActiveTicketDisplay(activeOrder);
}

function updateActiveTicketDisplay(order) {
  const titleEl = document.getElementById('activeTicketTitle');
  const noteEl = document.getElementById('activeTicketNote');

  if (!order) {
    titleEl.textContent = 'Chưa chọn đơn nào. Bấm "+ Khách Mới" để mời khách!';
    noteEl.textContent = 'Lời nhắn của khách: (Trống)';
    return;
  }

  titleEl.innerHTML = `Đang pha cho <strong>${order.customerName}</strong>: ${order.teaName} (Size ${order.size})`;
  noteEl.textContent = `Lời nhắn của khách: "${order.quote}"`;
}

function getToppingName(key) {
  switch (key) {
    case 'golden_boba': return 'Trân Châu Hoàng Kim';
    case 'night_star': return 'Trân Châu Tinh Tú';
    case 'moon_jelly': return 'Thạch Trăng Rằm';
    case 'cheese_foam': return 'Kem Cheese Tuyết';
    default: return key;
  }
}

// Render kho nguyên liệu mini
function renderPantry() {
  const container = document.getElementById('pantryGrid');
  const p = state.pantry;
  container.innerHTML = `
    <div class="pantry-item"><span class="pantry-icon">🦁</span><div><span class="pantry-name">Hồng Trà</span><span class="pantry-qty ${p.gryffindor < 5 ? 'low' : ''}">${p.gryffindor} ly</span></div></div>
    <div class="pantry-item"><span class="pantry-icon">🐍</span><div><span class="pantry-name">Lục Trà</span><span class="pantry-qty ${p.slytherin < 5 ? 'low' : ''}">${p.slytherin} ly</span></div></div>
    <div class="pantry-item"><span class="pantry-icon">🦅</span><div><span class="pantry-name">Trà Lam</span><span class="pantry-qty ${p.ravenclaw < 5 ? 'low' : ''}">${p.ravenclaw} ly</span></div></div>
    <div class="pantry-item"><span class="pantry-icon">🦡</span><div><span class="pantry-name">Trà Kim</span><span class="pantry-qty ${p.hufflepuff < 5 ? 'low' : ''}">${p.hufflepuff} ly</span></div></div>
  `;
}

// Cập nhật giao diện ly trà sữa trực quan
function updateCupVisual() {
  const cupEl = document.getElementById('magicCup');
  const liquidEl = document.getElementById('layerTeaLiquid');
  const iceEl = document.getElementById('layerIceCubes');
  const foamEl = document.getElementById('layerCheeseFoam');
  const bobaEl = document.getElementById('layerBobaBottom');
  const stampTextEl = document.getElementById('stampBaristaText');

  // Kích thước
  if (state.currentCup.size === 'L') {
    cupEl.classList.add('size-L');
  } else {
    cupEl.classList.remove('size-L');
  }

  // Cốt trà
  liquidEl.className = 'layer-tea-liquid';
  if (state.currentCup.tea) {
    liquidEl.classList.add(state.currentCup.tea);
    liquidEl.style.height = state.currentCup.toppings.has('cheese_foam') ? '76%' : '86%';
  } else {
    liquidEl.style.height = '0%';
  }

  // Đá
  iceEl.innerHTML = '';
  if (state.currentCup.ice !== '0%') {
    iceEl.classList.add('visible');
    const cubeCount = state.currentCup.ice === '100%' ? 3 : 2;
    for (let i = 0; i < cubeCount; i++) {
      const cube = document.createElement('div');
      cube.className = 'ice-cube-item';
      iceEl.appendChild(cube);
    }
  } else {
    iceEl.classList.remove('visible');
  }

  // Kem Cheese
  if (state.currentCup.toppings.has('cheese_foam')) {
    foamEl.classList.add('active');
  } else {
    foamEl.classList.remove('active');
  }

  // Trân châu & thạch dưới đáy
  bobaEl.innerHTML = '';
  let hasBoba = false;
  ['golden_boba', 'night_star', 'moon_jelly'].forEach(topKey => {
    if (state.currentCup.toppings.has(topKey)) {
      hasBoba = true;
      for (let i = 0; i < 6; i++) {
        const dot = document.createElement('div');
        dot.className = `boba-dot ${topKey === 'golden_boba' ? 'golden' : topKey}`;
        bobaEl.appendChild(dot);
      }
    }
  });

  if (hasBoba) {
    bobaEl.classList.add('has-boba');
  } else {
    bobaEl.classList.remove('has-boba');
  }

  // Tem Barista
  stampTextEl.textContent = `Pha bởi: ${state.baristaName.split(' ')[0]}`;

  // Bảng tóm tắt
  document.getElementById('summarySize').textContent = `Size ${state.currentCup.size}`;
  document.getElementById('summaryTea').textContent = state.currentCup.tea ? getTeaName(state.currentCup.tea) : 'Chưa rót';
  document.getElementById('summarySugarIce').textContent = `${state.currentCup.sugar} Đường / ${state.currentCup.ice} Đá`;
  
  const topsArray = Array.from(state.currentCup.toppings).map(t => getToppingName(t));
  document.getElementById('summaryToppings').textContent = topsArray.length > 0 ? topsArray.join(', ') : 'Chưa thêm';
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

// Bắt sự kiện bàn pha chế
function initBaristaControls() {
  // Chọn cỡ ly
  document.getElementById('btnSizeM').addEventListener('click', function() {
    sfx.playIce();
    state.currentCup.size = 'M';
    this.classList.add('active');
    document.getElementById('btnSizeL').classList.remove('active');
    updateCupVisual();
  });

  document.getElementById('btnSizeL').addEventListener('click', function() {
    sfx.playIce();
    state.currentCup.size = 'L';
    this.classList.add('active');
    document.getElementById('btnSizeM').classList.remove('active');
    updateCupVisual();
  });

  // Chọn cốt trà
  const teaCards = document.querySelectorAll('.tea-card');
  teaCards.forEach(card => {
    card.addEventListener('click', () => {
      const teaType = card.dataset.tea;
      if (state.pantry[teaType] <= 0) {
        showToast(`Hết cốt trà ${getTeaName(teaType)} rồi! Hãy bấm "Nấu Thêm" nhé.`);
        return;
      }
      sfx.playPour();
      teaCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.currentCup.tea = teaType;
      updateCupVisual();
      showToast(`Đã rót ${getTeaName(teaType)} vào ly!`);
    });
  });

  // Chọn mức đường
  const sugarBtns = document.querySelectorAll('#sugarBtnGroup .micro-btn');
  sugarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playIce();
      sugarBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentCup.sugar = btn.dataset.val;
      updateCupVisual();
    });
  });

  // Chọn lượng đá
  const iceBtns = document.querySelectorAll('#iceBtnGroup .micro-btn');
  iceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playIce();
      iceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentCup.ice = btn.dataset.val;
      updateCupVisual();
    });
  });

  // Chọn Topping
  const topBtns = document.querySelectorAll('.topping-btn');
  topBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const topKey = btn.dataset.top;
      sfx.playIce();
      if (state.currentCup.toppings.has(topKey)) {
        state.currentCup.toppings.delete(topKey);
        btn.classList.remove('active');
      } else {
        state.currentCup.toppings.add(topKey);
        btn.classList.add('active');
      }
      updateCupVisual();
    });
  });

  // Đổ đi làm lại
  document.getElementById('btnResetCup').addEventListener('click', () => {
    sfx.playPour();
    resetCraftingCup();
    showToast('Đã đổ ly đi làm lại!');
  });

  // Lắc Shaker & Dập Nắp
  document.getElementById('btnShakeCup').addEventListener('click', () => {
    if (!state.currentCup.tea) {
      showToast('Bạn chưa rót trà vào ly mà!');
      return;
    }
    sfx.playShaker();
    const cup = document.getElementById('magicCup');
    cup.classList.add('shaking');
    state.currentCup.shaken = true;
    state.currentCup.sealed = true;
    showToast('🪇 Đang lắc đều shaker phép thuật & dập nắp...');

    setTimeout(() => {
      cup.classList.remove('shaking');
      showToast('✨ Ly trà sữa đã dập nắp hoàn chỉnh và dán tem Barista!');
    }, 700);
  });

  // Giao nước cho khách & Thu tiền
  document.getElementById('btnDeliverOrder').addEventListener('click', deliverCurrentOrder);

  // Mời thêm khách NPC
  document.getElementById('btnSpawnCustomer').addEventListener('click', () => {
    spawnNewCustomerOrder();
    sfx.playBell();
    showToast('🛎️ Một vị khách phù thủy mới vừa bước vào hàng!');
  });

  // Nấu thêm mẻ trà
  document.getElementById('btnBrewPantry').addEventListener('click', () => {
    sfx.playPour();
    state.pantry.gryffindor += 10;
    state.pantry.slytherin += 10;
    state.pantry.ravenclaw += 10;
    state.pantry.hufflepuff += 10;
    renderPantry();
    showToast('🍵 Đã nấu thêm 10 ly cốt trà cho cả 4 Nhà!');
  });
}

function resetCraftingCup() {
  state.currentCup = {
    size: 'M',
    tea: null,
    sugar: '50%',
    ice: '50%',
    toppings: new Set(),
    shaken: false,
    sealed: false
  };

  document.querySelectorAll('.tea-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.topping-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btnSizeM').classList.add('active');
  document.getElementById('btnSizeL').classList.remove('active');
  updateCupVisual();
}

// Xử lý giao nước
function deliverCurrentOrder() {
  if (state.pendingOrders.length === 0) {
    showToast('Không có đơn hàng nào để giao!');
    return;
  }

  const order = state.pendingOrders[state.activeOrderIndex];
  if (!order) return;

  if (!state.currentCup.tea) {
    showToast('Ly trà còn trống! Hãy rót trà trước khi giao.');
    return;
  }

  if (!state.currentCup.shaken) {
    showToast('Hãy bấm "Lắc Shaker & Dập Nắp" trước khi giao cho khách nhé!');
    return;
  }

  // Tính điểm chuẩn xác
  let score = 100;
  if (state.currentCup.tea !== order.tea) score -= 40;
  if (state.currentCup.size !== order.size) score -= 15;
  if (state.currentCup.sugar !== order.sugar) score -= 10;
  if (state.currentCup.ice !== order.ice) score -= 10;

  // Tính tiền công và tiền Tip
  let earning = order.price;
  let tip = 0;
  if (score >= 90) {
    tip = Math.floor(Math.random() * 5) + 3; // Tip 3-7 Galleons
  }

  state.galleons += (earning + tip);
  state.cupsSold += 1;
  state.totalRev += earning;
  state.totalTips += tip;

  // Giảm nguyên liệu trong kho
  if (state.pantry[state.currentCup.tea] > 0) {
    state.pantry[state.currentCup.tea]--;
  }

  sfx.playCash();

  // Thêm review tự động từ khách hàng này
  const newRating = score >= 80 ? 5 : (score >= 50 ? 4 : 3);
  state.reviews.unshift({
    author: order.customerName,
    avatar: order.avatar,
    rating: newRating,
    drink: `🧋 ${order.teaName} (Size ${order.size})`,
    comment: score >= 90 
      ? `Trà ngon tuyệt đỉnh! Barista pha cực chuẩn vị, còn dán tem dễ thương nữa ❤️.`
      : `Uống ổn, khá vừa miệng, lần sau ghé tiếp.`,
    tip: tip,
    time: 'Vừa xong'
  });
  state.reviewsCount++;

  showToast(`🎉 Giao thành công cho ${order.customerName}! Nhận +${earning} G ${tip > 0 ? `(+${tip} G Tip)` : ''}!`);

  // Xóa đơn khỏi hàng đợi
  state.pendingOrders.splice(state.activeOrderIndex, 1);
  state.activeOrderIndex = 0;

  resetCraftingCup();
  renderOrderQueue();
  renderPantry();
  renderReviews();
  updateHeaderStats();

  // Nếu đây là đơn hàng của chính bạn ở tab Customer
  if (state.customerMyOrder && state.customerMyOrder.id === order.id) {
    advanceCustomerOrderTimeline(4); // Sẵn sàng
  }
}

// Tạo đơn NPC mới
function spawnNewCustomerOrder() {
  const npcs = [
    { name: 'Neville Longbottom', avatar: '🌱', house: 'huff', houseName: 'Hufflepuff', tea: 'hufflepuff', teaName: 'Trà Kim Hufflepuff', quote: 'Cho mình nhiều vị mật ong ngọt ấm nhé!' },
    { name: 'Ginny Weasley', avatar: '🦁', house: 'gryf', houseName: 'Gryffindor', tea: 'gryffindor', teaName: 'Hồng Trà Gryffindor', quote: 'Pha nhanh giúp mình nha, sắp có trận tập Quidditch rồi.' },
    { name: 'Cho Chang', avatar: '🦅', house: 'raven', houseName: 'Ravenclaw', tea: 'ravenclaw', teaName: 'Trà Lam Ravenclaw', quote: 'Ít đường nhiều đá giúp mình nhé bạn Barista!' },
    { name: 'Blaise Zabini', avatar: '🐍', house: 'slyth', houseName: 'Slytherin', tea: 'slytherin', teaName: 'Lục Trà Slytherin', quote: 'Thêm thạch trăng rằm và kem cheese đậm vị.' }
  ];

  const randomNpc = npcs[Math.floor(Math.random() * npcs.length)];
  const sizes = ['M', 'L'];
  const sugars = ['30%', '50%', '70%'];
  const ices = ['0%', '50%', '100%'];
  const topsPool = ['golden_boba', 'night_star', 'moon_jelly', 'cheese_foam'];

  const order = {
    id: `ORD-${Math.floor(Math.random() * 800) + 200}`,
    customerName: randomNpc.name,
    avatar: randomNpc.avatar,
    house: randomNpc.house,
    houseName: randomNpc.houseName,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    tea: randomNpc.tea,
    teaName: randomNpc.teaName,
    sugar: sugars[Math.floor(Math.random() * sugars.length)],
    ice: ices[Math.floor(Math.random() * ices.length)],
    toppings: [topsPool[Math.floor(Math.random() * topsPool.length)]],
    quote: randomNpc.quote,
    price: 24,
    patience: 100
  };

  state.pendingOrders.push(order);
  renderOrderQueue();
  updateHeaderStats();
}

// --- 5. LOGIC GÓC NHÌN 🙋‍♂️ KHÁCH HÀNG (CUSTOMER VIEW) ---

// Render danh sách món Menu
function renderDrinkMenu() {
  const container = document.getElementById('drinkMenuCardsGrid');
  const drinks = [
    {
      key: 'gryffindor',
      badge: '🦁',
      title: 'Hồng Trà Sư Tử Gryffindor',
      desc: 'Cốt hồng trà ủ từ lá thảo mộc phương Đông, vị nồng ấm, màu đỏ ruby kiêu hãnh.',
      price: 20
    },
    {
      key: 'slytherin',
      badge: '🐍',
      title: 'Lục Trà Táo Xanh Slytherin',
      desc: 'Lục trà the mát hương bạc hà cùng siro táo rừng, thanh khiết và sâu lắng.',
      price: 20
    },
    {
      key: 'ravenclaw',
      badge: '🦅',
      title: 'Trà Lam Hoa Đậu Biếc Ravenclaw',
      desc: 'Trà hoa đậu biếc biếc sắc huyền bí, thơm hoa nhài và vị ngọt dịu thông tuệ.',
      price: 22
    },
    {
      key: 'hufflepuff',
      badge: '🦡',
      title: 'Trà Sữa Bơ Mật Ong Hufflepuff',
      desc: 'Vị bơ đường nâu kết hợp sữa tươi đồng cỏ và mật ong nguyên chất ngọt ngào.',
      price: 22
    }
  ];

  container.innerHTML = '';
  drinks.forEach(d => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="menu-card-top">
        <span class="menu-card-badge">${d.badge}</span>
        <span class="menu-card-price">${d.price} G</span>
      </div>
      <h4>${d.title}</h4>
      <p>${d.desc}</p>
      <button class="menu-card-btn" data-drink="${d.key}">Chọn Món Này Vào Đơn</button>
    `;

    card.querySelector('.menu-card-btn').addEventListener('click', () => {
      sfx.playIce();
      document.getElementById('custBaseDrinkSelect').value = d.key;
      updateCustomerTotalGalleons();
      showToast(`Đã chọn "${d.title}" vào bảng order!`);
    });

    container.appendChild(card);
  });
}

let custSelectedSize = 'M';

function initCustomerControls() {
  // Chọn cỡ ly trong builder
  document.getElementById('custSizeM').addEventListener('click', function() {
    sfx.playIce();
    custSelectedSize = 'M';
    this.classList.add('active');
    document.getElementById('custSizeL').classList.remove('active');
    updateCustomerTotalGalleons();
  });

  document.getElementById('custSizeL').addEventListener('click', function() {
    sfx.playIce();
    custSelectedSize = 'L';
    this.classList.add('active');
    document.getElementById('custSizeM').classList.remove('active');
    updateCustomerTotalGalleons();
  });

  // Đổi món cơ bản
  document.getElementById('custBaseDrinkSelect').addEventListener('change', updateCustomerTotalGalleons);

  // Đổi topping
  document.querySelectorAll('.cust-toppings-grid input').forEach(input => {
    input.addEventListener('change', updateCustomerTotalGalleons);
  });

  // Gửi đơn đến quầy Barista
  document.getElementById('btnSubmitCustomerOrder').addEventListener('click', submitCustomerOrder);

  // Nút Uống Ngay
  document.getElementById('btnEnjoyDrink').addEventListener('click', () => {
    sfx.playSlurp();
    showToast('🧋 Rột rột rột... Trà sữa thơm béo ngậy! Hồi phục +30 Năng Lượng Phép Thuật!');
  });

  // Mở modal review
  document.getElementById('btnOpenReviewModal').addEventListener('click', () => {
    sfx.playIce();
    document.getElementById('reviewModal').hidden = false;
  });

  document.getElementById('btnCloseReviewModal').addEventListener('click', () => {
    document.getElementById('reviewModal').hidden = true;
  });

  // Chọn sao trong modal
  const stars = document.querySelectorAll('#starPicker .pick-star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      sfx.playIce();
      const r = parseInt(star.dataset.rating, 10);
      stars.forEach(s => {
        const sr = parseInt(s.dataset.rating, 10);
        s.classList.toggle('active', sr <= r);
      });
    });
  });

  // Chọn tiền tip trong modal
  const tipBtns = document.querySelectorAll('#tipBtnGroup .micro-btn');
  tipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playIce();
      tipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Gửi review từ modal
  document.getElementById('btnSendReview').addEventListener('click', sendCustomerReview);
}

function updateCustomerTotalGalleons() {
  const baseKey = document.getElementById('custBaseDrinkSelect').value;
  let total = (baseKey === 'gryffindor' || baseKey === 'slytherin') ? 20 : 22;
  if (custSelectedSize === 'L') total += 3;

  document.querySelectorAll('.cust-toppings-grid input:checked').forEach(() => {
    total += 3;
  });

  document.getElementById('custTotalGalleons').textContent = `${total} Galleons`;
  return total;
}

// Khách hàng bấm gửi đơn
function submitCustomerOrder() {
  const custName = document.getElementById('custNameInput').value.trim() || 'Học Sinh Bí Mật';
  const baseDrinkKey = document.getElementById('custBaseDrinkSelect').value;
  const sugar = document.getElementById('custSugarSelect').value;
  const ice = document.getElementById('custIceSelect').value;
  const note = document.getElementById('custNoteInput').value.trim() || 'Pha ngọt vừa giúp mình nhé!';
  
  const checkedTops = [];
  document.querySelectorAll('.cust-toppings-grid input:checked').forEach(c => checkedTops.push(c.value));

  const totalCost = updateCustomerTotalGalleons();
  if (state.galleons < totalCost) {
    showToast('Bạn không đủ tiền Galleons để đặt ly này!');
    return;
  }

  state.galleons -= totalCost;
  updateHeaderStats();
  sfx.playBell();

  const newOrder = {
    id: `ORD-${Math.floor(Math.random() * 900) + 100}`,
    customerName: custName,
    avatar: '🧙‍♂️',
    house: 'gryf',
    houseName: 'Hogwarts',
    size: custSelectedSize,
    tea: baseDrinkKey,
    teaName: getTeaName(baseDrinkKey),
    sugar: sugar,
    ice: ice,
    toppings: checkedTops,
    quote: note,
    price: totalCost,
    patience: 100
  };

  // Đưa vào hàng chờ Barista
  state.pendingOrders.unshift(newOrder);
  state.activeOrderIndex = 0;
  renderOrderQueue();
  updateHeaderStats();

  // Cập nhật thẻ theo dõi tiến độ của khách
  state.customerMyOrder = newOrder;
  document.getElementById('trackerId').textContent = `#${newOrder.id}`;
  document.getElementById('trackerDrinkName').textContent = `🧋 ${newOrder.teaName} (Size ${newOrder.size})`;
  document.getElementById('trackerSub').textContent = `${newOrder.sugar} Đường, ${newOrder.ice} Đá · ${checkedTops.map(t => getToppingName(t)).join(', ') || 'Không Topping'}`;
  document.getElementById('trackerNote').textContent = `Ghi chú của bạn: "${newOrder.quote}"`;

  advanceCustomerOrderTimeline(1); // Bước 1: Nhận đơn
  showToast(`🛎️ Đã gửi đơn đến quầy Barista! (Trừ -${totalCost} G)`);

  // Mô phỏng Barista đang làm việc (nếu người chơi không tự tay pha)
  setTimeout(() => advanceCustomerOrderTimeline(2), 2500); // Rót trà
  setTimeout(() => advanceCustomerOrderTimeline(3), 5000); // Lắc shaker
  setTimeout(() => advanceCustomerOrderTimeline(4), 7500); // Sẵn sàng
}

function advanceCustomerOrderTimeline(step) {
  document.querySelectorAll('.tracker-timeline .step-node').forEach((node, idx) => {
    node.classList.toggle('active', idx < step);
  });

  const statusPill = document.getElementById('trackerStatus');
  const actionsWrap = document.getElementById('trackerActions');

  if (step === 1) {
    statusPill.textContent = 'Quầy đã nhận đơn';
    statusPill.className = 'tracker-pill preparing';
    actionsWrap.style.display = 'none';
  } else if (step === 2) {
    statusPill.textContent = 'Barista đang rót trà...';
    statusPill.className = 'tracker-pill preparing';
  } else if (step === 3) {
    statusPill.textContent = 'Đang lắc shaker & dán tem...';
    statusPill.className = 'tracker-pill preparing';
  } else if (step >= 4) {
    statusPill.textContent = 'Đã sẵn sàng tại quầy!';
    statusPill.className = 'tracker-pill ready';
    actionsWrap.style.display = 'flex';
    sfx.playBell();
    showToast('✨ Nước của bạn đã sẵn sàng tại quầy! Hãy bấm "Uống Ngay".');
  }
}

// Khách gửi Review & Tip
function sendCustomerReview() {
  const comment = document.getElementById('reviewCommentInput').value.trim() || 'Trà sữa ngon tuyệt vời, 5 sao cho bạn Barista!';
  const activeStarCount = document.querySelectorAll('#starPicker .pick-star.active').length || 5;
  const tipVal = parseInt(document.querySelector('#tipBtnGroup .micro-btn.active')?.dataset.tip || '5', 10);

  if (tipVal > 0 && state.galleons >= tipVal) {
    state.galleons -= tipVal;
    state.totalTips += tipVal;
  }

  state.reviews.unshift({
    author: state.customerMyOrder ? state.customerMyOrder.customerName : 'HarryPotter',
    avatar: '🧙‍♂️',
    rating: activeStarCount,
    drink: state.customerMyOrder ? `${state.customerMyOrder.teaName} (Size ${state.customerMyOrder.size})` : 'Hồng Trà Gryffindor',
    comment: comment,
    tip: tipVal,
    time: 'Vừa xong'
  });
  state.reviewsCount++;

  sfx.playCash();
  document.getElementById('reviewModal').hidden = true;
  document.getElementById('reviewCommentInput').value = '';
  renderReviews();
  updateHeaderStats();
  showToast(`💌 Đã gửi đánh giá ${activeStarCount}★ và tặng ${tipVal} G Tip cho Barista!`);
}

// --- 6. LOGIC SỔ LƯU NIỆM & NÂNG CẤP TIỆM ---

function renderReviews() {
  const container = document.getElementById('reviewsFeedList');
  container.innerHTML = '';

  state.reviews.forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-item-card';
    card.innerHTML = `
      <div class="review-author-avatar">${r.avatar}</div>
      <div class="review-content-col">
        <div class="review-top-meta">
          <span class="review-author-name">${r.author}</span>
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
        showToast(`🎉 Đã mở khóa thành công: "${up.title}"!`);
      });
    }

    container.appendChild(row);
  });
}

// --- 7. KHỞI TẠO TỔNG THỂ (INIT) ---
window.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initBaristaControls();
  initCustomerControls();

  renderOrderQueue();
  renderPantry();
  updateCupVisual();

  renderDrinkMenu();
  renderReviews();
  renderUpgrades();
  updateHeaderStats();

  // Khách giảm kiên nhẫn theo thời gian thực (Patience decay timer)
  setInterval(() => {
    state.pendingOrders.forEach(order => {
      if (order.patience > 5) {
        order.patience -= 1;
      }
    });
    // Cập nhật lại thanh kiên nhẫn mà không gây giật lag
    const fills = document.querySelectorAll('.patience-fill');
    fills.forEach((fill, idx) => {
      const order = state.pendingOrders[idx];
      if (order) {
        fill.style.width = `${order.patience}%`;
        fill.className = `patience-fill ${order.patience < 30 ? 'danger' : (order.patience < 60 ? 'warning' : '')}`;
      }
    });
  }, 1000);
});

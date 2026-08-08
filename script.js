let db = null;
let SQL_module = null;
let allEvents = [];

// 数据统一存储在 timeline.sqlite 中，本文件不再保留冗余数据副本。
// 修改历史事件/朝代请直接编辑数据库文件。

// ── 动态加载 sql.js ──
const SQL_CDN_BASES = [
  'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/',
  'https://unpkg.com/sql.js@1.8.0/dist/',
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed: ' + src));
    document.head.appendChild(s);
  });
}

async function loadSqlJs() {
  try {
    await loadScript('sql-wasm.js');
    if (typeof initSqlJs === 'function') return 'local';
  } catch(_) {}
  for (const base of SQL_CDN_BASES) {
    try {
      await loadScript(base + 'sql-wasm.js');
      if (typeof initSqlJs === 'function') return base;
    } catch(_) {}
  }
  throw new Error('所有 CDN 均无法加载 sql.js');
}

async function initDB() {
  const loadingDetail = document.getElementById('loadingDetail');
  loadingDetail.textContent = '加载 sql.js WASM 引擎…';
  const loadedBase = await loadSqlJs();
  SQL_module = await initSqlJs({
    locateFile: f => loadedBase === 'local' ? f : loadedBase + f
  });

  loadingDetail.textContent = '加载 timeline.sqlite…';
  let resp;
  try {
    resp = await fetch('timeline.sqlite?v=' + Date.now());
  } catch(_) {
    throw new Error('无法读取数据库文件，请通过本地服务器或 GitHub Pages 访问（直接双击打开无效）');
  }
  if (!resp.ok) {
    throw new Error(`无法加载数据库 (HTTP ${resp.status})`);
  }
  const buf = await resp.arrayBuffer();
  db = new SQL_module.Database(new Uint8Array(buf));
  const test = db.exec("SELECT count(*) FROM events");
  if (!test.length) {
    throw new Error('数据库为空或已损坏');
  }
  loadingDetail.textContent = '数据库加载完成';
}

function queryEvents(type) {
  const results = [];
  const stmt = db.prepare(
    `SELECT year_label AS year, year_num AS yearNum, title, description AS "desc", image, emoji
     FROM events WHERE type = ? ORDER BY year_num`
  );
  stmt.bind([type]);
  while (stmt.step()) { results.push(stmt.getAsObject()); }
  stmt.free();
  return results;
}

function queryDynasties() {
  const results = [];
  const stmt = db.prepare(`SELECT name, start_year AS start, end_year AS end, color, detail FROM dynasties ORDER BY start_year`);
  while (stmt.step()) { results.push(stmt.getAsObject()); }
  stmt.free();
  return results;
}

// ════════════════════════════════════════════════
//  时间轴渲染
// ════════════════════════════════════════════════
const PADDING = 120;
const TOTAL_WIDTH = 25600;
const USABLE = TOTAL_WIDTH - PADDING * 2;
const SPLIT_YEAR = 1368;
const RATIO_BEFORE = 0.55;
const RATIO_AFTER = 0.45;

let minYear = -4000;
let maxYear = 2026;

function yearToX(yearNum) {
  if (yearNum <= SPLIT_YEAR) {
    return PADDING + (yearNum - minYear) / (SPLIT_YEAR - minYear) * USABLE * RATIO_BEFORE;
  } else {
    return PADDING + USABLE * RATIO_BEFORE
      + (yearNum - SPLIT_YEAR) / (maxYear - SPLIT_YEAR) * USABLE * RATIO_AFTER;
  }
}

const yearTicks = [];
for (let y = -4000; y <= 1300; y += 250) { yearTicks.push(y); }
for (let y = 1400; y <= 2000; y += 50) { yearTicks.push(y); }

function formatYear(y) {
  if (y < 0) return '前' + Math.abs(y);
  return y === 0 ? '元年' : String(y);
}

// 朝代卡通 emoji 映射
const DYNASTY_EMOJI = {
  '史前': '🦴', '夏': '🏺', '商': '🐢', '周': '📜',
  '秦': '⚔️', '汉': '🐉', '三国': '🗡️', '晋': '🍵',
  '南北朝': '🏯', '隋': '🌉', '唐': '🎐', '五代': '🔥',
  '宋': '🎨', '元': '🐎', '明': '🏮', '清': '👑',
  '民国': '🌅', '新中国': '🚀',
};

let dynastyData = [];

function buildAxis(dynasties) {
  dynastyData = dynasties;
  let html = '<div class="timeline-axis">';
  dynasties.forEach((d, i) => {
    const x1 = yearToX(d.start);
    const x2 = yearToX(d.end);
    const w = x2 - x1;
    const showName = w > 80;
    const emoji = DYNASTY_EMOJI[d.name] || '🏛️';
    html += `<div class="dynasty-band" data-dynasty-idx="${i}" style="left:${x1}px;width:${w}px;background:${d.color};opacity:0.6;">
      ${showName ? `<span class="dynasty-name"><span class="dynasty-emoji">${emoji}</span>${d.name}</span>` : ''}
    </div>`;
  });
  yearTicks.forEach(y => {
    const x = yearToX(y);
    html += `<div class="year-tick" style="left:${x}px;">
      <div class="tick-mark"></div>
      <div class="tick-label">${formatYear(y)}</div>
    </div>`;
  });
  html += '</div>';
  return html;
}

function buildNode(ev, type, idx) {
  const mediaHtml = ev.image
    ? `<div class="card-img-wrap"><img class="card-img" src="${ev.image}" alt="${ev.title}" loading="lazy"></div>`
    : (ev.emoji ? `<div class="card-emoji"><span>${ev.emoji}</span></div>` : '');
  const tagText = type === 'china' ? '中国' : '世界';
  return `
    <div class="event-node ${type}" data-event-idx="${idx}" style="left: ${ev.x}px;">
      <div class="card">
        <div class="card-tag">${tagText}</div>
        ${mediaHtml}
        <div class="card-body">
          <div class="year">${ev.year}</div>
          <div class="title">${ev.title}</div>
        </div>
        <div class="card-hint">📖 点击查看详情</div>
      </div>
      <div class="stem"></div>
      <div class="dot"></div>
    </div>`;
}

function renderTimeline() {
  const chinaEvents = queryEvents('china');
  const worldEvents = queryEvents('world');
  const dynasties = queryDynasties();

  const allYears = [...chinaEvents, ...worldEvents].map(e => e.yearNum);
  minYear = Math.min(...allYears);
  maxYear = Math.max(...allYears);

  chinaEvents.forEach(e => { e.x = yearToX(e.yearNum); });
  worldEvents.forEach(e => { e.x = yearToX(e.yearNum); });

  allEvents = [
    ...chinaEvents.map(e => ({ ...e, type: 'china' })),
    ...worldEvents.map(e => ({ ...e, type: 'world' }))
  ];

  const track = document.getElementById('timelineTrack');
  track.innerHTML = buildAxis(dynasties);
  track.style.width = TOTAL_WIDTH + 'px';

  renderedNodes.clear();
  currentX = -400;
  applyTransform();
  updateVisibleNodes();
}

// ════════════════════════════════════════════════
//  虚拟滚动：只渲染可视区域 ±2 屏内的事件卡片
// ════════════════════════════════════════════════
const renderedNodes = new Map();
let virtualUpdatePending = false;

function updateVisibleNodes() {
  virtualUpdatePending = false;
  const track = document.getElementById('timelineTrack');
  if (!track || allEvents.length === 0) return;

  const margin = window.innerWidth * 2;
  const leftBound = -currentX - margin;
  const rightBound = -currentX + window.innerWidth + margin;

  // 移除离开视口的节点
  for (const [idx, el] of renderedNodes) {
    const ev = allEvents[idx];
    if (!ev || ev.x < leftBound || ev.x > rightBound) {
      el.remove();
      renderedNodes.delete(idx);
    }
  }

  // 添加进入视口的节点
  allEvents.forEach((ev, idx) => {
    if (ev.x >= leftBound && ev.x <= rightBound && !renderedNodes.has(idx)) {
      const temp = document.createElement('div');
      temp.innerHTML = buildNode(ev, ev.type, idx);
      const el = temp.firstElementChild;
      track.appendChild(el);
      renderedNodes.set(idx, el);
    }
  });
}

function scheduleVirtualUpdate() {
  if (!virtualUpdatePending) {
    virtualUpdatePending = true;
    requestAnimationFrame(updateVisibleNodes);
  }
}

// ════════════════════════════════════════════════
//  交互控制
// ════════════════════════════════════════════════
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = toggleBtn.querySelector('.toggle-text');

let currentX = 0;
let isDragging = false;
let lastPointerX = 0;
let autoScroll = false;
let rafId = null;
let lastTime = 0;
const SCROLL_SPEED = 0.03;
let isHovering = false;

function getMinX() { return -(TOTAL_WIDTH - window.innerWidth); }
const MAX_X = 0;

function clampX() {
  const min = getMinX();
  if (currentX > MAX_X) currentX = MAX_X;
  if (currentX < min) currentX = min;
}

function applyTransform() {
  const track = document.getElementById('timelineTrack');
  if (track) {
    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    scheduleVirtualUpdate();
  }
}

// ── 平滑滚动引擎 ──
let smoothRaf = null;
function cancelSmooth() { if (smoothRaf) { cancelAnimationFrame(smoothRaf); smoothRaf = null; } }

function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

function smoothScrollTo(targetX, duration = 400) {
  cancelSmooth();
  const min = getMinX();
  targetX = Math.max(min, Math.min(MAX_X, targetX));
  const startX = currentX;
  const distance = targetX - startX;
  if (Math.abs(distance) < 0.5) return;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    currentX = startX + distance * easeOutQuart(t);
    clampX();
    applyTransform();
    if (t < 1) {
      smoothRaf = requestAnimationFrame(step);
    } else {
      smoothRaf = null;
      currentX = targetX;
    }
  }
  smoothRaf = requestAnimationFrame(step);
}

// ── 惯性滑动 ──
let momentumRaf = null;
function cancelMomentum() { if (momentumRaf) { cancelAnimationFrame(momentumRaf); momentumRaf = null; } }

function startMomentum(vx) {
  cancelMomentum();
  cancelSmooth();
  let velocity = vx;
  const FRICTION = 0.94;
  const MIN_VELOCITY = 0.3;

  function step() {
    if (Math.abs(velocity) < MIN_VELOCITY) { momentumRaf = null; return; }
    currentX += velocity;
    const min = getMinX();
    if (currentX > MAX_X) { currentX = MAX_X; velocity *= -0.4; if (Math.abs(velocity) < 1) { momentumRaf = null; return; } }
    else if (currentX < min) { currentX = min; velocity *= -0.4; if (Math.abs(velocity) < 1) { momentumRaf = null; return; } }
    applyTransform();
    velocity *= FRICTION;
    momentumRaf = requestAnimationFrame(step);
  }
  momentumRaf = requestAnimationFrame(step);
}

// ── 自动滚动 ──
function scrollLoop(timestamp) {
  if (!autoScroll || isDragging) { rafId = null; return; }
  if (!lastTime) lastTime = timestamp;
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  if (!isHovering) {
    currentX -= SCROLL_SPEED * dt;
    clampX();
    applyTransform();
    if (currentX <= getMinX()) {
      autoScroll = false;
      toggleBtn.classList.remove('active');
      toggleText.textContent = '已暂停';
      rafId = null;
      return;
    }
  }
  rafId = requestAnimationFrame(scrollLoop);
}

function startAutoScroll() { if (!rafId) { lastTime = 0; rafId = requestAnimationFrame(scrollLoop); } }
function stopAutoScroll() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

toggleBtn.addEventListener('click', () => {
  autoScroll = !autoScroll;
  if (autoScroll) {
    toggleBtn.classList.add('active');
    toggleText.textContent = '自动滚动';
    startAutoScroll();
  } else {
    toggleBtn.classList.remove('active');
    toggleText.textContent = '已暂停';
    stopAutoScroll();
  }
});

const trackEl = document.getElementById('timelineTrack');
trackEl.addEventListener('mouseenter', () => { isHovering = true; });
trackEl.addEventListener('mouseleave', () => { isHovering = false; });

let mouseDownX = 0, mouseDownY = 0, mouseDownTarget = null;
const CLICK_THRESHOLD = 6;

// 拖拽速度追踪
let dragHistory = [];

function openEventModalByNode(node) {
  const idx = parseInt(node.dataset.eventIdx);
  if (!isNaN(idx) && allEvents[idx]) openEventModal(idx);
}

trackEl.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastPointerX = e.pageX;
  mouseDownX = e.pageX; mouseDownY = e.pageY;
  mouseDownTarget = e.target.closest('.event-node');
  dragHistory = [{ x: e.pageX, t: performance.now() }];
  cancelSmooth();
  cancelMomentum();
  trackEl.style.cursor = 'grabbing';
  e.preventDefault();
});
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.pageX - lastPointerX;
  currentX += dx;
  clampX(); applyTransform();
  lastPointerX = e.pageX;
  dragHistory.push({ x: e.pageX, t: performance.now() });
  if (dragHistory.length > 6) dragHistory.shift();
});
window.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  trackEl.style.cursor = 'grab';
  if (mouseDownTarget) {
    const moved = Math.abs(e.pageX - mouseDownX) + Math.abs(e.pageY - mouseDownY);
    if (moved < CLICK_THRESHOLD) openEventModalByNode(mouseDownTarget);
  }
  // 计算释放时的速度，触发惯性滑动
  if (dragHistory.length >= 2) {
    const last = dragHistory[dragHistory.length - 1];
    const first = dragHistory[0];
    const dt = last.t - first.t;
    if (dt > 0 && dt < 200) {
      const vx = (last.x - first.x) / dt * 16;
      if (Math.abs(vx) > 1.5) startMomentum(vx);
    }
  }
  dragHistory = [];
  mouseDownTarget = null;
});

document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.event-node') && !e.target.closest('.toggle-btn') && !e.target.closest('.search-bar')) {
    // 点击空白区域不做额外操作
  }
});

// ── 触摸滑动（含惯性）──
let touchActive = false, touchDownX = 0, touchDownY = 0, touchDownTarget = null;
let touchHistory = [];
trackEl.addEventListener('touchstart', (e) => {
  touchActive = true;
  lastPointerX = e.touches[0].pageX;
  touchDownX = e.touches[0].pageX; touchDownY = e.touches[0].pageY;
  touchDownTarget = e.target.closest('.event-node');
  touchHistory = [{ x: e.touches[0].pageX, t: performance.now() }];
  cancelSmooth();
  cancelMomentum();
}, { passive: true });
trackEl.addEventListener('touchmove', (e) => {
  if (!touchActive) return;
  currentX += e.touches[0].pageX - lastPointerX;
  clampX(); applyTransform();
  lastPointerX = e.touches[0].pageX;
  touchHistory.push({ x: e.touches[0].pageX, t: performance.now() });
  if (touchHistory.length > 6) touchHistory.shift();
}, { passive: true });
trackEl.addEventListener('touchend', (e) => {
  touchActive = false;
  if (touchDownTarget) {
    const t = e.changedTouches[0];
    const moved = Math.abs(t.pageX - touchDownX) + Math.abs(t.pageY - touchDownY);
    if (moved < CLICK_THRESHOLD) openEventModalByNode(touchDownTarget);
  }
  // 触摸惯性
  if (touchHistory.length >= 2) {
    const last = touchHistory[touchHistory.length - 1];
    const first = touchHistory[0];
    const dt = last.t - first.t;
    if (dt > 0 && dt < 200) {
      const vx = (last.x - first.x) / dt * 16;
      if (Math.abs(vx) > 1.5) startMomentum(vx);
    }
  }
  touchHistory = [];
  touchDownTarget = null;
}, { passive: true });

// ── 滚轮（平滑滚动）──
let wheelTarget = 0;
let wheelTimer = null;
trackEl.addEventListener('wheel', (e) => {
  e.preventDefault();
  cancelMomentum();
  if (smoothRaf) { cancelSmooth(); }
  if (wheelTimer === null) wheelTarget = currentX;
  wheelTarget -= e.deltaY;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    smoothScrollTo(wheelTarget, 400);
    wheelTimer = null;
  }, 20);
}, { passive: false });

// ── 键盘导航（平滑滚动）──
const ARROW_STEP = 500;
let arrowKey = null, arrowHoldTimer = null;

document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (document.activeElement && document.activeElement.id === 'searchInput') return;
  e.preventDefault();
  cancelMomentum();
  if (arrowKey === e.key) return;
  arrowKey = e.key;
  smoothScrollTo(currentX + (e.key === 'ArrowLeft' ? ARROW_STEP : -ARROW_STEP), 350);
  if (arrowHoldTimer) clearInterval(arrowHoldTimer);
  arrowHoldTimer = setInterval(() => {
    smoothScrollTo(currentX + (arrowKey === 'ArrowLeft' ? ARROW_STEP * 0.6 : -ARROW_STEP * 0.6), 200);
  }, 200);
});

document.addEventListener('keyup', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (arrowKey === e.key) {
    arrowKey = null;
    if (arrowHoldTimer) { clearInterval(arrowHoldTimer); arrowHoldTimer = null; }
  }
});

// ════════════════════════════════════════════════
//  搜索功能
// ════════════════════════════════════════════════
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBtn = document.getElementById('searchBtn');

function performSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResults.classList.remove('show'); return []; }
  const matches = allEvents.filter(e =>
    String(e.title).toLowerCase().includes(q) ||
    String(e.year).toLowerCase().includes(q) ||
    String(e.desc).toLowerCase().includes(q)
  );
  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="search-no-result">没找到呀 😢</div>';
    searchResults.classList.add('show');
    return [];
  }
  searchResults.innerHTML = matches.map((e, i) => `
    <div class="search-result-item" data-index="${i}">
      <span class="result-year">${e.year}</span>
      <span class="result-title">${e.title}</span>
      <span class="result-type">${e.type === 'china' ? '🇨🇳' : '🌍'}</span>
    </div>
  `).join('');
  searchResults.classList.add('show');
  return matches;
}

function navigateToEvent(ev) {
  cancelMomentum();
  cancelSmooth();
  const targetX = window.innerWidth / 2 - ev.x;
  smoothScrollTo(targetX, 800);
  addSearchMarker(ev);
}

let searchMarkerTimer = null;
function addSearchMarker(ev) {
  document.querySelectorAll('.search-marker').forEach(m => m.remove());
  if (searchMarkerTimer) { clearTimeout(searchMarkerTimer); searchMarkerTimer = null; }

  const track = document.getElementById('timelineTrack');
  const marker = document.createElement('div');
  marker.className = 'search-marker';
  marker.style.left = ev.x + 'px';
  marker.innerHTML = `
    <div class="marker-pulse"></div>
    <div class="marker-label">📍 在这里！</div>
  `;
  track.appendChild(marker);

  searchMarkerTimer = setTimeout(() => {
    marker.classList.add('fading');
    setTimeout(() => marker.remove(), 500);
    searchMarkerTimer = null;
  }, 10000);
}

searchInput.addEventListener('input', performSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const matches = performSearch();
    if (matches.length > 0) {
      navigateToEvent(matches[0]);
      searchResults.classList.remove('show');
      searchInput.blur();
    }
  }
  if (e.key === 'Escape') {
    searchResults.classList.remove('show');
    searchInput.blur();
  }
});
searchBtn.addEventListener('click', () => {
  const matches = performSearch();
  if (matches.length > 0) {
    navigateToEvent(matches[0]);
    searchResults.classList.remove('show');
    searchInput.blur();
  }
});
searchResults.addEventListener('click', (e) => {
  const item = e.target.closest('.search-result-item');
  if (!item) return;
  const index = parseInt(item.dataset.index);
  const matches = performSearch();
  if (matches[index]) {
    navigateToEvent(matches[index]);
    searchResults.classList.remove('show');
    searchInput.blur();
  }
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-bar')) searchResults.classList.remove('show');
});

// ════════════════════════════════════════════════
//  朝代详情弹窗
// ════════════════════════════════════════════════
const dynastyModal = document.getElementById('dynastyModal');
const dynastyModalClose = document.getElementById('dynastyModalClose');
const dynastyModalEmoji = document.getElementById('dynastyModalEmoji');
const dynastyModalName = document.getElementById('dynastyModalName');
const dynastyModalYears = document.getElementById('dynastyModalYears');
const dynastyModalBody = document.getElementById('dynastyModalBody');
const dynastyModalHeader = document.getElementById('dynastyModalHeader');

function formatDynastyYear(y) {
  if (y < 0) return '前' + Math.abs(y) + '年';
  return y + '年';
}

function openDynastyModal(idx) {
  const d = dynastyData[idx];
  if (!d) return;
  const emoji = DYNASTY_EMOJI[d.name] || '🏛️';
  dynastyModalEmoji.textContent = emoji;
  dynastyModalName.textContent = d.name;
  dynastyModalYears.textContent = `${formatDynastyYear(d.start)} — ${formatDynastyYear(d.end)}`;
  dynastyModalBody.textContent = d.detail || '暂无详细介绍';
  dynastyModalHeader.style.background = `linear-gradient(135deg, ${d.color}33, ${d.color}11)`;
  dynastyModal.classList.add('show');
}

function closeDynastyModal() {
  dynastyModal.classList.remove('show');
}

trackEl.addEventListener('click', (e) => {
  const band = e.target.closest('.dynasty-band');
  if (band) {
    e.stopPropagation();
    const idx = parseInt(band.dataset.dynastyIdx);
    openDynastyModal(idx);
  }
});

dynastyModalClose.addEventListener('click', closeDynastyModal);
dynastyModal.querySelector('.dynasty-modal-backdrop').addEventListener('click', closeDynastyModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (dynastyModal.classList.contains('show')) closeDynastyModal();
    if (eventModal.classList.contains('show')) closeEventModal();
  }
});

// ════════════════════════════════════════════════
//  事件详情弹窗
// ════════════════════════════════════════════════
const eventModal = document.getElementById('eventModal');
const eventModalClose = document.getElementById('eventModalClose');
const eventModalHero = document.getElementById('eventModalHero');
const eventModalImg = document.getElementById('eventModalImg');
const eventModalEmoji = document.getElementById('eventModalEmoji');
const eventModalTag = document.getElementById('eventModalTag');
const eventModalYear = document.getElementById('eventModalYear');
const eventModalTitle = document.getElementById('eventModalTitle');
const eventModalDesc = document.getElementById('eventModalDesc');

function openEventModal(idx) {
  const ev = allEvents[idx];
  if (!ev) return;
  const isChina = ev.type === 'china';
  const tagText = isChina ? '中国' : '世界';

  // 重置 hero 区域
  eventModalHero.className = 'event-modal-hero ' + ev.type;
  eventModalImg.style.display = 'none';
  eventModalEmoji.style.display = 'none';

  if (ev.image) {
    eventModalImg.src = ev.image;
    eventModalImg.alt = ev.title;
    eventModalImg.style.display = 'block';
  } else if (ev.emoji) {
    eventModalEmoji.textContent = ev.emoji;
    eventModalEmoji.style.display = 'flex';
  }

  eventModalTag.className = 'event-modal-tag ' + ev.type;
  eventModalTag.textContent = tagText;
  eventModalYear.textContent = ev.year;
  eventModalTitle.textContent = ev.title;
  eventModalDesc.textContent = ev.desc || '暂无详细介绍';

  eventModal.classList.add('show');
}

function closeEventModal() {
  eventModal.classList.remove('show');
}

eventModalClose.addEventListener('click', closeEventModal);
eventModal.querySelector('.event-modal-backdrop').addEventListener('click', closeEventModal);

// ════════════════════════════════════════════════
//  启动
// ════════════════════════════════════════════════
(async () => {
  try {
    await initDB();
    renderTimeline();
  } catch(err) {
    console.error('[DB] 初始化失败:', err);
    document.getElementById('loadingDetail').textContent = '错误: ' + err.message;
    return;
  }
  document.getElementById('loadingOverlay').classList.add('hidden');
})();

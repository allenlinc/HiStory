// ════════════════════════════════════════════════
//  script.js — HiStory 时间轴主页面
//  common.js 必须在之前加载
// ════════════════════════════════════════════════

let allEvents = [];

// ── 拼音搜索映射（常用汉字 → 拼音首字母）──
const PINYIN_MAP = (() => {
  const m = {};
  const list = [
    '夏xià=x|商shāng=s|周zhōu=z|秦qín=q|汉hàn=h|三国sān=三s|晋jìn=j|南北朝nán=南n|隋suí=s|唐táng=t|五代wǔ=五w|宋sòng=s|元yuán=y|明míng=m|清qīng=q|民国mín=民m|新中国xīn=新x',
    '史前shǐ=史s|元年yuán=元y|中国zhōng=中z|世界shì=世s',
    '战争zhàn=战z|革命gé=革g|建立jiàn=建j|灭亡miè=灭m|统一tǒng=统t|发明fā=发f|发现fā=发f|诞生dàn=诞d|逝世shì=逝s',
    '皇帝huáng=皇h|帝国dì=帝d|王朝wáng=王w|文明wén=文w|文化wén=文w|科学kē=科k|技术jì=技j|艺术yì=艺y|哲学zhé=哲z|宗教zōng=宗z',
    '朝cháo=朝c|代dài=代d|年nián=年n|世纪shì=世s|公元gōng=公g',
  ];
  list.forEach(line => {
    line.split('|').forEach(item => {
      const segs = item.split('=');
      if (segs.length >= 2) {
        const key = segs[0].replace(/[a-zà-ü]+$/i, '');
        const py = segs[segs.length - 1];
        if (key && py) m[key] = py;
      }
    });
  });
  return m;
})();

function getPinyinFirstChar(str) {
  let result = '';
  for (const ch of str) {
    if (PINYIN_MAP[ch]) { result += PINYIN_MAP[ch]; }
    else if (/[a-zA-Z0-9]/.test(ch)) { result += ch.toLowerCase(); }
    else { result += ch; }
  }
  return result;
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
const minYear = -4000;
const maxYear = 2026;

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
for (let y = 1400; y <= 2050; y += 50) { yearTicks.push(y); }

let dynastyData = [];

// ── 时代背景图映射 ──
const ERA_BACKGROUNDS = {
  '史前': 'img/prehistoric-bg.webp',
  '夏': 'img/era-xia.webp',
  '商': 'img/era-bronze.webp',
  '周': 'img/era-zhou.webp',
  '秦': 'img/era-qinhan.webp',
  '汉': 'img/era-han.webp',
  '三国': 'img/era-weijin.webp',
  '晋': 'img/era-weijin.webp',
  '南北朝': 'img/era-weijin.webp',
  '隋': 'img/era-tang.webp',
  '唐': 'img/era-tang.webp',
  '五代': 'img/era-tang.webp',
  '宋': 'img/era-songyuan.webp',
  '元': 'img/era-yuan.webp',
  '明': 'img/era-mingqing.webp',
  '清': 'img/era-qing.webp',
  '民国': 'img/era-republic.webp',
  '新中国': 'img/era-modern.webp',
};

// 双层背景交叉淡入淡出
let bgLayerTurn = 1;
let currentEraBg = null;

function buildAxis(dynasties) {
  dynastyData = dynasties;
  let html = '<div class="timeline-axis">';
  dynasties.forEach((d, i) => {
    const x1 = yearToX(d.start);
    const x2 = yearToX(d.end);
    const w = x2 - x1;
    const showName = w > 80;
    const emoji = DYNASTY_EMOJI[d.name] || '🏛️';
    html += `<div class="dynasty-band" data-dynasty-idx="${i}" style="left:${x1}px;width:${w}px;background:${d.color};opacity:0.6;" role="button" tabindex="0" aria-label="${d.name} 朝代详情">
      ${showName ? `<span class="dynasty-name"><span class="dynasty-emoji" aria-hidden="true">${emoji}</span>${d.name}</span>` : ''}
    </div>`;
  });
  yearTicks.forEach(y => {
    const x = yearToX(y);
    html += `<div class="year-tick" style="left:${x}px;" aria-hidden="true">
      <div class="tick-mark"></div>
      <div class="tick-label">${formatYearShort(y)}</div>
    </div>`;
  });
  html += '</div>';
  return html;
}

function buildNode(ev, type, idx) {
  const mediaHtml = ev.image
    ? `<div class="card-img-wrap"><img class="card-img" src="${ev.image}" alt="${escapeHtml(ev.title)}" loading="lazy"></div>`
    : (ev.emoji ? `<div class="card-emoji"><span aria-hidden="true">${ev.emoji}</span></div>` : '');
  const tagText = type === 'china' ? '中国' : '世界';
  return `
    <div class="event-node ${type}" data-event-idx="${idx}" style="left: ${ev.x}px;" role="button" tabindex="0" aria-label="${tagText}: ${ev.title}（${ev.year}）">
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

// 防碰撞：同类型事件间距不小于 minGap，避免卡片重叠
function spreadCollisions(events, minGap) {
  if (events.length < 2) return;
  events.sort((a, b) => a.x - b.x);
  for (let i = 1; i < events.length; i++) {
    if (events[i].x - events[i - 1].x < minGap) {
      events[i].x = events[i - 1].x + minGap;
    }
  }
  for (let i = events.length - 2; i >= 0; i--) {
    if (events[i + 1].x - events[i].x < minGap) {
      events[i].x = events[i + 1].x - minGap;
    }
  }
}

function renderTimeline() {
  const chinaEvents = queryEvents('china');
  const worldEvents = queryEvents('world');
  const dynasties = queryDynasties();

  chinaEvents.forEach(e => { e.x = yearToX(e.yearNum); });
  worldEvents.forEach(e => { e.x = yearToX(e.yearNum); });

  spreadCollisions(chinaEvents, 210);
  spreadCollisions(worldEvents, 210);

  allEvents = [
    ...chinaEvents.map(e => ({ ...e, type: 'china' })),
    ...worldEvents.map(e => ({ ...e, type: 'world' }))
  ];

  const track = document.getElementById('timelineTrack');
  track.innerHTML = buildAxis(dynasties);
  track.style.width = TOTAL_WIDTH + 'px';
  if (!trackEl) trackEl = track;

  renderedNodes.clear();
  currentX = -400;
  applyTransform();
  updateVisibleNodes();
}

// ════════════════════════════════════════════════
//  虚拟滚动：只渲染可视区域 ±2 屏内的事件卡片
// ════════════════════════════════════════════════
const renderedNodes = new Map();
let postFramePending = false;

function updateVisibleNodes() {
  if (!trackEl || allEvents.length === 0) return;

  const margin = window.innerWidth * 2;
  const leftBound = -currentX - margin;
  const rightBound = -currentX + window.innerWidth + margin;

  for (const [idx, el] of renderedNodes) {
    const ev = allEvents[idx];
    if (!ev || ev.x < leftBound || ev.x > rightBound) {
      el.remove();
      renderedNodes.delete(idx);
    }
  }

  const frag = document.createDocumentFragment();
  let hasNew = false;
  allEvents.forEach((ev, idx) => {
    if (ev.x >= leftBound && ev.x <= rightBound && !renderedNodes.has(idx)) {
      const temp = document.createElement('div');
      temp.innerHTML = buildNode(ev, ev.type, idx);
      const el = temp.firstElementChild;
      frag.appendChild(el);
      renderedNodes.set(idx, el);
      hasNew = true;
    }
  });
  if (hasNew) {
    trackEl.appendChild(frag);
    requestAnimationFrame(() => {
      renderedNodes.forEach((el) => {
        if (!el.classList.contains('rendered')) {
          el.classList.add('rendered');
        }
      });
    });
  }
}

function updateEraBackgroundNow() {
  if (dynastyData.length === 0) return;

  const centerX = -currentX + window.innerWidth / 2;

  let activeDynasty = null;
  for (const d of dynastyData) {
    const x1 = yearToX(d.start);
    const x2 = yearToX(d.end);
    if (centerX >= x1 && centerX <= x2) {
      activeDynasty = d.name;
      break;
    }
  }

  if (!activeDynasty) {
    let minDist = Infinity;
    for (const d of dynastyData) {
      const x1 = yearToX(d.start);
      const x2 = yearToX(d.end);
      const mid = (x1 + x2) / 2;
      const dist = Math.abs(centerX - mid);
      if (dist < minDist) {
        minDist = dist;
        activeDynasty = d.name;
      }
    }
  }

  const bgUrl = ERA_BACKGROUNDS[activeDynasty];
  if (!bgUrl || bgUrl === currentEraBg) return;

  currentEraBg = bgUrl;
  const nextLayer = bgLayerTurn === 1 ? 2 : 1;
  const nextEl = document.getElementById(`eraBg${nextLayer}`);
  const currentEl = document.getElementById(`eraBg${bgLayerTurn}`);

  nextEl.style.backgroundImage = `url('${bgUrl}')`;
  nextEl.classList.add('active');
  if (currentEl) currentEl.classList.remove('active');
  bgLayerTurn = nextLayer;
}

function schedulePostFrameUpdate() {
  if (postFramePending) return;
  postFramePending = true;
  requestAnimationFrame(() => {
    postFramePending = false;
    updateVisibleNodes();
    updateEraBackgroundNow();
  });
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

function applyTransform(skipPostFrame) {
  if (trackEl) {
    trackEl.style.transform = `translate3d(${currentX}px, 0, 0)`;
    if (!skipPostFrame) schedulePostFrameUpdate();
  }
}

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

let momentumRaf = null;
function cancelMomentum() { if (momentumRaf) { cancelAnimationFrame(momentumRaf); momentumRaf = null; } }

function startMomentum(vx) {
  cancelMomentum();
  cancelSmooth();
  let velocity = vx;
  const FRICTION = 0.94;
  const MIN_VELOCITY = 0.3;

  function step() {
    if (Math.abs(velocity) < MIN_VELOCITY) {
      momentumRaf = null;
      schedulePostFrameUpdate();
      return;
    }
    currentX += velocity;
    const min = getMinX();
    if (currentX > MAX_X) { currentX = MAX_X; velocity *= -0.4; if (Math.abs(velocity) < 1) { momentumRaf = null; schedulePostFrameUpdate(); return; } }
    else if (currentX < min) { currentX = min; velocity *= -0.4; if (Math.abs(velocity) < 1) { momentumRaf = null; schedulePostFrameUpdate(); return; } }
    applyTransform(true);
    velocity *= FRICTION;
    momentumRaf = requestAnimationFrame(step);
  }
  momentumRaf = requestAnimationFrame(step);
}

function scrollLoop(timestamp) {
  if (!autoScroll || isDragging) { rafId = null; return; }
  if (!lastTime) lastTime = timestamp;
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  if (!isHovering) {
    currentX -= SCROLL_SPEED * dt;
    clampX();
    if (!scrollLoop.frameCount) scrollLoop.frameCount = 0;
    scrollLoop.frameCount++;
    applyTransform(scrollLoop.frameCount % 10 !== 0);
    if (currentX <= getMinX()) {
      autoScroll = false;
      toggleBtn.classList.remove('active');
      toggleText.textContent = '已暂停';
      rafId = null;
      schedulePostFrameUpdate();
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
let dragHistory = [];

function openEventDetailByNode(node) {
  const idx = parseInt(node.dataset.eventIdx);
  if (!isNaN(idx) && allEvents[idx]) {
    window.open(`detail.html?type=event&idx=${idx}`, '_blank');
  }
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
  clampX();
  applyTransform(true);
  lastPointerX = e.pageX;
  dragHistory.push({ x: e.pageX, t: performance.now() });
  if (dragHistory.length > 6) dragHistory.shift();
}, { passive: true });
window.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  trackEl.style.cursor = 'grab';
  schedulePostFrameUpdate();
  if (mouseDownTarget) {
    const moved = Math.abs(e.pageX - mouseDownX) + Math.abs(e.pageY - mouseDownY);
    if (moved < CLICK_THRESHOLD) openEventDetailByNode(mouseDownTarget);
  }
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
  clampX();
  applyTransform(true);
  lastPointerX = e.touches[0].pageX;
  touchHistory.push({ x: e.touches[0].pageX, t: performance.now() });
  if (touchHistory.length > 6) touchHistory.shift();
}, { passive: true });
trackEl.addEventListener('touchend', (e) => {
  touchActive = false;
  schedulePostFrameUpdate();
  if (touchDownTarget) {
    const t = e.changedTouches[0];
    const moved = Math.abs(t.pageX - touchDownX) + Math.abs(t.pageY - touchDownY);
    if (moved < CLICK_THRESHOLD) openEventDetailByNode(touchDownTarget);
  }
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

// ── 键盘导航（连续 RAF 平滑移动）──
const ARROW_SPEED = 1.2;
let arrowRaf = null;
let arrowDir = 0;

function arrowLoop(timestamp) {
  if (!arrowDir) { arrowRaf = null; return; }
  if (!arrowLoop.lastTime) arrowLoop.lastTime = timestamp;
  const dt = Math.min(timestamp - arrowLoop.lastTime, 50);
  arrowLoop.lastTime = timestamp;
  currentX += arrowDir * ARROW_SPEED * dt;
  clampX();
  applyTransform(true);
  arrowRaf = requestAnimationFrame(arrowLoop);
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (document.activeElement && document.activeElement.id === 'searchInput') return;
  e.preventDefault();
  cancelMomentum();
  cancelSmooth();
  arrowDir = e.key === 'ArrowLeft' ? 1 : -1;
  if (!arrowRaf) {
    arrowLoop.lastTime = 0;
    arrowRaf = requestAnimationFrame(arrowLoop);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  arrowDir = 0;
  schedulePostFrameUpdate();
  const vx = e.key === 'ArrowLeft' ? 2 : -2;
  startMomentum(vx);
});

// ════════════════════════════════════════════════
//  搜索功能（支持拼音）
// ════════════════════════════════════════════════
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBtn = document.getElementById('searchBtn');

function performSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResults.classList.remove('show'); return []; }

  const matches = allEvents.filter(e => {
    const title = String(e.title).toLowerCase();
    const year = String(e.year).toLowerCase();
    const desc = String(e.desc || '').toLowerCase();
    const pinyin = getPinyinFirstChar(e.title);
    return title.includes(q) || year.includes(q) || desc.includes(q) || pinyin.includes(q);
  });

  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="search-no-result">没找到呀 😢</div>';
    searchResults.classList.add('show');
    return [];
  }
  searchResults.innerHTML = matches.map((e, i) => `
    <div class="search-result-item" data-index="${i}" role="option" aria-selected="false">
      <span class="result-year">${e.year}</span>
      <span class="result-title">${e.title}</span>
      <span class="result-type">${e.type === 'china' ? '🇨🇳' : '🌍'}</span>
    </div>
  `).join('');
  searchResults.classList.add('show');
  searchResults.setAttribute('role', 'listbox');
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

  const marker = document.createElement('div');
  marker.className = 'search-marker';
  marker.style.left = ev.x + 'px';
  marker.setAttribute('aria-label', '搜索结果位置');
  marker.innerHTML = `
    <div class="marker-pulse"></div>
    <div class="marker-label">📍 在这里！</div>
  `;
  trackEl.appendChild(marker);

  searchMarkerTimer = setTimeout(() => {
    marker.classList.add('fading');
    setTimeout(() => marker.remove(), 500);
    searchMarkerTimer = null;
  }, 10000);
}

let searchDebounceTimer = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(performSearch, 200);
});
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
//  朝代/事件点击 → 跳转到详情页
// ════════════════════════════════════════════════
trackEl.addEventListener('click', (e) => {
  const band = e.target.closest('.dynasty-band');
  if (band) {
    e.stopPropagation();
    const idx = parseInt(band.dataset.dynastyIdx);
    window.open(`detail.html?type=dynasty&idx=${idx}`, '_blank');
  }
});

// ════════════════════════════════════════════════
//  启动
// ════════════════════════════════════════════════
(async () => {
  const loadingDetail = document.getElementById('loadingDetail');
  const loadingOverlay = document.getElementById('loadingOverlay');

  function showError(msg) {
    loadingDetail.innerHTML = `
      <span style="color:var(--china);">${escapeHtml(msg)}</span>
      <br><br>
      <button onclick="location.reload()" style="
        padding:10px 24px;font-family:'ZCOOL KuaiLe',sans-serif;font-size:16px;
        border:2.5px solid var(--gold);border-radius:24px;background:var(--paper);
        color:var(--ink);cursor:pointer;transition:all 0.2s;
      " onmouseover="this.style.background='var(--gold-soft)'"
         onmouseout="this.style.background='var(--paper)'"
      >🔄 重试</button>
    `;
  }

  try {
    loadingDetail.textContent = '加载 sql.js WASM 引擎…';
    await initDB('3.4');
    loadingDetail.textContent = '数据库加载完成';
    renderTimeline();
    loadingOverlay.classList.add('hidden');
  } catch(err) {
    console.error('[DB] 初始化失败:', err);
    showError(err.message);
  }
})();

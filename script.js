let db = null;
let SQL_module = null;

const CHINA_DATA = [
  ['约前2070', -2070, '夏朝建立', '中国第一个王朝，世袭制开端', null, '👑'],
  ['约前1600', -1600, '商汤灭夏', '青铜文明与甲骨文的辉煌', null, '🏺'],
  ['约前1046', -1046, '武王伐纣', '周朝建立，分封制与礼乐制', null, '⚔️'],
  ['前770',    -770,  '平王东迁', '东周开始，春秋争霸', null, '🏯'],
  ['前551',    -551,  '孔子诞生', '儒家思想创始人', 'img/kongzi.jpg', '📚'],
  ['前221',    -221,  '秦统一六国', '书同文，车同轨，郡县制', 'img/qinshihuang.jpg', '🏯'],
  ['前202',    -202,  '汉朝建立', '刘邦称帝，大一统盛世', null, '🐉'],
  ['105',      105,   '蔡伦造纸', '改良造纸术，影响世界', null, '📜'],
  ['220',      220,   '三国鼎立', '魏蜀吴三分天下', null, '⚔️'],
  ['618',      618,   '大唐建立', '贞观之治，万国来朝', 'img/lisimin.jpg', '👑'],
  ['960',      960,   '北宋建立', '重文轻武，科技昌盛', null, '📖'],
  ['1271',     1271,  '元朝建立', '忽必烈定国号为大元', null, '🐎'],
  ['1368',     1368,  '明朝建立', '朱元璋驱逐蒙元', 'img/zhuyuanzhang.jpg', '🏯'],
  ['1405',     1405,  '郑和下西洋', '七下西洋，航海壮举', 'img/zhenghe.jpg', '⛵'],
  ['1644',     1644,  '清军入关', '明朝灭亡，清朝统治开始', null, '🏹'],
  ['1840',     1840,  '鸦片战争', '近代史开端，国门被打开', null, '⚓'],
  ['1912',     1912,  '中华民国', '两千多年帝制终结', null, '🌅'],
  ['1949',     1949,  '新中国成立', '中华人民共和国成立', null, '🇨🇳'],
  ['1978',     1978,  '改革开放', '现代化建设的新纪元', null, '🚀'],
  ['2008',     2008,  '北京奥运', '百年奥运梦圆北京', null, '🏅'],
];

const WORLD_DATA = [
  ['约前3500', -3500, '两河文明', '苏美尔人发明楔形文字', null, '📝'],
  ['约前3100', -3100, '古埃及统一', '美尼斯统一上下埃及', null, '🔺'],
  ['约前2560', -2560, '胡夫金字塔', '古代世界七大奇迹之一', null, '🏔️'],
  ['约前776',  -776,  '首届奥运会', '古希腊奥林匹亚竞技会', null, '🏃'],
  ['前509',    -509,  '罗马共和国', '罗马建立共和政体', null, '🏛️'],
  ['前336',    -336,  '亚历山大东征', '横跨欧亚非的帝国', null, '🐎'],
  ['前27',     -27,   '罗马帝国', '屋大维称帝，Pax Romana', null, '👑'],
  ['476',      476,   '西罗马灭亡', '欧洲进入中世纪', null, '🏚️'],
  ['622',      622,   '伊斯兰兴起', '穆罕默德创立伊斯兰教', null, '🌙'],
  ['800',      800,   '查理曼加冕', '查理曼帝国建立', null, '👑'],
  ['1096',     1096,  '十字军东征', '持续近两百年的宗教战争', null, '🛡️'],
  ['1453',     1453,  '君士坦丁堡陷落', '拜占庭帝国灭亡', null, '🏰'],
  ['1492',     1492,  '发现新大陆', '哥伦布到达美洲', 'img/columbus.jpg', '🧭'],
  ['1517',     1517,  '宗教改革', '马丁·路德发表论纲', null, '📖'],
  ['1687',     1687,  '牛顿力学', '《自然哲学的数学原理》', 'img/newton.jpg', '🍎'],
  ['1707',     1707,  '英国建国', '英格兰与苏格兰合并，大不列颠王国成立', null, '🇬🇧'],
  ['1769',     1769,  '蒸汽机改良', '瓦特推动工业革命', null, '⚙️'],
  ['1776',     1776,  '美国建国', '《独立宣言》发表，美利坚合众国成立', null, '🇺🇸'],
  ['1789',     1789,  '法国大革命', '自由、平等、博爱', 'img/napoleon.jpg', '🗽'],
  ['1871',     1871,  '德国建国', '普鲁士统一德意志，德意志帝国成立', null, '🇩🇪'],
  ['1879',     1879,  '电灯发明', '爱迪生点亮世界', 'img/edison.jpg', '💡'],
  ['1914',     1914,  '第一次世界大战', '改变世界格局的大战', null, '💥'],
  ['1945',     1945,  '二战结束', '联合国成立，新秩序建立', null, '🕊️'],
  ['1969',     1969,  '人类登月', '阿姆斯特朗踏上月球', 'img/armstrong.jpg', '🌙'],
  ['1989',     1989,  '万维网诞生', '互联网改变世界', null, '🌐'],
  ['2023',     2023,  'AI大模型时代', '生成式AI改变未来', null, '🤖'],
];

const DYNASTY_DATA = [
  ['史前',   -4000, -2070, '#B5C4B1'],
  ['夏',     -2070, -1600, '#D4B896'],
  ['商',     -1600, -1046, '#C88E5A'],
  ['周',     -1046, -256,  '#9FCF6B'],
  ['秦',     -221,  -207,  '#E85D5D'],
  ['汉',     -202,  220,   '#F0B840'],
  ['三国',   220,   280,   '#D9A87A'],
  ['晋',     265,   420,   '#8BB8D4'],
  ['南北朝', 420,   589,   '#B49AE0'],
  ['隋',     581,   618,   '#E88AB0'],
  ['唐',     618,   907,   '#FFA050'],
  ['五代',   907,   960,   '#C0A050'],
  ['宋',     960,   1279,  '#6BB5D9'],
  ['元',     1271,  1368,  '#6A9080'],
  ['明',     1368,  1644,  '#E05050'],
  ['清',     1644,  1912,  '#8060C0'],
  ['民国',   1912,  1949,  '#40A0A0'],
  ['新中国', 1949,  2026,  '#E85060'],
];

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

  loadingDetail.textContent = '尝试加载 timeline.sqlite…';
  try {
    const resp = await fetch('timeline.sqlite');
    if (resp.ok) {
      const buf = await resp.arrayBuffer();
      db = new SQL_module.Database(new Uint8Array(buf));
      const test = db.exec("SELECT count(*) FROM events");
      if (test.length > 0) {
        // 检查是否有 emoji 列，没有则添加
        try { db.exec("SELECT emoji FROM events LIMIT 1"); }
        catch(_) {
          db.run("ALTER TABLE events ADD COLUMN emoji TEXT");
          const allData = [...CHINA_DATA.map(e => [...e, 'china']), ...WORLD_DATA.map(e => [...e, 'world'])];
          const ustmt = db.prepare('UPDATE events SET emoji = ? WHERE year_num = ? AND title = ?');
          allData.forEach(e => { ustmt.run([e[5], e[1], e[2]]); });
          ustmt.free();
        }
        loadingDetail.textContent = '数据库加载完成';
        return;
      }
    }
  } catch(e) {}

  loadingDetail.textContent = '创建内存数据库…';
  db = new SQL_module.Database();
  db.run(`CREATE TABLE events (id INTEGER PRIMARY KEY AUTOINCREMENT, year_label TEXT NOT NULL, year_num INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, type TEXT NOT NULL DEFAULT 'china', image TEXT, emoji TEXT)`);
  db.run(`CREATE TABLE dynasties (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, start_year INTEGER NOT NULL, end_year INTEGER NOT NULL, color TEXT NOT NULL)`);

  const stmt = db.prepare('INSERT INTO events (year_label, year_num, title, description, type, image, emoji) VALUES (?,?,?,?,?,?,?)');
  CHINA_DATA.forEach(e => { stmt.run([e[0], e[1], e[2], e[3], 'china', e[4], e[5]]); });
  WORLD_DATA.forEach(e => { stmt.run([e[0], e[1], e[2], e[3], 'world', e[4], e[5]]); });
  stmt.free();

  const stmt2 = db.prepare('INSERT INTO dynasties (name, start_year, end_year, color) VALUES (?,?,?,?)');
  DYNASTY_DATA.forEach(d => { stmt2.run(d); });
  stmt2.free();
  loadingDetail.textContent = '数据库已就绪';
}

function queryEvents(type) {
  const results = [];
  try {
    const stmt = db.prepare(
      `SELECT year_label AS year, year_num AS yearNum, title, description AS "desc", image, emoji
       FROM events WHERE type = ? ORDER BY year_num`
    );
    stmt.bind([type]);
    while (stmt.step()) { results.push(stmt.getAsObject()); }
    stmt.free();
  } catch(_) {
    const stmt = db.prepare(
      `SELECT year_label AS year, year_num AS yearNum, title, description AS "desc", image
       FROM events WHERE type = ? ORDER BY year_num`
    );
    stmt.bind([type]);
    while (stmt.step()) { results.push({...stmt.getAsObject(), emoji: null}); }
    stmt.free();
  }
  return results;
}

function queryDynasties() {
  const results = [];
  const stmt = db.prepare(`SELECT name, start_year AS start, end_year AS end, color FROM dynasties ORDER BY start_year`);
  while (stmt.step()) { results.push(stmt.getAsObject()); }
  stmt.free();
  return results;
}

// ════════════════════════════════════════════════
//  时间轴渲染
// ════════════════════════════════════════════════
const PADDING = 120;
const TOTAL_WIDTH = 12800;
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

function buildAxis(dynasties) {
  let html = '<div class="timeline-axis">';
  dynasties.forEach(d => {
    const x1 = yearToX(d.start);
    const x2 = yearToX(d.end);
    const w = x2 - x1;
    const showName = w > 50;
    html += `<div class="dynasty-band" style="left:${x1}px;width:${w}px;background:${d.color};opacity:0.55;">
      ${showName ? `<span class="dynasty-name">${d.name}</span>` : ''}
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

function buildNode(ev, type, index) {
  const mediaHtml = ev.image
    ? `<div class="card-img-wrap"><img class="card-img" src="${ev.image}" alt="${ev.title}" loading="lazy"></div>`
    : (ev.emoji ? `<div class="card-emoji"><span>${ev.emoji}</span></div>` : '');
  const tagText = type === 'china' ? '中国' : '世界';
  return `
    <div class="event-node ${type}" style="left: ${ev.x}px; animation-delay: ${index * 0.04}s;">
      <div class="card">
        <div class="card-tag">${tagText}</div>
        ${mediaHtml}
        <div class="card-body">
          <div class="year">${ev.year}</div>
          <div class="title">${ev.title}</div>
          <div class="desc">${ev.desc}</div>
        </div>
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

  let html = '';
  html += buildAxis(dynasties);
  chinaEvents.forEach((ev, i) => { html += buildNode(ev, 'china', i); });
  worldEvents.forEach((ev, i) => { html += buildNode(ev, 'world', i); });

  const track = document.getElementById('timelineTrack');
  track.innerHTML = html;
  track.style.width = TOTAL_WIDTH + 'px';

  currentX = -400;
  applyTransform();
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
  if (track) track.style.transform = `translate3d(${currentX}px, 0, 0)`;
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

function toggleNodeActive(node) {
  const wasActive = node.classList.contains('active');
  document.querySelectorAll('.event-node.active').forEach(n => n.classList.remove('active'));
  if (!wasActive) node.classList.add('active');
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
    if (moved < CLICK_THRESHOLD) toggleNodeActive(mouseDownTarget);
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
  if (!e.target.closest('.event-node') && !e.target.closest('.toggle-btn')) {
    document.querySelectorAll('.event-node.active').forEach(n => n.classList.remove('active'));
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
    if (moved < CLICK_THRESHOLD) toggleNodeActive(touchDownTarget);
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
const ARROW_STEP = 250;
let arrowKey = null, arrowHoldTimer = null;

document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
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

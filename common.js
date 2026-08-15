// ============================================================
//  common.js — HiStory 共享模块
//  sql.js 初始化、数据库查询、工具函数、朝代 emoji 映射
// ============================================================

// ── CDN 回退链 ──
const SQL_CDN_BASES = [
  'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/',
  'https://unpkg.com/sql.js@1.8.0/dist/',
];

// ── 动态加载脚本 ──
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed: ' + src));
    document.head.appendChild(s);
  });
}

// ── 加载 sql.js ──
async function loadSqlJs() {
  try {
    await loadScript('sql-wasm.js');
    if (typeof initSqlJs === 'function') return 'local';
  } catch (_) {}
  for (const base of SQL_CDN_BASES) {
    try {
      await loadScript(base + 'sql-wasm.js');
      if (typeof initSqlJs === 'function') return base;
    } catch (_) {}
  }
  throw new Error('所有 CDN 均无法加载 sql.js');
}

// ── 初始化数据库 ──
let db = null;
let SQL_module = null;

async function initDB(cacheVersion = '3.5') {
  const loadedBase = await loadSqlJs();
  SQL_module = await initSqlJs({
    locateFile: f => loadedBase === 'local' ? f : loadedBase + f
  });

  const resp = await fetch('timeline.sqlite?v=' + cacheVersion);
  if (!resp.ok) {
    throw new Error(`无法加载数据库 (HTTP ${resp.status})`);
  }
  const buf = await resp.arrayBuffer();
  db = new SQL_module.Database(new Uint8Array(buf));

  const test = db.exec("SELECT count(*) FROM events");
  if (!test.length) {
    throw new Error('数据库为空或已损坏');
  }
  return db;
}

// ── 查询函数 ──
function queryEvents(type) {
  const results = [];
  const stmt = db.prepare(
    `SELECT year_label AS year, year_num AS yearNum, title, description AS "desc",
            image, emoji, detail, type
     FROM events WHERE type = ? ORDER BY year_num`
  );
  stmt.bind([type]);
  while (stmt.step()) { results.push(stmt.getAsObject()); }
  stmt.free();
  return results;
}

function queryAllEvents() {
  const results = [];
  const stmt = db.prepare(
    `SELECT year_label AS year, year_num AS yearNum, title, description AS "desc",
            image, emoji, detail, type
     FROM events ORDER BY year_num`
  );
  while (stmt.step()) { results.push(stmt.getAsObject()); }
  stmt.free();
  return results;
}

function queryDynasties() {
  const results = [];
  const stmt = db.prepare(
    `SELECT name, start_year AS start, end_year AS end, color, detail FROM dynasties ORDER BY start_year`
  );
  while (stmt.step()) { results.push(stmt.getAsObject()); }
  stmt.free();
  return results;
}

// ── 朝代 emoji 映射 ──
const DYNASTY_EMOJI = {
  '史前': '🦴', '夏': '🏺', '商': '🐢', '周': '📜',
  '秦': '⚔️', '汉': '🐉', '三国': '🗡️', '晋': '🍵',
  '南北朝': '🏯', '隋': '🌉', '唐': '🎐', '五代': '🔥',
  '宋': '🎨', '元': '🐎', '明': '🏮', '清': '👑',
  '民国': '🌅', '新中国': '🚀',
};

// ── 工具函数 ──
function formatYear(y) {
  if (y < 0) return '前' + Math.abs(y) + '年';
  return y === 0 ? '元年' : y + '年';
}

function formatYearShort(y) {
  if (y < 0) return '前' + Math.abs(y);
  return y === 0 ? '元年' : String(y);
}

function findDynastyForYear(dynasties, yearNum) {
  for (const d of dynasties) {
    if (yearNum >= d.start && yearNum <= d.end) return d;
  }
  return null;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── 构建事件索引（与 timeline 页面一致）──
function buildAllEvents() {
  const china = queryEvents('china');
  const world = queryEvents('world');
  return [
    ...china.map(e => ({ ...e, type: 'china' })),
    ...world.map(e => ({ ...e, type: 'world' }))
  ];
}

// ── 当前年份（动态）──
const CURRENT_YEAR = new Date().getFullYear();

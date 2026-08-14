// ════════════════════════════════════════════════
//  detail.js — HiStory 详情页
//  common.js 必须在之前加载
// ════════════════════════════════════════════════

// ── 渲染事件详情 ──
function renderEventDetail(allEvents, dynasties, idx) {
  const ev = allEvents[idx];
  if (!ev) return renderError();

  const isChina = ev.type === 'china';
  const typeLabel = isChina ? '中国历史' : '世界历史';
  const typeClass = isChina ? 'china' : 'world';
  const emoji = ev.emoji || (isChina ? '🏮' : '🌍');
  const dynasty = findDynastyForYear(dynasties, ev.yearNum);

  // 同期事件（±200年，排除自身）
  const related = allEvents
    .filter((e, i) => i !== idx && Math.abs(e.yearNum - ev.yearNum) <= 200)
    .sort((a, b) => a.yearNum - b.yearNum);

  const longDesc = ev.detail || ev.desc || '暂无详细介绍';

  const heroBg = ev.image
    ? `<img src="${ev.image}" alt="${escapeHtml(ev.title)}">`
    : `<span class="detail-hero-emoji" aria-hidden="true">${emoji}</span>`;

  let html = `
    <div class="detail-hero">
      <div class="detail-hero-bg ${typeClass}">${heroBg}</div>
      <div class="detail-hero-body">
        <div class="detail-badges">
          <span class="detail-badge type-${typeClass}">${typeLabel}</span>
          <span class="detail-badge year-badge">${escapeHtml(ev.year)}</span>
        </div>
        <h1 class="detail-title">${escapeHtml(ev.title)}</h1>
        <div class="detail-subtitle">CHRONICLE · ${formatYearShort(ev.yearNum)}</div>
      </div>
    </div>

    <section class="detail-section">
      <div class="section-title">
        <span class="section-icon" aria-hidden="true">📖</span>
        <span>详细介绍</span>
      </div>
      <div class="detail-text"><p>${escapeHtml(longDesc)}</p></div>
    </section>
  `;

  // 信息卡片
  const infoCards = [];
  if (dynasty) {
    const dIdx = dynasties.indexOf(dynasty);
    infoCards.push(`
      <div class="info-card">
        <div class="info-card-label">🏛️ 所属朝代</div>
        <a href="detail.html?type=dynasty&idx=${dIdx}" class="dynasty-preview" style="margin-top:8px;border:none;padding:0;">
          <div class="dynasty-preview-color" style="background:${dynasty.color};"></div>
          <div class="dynasty-preview-info">
            <div class="dynasty-preview-name">${DYNASTY_EMOJI[dynasty.name] || '🏛️'} ${escapeHtml(dynasty.name)}</div>
            <div class="dynasty-preview-years">${formatYear(dynasty.start)} — ${formatYear(dynasty.end)}</div>
          </div>
        </a>
      </div>
    `);
  }
  infoCards.push(`
    <div class="info-card">
      <div class="info-card-label">📅 距今约</div>
      <div class="info-card-value">${CURRENT_YEAR - ev.yearNum} 年</div>
    </div>
  `);
  infoCards.push(`
    <div class="info-card">
      <div class="info-card-label">🏷️ 分类</div>
      <div class="info-card-value">${typeLabel}</div>
    </div>
  `);
  if (ev.desc && ev.desc !== longDesc) {
    infoCards.push(`
      <div class="info-card">
        <div class="info-card-label">💡 一句话概括</div>
        <div class="info-card-value" style="font-size:15px;">${escapeHtml(ev.desc)}</div>
      </div>
    `);
  }

  html += `
    <section class="detail-section">
      <div class="section-title">
        <span class="section-icon" aria-hidden="true">📋</span>
        <span>基本信息</span>
      </div>
      <div class="info-grid">${infoCards.join('')}</div>
    </section>
  `;

  // 同期事件
  if (related.length > 0) {
    const relatedHtml = related.map((r, i) => {
      const rIdx = allEvents.indexOf(r);
      const rTypeClass = r.type === 'china' ? 'china' : 'world';
      const isCurrent = r.yearNum === ev.yearNum;
      return `
        <a href="detail.html?type=event&idx=${rIdx}" class="related-item ${isCurrent ? 'current' : ''}">
          <span class="related-item-dot ${rTypeClass}"></span>
          <span class="related-item-year">${escapeHtml(r.year)}</span>
          <span class="related-item-title">${escapeHtml(r.title)}</span>
          <span class="related-item-arrow" aria-hidden="true">→</span>
        </a>
      `;
    }).join('');

    html += `
      <section class="detail-section">
        <div class="section-title">
          <span class="section-icon" aria-hidden="true">⏳</span>
          <span>同期大事（前后200年）</span>
        </div>
        <div class="related-list">${relatedHtml}</div>
      </section>
    `;
  }

  return html;
}

// ── 渲染朝代详情 ──
function renderDynastyDetail(allEvents, dynasties, idx) {
  const d = dynasties[idx];
  if (!d) return renderError();

  const emoji = DYNASTY_EMOJI[d.name] || '🏛️';
  const duration = d.end - d.start;

  const periodEvents = allEvents
    .filter(e => e.yearNum >= d.start && e.yearNum <= d.end)
    .sort((a, b) => a.yearNum - b.yearNum);

  const longDesc = d.detail || '暂无详细介绍';

  let html = `
    <div class="detail-hero">
      <div class="detail-hero-bg dynasty" style="background: linear-gradient(135deg, ${d.color}22 0%, ${d.color}11 60%, ${d.color}08 100%);">
        <span class="detail-hero-emoji" aria-hidden="true">${emoji}</span>
      </div>
      <div class="detail-hero-body">
        <div class="detail-badges">
          <span class="detail-badge type-dynasty">🏛️ 朝代</span>
          <span class="detail-badge year-badge">${formatYear(d.start)} — ${formatYear(d.end)}</span>
        </div>
        <h1 class="detail-title">${emoji} ${escapeHtml(d.name)}</h1>
        <div class="detail-subtitle">DYNASTY · 历时 ${duration} 年</div>
      </div>
    </div>

    <section class="detail-section">
      <div class="section-title">
        <span class="section-icon" aria-hidden="true">📖</span>
        <span>朝代介绍</span>
      </div>
      <div class="detail-text"><p>${escapeHtml(longDesc)}</p></div>
    </section>
  `;

  const infoCards = [
    `<div class="info-card">
      <div class="info-card-label">📅 起始</div>
      <div class="info-card-value">${formatYear(d.start)}</div>
    </div>`,
    `<div class="info-card">
      <div class="info-card-label">📅 结束</div>
      <div class="info-card-value">${formatYear(d.end)}</div>
    </div>`,
    `<div class="info-card">
      <div class="info-card-label">⏱️ 历时</div>
      <div class="info-card-value">${duration} 年</div>
    </div>`,
    `<div class="info-card">
      <div class="info-card-label">📝 大事件数</div>
      <div class="info-card-value">${periodEvents.length} 件</div>
    </div>`,
  ];

  html += `
    <section class="detail-section">
      <div class="section-title">
        <span class="section-icon" aria-hidden="true">📋</span>
        <span>基本信息</span>
      </div>
      <div class="info-grid">${infoCards.join('')}</div>
    </section>
  `;

  if (periodEvents.length > 0) {
    const eventsHtml = periodEvents.map(e => {
      const eIdx = allEvents.indexOf(e);
      const eTypeClass = e.type === 'china' ? 'china' : 'world';
      return `
        <a href="detail.html?type=event&idx=${eIdx}" class="related-item">
          <span class="related-item-dot ${eTypeClass}"></span>
          <span class="related-item-year">${escapeHtml(e.year)}</span>
          <span class="related-item-title">${escapeHtml(e.title)}</span>
          <span class="related-item-arrow" aria-hidden="true">→</span>
        </a>
      `;
    }).join('');

    html += `
      <section class="detail-section">
        <div class="section-title">
          <span class="section-icon" aria-hidden="true">📜</span>
          <span>这一时期的大事件</span>
        </div>
        <div class="related-list">${eventsHtml}</div>
      </section>
    `;
  }

  // 前后朝代
  const prevDynasty = idx > 0 ? dynasties[idx - 1] : null;
  const nextDynasty = idx < dynasties.length - 1 ? dynasties[idx + 1] : null;
  const neighbors = [];
  if (prevDynasty) {
    neighbors.push(`
      <a href="detail.html?type=dynasty&idx=${idx - 1}" class="related-item">
        <span class="related-item-dot" style="background:${prevDynasty.color};box-shadow:0 0 0 2px rgba(0,0,0,0.15);"></span>
        <span class="related-item-year">前一个</span>
        <span class="related-item-title">${DYNASTY_EMOJI[prevDynasty.name] || ''} ${escapeHtml(prevDynasty.name)}</span>
        <span class="related-item-arrow" aria-hidden="true">→</span>
      </a>
    `);
  }
  if (nextDynasty) {
    neighbors.push(`
      <a href="detail.html?type=dynasty&idx=${idx + 1}" class="related-item">
        <span class="related-item-dot" style="background:${nextDynasty.color};box-shadow:0 0 0 2px rgba(0,0,0,0.15);"></span>
        <span class="related-item-year">后一个</span>
        <span class="related-item-title">${DYNASTY_EMOJI[nextDynasty.name] || ''} ${escapeHtml(nextDynasty.name)}</span>
        <span class="related-item-arrow" aria-hidden="true">→</span>
      </a>
    `);
  }
  if (neighbors.length > 0) {
    html += `
      <section class="detail-section">
        <div class="section-title">
          <span class="section-icon" aria-hidden="true">🔄</span>
          <span>前后朝代</span>
        </div>
        <div class="related-list">${neighbors.join('')}</div>
      </section>
    `;
  }

  return html;
}

function renderError() {
  return `
    <div class="error-state">
      <div class="error-emoji" aria-hidden="true">🔍</div>
      <div class="error-text">没有找到这条记录<br>请从时间轴页面进入</div>
      <a href="index.html" class="back-btn" style="display:inline-flex;">
        <span class="back-arrow" aria-hidden="true">←</span>
        <span>返回时间轴</span>
      </a>
    </div>
  `;
}

// ── 启动 ──
(async () => {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const content = document.getElementById('detailContent');

  function showError(msg) {
    content.innerHTML = `
      <div class="error-state">
        <div class="error-emoji" aria-hidden="true">😢</div>
        <div class="error-text">加载失败: ${escapeHtml(msg)}</div>
        <button onclick="location.reload()" class="back-btn" style="display:inline-flex;margin-right:12px;">
          <span class="back-arrow">🔄</span>
          <span>重试</span>
        </button>
        <a href="index.html" class="back-btn" style="display:inline-flex;">
          <span class="back-arrow">←</span>
          <span>返回时间轴</span>
        </a>
      </div>
    `;
    content.style.display = 'block';
    loadingOverlay.classList.add('hidden');
  }

  try {
    await initDB('3.3');
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'event';
    const idx = parseInt(params.get('idx')) || 0;

    const allEvents = buildAllEvents();
    const dynasties = queryDynasties();

    if (type === 'dynasty') {
      content.innerHTML = renderDynastyDetail(allEvents, dynasties, idx);
    } else {
      content.innerHTML = renderEventDetail(allEvents, dynasties, idx);
    }
    content.style.display = 'block';
    loadingOverlay.classList.add('hidden');
  } catch (err) {
    console.error('[Detail] 初始化失败:', err);
    showError(err.message);
  }
})();

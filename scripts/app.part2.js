// ── 홈 로봇 유영 ──────────────────────────────────────────
let _botDriftRaf = null;

function startBotDrift() {
  if (_botDriftRaf) cancelAnimationFrame(_botDriftRaf);
  const bot = document.querySelector('.ai-bot');
  if (!bot) return;

  let t = Math.random() * Math.PI * 6;
  let lastTime = null;

  function tick(now) {
    if (!document.getElementById('screen-home')?.classList.contains('active')) {
      _botDriftRaf = null;
      return;
    }
    if (!lastTime) lastTime = now;
    const dt = Math.min(now - lastTime, 50);
    lastTime = now;
    t += dt * 0.00022;

    const x = Math.sin(t) * 12;
    const y = Math.sin(t * 1.4641 + 1.07) * 18;

    bot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    _botDriftRaf = requestAnimationFrame(tick);
  }

  _botDriftRaf = requestAnimationFrame(tick);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.body.dataset.activeScreen = id;
  window.scrollTo(0, 0);
  // Update site header nav active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const map = {
    'screen-home': 'nav-curriculum',
    'screen-review': 'nav-review',
    'screen-wrong-cats': 'nav-review',
    'screen-wrong-note': 'nav-review',
    'screen-collections': 'nav-collections',
    'screen-games': 'nav-games',
    'screen-charge-game': 'nav-games',
    'screen-community': 'nav-community',
    'screen-week': 'nav-curriculum',
    'screen-quiz': null,
    'screen-complete': null,
  };
  const targetId = map[id];
  if (targetId) document.getElementById(targetId)?.classList.add('active');
}

// ── 홈 화면 ───────────────────────────────────────────────
function showHome(options = {}) {
  showScreen('screen-home');
  if (!options.skipHistory) setAppHistory({ screen: 'home' }, options);
  const progress = getProgress();
  const availableWeeks = getAvailableWeeks();
  const totalDisplay = Math.max(4, availableWeeks[availableWeeks.length - 1] || 1);

  // streak (학습한 날 수 기반 단순 계산)
  const allDays = Object.values(progress).filter(v => v.completed);
  const streakDays = allDays.length;
  document.getElementById('streak-days').innerHTML = `${streakDays}<span>일째</span>`;
  const barsEl = document.getElementById('streak-bars');
  barsEl.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const bar = document.createElement('div');
    bar.className = 'streak-bar' + (i < Math.min(streakDays, 7) ? ' on' : '');
    barsEl.appendChild(bar);
  }

  const completedWeeks = availableWeeks.filter(w => {
    const availableDays = getAvailableDayCount(w);
    return availableDays > 0 && Array.from({ length: availableDays }, (_, i) => i + 1)
      .every(d => progress[`w${w}d${d}`]?.completed);
  }).length;
  document.getElementById('week-meta').textContent = `${completedWeeks}/${totalDisplay}`;

  const list = document.getElementById('week-list');
  list.innerHTML = '';
  for (let w = 1; w <= totalDisplay; w++) {
    const isAvailable = availableWeeks.includes(w);
    const availableDays = isAvailable ? getAvailableDayCount(w) : 0;
    const completedDays = Array.from({ length: availableDays }, (_, i) => i + 1)
      .filter(d => progress[`w${w}d${d}`]?.completed).length;
    const pct = availableDays > 0 ? Math.round(completedDays / availableDays * 100) : 0;
    const color = WEEK_COLORS[(w - 1) % WEEK_COLORS.length];
    const asym  = WEEK_ASYMS[(w - 1) % WEEK_ASYMS.length];
    const name  = WEEK_NAMES[w] || `${w}주차`;
    const iconNum = String(w).padStart(2, '0');

    const card = document.createElement('div');
    card.className = `week-card c-${color} ${asym}` + (isAvailable ? '' : ' locked');
    card.innerHTML = `
      <div class="accent-stripe"></div>
      <div class="week-card-inner">
        <div class="week-icon">${isAvailable ? iconNum : '🔒'}</div>
        <div class="week-info">
          <div class="week-name">${name}</div>
          <div class="week-stat">
            ${isAvailable
              ? `<span>${completedDays}/${availableDays}일</span><span style="color:var(--line)">·</span><span class="week-pct">${pct}%</span>`
              : `<span style="color:var(--ink-mute)">준비 중</span>`}
          </div>
        </div>
        ${pct >= 100 && isAvailable ? `<span class="week-badge">★ 완료</span>` : ''}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>`;
    if (isAvailable) card.addEventListener('click', () => showWeekDetail(w));
    list.appendChild(card);
  }

  const favs = getFavorites();
  const stats = getTermStats();
  const correctIds = Object.keys(stats).filter(id => stats[id].correct > 0 && !favs.includes(id));
  const weakIds = getWeakTermIds();
  const completedDaysTotal = Object.values(progress).filter(value => value.completed).length;
  const totalDays = getTotalAvailableDays();
  const nextTarget = getNextStudyTarget();

  document.getElementById('summary-terms').textContent = String(state.allTerms.length);
  document.getElementById('summary-days').textContent = `${completedDaysTotal}/${totalDays}`;
  document.getElementById('summary-review').textContent = String(new Set([...favs, ...weakIds]).size);
  const continueBtn = document.getElementById('home-continue-btn');
  continueBtn.textContent = `${nextTarget.week}주차 ${nextTarget.day}일차 이어하기`;
  continueBtn.disabled = totalDays === 0;
  const weakBtn = document.getElementById('home-weak-btn');
  weakBtn.textContent = weakIds.length > 0 ? `약점 ${weakIds.length}개 복습` : '약점 복습';
  weakBtn.disabled = weakIds.length === 0;

  const reviewSection = document.getElementById('review-section');
  reviewSection.style.display = 'block';
  document.getElementById('wrong-count').textContent = `${favs.length}`;
  document.getElementById('correct-count').textContent = `${correctIds.length}`;
  const wrongCard = document.getElementById('wrong-review-card');
  const correctCard = document.getElementById('correct-review-card');
  wrongCard.style.display = '';
  correctCard.style.display = '';
  wrongCard.disabled = favs.length === 0;
  correctCard.disabled = correctIds.length === 0;

  renderLevelSection();
  renderCategoryAccuracy();
  renderTodaySummary();
  startBotDrift();
}

// ── 주차 상세 ─────────────────────────────────────────────
function showWeekDetail(week, options = {}) {
  state.currentWeek = week;
  showScreen('screen-week');
  if (!options.skipHistory) setAppHistory({ screen: 'week', week }, options);
  const name = WEEK_NAMES[week] || `${week}주차`;
  document.getElementById('week-title').textContent = name;

  const progress = getProgress();
  const list = document.getElementById('day-list');
  const availableDays = getAvailableDayCount(week);
  list.innerHTML = '';
  for (let d = 1; d <= 7; d++) {
    const key = `w${week}d${d}`;
    const prevKey = `w${week}d${d - 1}`;
    const dayProg = progress[key];
    const isCompleted = dayProg?.completed;
    const hasTerms = d <= availableDays && getDayTerms(week, d).length > 0;
    const isUnlocked = hasTerms && (d === 1 || progress[prevKey]?.completed);

    const item = document.createElement('div');
    item.className = 'day-item'
      + (isCompleted ? ' done' : '')
      + (!isUnlocked && !isCompleted ? ' locked' : '');

    if (!hasTerms) {
      item.innerHTML = `
        <div class="day-info">
          <div class="day-label">${d}일차</div>
          <div class="day-hint">용어 준비 중</div>
        </div>
        <span class="day-status">🔒</span>`;
    } else if (isCompleted) {
      item.innerHTML = `
        <div class="day-info">
          <div class="day-label">${d}일차</div>
          <div class="day-score">점수 ${dayProg.score} / 10</div>
        </div>
        <span class="day-status done-icon">✓</span>`;
    } else if (isUnlocked) {
      item.innerHTML = `
        <div class="day-info">
          <div class="day-label">${d}일차</div>
          <div class="day-hint">10문제</div>
        </div>
        <span class="day-status">→</span>`;
      item.addEventListener('click', () => startQuiz(week, d));
    } else {
      item.innerHTML = `
        <div class="day-info">
          <div class="day-label">${d}일차</div>
          <div class="day-hint">이전 날 완료 후 해금</div>
        </div>
        <span class="day-status">🔒</span>`;
    }
    list.appendChild(item);
  }
}

// ── 일반 퀴즈 시작 ────────────────────────────────────────
function startQuiz(week, day, options = {}) {
  state.mode = 'daily';
  state.currentWeek = week;
  state.currentDay = day;
  state.sessionTerms = getDayTerms(week, day);
  if (state.sessionTerms.length === 0) {
    showWeekDetail(week, { replaceHistory: true });
    return;
  }
  state.sessionIndex = 0;
  state.sessionScore = 0;
  state.sessionWrong = 0;
  state.sessionSkip  = 0;
  state.wrongIds = [];

  document.getElementById('btn-back-week').dataset.mode = 'daily';
  document.getElementById('review-controls').style.display = 'none';
  document.getElementById('quiz-total').textContent = ` / ${state.sessionTerms.length}`;
  showScreen('screen-quiz');
  if (!options.skipHistory) setAppHistory({ screen: 'quiz', week, day }, options);
  renderQuestion();
}

// ── 틀린 것 카테고리 화면 ────────────────────────────────
function showWrongCategories(options = {}) {
  showScreen('screen-wrong-cats');
  if (!options.skipHistory) setAppHistory({ screen: 'wrong-cats' }, options);
  const favIds = getFavorites();
  const favTerms = state.allTerms.filter(t => favIds.includes(t.id));

  document.getElementById('wrong-cats-total').textContent = favIds.length;

  const catCounts = {};
  favTerms.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });

  const grid = document.getElementById('wrong-cat-list');
  grid.innerHTML = '';

  Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const color = CAT_COLORS[cat] || WEEK_COLORS[Object.keys(catCounts).indexOf(cat) % WEEK_COLORS.length];
      const glyph = CAT_GLYPHS[cat] || cat.slice(0, 2);
      const card = document.createElement('div');
      card.className = 'cat-card asym-tl';
      card.innerHTML = `
        <div class="accent-stripe" style="background:${COLOR_CSS[color]}"></div>
        <div class="cat-card-glyph" style="color:${COLOR_CSS[color]}">${glyph}</div>
        <div class="cat-card-count" style="color:${COLOR_CSS[color]}">${count}</div>
        <div class="cat-card-bottom">
          <div class="cat-card-name">${cat}</div>
          <div class="cat-card-sub">단어 →</div>
        </div>`;
      card.style.background = `linear-gradient(135deg, ${COLOR_SOFT[color]}, rgba(255,255,255,0.92))`;
      card.style.border = `1px solid var(--line)`;
      card.addEventListener('click', () => startWrongReview(cat));
      grid.appendChild(card);
    });
}

function getCorrectReviewIds() {
  const stats = getTermStats();
  const favIds = getFavorites();
  return Object.keys(stats).filter(id => stats[id].correct > 0 && !favIds.includes(id));
}

function showReviewCenter(options = {}) {
  showScreen('screen-review');
  if (!options.skipHistory) setAppHistory({ screen: 'review' }, options);
  document.getElementById('review-wrong-total').textContent = String(getFavorites().length);
  document.getElementById('review-correct-total').textContent = String(getCorrectReviewIds().length);
  document.getElementById('review-weak-total').textContent = String(getWeakTermIds().length);
  document.getElementById('review-note-total').textContent = String(getFavorites().length);
}

function showWrongNote(options = {}) {
  showScreen('screen-wrong-note');
  if (!options.skipHistory) setAppHistory({ screen: 'wrong-note' }, options);
  const favIds = getFavorites();
  const list = document.getElementById('wrong-note-list');
  const terms = state.allTerms.filter(term => favIds.includes(term.id));
  if (terms.length === 0) {
    list.innerHTML = '<div class="wrong-note-card"><p>아직 오답 노트에 저장된 용어가 없습니다.</p></div>';
    return;
  }
  list.innerHTML = '';
  terms.forEach(term => {
    const card = document.createElement('div');
    card.className = 'wrong-note-card';
    card.innerHTML = `
      <div class="wrong-note-top">
        <strong>${term.term}</strong>
        <span class="wrong-note-meta">${term.week}주차 · ${term.category}</span>
      </div>
      <p>${term.definition}</p>
      <div class="wrong-note-hint">힌트: ${term.hint || '힌트가 없습니다.'}</div>
      ${buildTermDetailBlock(term)}
      <div class="term-result-actions">
        <button class="wrong-note-quiz-btn" data-term-id="${term.id}">다시 풀기</button>
      </div>`;
    list.appendChild(card);
  });
  list.querySelectorAll('[data-term-id]').forEach(button => {
    button.addEventListener('click', () => startTermPractice(button.dataset.termId));
  });
}

function buildBeginnerTermDetail(term) {
  const difficultyText = {
    easy: '기초 단계에서 자주 나오기 때문에 먼저 편하게 익혀두면 좋습니다.',
    medium: '기초 개념과 연결해서 보면 훨씬 이해하기 쉽습니다.',
    hard: '처음에는 낯설 수 있지만, 역할을 하나씩 나누어 보면 이해할 수 있습니다.',
  }[term.difficulty] || '코딩을 이해할 때 자주 만나는 개념입니다.';
  const hint = term.hint || '핵심 힌트를 떠올리며 의미를 연결해보세요.';

  return [
    `쉽게 말해 "${term.term}"는 "${hint}"처럼 생각하면 됩니다. 처음에는 정확한 문장보다 머릿속에 떠오르는 그림을 만드는 것이 더 중요합니다.`,
    `왜 필요할까요? ${term.category}에서는 코드를 읽고, 고치고, 설명할 때 이런 용어를 자주 씁니다. 이 말을 알면 설명을 들을 때 "아, 이 역할을 말하는구나" 하고 따라가기 쉬워집니다.`,
    `기본 설명은 "${term.definition}"입니다. 이 문장을 한 번에 외우려 하지 말고, "무엇을 하는가", "언제 쓰는가", "무엇과 헷갈릴 수 있는가"로 나누어 읽어보세요.`,
    `${difficultyText} 퀴즈에서는 설명 속 핵심 역할을 먼저 찾고, 보기 중 그 역할과 가장 가까운 단어를 고르면 됩니다.`,
  ];
}

function buildTermDetailBlock(term) {
  const paragraphs = buildBeginnerTermDetail(term);
  return `
    <details class="term-detail">
      <summary>자세히 알기</summary>
      <div class="term-detail-body">
        ${paragraphs.map(text => `<p>${text}</p>`).join('')}
      </div>
    </details>`;
}

function showCollections(options = {}) {
  showScreen('screen-collections');
  if (!options.skipHistory) setAppHistory({ screen: 'collections' }, options);
  populateTermFilters();

  const progress = getProgress();
  const favCount = getFavorites().length;
  const correctCount = getCorrectReviewIds().length;
  const weeks = getAvailableWeeks();
  const list = document.getElementById('collections-list');
  list.innerHTML = '';

  weeks.forEach(week => {
    const availableDays = getAvailableDayCount(week);
    const completedDays = Array.from({ length: availableDays }, (_, i) => i + 1)
      .filter(day => progress[`w${week}d${day}`]?.completed).length;
    const row = document.createElement('div');
    row.className = 'utility-row';
    row.innerHTML = `<strong>${WEEK_NAMES[week] || `${week}주차`}</strong><span>${completedDays}/${availableDays}일차 완료</span>`;
    row.addEventListener('click', () => showWeekDetail(week));
    list.appendChild(row);
  });

  const reviewRow = document.createElement('div');
  reviewRow.className = 'utility-row';
  reviewRow.innerHTML = `<strong>복습 컬렉션</strong><span>틀린 문제 ${favCount}개 · 맞힌 문제 ${correctCount}개</span>`;
  reviewRow.addEventListener('click', () => showReviewCenter());
  list.appendChild(reviewRow);

  renderTermSearchResults(document.getElementById('term-search-input')?.value || '');
}

function populateTermFilters() {
  const categorySelect = document.getElementById('term-category-filter');
  if (!categorySelect || categorySelect.dataset.ready === 'true') return;
  const categories = [...new Set(state.allTerms.map(term => term.category))].sort();
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  categorySelect.dataset.ready = 'true';
}

function renderTermSearchResults(query) {
  const resultsEl = document.getElementById('term-search-results');
  if (!resultsEl) return;
  const value = query.trim().toLowerCase();
  const categoryFilter = document.getElementById('term-category-filter')?.value || 'all';
  const difficultyFilter = document.getElementById('term-difficulty-filter')?.value || 'all';
  resultsEl.innerHTML = '';

  const matches = state.allTerms
    .filter(term =>
      (!value
        || term.term.toLowerCase().includes(value)
        || term.definition.toLowerCase().includes(value)
        || term.category.toLowerCase().includes(value)
        || (term.hint || '').toLowerCase().includes(value))
      && (categoryFilter === 'all' || term.category === categoryFilter)
      && (difficultyFilter === 'all' || term.difficulty === difficultyFilter)
    )
    .slice(0, 12);

  if (matches.length === 0) {
    resultsEl.innerHTML = '<div class="term-result-card"><p>검색 결과가 없습니다.</p></div>';
    return;
  }

  matches.forEach(term => {
    const card = document.createElement('div');
    card.className = 'term-result-card';
    card.innerHTML = `
      <div class="term-result-top">
        <strong>${term.term}</strong>
        <span>${term.week}주차 · ${term.category}</span>
      </div>
      <p>${term.definition}</p>
      ${buildTermDetailBlock(term)}
      <div class="term-result-actions">
        <button class="term-quiz-btn" data-term-id="${term.id}">퀴즈로 풀기</button>
      </div>`;
    resultsEl.appendChild(card);
  });
  resultsEl.querySelectorAll('[data-term-id]').forEach(button => {
    button.addEventListener('click', () => startTermPractice(button.dataset.termId));
  });
}

function showCommunity(options = {}) {
  showScreen('screen-community');
  if (!options.skipHistory) setAppHistory({ screen: 'community' }, options);

  const completed = Object.values(getProgress()).filter(value => value.completed).length;
  const wrong = getFavorites().length;
  document.getElementById('community-today').textContent =
    completed > 0
      ? `${completed}개 일차 완료 · 복습할 문제 ${wrong}개`
      : '아직 완료한 일차가 없습니다.';
}

function showGames(options = {}) {
  showScreen('screen-games');
  if (!options.skipHistory) setAppHistory({ screen: 'games' }, options);
}

function getRandomTerms(count) {
  return [...state.allTerms]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

function getChargeTermPool(mode = 'all') {
  if (mode === 'weak') {
    const weakIds = new Set(getWeakTermIds());
    const weakPool = state.allTerms.filter(term => weakIds.has(term.id));
    return {
      terms: weakPool.length > 0 ? weakPool : state.allTerms,
      label: weakPool.length > 0 ? '약점 전용' : '약점 없음 · 전체 랜덤',
    };
  }

  if (mode === 'week') {
    const w = state.chargeGame.selectedWeek || getNextStudyTarget().week;
    const weekTerms = state.allTerms.filter(term => term.week === w);
    return {
      terms: weekTerms.length > 0 ? weekTerms : state.allTerms,
      label: `${w}주차 전용`,
    };
  }

  return { terms: state.allTerms, label: '전체 랜덤' };
}

function pickChargeTerms(mode, count) {
  const pool = getChargeTermPool(mode);
  return {
    label: pool.label,
    terms: [...pool.terms].sort(() => Math.random() - 0.5).slice(0, count),
  };
}

function buildChargeChoices(term) {
  const sameCat = state.allTerms.filter(t => t.id !== term.id && t.category === term.category);
  const diffCat = state.allTerms.filter(t => t.id !== term.id && t.category !== term.category);
  const wrong = [...sameCat].sort(() => Math.random() - 0.5).slice(0, 2).map(t => t.term);
  let i = 0;
  const shuffledDiff = [...diffCat].sort(() => Math.random() - 0.5);
  while (wrong.length < 3 && i < shuffledDiff.length) wrong.push(shuffledDiff[i++].term);
  const pool = [term.term, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);
  pool.push('모르겠음');
  return pool;
}

function ensureChargeAudio() {
  const game = state.chargeGame;
  if (!game.audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    game.audio = new AudioContext();
  }
  if (game.audio.state === 'suspended') game.audio.resume();
  return game.audio;
}

function playChargeSound(type, combo) {
  const game = state.chargeGame;
  if (!game.soundOn) return;
  const audio = ensureChargeAudio();
  if (!audio) return;

  const now = audio.currentTime;
  const comboMult = (type === 'correct' && combo > 1) ? 1 + Math.min(1.4, (combo - 1) * 0.14) : 1;
  const vol = type === 'wrong' ? 0.12 : Math.min(0.22, 0.16 + (combo || 0) * 0.012);

  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(vol, now + 0.018);
  master.gain.exponentialRampToValueAtTime(0.0001, now + (type === 'complete' ? 0.72 : 0.34));
  master.connect(audio.destination);

  const makeTone = (freq, start, duration, wave = 'sine') => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.8, now + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(gain).connect(master);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.04);
  };

  if (type === 'correct') {
    makeTone(420 * comboMult, 0, 0.12, 'triangle');
    makeTone(760 * comboMult, 0.07, 0.18, 'sawtooth');
  } else if (type === 'wrong') {
    makeTone(170, 0, 0.22, 'sawtooth');
    makeTone(92, 0.08, 0.24, 'square');
  } else if (type === 'complete') {
    makeTone(440, 0, 0.18, 'triangle');
    makeTone(660, 0.12, 0.18, 'triangle');
    makeTone(990, 0.24, 0.28, 'sine');
  }
}

function spawnShockwaves(kind, combo) {
  const wrap = document.getElementById('charge-robot-wrap');
  if (!wrap) return;
  const isCombo = kind === 'correct' && combo >= 3;
  const count = kind === 'correct' ? (isCombo ? 3 : 2) : 1;
  const cls = isCombo ? 'sw-combo' : (kind === 'correct' ? 'sw-correct' : 'sw-wrong');
  for (let i = 0; i < count; i++) {
    const sw = document.createElement('div');
    sw.className = `charge-shockwave ${cls}`;
    sw.style.animationDelay = `${i * 110}ms`;
    wrap.appendChild(sw);
    window.setTimeout(() => sw.remove(), 900 + i * 110);
  }
}

function spawnParticles(kind, combo) {
  const wrap = document.getElementById('charge-robot-wrap');
  if (!wrap) return;
  const isCombo = kind === 'correct' && combo >= 3;
  const count = kind === 'correct' ? (isCombo ? 22 : 14) : 10;
  const cls = isCombo ? 'pt-combo' : (kind === 'correct' ? 'pt-correct' : 'pt-wrong');
  const baseRadius = isCombo ? 110 : 85;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
    const dist = baseRadius * (0.65 + Math.random() * 0.7);
    const dx = Math.round(Math.cos(angle) * dist);
    const dy = Math.round(Math.sin(angle) * dist);
    const size = 5 + Math.round(Math.random() * 7);
    const dur = (0.5 + Math.random() * 0.35).toFixed(2);
    const delay = Math.round(Math.random() * 55);
    const p = document.createElement('div');
    p.className = `charge-particle ${cls}`;
    p.style.cssText = `--pdx:${dx}px;--pdy:${dy}px;--pdur:${dur}s;width:${size}px;height:${size}px;animation-delay:${delay}ms`;
    wrap.appendChild(p);
    window.setTimeout(() => p.remove(), 1100);
  }
}

function spawnAuraFlare(kind, combo) {
  const wrap = document.getElementById('charge-robot-wrap');
  if (!wrap) return;
  const isCombo = kind === 'correct' && combo >= 3;
  const cls = isCombo ? 'flare-combo' : (kind === 'correct' ? 'flare-correct' : 'flare-wrong');
  const flare = document.createElement('div');
  flare.className = `charge-aura-flare ${cls}`;
  wrap.appendChild(flare);
  window.setTimeout(() => flare.remove(), 750);
}


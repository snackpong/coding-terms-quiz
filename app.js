// ── 상태 ──────────────────────────────────────────────────
const state = {
  allTerms: [],
  mode: 'daily',
  currentWeek: null,
  currentDay: null,
  sessionTerms: [],
  sessionIndex: 0,
  sessionScore: 0,
  sessionWrong: 0,
  sessionSkip: 0,
  wrongIds: [],
  answered: false,
  reviewCategory: 'all',
  restoringHistory: false,
  appHistoryDepth: 0,
  chargeGame: {
    battery: 35,
    combo: 0,
    maxCombo: 0,
    score: 0,
    round: 0,
    maxRounds: 10,
    terms: [],
    currentTerm: null,
    answered: false,
    finished: false,
    sourceMode: 'all',
    sourceLabel: '전체 랜덤',
    soundOn: true,
    audio: null,
    auraLevel: 1,
    correctCount: 0,
    wrongCount: 0,
    selectedWeek: 1,
    villainEnergy: 100,
    wrongTerms: [],
  },
};

// ── 디자인 상수 ───────────────────────────────────────────
const WEEK_COLORS = ['violet', 'coral', 'amber', 'sky', 'mint'];
const WEEK_ASYMS  = ['asym-tl', 'asym-tr', 'asym-br', 'asym-bl', 'asym-tl'];
const WEEK_NAMES  = [
  '',
  '프로그래밍 기초', '변수와 자료형', '조건문과 반복문', '함수와 스코프',
  'AI / 머신러닝', '웹 기초', '네트워크', '자료구조',
  '알고리즘', '데이터베이스', '운영체제', '버전 관리',
];

const CAT_COLORS = {
  '프로그래밍 기초': 'violet', 'AI / 머신러닝': 'coral', '웹 기초': 'sky',
  '자료구조': 'amber', '알고리즘': 'mint', '데이터베이스': 'violet',
  '운영체제': 'coral', '네트워크': 'sky', '버전 관리': 'amber',
  '변수와 자료형': 'coral', '조건문과 반복문': 'amber', '함수와 스코프': 'sky',
  'AI/ML': 'coral', '개발 도구': 'amber', '데이터': 'violet',
  '웹/네트워킹': 'sky', '웹/데이터': 'violet', '인프라': 'mint',
  '아키텍처': 'mint',
};
const CAT_GLYPHS = {
  '프로그래밍 기초': '{}', 'AI / 머신러닝': 'AI', '웹 기초': '<>',
  '자료구조': '[]', '알고리즘': 'fn', '데이터베이스': 'DB',
  '운영체제': 'OS', '네트워크': '~~', '버전 관리': 'git',
  '변수와 자료형': ':=', '조건문과 반복문': 'if', '함수와 스코프': 'fn',
  'AI/ML': 'AI', '개발 도구': 'dev', '데이터': '01',
  '웹/네트워킹': 'net', '웹/데이터': 'DB', '인프라': 'ops',
  '아키텍처': 'arc',
};
const COLOR_CSS = {
  violet: 'var(--violet)', coral: 'var(--coral)', amber: 'var(--amber)',
  sky: 'var(--sky)', mint: 'var(--mint)',
};
const COLOR_SOFT = {
  violet: 'var(--violet-soft)', coral: 'var(--coral-soft)', amber: 'var(--amber-soft)',
  sky: 'var(--sky-soft)', mint: 'var(--mint-soft)',
};

// ── 레벨 시스템 ────────────────────────────────────────────
const LEVELS = [
  { level: 1, name: '입문자',      xp: 0     },
  { level: 2, name: '견습생',      xp: 500   },
  { level: 3, name: '학습자',      xp: 2000  },
  { level: 4, name: '주니어',      xp: 5000  },
  { level: 5, name: '개발자',      xp: 9000  },
  { level: 6, name: 'AI 엔지니어', xp: 14000 },
  { level: 7, name: '마스터',      xp: 17000 },
];

function getTotalXP() {
  const stats = getTermStats();
  return Object.values(stats).reduce((sum, s) => sum + (s.correct || 0), 0) * 10;
}

function getCurrentLevel() {
  const xp = getTotalXP();
  let idx = 0;
  // ?lv=N 파라미터로 레벨 강제 미리보기
  const previewLv = parseInt(new URLSearchParams(window.location.search).get('lv'));
  if (previewLv >= 1 && previewLv <= 7) {
    idx = previewLv - 1;
  } else {
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xp) idx = i;
    }
  }
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const pct = next
    ? Math.min(100, Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100))
    : 100;
  return { current, next, xp, pct };
}

function getCategoryAccuracy() {
  const stats = getTermStats();
  const cats = {};
  state.allTerms.forEach(term => {
    const cat = term.category;
    if (!cats[cat]) cats[cat] = { correct: 0, seen: 0 };
    const s = stats[term.id];
    if (s) {
      cats[cat].seen   += s.seen    || 0;
      cats[cat].correct += s.correct || 0;
    }
  });
  return cats;
}

const LEVEL_ROBOT_IMGS = {
  1: 'assets/ai-robot.png',
  2: 'assets/level-robots/lv2-robot.png',
  3: 'assets/level-robots/lv3-robot.png',
  4: 'assets/level-robots/lv4-robot.png',
  5: 'assets/level-robots/lv5-robot.png',
  6: 'assets/level-robots/lv6-robot.png',
  7: 'assets/level-robots/lv7-robot.png',
};

function updateRobotImage() {
  const { current } = getCurrentLevel();
  const src = LEVEL_ROBOT_IMGS[current.level] || LEVEL_ROBOT_IMGS[1];
  const botImg  = document.getElementById('ai-bot-img');
  const cardImg = document.getElementById('level-robot-img');
  if (botImg)  botImg.src  = src;
  if (cardImg) cardImg.src = src;
}

function renderLevelSection() {
  const { current, next, xp, pct } = getCurrentLevel();
  const numEl   = document.getElementById('level-num');
  const nameEl  = document.getElementById('level-name');
  const fillEl  = document.getElementById('level-xp-fill');
  const textEl  = document.getElementById('level-xp-text');
  const maxEl   = document.getElementById('level-max-badge');
  if (!numEl) return;
  numEl.textContent  = current.level;
  nameEl.textContent = current.name;
  fillEl.style.width = `${pct}%`;
  if (next) {
    textEl.textContent   = `${xp.toLocaleString()} / ${next.xp.toLocaleString()} XP`;
    if (maxEl) maxEl.style.display = 'none';
  } else {
    textEl.textContent   = `${xp.toLocaleString()} XP — 마스터 달성!`;
    if (maxEl) maxEl.style.display = '';
  }
}

function renderCategoryAccuracy() {
  const list = document.getElementById('cat-accuracy-list');
  if (!list) return;
  const catData = getCategoryAccuracy();
  const entries = Object.entries(catData).filter(([, d]) => d.seen > 0)
    .sort((a, b) => (b[1].correct / b[1].seen) - (a[1].correct / a[1].seen));
  if (entries.length === 0) {
    list.innerHTML = '<div class="cat-accuracy-empty">퀴즈를 풀면 카테고리별 정답률이 표시됩니다.</div>';
    return;
  }
  list.innerHTML = entries.map(([cat, d]) => {
    const pct   = Math.round((d.correct / d.seen) * 100);
    const color = CAT_COLORS[cat] || 'violet';
    return `<div class="cat-acc-row">
      <div class="cat-acc-label">${cat}</div>
      <div class="cat-acc-bar-wrap"><div class="cat-acc-bar c-${color}" style="width:${pct}%"></div></div>
      <div class="cat-acc-pct">${pct}%</div>
    </div>`;
  }).join('');
}

// ── localStorage 헬퍼 ──────────────────────────────────────
function getProgress()      { return JSON.parse(localStorage.getItem('quiz_progress')   || '{}'); }
function saveProgress(data) { localStorage.setItem('quiz_progress', JSON.stringify(data)); }
function getFavorites()     { return JSON.parse(localStorage.getItem('quiz_favorites')  || '[]'); }
function getTermStats()     { return JSON.parse(localStorage.getItem('quiz_term_stats') || '{}'); }

function addFavorite(termId) {
  const favs = getFavorites();
  if (!favs.includes(termId)) {
    favs.push(termId);
    localStorage.setItem('quiz_favorites', JSON.stringify(favs));
  }
}

function updateTermStat(termId, isCorrect) {
  const stats = getTermStats();
  if (!stats[termId]) stats[termId] = { seen: 0, correct: 0 };
  stats[termId].seen++;
  if (isCorrect) stats[termId].correct++;
  localStorage.setItem('quiz_term_stats', JSON.stringify(stats));
}

// ── 데이터 로딩 ────────────────────────────────────────────
async function init() {
  const res = await fetch('data/terms.json');
  const data = await res.json();
  state.allTerms = data.terms;
  initGameWeekSelector();
  const route = parseRouteHash(window.location.hash);
  if (route && route.screen !== 'home') {
    restoreRoute(route);
    setAppHistory(route, { replaceHistory: true });
  } else {
    showHome({ replaceHistory: true });
  }
}

function parseRouteHash(hash) {
  const value = (hash || '').replace(/^#/, '');
  if (!value || value === 'home') return { screen: 'home' };
  if (value.startsWith('week-')) return { screen: 'week', week: Number(value.slice(5)) };
  if (value.startsWith('quiz-')) {
    const [, week, day] = value.match(/^quiz-(\d+)-(\d+)$/) || [];
    if (week && day) return { screen: 'quiz', week: Number(week), day: Number(day) };
  }
  if (value === 'wrong-review') return { screen: 'wrong-cats' };
  if (value.startsWith('wrong-review-')) {
    return { screen: 'wrong-review', category: decodeURIComponent(value.slice(13)) || 'all' };
  }
  if (value === 'correct-review') return { screen: 'correct-review' };
  if (value === 'weak-review') return { screen: 'weak-review' };
  if (value === 'review') return { screen: 'review' };
  if (value === 'collections') return { screen: 'collections' };
  if (value === 'games') return { screen: 'games' };
  if (value === 'charge-game') return { screen: 'charge-game' };
  if (value === 'community') return { screen: 'community' };
  if (value.startsWith('complete-')) {
    const [, week, day] = value.match(/^complete-(\d+)-(\d+)$/) || [];
    if (week && day) return { screen: 'complete', week: Number(week), day: Number(day) };
  }
  return { screen: 'home' };
}

function routeHash(route) {
  if (!route || route.screen === 'home') return '#home';
  if (route.screen === 'week') return `#week-${route.week}`;
  if (route.screen === 'quiz') return `#quiz-${route.week}-${route.day}`;
  if (route.screen === 'wrong-cats') return '#wrong-review';
  if (route.screen === 'wrong-review') return `#wrong-review-${encodeURIComponent(route.category || 'all')}`;
  if (route.screen === 'correct-review') return '#correct-review';
  if (route.screen === 'weak-review') return '#weak-review';
  if (route.screen === 'review') return '#review';
  if (route.screen === 'collections') return '#collections';
  if (route.screen === 'games') return '#games';
  if (route.screen === 'charge-game') return '#charge-game';
  if (route.screen === 'community') return '#community';
  if (route.screen === 'complete') return `#complete-${route.week}-${route.day}`;
  return '#home';
}

function setAppHistory(route, options = {}) {
  if (state.restoringHistory || !window.history) return;
  const historyState = { quizRoute: route };
  const method = options.replaceHistory ? 'replaceState' : 'pushState';
  window.history[method](historyState, '', routeHash(route));
  if (method === 'replaceState') state.appHistoryDepth = 0;
  else state.appHistoryDepth++;
}

function goBackOr(fallback) {
  if (state.appHistoryDepth > 0) {
    window.history.back();
    return;
  }
  fallback();
}

function restoreRoute(route) {
  state.restoringHistory = true;
  try {
    if (!route || route.screen === 'home') showHome({ skipHistory: true });
    else if (route.screen === 'week') showWeekDetail(route.week, { skipHistory: true });
    else if (route.screen === 'quiz') startQuiz(route.week, route.day, { skipHistory: true });
    else if (route.screen === 'wrong-cats') showWrongCategories({ skipHistory: true });
    else if (route.screen === 'wrong-review') startWrongReview(route.category || 'all', { skipHistory: true });
    else if (route.screen === 'correct-review') startCorrectReview({ skipHistory: true });
    else if (route.screen === 'weak-review') startWeakReview({ skipHistory: true });
    else if (route.screen === 'review') showReviewCenter({ skipHistory: true });
    else if (route.screen === 'collections') showCollections({ skipHistory: true });
    else if (route.screen === 'games') showGames({ skipHistory: true });
    else if (route.screen === 'charge-game') startChargeGame({ skipHistory: true, mode: 'all' });
    else if (route.screen === 'community') showCommunity({ skipHistory: true });
    else if (route.screen === 'complete') showWeekDetail(route.week, { skipHistory: true });
    else showHome({ skipHistory: true });
  } finally {
    state.restoringHistory = false;
  }
}

// ── 주차/일차 헬퍼 ────────────────────────────────────────
function getAvailableWeeks() {
  return [...new Set(state.allTerms.map(t => t.week))].sort((a, b) => a - b);
}

function getWeekTermCount(week) {
  return state.allTerms.filter(t => t.week === week).length;
}

function getAvailableDayCount(week) {
  return Math.min(7, Math.ceil(getWeekTermCount(week) / 10));
}

function getTotalAvailableDays() {
  return getAvailableWeeks().reduce((sum, week) => sum + getAvailableDayCount(week), 0);
}

function getNextStudyTarget() {
  const progress = getProgress();
  for (const week of getAvailableWeeks()) {
    const availableDays = getAvailableDayCount(week);
    for (let day = 1; day <= availableDays; day++) {
      if (!progress[`w${week}d${day}`]?.completed) return { week, day };
    }
  }
  const weeks = getAvailableWeeks();
  const week = weeks[0] || 1;
  return { week, day: 1 };
}

function getDayTerms(week, day) {
  return state.allTerms
    .filter(t => t.week === week)
    .sort((a, b) => parseInt(a.id) - parseInt(b.id))
    .slice((day - 1) * 10, day * 10);
}

// ── SRS ───────────────────────────────────────────────────
function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickReviewTerm() {
  const favIds = getFavorites();
  let pool = state.allTerms.filter(t => favIds.includes(t.id));
  if (state.reviewCategory !== 'all') pool = pool.filter(t => t.category === state.reviewCategory);
  if (pool.length === 0) return null;
  const stats = getTermStats();
  const weights = pool.map(t => {
    const s = stats[t.id] || { seen: 0, correct: 0 };
    return Math.max(1, (s.seen - s.correct) * 3 + 1);
  });
  return weightedRandom(pool, weights);
}

function pickCorrectTerm() {
  const stats = getTermStats();
  const favIds = getFavorites();
  let pool = state.allTerms.filter(t => {
    const s = stats[t.id];
    return s && s.correct > 0 && !favIds.includes(t.id);
  });
  if (state.reviewCategory !== 'all') pool = pool.filter(t => t.category === state.reviewCategory);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getWeakTermIds() {
  const stats = getTermStats();
  const favIds = new Set(getFavorites());
  return state.allTerms
    .map(term => {
      const s = stats[term.id] || { seen: 0, correct: 0 };
      const wrong = Math.max(0, s.seen - s.correct);
      const isFavorite = favIds.has(term.id);
      const score = wrong * 3 + (isFavorite ? 2 : 0) + Math.max(0, 3 - s.correct);
      return { term, score, wrong, seen: s.seen };
    })
    .filter(item => item.score > 0 && (item.wrong > 0 || favIds.has(item.term.id)))
    .sort((a, b) => b.score - a.score || b.seen - a.seen)
    .map(item => item.term.id);
}

function pickWeakTerm() {
  const ids = getWeakTermIds();
  if (ids.length === 0) return null;
  const pool = state.allTerms.filter(term => ids.includes(term.id));
  const stats = getTermStats();
  const favIds = new Set(getFavorites());
  const weights = pool.map(term => {
    const s = stats[term.id] || { seen: 0, correct: 0 };
    const wrong = Math.max(0, s.seen - s.correct);
    return Math.max(1, wrong * 4 + (favIds.has(term.id) ? 3 : 0));
  });
  return weightedRandom(pool, weights);
}

// ── 화면 전환 ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  // Update site header nav active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const map = {
    'screen-home': 'nav-curriculum',
    'screen-review': 'nav-review',
    'screen-wrong-cats': 'nav-review',
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
  updateRobotImage();
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
}

function showCollections(options = {}) {
  showScreen('screen-collections');
  if (!options.skipHistory) setAppHistory({ screen: 'collections' }, options);

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

function renderTermSearchResults(query) {
  const resultsEl = document.getElementById('term-search-results');
  if (!resultsEl) return;
  const value = query.trim().toLowerCase();
  resultsEl.innerHTML = '';

  if (!value) return;

  const matches = state.allTerms
    .filter(term =>
      term.term.toLowerCase().includes(value)
      || term.definition.toLowerCase().includes(value)
      || term.category.toLowerCase().includes(value)
      || term.hint.toLowerCase().includes(value)
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
      <p>${term.definition}</p>`;
    resultsEl.appendChild(card);
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

function triggerScreenShake() {
  const stage = document.getElementById('charge-stage');
  if (!stage) return;
  stage.classList.remove('stage-shake');
  void stage.offsetWidth;
  stage.classList.add('stage-shake');
  window.setTimeout(() => stage.classList.remove('stage-shake'), 500);
}

function spawnComboBurst(combo) {
  if (combo < 3) return;
  const wrap = document.getElementById('charge-robot-wrap');
  if (!wrap) return;
  const burst = document.createElement('div');
  burst.className = 'charge-combo-burst burst-combo';
  burst.textContent = `COMBO ×${combo}!`;
  wrap.appendChild(burst);
  window.setTimeout(() => burst.remove(), 980);
}

function triggerVillainHit(combo) {
  const wrap = document.getElementById('charge-villain-wrap');
  if (!wrap) return;
  wrap.classList.remove('villain-hit');
  void wrap.offsetWidth;
  wrap.classList.add('villain-hit');
  window.setTimeout(() => wrap.classList.remove('villain-hit'), 520);
  spawnTravelParticles('villain-to-ai', combo);
  // 쇼크웨이브 (villain wrap 기준)
  const count = (combo || 0) >= 3 ? 3 : 2;
  for (let i = 0; i < count; i++) {
    const sw = document.createElement('div');
    sw.className = 'charge-shockwave sw-villain-drain';
    wrap.appendChild(sw);
    window.setTimeout(() => sw.remove(), 780);
  }
  state.chargeGame.villainEnergy = Math.max(0, state.chargeGame.villainEnergy - ((combo || 0) >= 3 ? 16 : 10));
  updateChargeAura();
}

function triggerVillainSurge() {
  const wrap = document.getElementById('charge-villain-wrap');
  if (wrap) {
    wrap.classList.remove('villain-surge');
    void wrap.offsetWidth;
    wrap.classList.add('villain-surge');
    window.setTimeout(() => wrap.classList.remove('villain-surge'), 580);
  }
  spawnTravelParticles('ai-to-villain', 0);
  state.chargeGame.villainEnergy = Math.min(100, state.chargeGame.villainEnergy + 9);
  updateChargeAura();
}

function spawnTravelParticles(direction, combo) {
  const aiWrap      = document.getElementById('charge-robot-wrap');
  const villainWrap = document.getElementById('charge-villain-wrap');
  if (!aiWrap || !villainWrap) return;
  const fromEl = direction === 'villain-to-ai' ? villainWrap : aiWrap;
  const toEl   = direction === 'villain-to-ai' ? aiWrap     : villainWrap;
  const fromRect = fromEl.getBoundingClientRect();
  const toRect   = toEl.getBoundingClientRect();
  const toX = toRect.left + toRect.width  / 2;
  const toY = toRect.top  + toRect.height / 2;
  const count = direction === 'villain-to-ai' ? Math.min(16, 8 + (combo || 0) * 2) : 8;
  const cls   = direction === 'villain-to-ai' ? 'tp-energy' : 'tp-drain';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = `travel-particle ${cls}`;
    const sx = fromRect.left + fromRect.width  * (0.1 + Math.random() * 0.8);
    const sy = fromRect.top  + fromRect.height * (0.1 + Math.random() * 0.8);
    p.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;z-index:1600;pointer-events:none;`;
    p.style.setProperty('--tx', `${toX - sx + (Math.random() - 0.5) * 36}px`);
    p.style.setProperty('--ty', `${toY - sy + (Math.random() - 0.5) * 36}px`);
    p.style.animationDelay = `${i * 0.032 + Math.random() * 0.06}s`;
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 1100);
  }
}

function firePositionedBeam(fromEl, toEl, kind, combo) {
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  const cx1 = fromRect.left + fromRect.width / 2;
  const cy1 = fromRect.top + fromRect.height / 2;
  const cx2 = toRect.left + toRect.width / 2;
  const cy2 = toRect.top + toRect.height / 2;

  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  const comboScale = Math.min(4.0, 1 + (combo || 0) * 0.42);
  const thickness = kind === 'correct' ? Math.round(22 * comboScale) : 24;
  const glowSz = kind === 'correct' ? Math.round(52 * comboScale) : 48;
  const glowColor = kind === 'correct'
    ? `rgba(0,229,160,0.98), 0 0 ${Math.round(80 * comboScale)}px rgba(91,184,255,0.85), 0 0 ${Math.round(130 * comboScale)}px rgba(0,229,160,0.4)`
    : 'rgba(255,40,100,0.98), 0 0 72px rgba(180,0,255,0.85), 0 0 130px rgba(255,40,80,0.4)';

  const outer = document.createElement('div');
  outer.style.cssText = [
    'position:fixed',
    `left:${cx1}px`,
    `top:${cy1}px`,
    `width:${Math.max(10, dist)}px`,
    `height:${thickness}px`,
    `transform:rotate(${angle}deg) translateY(-50%)`,
    'transform-origin:0 50%',
    'z-index:1500',
    'pointer-events:none',
    'border-radius:999px',
    'overflow:visible',
  ].join(';');

  const inner = document.createElement('div');
  inner.className = `beam-dyn-inner ${kind === 'correct' ? 'beam-dyn-correct' : 'beam-dyn-drain'}`;
  inner.style.cssText = `box-shadow:0 0 ${glowSz}px ${glowColor};`;
  outer.appendChild(inner);
  document.body.appendChild(outer);

  void inner.offsetWidth;
  inner.classList.add('beam-dyn-fire');
  window.setTimeout(() => outer.remove(), 800);
}

function triggerChargeImpact(kind, label, clickedBtn, combo) {
  const floatEl = document.getElementById('charge-float');
  const fill = document.getElementById('charge-battery-fill');
  const flash = document.getElementById('charge-screen-flash');
  const robotWrap = document.getElementById('charge-robot-wrap');

  if (!floatEl) return;

  // Floating delta text
  floatEl.textContent = label;
  floatEl.className = 'charge-float';
  void floatEl.offsetWidth;
  floatEl.classList.add('float-active', kind === 'correct' ? 'float-correct' : 'float-drain');
  window.setTimeout(() => floatEl.classList.remove('float-active', 'float-correct', 'float-drain'), 1000);

  // Battery bar kick
  fill?.classList.remove('kick');
  void fill?.offsetWidth;
  fill?.classList.add('kick');
  window.setTimeout(() => fill?.classList.remove('kick'), 360);

  // Screen flash
  if (flash) {
    flash.className = 'charge-screen-flash';
    void flash.offsetWidth;
    flash.classList.add(kind === 'correct' ? 'flash-correct' : 'flash-wrong');
    window.setTimeout(() => { flash.className = 'charge-screen-flash'; }, 520);
  }

  // Spectacular impact effects
  const c = combo || 0;
  spawnShockwaves(kind, c);
  spawnParticles(kind, c);
  spawnAuraFlare(kind, c);
  if (kind !== 'correct') {
    triggerScreenShake();
  } else {
    spawnComboBurst(c);
  }

  const villainWrap = document.getElementById('charge-villain-wrap');

  if (kind !== 'correct') {
    // Wrong: robot shakes and villain surges immediately
    if (robotWrap) {
      robotWrap.classList.remove('robot-shake');
      void robotWrap.offsetWidth;
      robotWrap.classList.add('robot-shake');
      window.setTimeout(() => robotWrap.classList.remove('robot-shake'), 500);
    }
    if (villainWrap && robotWrap) {
      firePositionedBeam(robotWrap, villainWrap, 'drain', 0);
      triggerVillainSurge();
    }
  } else {
    // Correct: charge → compress → fire ki projectile
    if (robotWrap) {
      robotWrap.classList.remove('robot-charge');
      void robotWrap.offsetWidth;
      robotWrap.classList.add('robot-charge');
      window.setTimeout(() => robotWrap.classList.remove('robot-charge'), 540);
    }

    // Spawn ki orb at robot chest
    const orb = robotWrap ? document.createElement('div') : null;
    if (orb) {
      orb.className = 'charge-ki-orb';
      robotWrap.appendChild(orb);
    }

    // Compress orb at peak, then launch projectile
    window.setTimeout(() => {
      if (orb) orb.classList.add('ki-compress');

      window.setTimeout(() => {
        if (orb) orb.remove();
        if (!robotWrap || !villainWrap) return;

        // Get chest positions for projectile travel
        const fromRect = robotWrap.getBoundingClientRect();
        const toRect   = villainWrap.getBoundingClientRect();
        const fromX = fromRect.left + fromRect.width  * 0.50;
        const fromY = fromRect.top  + fromRect.height * 0.42;
        const toX   = toRect.left  + toRect.width    * 0.50;
        const toY   = toRect.top   + toRect.height   * 0.42;
        const dist  = Math.hypot(toX - fromX, toY - fromY);
        const dur   = Math.max(200, Math.min(380, dist * 0.55));

        const proj = document.createElement('div');
        proj.className = 'ki-projectile';
        proj.style.left = `${fromX}px`;
        proj.style.top  = `${fromY}px`;
        proj.style.setProperty('--ki-tx', `${toX - fromX}px`);
        proj.style.setProperty('--ki-ty', `${toY - fromY}px`);
        proj.style.setProperty('--ki-dur', `${dur}ms`);
        document.body.appendChild(proj);

        // On impact
        window.setTimeout(() => {
          proj.remove();
          const core = robotWrap.querySelector('.charge-core');
          if (core) {
            core.classList.remove('core-burst');
            void core.offsetWidth;
            core.classList.add('core-burst');
            window.setTimeout(() => core.classList.remove('core-burst'), 650);
          }
          firePositionedBeam(villainWrap, robotWrap, 'correct', c);
          triggerVillainHit(c);
          if (c >= 3) {
            window.setTimeout(() => firePositionedBeam(villainWrap, robotWrap, 'correct', Math.max(0, c - 1)), 60);
            window.setTimeout(() => firePositionedBeam(villainWrap, robotWrap, 'correct', Math.max(0, c - 2)), 130);
          }
        }, dur);

      }, 130); // compress duration
    }, 400); // charge-up duration before compress
  }
}

function updateChargeAura() {
  const game = state.chargeGame;
  const wrap = document.getElementById('charge-robot-wrap');
  if (!wrap) return;
  const level = Math.max(0, Math.min(10, game.auraLevel));
  const scale = 0.76 + level * 0.078;        // level 0: 0.76 → level 10: 1.54
  const intensity = 0.14 + level * 0.096;     // level 0: 0.14 → level 10: 1.1 (capped)
  const blur = 16 + level * 9.2;              // level 0: 16px → level 10: 108px

  wrap.style.setProperty('--charge-aura-scale', scale.toFixed(3));
  wrap.style.setProperty('--charge-aura-intensity', Math.min(1, intensity).toFixed(3));
  wrap.style.setProperty('--charge-aura-blur', `${blur.toFixed(0)}px`);
  wrap.dataset.auraLevel = String(Math.round(level));

  const aura = wrap.querySelector('.charge-robot-aura');
  if (aura) {
    aura.style.transform = `scale(${scale.toFixed(3)})`;
    aura.style.opacity = String(Math.min(1, 0.52 + Math.min(1, intensity) * 0.52).toFixed(3));
  }

  // 빌런 아우라 — villainEnergy(0~100)에 비례
  const villainWrap = document.getElementById('charge-villain-wrap');
  if (villainWrap) {
    const vLevel = game.villainEnergy / 10;
    const vScale = 0.70 + vLevel * 0.068;
    const vIntensity = 0.12 + vLevel * 0.090;
    const vBlur = 14 + vLevel * 7.4;
    villainWrap.style.setProperty('--villain-aura-scale', vScale.toFixed(3));
    villainWrap.style.setProperty('--villain-aura-intensity', Math.min(1, vIntensity).toFixed(3));
    villainWrap.style.setProperty('--villain-aura-blur', `${vBlur.toFixed(0)}px`);
    const vAura = villainWrap.querySelector('.charge-villain-aura');
    if (vAura) {
      vAura.style.transform = `scale(${vScale.toFixed(3)})`;
      vAura.style.opacity = String(Math.min(1, 0.5 + Math.min(1, vIntensity) * 0.56).toFixed(3));
    }
    const vFill = document.getElementById('villain-energy-fill');
    if (vFill) vFill.style.width = `${Math.max(0, Math.min(100, game.villainEnergy))}%`;
  }
}

function updateCannonCharge() {
  // cannon removed; villain energy fill handled by updateChargeAura
}

function changeChargeAura(delta) {
  const game = state.chargeGame;
  game.auraLevel = Math.max(0, Math.min(10, game.auraLevel + delta));
  updateChargeAura();
}

function startChargeGame(options = {}) {
  const game = state.chargeGame;
  const sourceMode = typeof options === 'string' ? options : options.mode || game.sourceMode || 'all';
  const gameOptions = typeof options === 'string' ? {} : options;
  game.battery = 35;
  game.combo = 0;
  game.maxCombo = 0;
  game.score = 0;
  game.round = 0;
  game.maxRounds = 10;
  game.correctCount = 0;
  game.wrongCount = 0;
  game.villainEnergy = 100;
  game.wrongTerms = [];
  const picked = pickChargeTerms(sourceMode, game.maxRounds);
  game.sourceMode = sourceMode;
  game.sourceLabel = picked.label;
  game.terms = picked.terms;
  game.currentTerm = null;
  game.answered = false;
  game.finished = false;
  game.auraLevel = 1;

  const overlay = document.getElementById('charge-result-overlay');
  if (overlay) { overlay.className = 'charge-result-overlay'; overlay.style.display = 'none'; }

  showScreen('screen-charge-game');
  document.getElementById('charge-mode-label').textContent = `AI CORE REACTOR · ${game.sourceLabel}`;
  document.getElementById('btn-charge-sound').textContent = game.soundOn ? 'Sound On' : 'Sound Off';
  document.getElementById('btn-charge-sound').setAttribute('aria-pressed', String(game.soundOn));
  if (!gameOptions.skipHistory) setAppHistory({ screen: 'charge-game' }, gameOptions);
  updateChargeAura();
  renderChargeQuestion();
}

function setChargeStageState(kind) {
  const stage = document.getElementById('charge-stage');
  stage.className = 'charge-stage';
  if (state.chargeGame.battery <= 22) stage.classList.add('low');
  if (kind) stage.classList.add(kind);
}

function updateChargeHud(statusText, stageKind) {
  const game = state.chargeGame;
  const battery = Math.max(0, Math.min(100, Math.round(game.battery)));
  document.getElementById('charge-battery-text').textContent = `${battery}%`;
  document.getElementById('charge-battery-fill').style.width = `${battery}%`;
  document.getElementById('charge-combo').textContent = String(game.combo);
  document.getElementById('charge-round').textContent = `${Math.min(game.round + 1, game.maxRounds)}/${game.maxRounds}`;
  document.getElementById('charge-score').textContent = String(game.score);
  document.getElementById('charge-status').textContent = statusText;
  setChargeStageState(stageKind);
  updateCannonCharge();
}

function renderChargeQuestion() {
  const game = state.chargeGame;
  game.answered = false;
  game.currentTerm = game.terms[game.round];

  if (!game.currentTerm) {
    finishChargeGame(game.battery >= 100 ? 'complete' : 'done');
    return;
  }

  updateChargeHud(game.battery <= 22 ? '배터리가 낮습니다. 정확히 충전하세요.' : '정답을 맞히면 에너지가 충전됩니다.');
  updateChargeAura();
  updateCannonCharge();
  document.getElementById('charge-definition').textContent = game.currentTerm.definition;
  document.getElementById('charge-feedback').textContent = '';
  document.getElementById('charge-next-btn').style.display = 'none';
  document.getElementById('charge-next-btn').textContent = '다음 →';

  const cannon = document.getElementById('charge-cannon');
  if (cannon) cannon.className = 'charge-cannon';

  const choicesEl = document.getElementById('charge-choices');
  choicesEl.innerHTML = '';
  buildChargeChoices(game.currentTerm).forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'charge-choice' + (choice === '모르겠음' ? ' dont-know' : '');
    btn.dataset.choice = choice;
    btn.textContent = choice === '모르겠음' ? '0. 모르겠음' : `${index + 1}. ${choice}`;
    btn.addEventListener('click', () => handleChargeAnswer(choice, btn));
    choicesEl.appendChild(btn);
  });
}

function handleChargeAnswer(choice, clickedBtn) {
  const game = state.chargeGame;
  if (game.answered || game.finished) return;
  game.answered = true;

  const term = game.currentTerm;
  const isCorrect = choice === term.term;
  const isSkip = choice === '모르겠음';
  let delta = 0;

  document.querySelectorAll('.charge-choice').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.choice === term.term) btn.classList.add('correct');
    else if (btn !== clickedBtn) btn.classList.add('dim');
  });

  if (isCorrect) {
    game.combo++;
    game.maxCombo = Math.max(game.maxCombo, game.combo);
    game.correctCount++;
    const bonus = game.combo >= 3 ? 4 : 0;
    delta = 12 + bonus;
    changeChargeAura(1.1 + Math.min(2.2, game.combo * 0.38));
    game.score += 10 + bonus;
    updateTermStat(term.id, true);
    document.getElementById('charge-feedback').textContent =
      bonus > 0 ? `정답입니다. 콤보 보너스 +${bonus}% 충전!` : '정답입니다. 에너지가 충전됐습니다.';
  } else {
    clickedBtn.classList.add('wrong');
    game.combo = 0;
    game.wrongCount++;
    game.wrongTerms.push(term.term);
    delta = isSkip ? -3 : -8;
    changeChargeAura(isSkip ? -0.8 : -1.8);
    addFavorite(term.id);
    updateTermStat(term.id, false);
    document.getElementById('charge-feedback').textContent =
      isSkip ? `정답은 ${term.term}입니다. 약점 목록에 저장했습니다.` : `정답은 ${term.term}입니다. 배터리가 감소했습니다.`;
  }

  game.battery = Math.max(0, Math.min(100, game.battery + delta));
  updateChargeHud(isCorrect ? '충전 성공' : '충전 불안정', isCorrect ? 'correct' : 'wrong');
  triggerChargeImpact(isCorrect ? 'correct' : 'wrong', `${delta > 0 ? '+' : ''}${delta}%`, clickedBtn, game.combo);
  playChargeSound(isCorrect ? 'correct' : 'wrong', game.combo);

  if (game.battery >= 100) {
    finishChargeGame('complete');
    return;
  }
  if (game.battery <= 0) {
    finishChargeGame('fail');
    return;
  }

  document.getElementById('charge-next-btn').style.display = 'inline-flex';
}

function nextChargeQuestion() {
  const game = state.chargeGame;
  if (!game.answered || game.finished) return;
  game.round++;
  if (game.round >= game.maxRounds) {
    finishChargeGame(game.battery >= 70 ? 'done' : 'fail');
    return;
  }
  renderChargeQuestion();
}

function finishChargeGame(result) {
  const game = state.chargeGame;
  game.finished = true;
  const complete = result === 'complete';
  const fail = result === 'fail';
  setChargeStageState(complete ? 'complete' : fail ? 'wrong' : 'correct');
  playChargeSound(complete ? 'complete' : fail ? 'wrong' : 'correct', 0);
  document.getElementById('charge-choices').innerHTML = '';
  document.getElementById('charge-next-btn').style.display = 'none';

  // Show result overlay
  const overlay = document.getElementById('charge-result-overlay');
  if (!overlay) return;
  document.getElementById('res-result-kicker').textContent = complete ? 'COMPLETE' : fail ? 'GAME OVER' : 'ROUND END';
  document.getElementById('res-result-title').textContent = complete ? '충전 완료!' : fail ? '방전됐습니다' : '라운드 종료';
  document.getElementById('res-battery').textContent = `${Math.round(game.battery)}%`;
  document.getElementById('res-score').textContent = String(game.score);
  document.getElementById('res-combo').textContent = String(game.maxCombo);
  document.getElementById('res-correct').textContent = String(game.correctCount);
  document.getElementById('res-wrong').textContent = String(game.wrongCount);
  const totalAnswered = game.correctCount + game.wrongCount;
  document.getElementById('res-accuracy').textContent =
    totalAnswered > 0 ? `${Math.round(game.correctCount / totalAnswered * 100)}%` : '—';
  // 틀린 용어 목록
  const wrongSection = document.getElementById('res-wrong-terms-section');
  const wrongList    = document.getElementById('res-wrong-list');
  if (wrongSection && wrongList) {
    const terms = [...new Set(game.wrongTerms)].slice(0, 6);
    wrongList.innerHTML = terms.map(t => `<span class="res-wrong-term">${t}</span>`).join('');
    wrongSection.style.display = terms.length > 0 ? 'block' : 'none';
  }
  overlay.className = `charge-result-overlay ${complete ? 'result-complete' : fail ? 'result-fail' : 'result-done'}`;
  overlay.style.display = 'flex';
  window.requestAnimationFrame(() => overlay.classList.add('visible'));
}

function initGameWeekSelector() {
  const seg = document.getElementById('game-week-seg');
  if (!seg || !state.allTerms.length) return;
  const weeks = [...new Set(state.allTerms.map(t => t.week))].sort((a, b) => a - b);
  seg.innerHTML = '';
  weeks.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'game-week-btn' + (w === state.chargeGame.selectedWeek ? ' selected' : '');
    btn.textContent = `${w}주차`;
    btn.addEventListener('click', () => {
      state.chargeGame.selectedWeek = w;
      seg.querySelectorAll('.game-week-btn').forEach(b => b.classList.toggle('selected', b === btn));
    });
    seg.appendChild(btn);
  });
}

// ── 틀린 것 복습 시작 ─────────────────────────────────────
function startWrongReview(category = 'all', options = {}) {
  const favIds = getFavorites();
  const favTerms = state.allTerms.filter(t => favIds.includes(t.id));
  if (favTerms.length === 0) return;

  state.mode = 'review';
  state.reviewCategory = category;

  const categories = [...new Set(favTerms.map(t => t.category))].sort();
  const select = document.getElementById('category-select');
  select.innerHTML = '<option value="all">전체 카테고리</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = `${cat} (${favTerms.filter(t => t.category === cat).length})`;
    select.appendChild(opt);
  });
  select.value = category;

  document.getElementById('btn-back-week').dataset.mode = 'review';
  document.getElementById('quiz-progress').textContent = `✗ ${favIds.length}개`;
  document.getElementById('quiz-num').textContent = '–';
  document.getElementById('quiz-total').textContent = '';
  document.getElementById('quiz-progress-fill').style.width = '0%';
  document.getElementById('review-controls').style.display = 'block';

  showScreen('screen-quiz');
  if (!options.skipHistory) setAppHistory({ screen: 'wrong-review', category }, options);
  renderQuestion(pickReviewTerm());
}

// ── 맞은 것 복습 시작 ─────────────────────────────────────
function startCorrectReview(options = {}) {
  const stats = getTermStats();
  const favIds = getFavorites();
  const correctTerms = state.allTerms.filter(t => {
    const s = stats[t.id];
    return s && s.correct > 0 && !favIds.includes(t.id);
  });
  if (correctTerms.length === 0) return;

  state.mode = 'correct-review';
  state.reviewCategory = 'all';

  const categories = [...new Set(correctTerms.map(t => t.category))].sort();
  const select = document.getElementById('category-select');
  select.innerHTML = '<option value="all">전체 카테고리</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = `${cat} (${correctTerms.filter(t => t.category === cat).length})`;
    select.appendChild(opt);
  });

  document.getElementById('btn-back-week').dataset.mode = 'correct-review';
  document.getElementById('quiz-progress').textContent = `✓ ${correctTerms.length}개`;
  document.getElementById('quiz-num').textContent = '–';
  document.getElementById('quiz-total').textContent = '';
  document.getElementById('quiz-progress-fill').style.width = '0%';
  document.getElementById('review-controls').style.display = 'block';

  showScreen('screen-quiz');
  if (!options.skipHistory) setAppHistory({ screen: 'correct-review' }, options);
  renderQuestion(pickCorrectTerm());
}

function startWeakReview(options = {}) {
  const weakIds = getWeakTermIds();
  if (weakIds.length === 0) return;

  state.mode = 'weak-review';
  state.reviewCategory = 'all';
  document.getElementById('btn-back-week').dataset.mode = 'weak-review';
  document.getElementById('quiz-progress').textContent = `약점 ${weakIds.length}개`;
  document.getElementById('quiz-num').textContent = '–';
  document.getElementById('quiz-total').textContent = '';
  document.getElementById('quiz-progress-fill').style.width = '0%';
  document.getElementById('review-controls').style.display = 'none';

  showScreen('screen-quiz');
  if (!options.skipHistory) setAppHistory({ screen: 'weak-review' }, options);
  renderQuestion(pickWeakTerm());
}

// ── 문제 렌더 ─────────────────────────────────────────────
function renderQuestion(termOverride) {
  state.answered = false;
  const term = termOverride || state.sessionTerms[state.sessionIndex];

  if (state.mode === 'daily') {
    const n = state.sessionIndex + 1;
    const total = state.sessionTerms.length;
    document.getElementById('quiz-num').textContent = String(n).padStart(2, '0');
    document.getElementById('quiz-progress-fill').style.width = `${n / total * 100}%`;
  }

  const diffLabels = { easy: '쉬움', medium: '보통 ★★', hard: '어려움 ★★★' };
  document.getElementById('pill-week').textContent = `${term.week}주차`;
  document.getElementById('pill-cat').textContent = term.category;
  document.getElementById('pill-diff').textContent = diffLabels[term.difficulty] || term.difficulty;
  document.getElementById('question-stem').textContent = term.definition;

  // hide result footer
  const footer = document.getElementById('result-footer');
  footer.className = 'result-footer';

  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';
  buildChoices(term).forEach((choice, i) => {
    const isDontKnow = choice === '모르겠음';
    const btn = document.createElement('button');
    btn.className = 'choice-btn' + (isDontKnow ? ' dont-know' : '');
    btn.dataset.choice = choice;
    btn.innerHTML = isDontKnow
      ? `<span class="choice-badge">?</span><span class="choice-text">모르겠음</span>`
      : `<span class="choice-badge">${i + 1}</span><span class="choice-text">${choice}</span>`;
    btn.addEventListener('click', () => handleAnswer(choice, btn, term));
    choicesEl.appendChild(btn);
  });
}

// ── 선택지 생성 ───────────────────────────────────────────
function buildChoices(term) {
  const sameCat = state.allTerms.filter(t => t.id !== term.id && t.category === term.category);
  const diffCat = state.allTerms.filter(t => t.id !== term.id && t.category !== term.category);
  const shuffledSame = [...sameCat].sort(() => Math.random() - 0.5);
  const shuffledDiff = [...diffCat].sort(() => Math.random() - 0.5);

  const wrong = shuffledSame.slice(0, 4).map(t => t.term);
  let di = 0;
  while (wrong.length < 5 && di < shuffledDiff.length) wrong.push(shuffledDiff[di++].term);

  const pool = [term.term, ...wrong.slice(0, 5)];
  pool.sort(() => Math.random() - 0.5);
  pool.push('모르겠음');
  return pool;
}

// ── 답 처리 ───────────────────────────────────────────────
function handleAnswer(choice, clickedBtn, term) {
  if (state.answered) return;
  state.answered = true;

  const isCorrect = choice === term.term;
  const isSkip    = choice === '모르겠음';

  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.choice === term.term) btn.classList.add('correct');
    else if (!isCorrect && btn !== clickedBtn) btn.classList.add('dim');
  });
  if (!isCorrect) clickedBtn.classList.add('wrong');

  updateTermStat(term.id, isCorrect);

  if (isCorrect) {
    if (state.mode === 'daily') state.sessionScore++;
  } else {
    addFavorite(term.id);
    if (state.mode === 'daily') {
      state.wrongIds.push(term.id);
      if (isSkip) state.sessionSkip++; else state.sessionWrong++;
    }
  }

  // result footer
  const footer   = document.getElementById('result-footer');
  const iconEl   = document.getElementById('result-icon');
  const verdict  = document.getElementById('result-verdict');
  const answer   = document.getElementById('result-answer');
  const hintEl   = document.getElementById('result-hint');
  const nextLabel = document.getElementById('result-next-btn');

  if (isCorrect) {
    footer.className = 'result-footer show ok';
    iconEl.textContent = '✓';
    verdict.textContent = '정답이에요!';
  } else if (isSkip) {
    footer.className = 'result-footer show skip';
    iconEl.textContent = '?';
    verdict.textContent = '같이 알아봐요';
  } else {
    footer.className = 'result-footer show bad';
    iconEl.textContent = '✗';
    verdict.textContent = '아쉬워요';
  }
  answer.innerHTML = `정답: <strong>${term.term}</strong>`;
  hintEl.textContent = `💡 ${term.hint}`;

  if (state.mode === 'review' || state.mode === 'correct-review' || state.mode === 'weak-review') {
    nextLabel.textContent = '다음 →';
  } else {
    nextLabel.textContent = state.sessionIndex < state.sessionTerms.length - 1 ? '다음 →' : '결과 보기 →';
  }
}

// ── 다음 문제 / 결과 ──────────────────────────────────────
function onNextBtn() {
  if (state.mode === 'review') {
    const term = pickReviewTerm();
    if (term) {
      document.getElementById('quiz-progress').textContent = `✗ ${getFavorites().length}개`;
      renderQuestion(term);
    } else {
      showWrongCategories();
    }
    return;
  }
  if (state.mode === 'correct-review') {
    const term = pickCorrectTerm();
    if (term) renderQuestion(term);
    else showHome();
    return;
  }
  if (state.mode === 'weak-review') {
    const term = pickWeakTerm();
    if (term) {
      document.getElementById('quiz-progress').textContent = `약점 ${getWeakTermIds().length}개`;
      renderQuestion(term);
    } else {
      showReviewCenter();
    }
    return;
  }
  if (state.sessionIndex < state.sessionTerms.length - 1) {
    state.sessionIndex++;
    renderQuestion();
  } else {
    finishSession();
  }
}

// ── 세션 완료 ─────────────────────────────────────────────
function finishSession() {
  const key = `w${state.currentWeek}d${state.currentDay}`;
  const progress = getProgress();
  progress[key] = {
    completed: true,
    score: state.sessionScore,
    completedAt: new Date().toISOString().slice(0, 10),
  };
  saveProgress(progress);

  showScreen('screen-complete');
  setAppHistory({
    screen: 'complete',
    week: state.currentWeek,
    day: state.currentDay,
  });

  const correct = state.sessionScore;
  const wrong   = state.sessionWrong;
  const skip    = state.sessionSkip;
  const total   = state.sessionTerms.length;

  document.getElementById('complete-kicker').textContent =
    `RESULT — ${state.currentWeek}주차 · ${state.currentDay}일차`;
  document.getElementById('complete-score').textContent = correct;
  document.querySelector('.complete-score-denom').textContent = `/${total}`;

  const taglines = ['훌륭해요! 계속 가봐요 🎉', '잘 하고 있어요! 복습이면 완벽 👍', '조금만 더 하면 완벽해요!', '복습을 통해 더 강해질 거예요!'];
  const pct = correct / total;
  document.getElementById('complete-tagline').textContent =
    pct >= 0.9 ? taglines[0] : pct >= 0.7 ? taglines[1] : pct >= 0.5 ? taglines[2] : taglines[3];

  document.getElementById('complete-stats').innerHTML = `
    <div class="stat-row ok">
      <div class="stat-icon">✓</div>
      <div class="stat-label">정답</div>
      <div class="stat-value">${correct}<span> /${total}</span></div>
    </div>
    <div class="stat-row bad">
      <div class="stat-icon">✗</div>
      <div class="stat-label">오답</div>
      <div class="stat-value">${wrong}<span> /${total}</span></div>
    </div>
    <div class="stat-row skip">
      <div class="stat-icon">?</div>
      <div class="stat-label">모름</div>
      <div class="stat-value">${skip}<span> /${total}</span></div>
    </div>`;

  document.getElementById('btn-complete-next').style.display =
    state.currentDay < getAvailableDayCount(state.currentWeek) ? 'block' : 'none';
}

// ── 이벤트 바인딩 ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('popstate', event => {
    state.appHistoryDepth = Math.max(0, state.appHistoryDepth - 1);
    restoreRoute(event.state?.quizRoute || parseRouteHash(window.location.hash));
  });

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tag = event.target?.tagName;
    const isEditable = event.target?.isContentEditable
      || tag === 'INPUT'
      || tag === 'TEXTAREA'
      || tag === 'SELECT';
    if (isEditable) return;

    if (document.getElementById('screen-quiz')?.classList.contains('active')) {
      if (event.key === 'Enter' && document.getElementById('result-footer')?.classList.contains('show')) {
        event.preventDefault();
        onNextBtn();
        return;
      }
      if (!state.answered) {
        const buttons = [...document.querySelectorAll('#choices .choice-btn:not(:disabled)')];
        const index = Number(event.key);
        if (index >= 1 && index <= buttons.length) {
          event.preventDefault();
          buttons[index - 1].click();
          return;
        }
        if (event.key === '0' || event.key === ' ') {
          const skipBtn = buttons.find(btn => btn.dataset.choice === '모르겠음');
          if (skipBtn) {
            event.preventDefault();
            skipBtn.click();
            return;
          }
        }
      }
    }

    if (document.getElementById('screen-charge-game')?.classList.contains('active')) {
      const nextBtn = document.getElementById('charge-next-btn');
      if (event.key === 'Enter' && nextBtn?.style.display !== 'none') {
        event.preventDefault();
        nextBtn.click();
        return;
      }
      if (!state.chargeGame.answered && !state.chargeGame.finished) {
        const buttons = [...document.querySelectorAll('#charge-choices .charge-choice:not(:disabled)')];
        const index = Number(event.key);
        if (index >= 1 && index <= buttons.length) {
          event.preventDefault();
          buttons[index - 1].click();
          return;
        }
        if (event.key === '0' || event.key === ' ') {
          const skipBtn = buttons.find(btn => btn.dataset.choice === '모르겠음');
          if (skipBtn) {
            event.preventDefault();
            skipBtn.click();
            return;
          }
        }
      }
    }

    if (event.key !== 'Backspace') return;
    if (!window.history.state?.quizRoute || window.history.state.quizRoute.screen === 'home') return;
    event.preventDefault();
    window.history.back();
  });

  document.getElementById('result-next-btn').addEventListener('click', onNextBtn);
  document.getElementById('next-btn').addEventListener('click', onNextBtn);

  // Site header nav
  document.getElementById('nav-home-logo')?.addEventListener('click', e => { e.preventDefault(); showHome(); });
  document.getElementById('nav-curriculum')?.addEventListener('click', e => { e.preventDefault(); showHome(); });
  document.getElementById('nav-review')?.addEventListener('click', e => {
    e.preventDefault();
    showReviewCenter();
  });
  document.getElementById('nav-collections')?.addEventListener('click', e => {
    e.preventDefault();
    showCollections();
  });
  document.getElementById('nav-games')?.addEventListener('click', e => {
    e.preventDefault();
    showGames();
  });
  document.getElementById('nav-community')?.addEventListener('click', e => {
    e.preventDefault();
    showCommunity();
  });
  document.getElementById('site-start-btn')?.addEventListener('click', () => {
    const target = getNextStudyTarget();
    startQuiz(target.week, target.day);
  });
  document.getElementById('home-continue-btn')?.addEventListener('click', () => {
    const target = getNextStudyTarget();
    startQuiz(target.week, target.day);
  });
  document.getElementById('home-weak-btn')?.addEventListener('click', startWeakReview);
  document.getElementById('btn-reset-review')?.addEventListener('click', () => {
    if (!confirm('맞은 것, 틀린 것 기록을 모두 초기화할까요?\n주차별 완료 기록은 유지됩니다.')) return;
    localStorage.removeItem('quiz_favorites');
    localStorage.removeItem('quiz_term_stats');
    showHome({ skipHistory: true });
  });

  document.getElementById('btn-back-home').addEventListener('click', () => goBackOr(showHome));

  document.getElementById('btn-back-week').addEventListener('click', () => {
    goBackOr(() => {
      const mode = document.getElementById('btn-back-week').dataset.mode || state.mode;
      if (mode === 'review') showWrongCategories();
      else if (mode === 'correct-review' || mode === 'weak-review') showReviewCenter();
      else showWeekDetail(state.currentWeek);
    });
  });

  document.getElementById('btn-wc-back').addEventListener('click', () => goBackOr(showHome));
  document.getElementById('hero-start-all').addEventListener('click', () => startWrongReview('all'));
  document.querySelectorAll('[data-charge-mode]').forEach(button => {
    button.addEventListener('click', () => startChargeGame({ mode: button.dataset.chargeMode }));
  });
  document.getElementById('btn-charge-back')?.addEventListener('click', () => goBackOr(showGames));
  document.getElementById('btn-charge-restart')?.addEventListener('click', startChargeGame);
  document.getElementById('btn-charge-sound')?.addEventListener('click', () => {
    state.chargeGame.soundOn = !state.chargeGame.soundOn;
    const btn = document.getElementById('btn-charge-sound');
    btn.textContent = state.chargeGame.soundOn ? 'Sound On' : 'Sound Off';
    btn.setAttribute('aria-pressed', String(state.chargeGame.soundOn));
    if (state.chargeGame.soundOn) playChargeSound('correct', 0);
  });
  document.getElementById('charge-next-btn')?.addEventListener('click', () => {
    if (state.chargeGame.finished) startChargeGame();
    else nextChargeQuestion();
  });
  document.getElementById('btn-result-retry')?.addEventListener('click', startChargeGame);
  document.getElementById('btn-result-games')?.addEventListener('click', showGames);

  document.getElementById('btn-complete-home').addEventListener('click', showHome);
  document.getElementById('btn-complete-next').addEventListener('click', () =>
    startQuiz(state.currentWeek, state.currentDay + 1));

  document.getElementById('wrong-review-card').addEventListener('click', showWrongCategories);
  document.getElementById('correct-review-card').addEventListener('click', startCorrectReview);
  document.getElementById('review-wrong-start').addEventListener('click', () => {
    if (getFavorites().length > 0) showWrongCategories();
  });
  document.getElementById('review-correct-start').addEventListener('click', () => {
    if (getCorrectReviewIds().length > 0) startCorrectReview();
  });
  document.getElementById('review-weak-start').addEventListener('click', () => {
    if (getWeakTermIds().length > 0) startWeakReview();
  });
  document.getElementById('term-search-input')?.addEventListener('input', event => {
    renderTermSearchResults(event.target.value);
  });

  document.getElementById('category-select').addEventListener('change', e => {
    state.reviewCategory = e.target.value;
    if (state.mode === 'correct-review') renderQuestion(pickCorrectTerm());
    else renderQuestion(pickReviewTerm());
  });

  init();
});

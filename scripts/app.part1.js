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
    finishing: false,
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

const firebaseState = {
  app: null,
  auth: null,
  db: null,
  provider: null,
  user: null,
  ready: false,
  enabled: false,
  cache: {
    progress: null,
    favorites: null,
    termStats: null,
  },
  api: {},
};

const FIREBASE_SDK_VERSION = '9.23.0';
const FIRESTORE_DOCS = {
  progress: 'progress',
  favorites: 'favorites',
  termStats: 'termStats',
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
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) idx = i;
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
  const fallback = LEVEL_ROBOT_IMGS[1];
  const botImg = document.getElementById('ai-bot-img');
  const cardImg = document.getElementById('level-robot-img');
  if (botImg) {
    botImg.src = src;
    botImg.onerror = () => { botImg.onerror = null; botImg.src = fallback; };
  }
  if (cardImg) {
    cardImg.src = src;
    cardImg.onerror = () => { cardImg.onerror = null; cardImg.src = fallback; };
  }
}

function renderLevelSection() {
  const { current, next, xp, pct } = getCurrentLevel();
  const numEl   = document.getElementById('level-num');
  const nameEl  = document.getElementById('level-name');
  const badgeEl = document.getElementById('level-title-badge');
  const fillEl  = document.getElementById('level-xp-fill');
  const textEl  = document.getElementById('level-xp-text');
  const maxEl   = document.getElementById('level-max-badge');
  if (!numEl) return;
  numEl.textContent  = current.level;
  nameEl.textContent = current.name;
  if (badgeEl) badgeEl.textContent = `${current.name} 배지`;
  fillEl.style.width = `${pct}%`;
  if (next) {
    textEl.textContent   = `${xp.toLocaleString()} / ${next.xp.toLocaleString()} XP`;
    if (maxEl) maxEl.style.display = 'none';
  } else {
    textEl.textContent   = `${xp.toLocaleString()} XP — 마스터 달성!`;
    if (maxEl) maxEl.style.display = '';
  }
  updateRobotImage();
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

// ── 저장소 헬퍼: Firebase 로그인 시 Firestore 캐시, 비로그인 시 localStorage ──
function readLocalJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeLocalJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function cloneData(data, fallback) {
  if (data == null) return fallback;
  return JSON.parse(JSON.stringify(data));
}

function remoteCacheActive() {
  return Boolean(firebaseState.user && firebaseState.cache.progress && firebaseState.cache.favorites && firebaseState.cache.termStats);
}

function getProgress() {
  return cloneData(remoteCacheActive() ? firebaseState.cache.progress : readLocalJSON('quiz_progress', {}), {});
}

function saveProgress(data) {
  if (remoteCacheActive()) {
    firebaseState.cache.progress = cloneData(data, {});
    saveRemoteData('progress', data);
    return;
  }
  writeLocalJSON('quiz_progress', data);
}

function getFavorites() {
  return cloneData(remoteCacheActive() ? firebaseState.cache.favorites : readLocalJSON('quiz_favorites', []), []);
}

function saveFavorites(data) {
  if (remoteCacheActive()) {
    firebaseState.cache.favorites = cloneData(data, []);
    saveRemoteData('favorites', data);
    return;
  }
  writeLocalJSON('quiz_favorites', data);
}

function getTermStats() {
  return cloneData(remoteCacheActive() ? firebaseState.cache.termStats : readLocalJSON('quiz_term_stats', {}), {});
}

function saveTermStats(data) {
  if (remoteCacheActive()) {
    firebaseState.cache.termStats = cloneData(data, {});
    saveRemoteData('termStats', data);
    return;
  }
  writeLocalJSON('quiz_term_stats', data);
}

function clearReviewData() {
  saveFavorites([]);
  saveTermStats({});
  localStorage.removeItem('quiz_favorites');
  localStorage.removeItem('quiz_term_stats');
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDailySummaryStore() {
  return readLocalJSON('quiz_daily_summary', {});
}

function getTodaySummary() {
  const store = getDailySummaryStore();
  return store[todayKey()] || { solved: 0, correct: 0, xp: 0, weakAdded: 0 };
}

function recordTodaySummary({ solved = 1, correct = 0, xp = 0, weakAdded = 0 } = {}) {
  const store = getDailySummaryStore();
  const key = todayKey();
  const current = store[key] || { solved: 0, correct: 0, xp: 0, weakAdded: 0 };
  current.solved += solved;
  current.correct += correct;
  current.xp += xp;
  current.weakAdded += weakAdded;
  store[key] = current;
  writeLocalJSON('quiz_daily_summary', store);
}

function renderTodaySummary() {
  const summary = getTodaySummary();
  document.getElementById('today-solved').textContent = String(summary.solved);
  document.getElementById('today-correct').textContent = String(summary.correct);
  document.getElementById('today-xp').textContent = String(summary.xp);
  document.getElementById('today-weak').textContent = String(summary.weakAdded);
}

async function saveRemoteData(kind, data) {
  if (!firebaseState.enabled || !firebaseState.user) return;
  const { doc, setDoc } = firebaseState.api;
  const docRef = doc(firebaseState.db, 'users', firebaseState.user.uid, FIRESTORE_DOCS[kind], 'data');
  const payload = kind === 'favorites' ? { items: data } : data;
  try {
    await setDoc(docRef, payload);
  } catch (error) {
    console.warn('Firestore save failed; keeping local fallback.', error);
    if (kind === 'progress') writeLocalJSON('quiz_progress', data);
    if (kind === 'favorites') writeLocalJSON('quiz_favorites', data);
    if (kind === 'termStats') writeLocalJSON('quiz_term_stats', data);
  }
}

async function initFirebase() {
  try {
    const configResponse = await fetch('./firebase-config.js', { cache: 'no-store' });
    if (!configResponse.ok) throw new Error('firebase-config.js is not available.');
    const [{ initializeApp }, authApi, firestoreApi, configModule] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`),
      import(new URL('./firebase-config.js', window.location.href).href),
    ]);
    const config = configModule.firebaseConfig;
    if (!config || config.apiKey === 'YOUR_API_KEY') throw new Error('Firebase config is not set.');
    firebaseState.app = initializeApp(config);
    firebaseState.auth = authApi.getAuth(firebaseState.app);
    firebaseState.db = firestoreApi.getFirestore(firebaseState.app);
    firebaseState.provider = new authApi.GoogleAuthProvider();
    firebaseState.api = {
      ...authApi,
      doc: firestoreApi.doc,
      getDoc: firestoreApi.getDoc,
      setDoc: firestoreApi.setDoc,
    };
    firebaseState.enabled = true;
    bindAuthState();
  } catch (error) {
    console.warn('Firebase disabled; using localStorage only.', error);
    firebaseState.ready = true;
    updateAccountButton(null);
  }
}

function bindAuthState() {
  firebaseState.api.onAuthStateChanged(firebaseState.auth, async user => {
    firebaseState.user = user;
    if (user) {
      await loadRemoteUserData(user);
      await migrateLocalDataToFirestore();
    } else {
      firebaseState.cache.progress = null;
      firebaseState.cache.favorites = null;
      firebaseState.cache.termStats = null;
    }
    firebaseState.ready = true;
    updateAccountButton(user);
    if (state.allTerms.length > 0) showHome({ skipHistory: true });
  });
}

async function readRemoteDoc(kind, fallback) {
  const { doc, getDoc } = firebaseState.api;
  const docRef = doc(firebaseState.db, 'users', firebaseState.user.uid, FIRESTORE_DOCS[kind], 'data');
  const snap = await getDoc(docRef);
  if (!snap.exists()) return fallback;
  const data = snap.data();
  return kind === 'favorites' ? (data.items || []) : data;
}

async function loadRemoteUserData() {
  try {
    const [progress, favorites, termStats] = await Promise.all([
      readRemoteDoc('progress', {}),
      readRemoteDoc('favorites', []),
      readRemoteDoc('termStats', {}),
    ]);
    firebaseState.cache.progress = progress;
    firebaseState.cache.favorites = favorites;
    firebaseState.cache.termStats = termStats;
  } catch (error) {
    console.warn('Firestore load failed; using localStorage fallback.', error);
    firebaseState.cache.progress = readLocalJSON('quiz_progress', {});
    firebaseState.cache.favorites = readLocalJSON('quiz_favorites', []);
    firebaseState.cache.termStats = readLocalJSON('quiz_term_stats', {});
  }
}

async function migrateLocalDataToFirestore() {
  if (!firebaseState.enabled || !firebaseState.user) return;
  const localProgress = readLocalJSON('quiz_progress', {});
  const localFavorites = readLocalJSON('quiz_favorites', []);
  const localTermStats = readLocalJSON('quiz_term_stats', {});
  const progress = { ...localProgress, ...(firebaseState.cache.progress || {}) };
  const favorites = [...new Set([...(firebaseState.cache.favorites || []), ...localFavorites])];
  const termStats = { ...localTermStats, ...(firebaseState.cache.termStats || {}) };
  firebaseState.cache.progress = progress;
  firebaseState.cache.favorites = favorites;
  firebaseState.cache.termStats = termStats;
  await Promise.all([
    saveRemoteData('progress', progress),
    saveRemoteData('favorites', favorites),
    saveRemoteData('termStats', termStats),
  ]);
}

async function handleAccountClick() {
  if (!firebaseState.enabled) {
    alert('Firebase 설정이 아직 없습니다. firebase-config.js를 추가하면 구글 로그인을 사용할 수 있습니다.');
    return;
  }
  if (firebaseState.user) {
    if (!confirm('로그아웃할까요?')) return;
    await firebaseState.api.signOut(firebaseState.auth);
    return;
  }
  try {
    await firebaseState.api.signInWithPopup(firebaseState.auth, firebaseState.provider);
  } catch (error) {
    console.warn('Google sign-in failed.', error);
    alert('구글 로그인에 실패했습니다. Firebase 설정과 승인 도메인을 확인해주세요.');
  }
}

function updateAccountButton(user) {
  const btn = document.getElementById('btn-account');
  if (!btn) return;
  btn.innerHTML = '';
  btn.title = user ? `${user.displayName || user.email || 'Account'} 로그아웃` : 'Account';
  if (user?.photoURL) {
    const img = document.createElement('img');
    img.src = user.photoURL;
    img.alt = '';
    img.className = 'account-avatar';
    btn.appendChild(img);
  } else {
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'account_circle';
    btn.appendChild(icon);
  }
}

function addFavorite(termId) {
  const favs = getFavorites();
  if (!favs.includes(termId)) {
    favs.push(termId);
    saveFavorites(favs);
    return true;
  }
  return false;
}

function updateTermStat(termId, isCorrect) {
  const stats = getTermStats();
  if (!stats[termId]) stats[termId] = { seen: 0, correct: 0 };
  stats[termId].seen++;
  if (isCorrect) stats[termId].correct++;
  saveTermStats(stats);
}

// ── 데이터 로딩 ────────────────────────────────────────────
async function init() {
  initFirebase();
  const weeks = Array.from({ length: 30 }, (_, i) => i + 1);
  const results = await Promise.all(
    weeks.map(w => fetch(`data/terms.week${w}.json`).then(r => r.json()))
  );
  state.allTerms = results.flat();
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
  if (value === 'wrong-note') return { screen: 'wrong-note' };
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
  if (route.screen === 'wrong-note') return '#wrong-note';
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
    else if (route.screen === 'wrong-note') showWrongNote({ skipHistory: true });
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

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
};
const CAT_GLYPHS = {
  '프로그래밍 기초': '{}', 'AI / 머신러닝': 'AI', '웹 기초': '<>',
  '자료구조': '[]', '알고리즘': 'fn', '데이터베이스': 'DB',
  '운영체제': 'OS', '네트워크': '~~', '버전 관리': 'git',
  '변수와 자료형': ':=', '조건문과 반복문': 'if', '함수와 스코프': 'fn',
};
const COLOR_CSS = {
  violet: 'var(--violet)', coral: 'var(--coral)', amber: 'var(--amber)',
  sky: 'var(--sky)', mint: 'var(--mint)',
};
const COLOR_SOFT = {
  violet: 'var(--violet-soft)', coral: 'var(--coral-soft)', amber: 'var(--amber-soft)',
  sky: 'var(--sky-soft)', mint: 'var(--mint-soft)',
};

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
  showHome();
}

// ── 주차/일차 헬퍼 ────────────────────────────────────────
function getAvailableWeeks() {
  return [...new Set(state.allTerms.map(t => t.week))].sort((a, b) => a - b);
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

// ── 화면 전환 ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ── 홈 화면 ───────────────────────────────────────────────
function showHome() {
  showScreen('screen-home');
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

  const completedWeeks = availableWeeks.filter(w =>
    [1,2,3,4,5,6,7].every(d => progress[`w${w}d${d}`]?.completed)
  ).length;
  document.getElementById('week-meta').textContent = `${completedWeeks}/${totalDisplay}`;

  const list = document.getElementById('week-list');
  list.innerHTML = '';
  for (let w = 1; w <= totalDisplay; w++) {
    const isAvailable = availableWeeks.includes(w);
    const completedDays = [1,2,3,4,5,6,7].filter(d => progress[`w${w}d${d}`]?.completed).length;
    const pct = isAvailable ? Math.round(completedDays / 7 * 100) : 0;
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
              ? `<span>${completedDays}/7일</span><span style="color:var(--line)">·</span><span class="week-pct">${pct}%</span>`
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
  const reviewSection = document.getElementById('review-section');
  reviewSection.style.display = (favs.length > 0 || correctIds.length > 0) ? 'block' : 'none';
  document.getElementById('wrong-count').textContent = `${favs.length}`;
  document.getElementById('correct-count').textContent = `${correctIds.length}`;
  document.getElementById('wrong-review-card').style.display = favs.length > 0 ? '' : 'none';
  document.getElementById('correct-review-card').style.display = correctIds.length > 0 ? '' : 'none';
}

// ── 주차 상세 ─────────────────────────────────────────────
function showWeekDetail(week) {
  state.currentWeek = week;
  showScreen('screen-week');
  const name = WEEK_NAMES[week] || `${week}주차`;
  document.getElementById('week-title').textContent = name;

  const progress = getProgress();
  const list = document.getElementById('day-list');
  list.innerHTML = '';
  for (let d = 1; d <= 7; d++) {
    const key = `w${week}d${d}`;
    const prevKey = `w${week}d${d - 1}`;
    const dayProg = progress[key];
    const isCompleted = dayProg?.completed;
    const isUnlocked = d === 1 || progress[prevKey]?.completed;

    const item = document.createElement('div');
    item.className = 'day-item'
      + (isCompleted ? ' done' : '')
      + (!isUnlocked && !isCompleted ? ' locked' : '');

    if (isCompleted) {
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
function startQuiz(week, day) {
  state.mode = 'daily';
  state.currentDay = day;
  state.sessionTerms = getDayTerms(week, day);
  state.sessionIndex = 0;
  state.sessionScore = 0;
  state.sessionWrong = 0;
  state.sessionSkip  = 0;
  state.wrongIds = [];

  document.getElementById('btn-back-week').dataset.mode = 'daily';
  document.getElementById('review-controls').style.display = 'none';
  document.getElementById('quiz-total').textContent = ' / 10';
  showScreen('screen-quiz');
  renderQuestion();
}

// ── 틀린 것 카테고리 화면 ────────────────────────────────
function showWrongCategories() {
  showScreen('screen-wrong-cats');
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

// ── 틀린 것 복습 시작 ─────────────────────────────────────
function startWrongReview(category = 'all') {
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
  renderQuestion(pickReviewTerm());
}

// ── 맞은 것 복습 시작 ─────────────────────────────────────
function startCorrectReview() {
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
  renderQuestion(pickCorrectTerm());
}

// ── 문제 렌더 ─────────────────────────────────────────────
function renderQuestion(termOverride) {
  state.answered = false;
  const term = termOverride || state.sessionTerms[state.sessionIndex];

  if (state.mode === 'daily') {
    const n = state.sessionIndex + 1;
    document.getElementById('quiz-num').textContent = String(n).padStart(2, '0');
    document.getElementById('quiz-progress-fill').style.width = `${n / 10 * 100}%`;
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

  if (state.mode === 'review' || state.mode === 'correct-review') {
    nextLabel.textContent = '다음 →';
  } else {
    nextLabel.textContent = state.sessionIndex < 9 ? '다음 →' : '결과 보기 →';
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
  if (state.sessionIndex < 9) {
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

  const correct = state.sessionScore;
  const wrong   = state.sessionWrong;
  const skip    = state.sessionSkip;

  document.getElementById('complete-kicker').textContent =
    `RESULT — ${state.currentWeek}주차 · ${state.currentDay}일차`;
  document.getElementById('complete-score').textContent = correct;

  const taglines = ['훌륭해요! 계속 가봐요 🎉', '잘 하고 있어요! 복습이면 완벽 👍', '조금만 더 하면 완벽해요!', '복습을 통해 더 강해질 거예요!'];
  const pct = correct / 10;
  document.getElementById('complete-tagline').textContent =
    pct >= 0.9 ? taglines[0] : pct >= 0.7 ? taglines[1] : pct >= 0.5 ? taglines[2] : taglines[3];

  document.getElementById('complete-stats').innerHTML = `
    <div class="stat-row ok">
      <div class="stat-icon">✓</div>
      <div class="stat-label">정답</div>
      <div class="stat-value">${correct}<span> /10</span></div>
    </div>
    <div class="stat-row bad">
      <div class="stat-icon">✗</div>
      <div class="stat-label">오답</div>
      <div class="stat-value">${wrong}<span> /10</span></div>
    </div>
    <div class="stat-row skip">
      <div class="stat-icon">?</div>
      <div class="stat-label">모름</div>
      <div class="stat-value">${skip}<span> /10</span></div>
    </div>`;

  document.getElementById('btn-complete-next').style.display =
    state.currentDay < 7 ? 'block' : 'none';
}

// ── 이벤트 바인딩 ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('result-next-btn').addEventListener('click', onNextBtn);
  document.getElementById('next-btn').addEventListener('click', onNextBtn);

  document.getElementById('btn-back-home').addEventListener('click', showHome);

  document.getElementById('btn-back-week').addEventListener('click', () => {
    const mode = document.getElementById('btn-back-week').dataset.mode || state.mode;
    if (mode === 'review') showWrongCategories();
    else if (mode === 'correct-review') showHome();
    else showWeekDetail(state.currentWeek);
  });

  document.getElementById('btn-wc-back').addEventListener('click', showHome);
  document.getElementById('hero-start-all').addEventListener('click', () => startWrongReview('all'));

  document.getElementById('btn-complete-home').addEventListener('click', showHome);
  document.getElementById('btn-complete-next').addEventListener('click', () =>
    startQuiz(state.currentWeek, state.currentDay + 1));

  document.getElementById('wrong-review-card').addEventListener('click', showWrongCategories);
  document.getElementById('correct-review-card').addEventListener('click', startCorrectReview);

  document.getElementById('category-select').addEventListener('change', e => {
    state.reviewCategory = e.target.value;
    if (state.mode === 'correct-review') renderQuestion(pickCorrectTerm());
    else renderQuestion(pickReviewTerm());
  });

  init();
});

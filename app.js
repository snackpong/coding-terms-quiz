// ── 상태 ──────────────────────────────────────────────────
const state = {
  allTerms: [],
  mode: 'daily',        // 'daily' | 'review'
  currentWeek: null,
  currentDay: null,
  sessionTerms: [],
  sessionIndex: 0,
  sessionScore: 0,
  wrongIds: [],
  answered: false,
  reviewCategory: 'all',
};

// ── localStorage 헬퍼 ──────────────────────────────────────
function getProgress()        { return JSON.parse(localStorage.getItem('quiz_progress')    || '{}'); }
function saveProgress(data)   { localStorage.setItem('quiz_progress', JSON.stringify(data)); }
function getFavorites()       { return JSON.parse(localStorage.getItem('quiz_favorites')   || '[]'); }
function getTermStats()       { return JSON.parse(localStorage.getItem('quiz_term_stats')  || '{}'); }

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

// ── SRS: 가중치 기반 랜덤 선택 ───────────────────────────
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
  if (state.reviewCategory !== 'all') {
    pool = pool.filter(t => t.category === state.reviewCategory);
  }
  if (pool.length === 0) return null;

  const stats = getTermStats();
  // 틀린 횟수가 많을수록 가중치 높음, 맞은 비율 높으면 낮음
  const weights = pool.map(t => {
    const s = stats[t.id] || { seen: 0, correct: 0 };
    const wrong = s.seen - s.correct;
    return Math.max(1, wrong * 3 + 1);
  });
  return weightedRandom(pool, weights);
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

  const list = document.getElementById('week-list');
  list.innerHTML = '';
  for (let w = 1; w <= totalDisplay; w++) {
    const isAvailable = availableWeeks.includes(w);
    const completedDays = [1,2,3,4,5,6,7].filter(d => progress[`w${w}d${d}`]?.completed).length;

    const card = document.createElement('div');
    card.className = 'week-card' + (isAvailable ? '' : ' locked');
    card.innerHTML = `
      <div class="week-card-header">
        <span class="week-label">${w}주차</span>
        ${isAvailable
          ? `<span class="week-days">${completedDays} / 7일</span>`
          : `<span class="week-lock">준비 중</span>`}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${isAvailable ? completedDays/7*100 : 0}%"></div>
      </div>`;
    if (isAvailable) card.addEventListener('click', () => showWeekDetail(w));
    list.appendChild(card);
  }

  // 즐겨찾기 복습 카드
  const favs = getFavorites();
  const reviewSection = document.getElementById('review-section');
  reviewSection.style.display = favs.length > 0 ? 'block' : 'none';
  document.getElementById('review-count').textContent = `${favs.length}개`;
}

// ── 주차 상세 ─────────────────────────────────────────────
function showWeekDetail(week) {
  state.currentWeek = week;
  showScreen('screen-week');
  document.getElementById('week-title').textContent = `${week}주차`;

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
          <span class="day-label">${d}일차</span>
          <span class="day-score">점수 ${dayProg.score} / 10</span>
        </div>
        <span class="day-status done-icon">✓</span>`;
    } else if (isUnlocked) {
      item.innerHTML = `
        <div class="day-info">
          <span class="day-label">${d}일차</span>
          <span class="day-hint">10문제</span>
        </div>
        <span class="day-status">→</span>`;
      item.addEventListener('click', () => startQuiz(week, d));
    } else {
      item.innerHTML = `
        <div class="day-info">
          <span class="day-label">${d}일차</span>
          <span class="day-hint">이전 날 완료 후 해금</span>
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
  state.wrongIds = [];

  const backBtn = document.getElementById('btn-back-week');
  backBtn.textContent = '← 뒤로';

  document.getElementById('quiz-session-title').textContent = `${week}주차 ${day}일차`;
  document.getElementById('review-controls').style.display = 'none';
  showScreen('screen-quiz');
  renderQuestion();
}

// ── 복습 모드 시작 ────────────────────────────────────────
function startReview() {
  const favIds = getFavorites();
  const favTerms = state.allTerms.filter(t => favIds.includes(t.id));
  if (favTerms.length === 0) return;

  state.mode = 'review';
  state.reviewCategory = 'all';

  // 카테고리 필터 옵션 채우기
  const categories = [...new Set(favTerms.map(t => t.category))].sort();
  const select = document.getElementById('category-select');
  select.innerHTML = '<option value="all">전체 카테고리</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = `${cat} (${favTerms.filter(t => t.category === cat).length})`;
    select.appendChild(opt);
  });

  document.getElementById('btn-back-week').textContent = '← 홈';
  document.getElementById('quiz-session-title').textContent = '즐겨찾기 복습';
  document.getElementById('quiz-progress').textContent = `★ ${favIds.length}개`;
  document.getElementById('review-controls').style.display = 'block';

  showScreen('screen-quiz');
  renderQuestion(pickReviewTerm());
}

// ── 문제 렌더 ─────────────────────────────────────────────
function renderQuestion(termOverride) {
  state.answered = false;
  const term = termOverride || state.sessionTerms[state.sessionIndex];

  if (state.mode === 'daily') {
    document.getElementById('quiz-progress').textContent = `${state.sessionIndex + 1} / 10`;
  }

  document.getElementById('category-badge').textContent = term.category;
  const diffBadge = document.getElementById('difficulty-badge');
  diffBadge.textContent = { easy: '쉬움', medium: '보통', hard: '어려움' }[term.difficulty];
  diffBadge.className = `difficulty-badge ${term.difficulty}`;
  document.getElementById('question-stem').textContent = term.definition;

  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';
  buildChoices(term).forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn' + (choice === '모르겠음' ? ' dont-know' : '');
    btn.textContent = `${i + 1}.  ${choice}`;
    btn.dataset.choice = choice;
    btn.addEventListener('click', () => handleAnswer(choice, btn, term));
    choicesEl.appendChild(btn);
  });

  const resultBox = document.getElementById('result-box');
  resultBox.className = 'result-box';
  resultBox.innerHTML = '';
  document.getElementById('next-btn').style.display = 'none';
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
  const isSkip = choice === '모르겠음';

  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.choice === term.term) btn.classList.add('correct');
  });
  if (!isCorrect) clickedBtn.classList.add('wrong');

  // 통계 업데이트 (SRS 기반)
  updateTermStat(term.id, isCorrect);

  if (isCorrect) {
    if (state.mode === 'daily') state.sessionScore++;
  } else {
    addFavorite(term.id);
    if (state.mode === 'daily') state.wrongIds.push(term.id);
  }

  const resultBox = document.getElementById('result-box');
  resultBox.className = 'result-box show';
  const labelClass = isCorrect ? 'ok' : (isSkip ? 'skip' : 'bad');
  const labelText = isCorrect ? '정답입니다!'
    : (isSkip ? `정답: ${term.term}` : `오답 — 정답: ${term.term}`);
  resultBox.innerHTML = `
    <div class="result-label ${labelClass}">${labelText}</div>
    <div class="hint-text">💡 ${term.hint}</div>`;

  const nextBtn = document.getElementById('next-btn');
  if (state.mode === 'review') {
    nextBtn.textContent = '다음 문제 →';
  } else {
    nextBtn.textContent = state.sessionIndex < 9 ? '다음 문제 →' : '결과 보기 →';
  }
  nextBtn.style.display = 'block';
}

// ── 다음 문제 / 결과 ──────────────────────────────────────
function onNextBtn() {
  if (state.mode === 'review') {
    const term = pickReviewTerm();
    if (term) {
      // 진행 중 즐겨찾기 수 갱신
      const favCount = getFavorites().length;
      document.getElementById('quiz-progress').textContent = `★ ${favCount}개`;
      renderQuestion(term);
    } else {
      showHome();
    }
    return;
  }
  // daily mode
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
  document.getElementById('complete-title').textContent =
    `${state.currentWeek}주차 ${state.currentDay}일차 완료!`;
  document.getElementById('complete-score').textContent = `${state.sessionScore} / 10`;
  document.getElementById('complete-miss').textContent =
    state.wrongIds.length > 0
      ? `즐겨찾기에 ${state.wrongIds.length}개 추가됨 ★`
      : '전부 정답! 완벽합니다 🎉';

  document.getElementById('btn-complete-next').style.display =
    state.currentDay < 7 ? 'block' : 'none';
}

// ── 이벤트 바인딩 ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('next-btn')
    .addEventListener('click', onNextBtn);

  document.getElementById('btn-back-home')
    .addEventListener('click', showHome);

  document.getElementById('btn-back-week')
    .addEventListener('click', () => {
      if (state.mode === 'review') showHome();
      else showWeekDetail(state.currentWeek);
    });

  document.getElementById('btn-complete-home')
    .addEventListener('click', showHome);

  document.getElementById('btn-complete-next')
    .addEventListener('click', () => startQuiz(state.currentWeek, state.currentDay + 1));

  document.getElementById('review-card')
    .addEventListener('click', startReview);

  document.getElementById('category-select')
    .addEventListener('change', e => {
      state.reviewCategory = e.target.value;
      renderQuestion(pickReviewTerm());
    });

  init();
});

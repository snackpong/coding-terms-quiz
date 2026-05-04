function startTermPractice(termId) {
  const term = state.allTerms.find(item => item.id === termId);
  if (!term) return;
  state.mode = 'term-practice';
  state.reviewCategory = 'all';
  state.sessionTerms = [term];
  state.sessionIndex = 0;
  state.sessionScore = 0;
  state.sessionWrong = 0;
  state.sessionSkip = 0;
  document.getElementById('btn-back-week').dataset.mode = 'term-practice';
  document.getElementById('quiz-progress').textContent = '단일 용어';
  document.getElementById('quiz-num').textContent = '01';
  document.getElementById('quiz-total').textContent = ' / 01';
  document.getElementById('quiz-progress-fill').style.width = '100%';
  document.getElementById('review-controls').style.display = 'none';
  showScreen('screen-quiz');
  renderQuestion(term);
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

  // 자세히 알기 버튼 — detail 데이터 있는 용어만 표시
  const detailBtn = document.getElementById('detail-open-btn');
  if (detailBtn) {
    const hasDetail = term.detail && (term.detail.easy || term.detail.analogy);
    detailBtn.style.display = hasDetail ? 'inline-flex' : 'none';
    detailBtn.onclick = () => openDetailModal(term);
  }

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
      ? `<span class="choice-badge">7</span><span class="choice-text">모르겠음</span>`
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
    const weakAdded = addFavorite(term.id);
    recordTodaySummary({ correct: 0, xp: 0, weakAdded: weakAdded ? 1 : 0 });
    if (state.mode === 'daily') {
      state.wrongIds.push(term.id);
      if (isSkip) state.sessionSkip++; else state.sessionWrong++;
    }
  }
  if (isCorrect) recordTodaySummary({ correct: 1, xp: 10, weakAdded: 0 });

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
  hintEl.innerHTML = `<span>💡 ${term.hint}</span>${buildTermDetailBlock(term)}`;

  if (state.mode === 'review' || state.mode === 'correct-review' || state.mode === 'weak-review' || state.mode === 'term-practice') {
    nextLabel.textContent = '다음 →';
  } else {
    nextLabel.textContent = state.sessionIndex < state.sessionTerms.length - 1 ? '다음 →' : '결과 보기 →';
  }
}

// ── 다음 문제 / 결과 ──────────────────────────────────────
function onNextBtn() {
  if (state.mode === 'term-practice') {
    showCollections();
    return;
  }
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
  const { current, xp } = getCurrentLevel();
  const levelLine = document.getElementById('complete-level-line');
  if (levelLine) levelLine.textContent = `Lv.${current.level} ${current.name} 배지 · 총 ${xp.toLocaleString()} XP`;

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
function bootApplication() {
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
      if (!state.chargeGame.answered && !state.chargeGame.finished && !state.chargeGame.finishing) {
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
    clearReviewData();
    showHome({ skipHistory: true });
  });
  document.getElementById('btn-account')?.addEventListener('click', handleAccountClick);

  document.getElementById('btn-back-home').addEventListener('click', () => goBackOr(showHome));

  document.getElementById('btn-back-week').addEventListener('click', () => {
    goBackOr(() => {
      const mode = document.getElementById('btn-back-week').dataset.mode || state.mode;
      if (mode === 'review') showWrongCategories();
      else if (mode === 'correct-review' || mode === 'weak-review') showReviewCenter();
      else if (mode === 'term-practice') showCollections();
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
  document.getElementById('review-note-start')?.addEventListener('click', showWrongNote);
  document.getElementById('wrong-note-retry')?.addEventListener('click', () => {
    if (getFavorites().length > 0) startWrongReview('all');
  });
  document.getElementById('term-search-input')?.addEventListener('input', event => {
    renderTermSearchResults(event.target.value);
  });
  document.getElementById('term-category-filter')?.addEventListener('change', () => {
    renderTermSearchResults(document.getElementById('term-search-input')?.value || '');
  });
  document.getElementById('term-difficulty-filter')?.addEventListener('change', () => {
    renderTermSearchResults(document.getElementById('term-search-input')?.value || '');
  });

  document.getElementById('category-select').addEventListener('change', e => {
    state.reviewCategory = e.target.value;
    if (state.mode === 'correct-review') renderQuestion(pickCorrectTerm());
    else renderQuestion(pickReviewTerm());
  });

  init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApplication);
} else {
  bootApplication();
}

// ── 자세히 알기 Modal ──────────────────────────────────────────

function openDetailModal(term) {
  const d = term.detail || {};
  const modal = document.getElementById('detail-modal');
  if (!modal) return;

  document.getElementById('dm-term').textContent = term.term;
  document.getElementById('dm-category').textContent = term.category;

  // 핵심 한 줄
  document.getElementById('dm-easy').textContent = d.easy || term.definition;

  // 쉬운 비유 (없으면 섹션 숨김)
  const analogySec = document.getElementById('dm-analogy-sec');
  const analogyText = d.analogy || '';
  document.getElementById('dm-analogy').textContent = analogyText;
  if (analogySec) analogySec.style.display = analogyText ? 'flex' : 'none';

  // 예시 (없으면 섹션 숨김)
  const exSec = document.getElementById('dm-example-sec');
  const exText = d.example || '';
  document.getElementById('dm-example').textContent = exText;
  if (exSec) exSec.style.display = exText ? 'flex' : 'none';

  // 초보자 팁 (없으면 섹션 숨김)
  const tipSec = document.getElementById('dm-tip-sec');
  const tipText = d.tip || '';
  document.getElementById('dm-tip').textContent = tipText;
  if (tipSec) tipSec.style.display = tipText ? 'flex' : 'none';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// 닫기 버튼 + 배경 클릭
document.addEventListener('click', function(e) {
  if (e.target.id === 'detail-close-btn') closeDetailModal();
  if (e.target.id === 'detail-modal') closeDetailModal();
});

// ESC 키 닫기
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeDetailModal();
});

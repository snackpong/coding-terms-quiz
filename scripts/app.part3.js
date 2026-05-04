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
  if (!fromEl || !toEl) return;
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

function getChargeCore() {
  return document.querySelector('#charge-robot-wrap .charge-core');
}

function triggerChargeCoreBurst() {
  const core = getChargeCore();
  if (!core) return;
  core.classList.remove('core-burst');
  void core.offsetWidth;
  core.classList.add('core-burst');
  window.setTimeout(() => core.classList.remove('core-burst'), 650);
}

function fireChoiceToCoreBeam(clickedBtn, combo) {
  const core = getChargeCore();
  if (!clickedBtn || !core) return;
  clickedBtn.classList.add('energy-source');
  firePositionedBeam(clickedBtn, core, 'correct', combo);
  window.setTimeout(triggerChargeCoreBurst, 220);
  window.setTimeout(() => clickedBtn.classList.remove('energy-source'), 720);
}

function fireCoreDrainBeam(clickedBtn) {
  const core = getChargeCore();
  if (!core) return;
  const target = clickedBtn || document.getElementById('charge-choices') || document.getElementById('charge-arena');
  target?.classList?.add('warning-target');
  firePositionedBeam(core, target, 'drain', 0);
  window.setTimeout(() => target?.classList?.remove('warning-target'), 720);
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
  fill?.classList.remove('kick', 'overshoot', 'drain-hit');
  void fill?.offsetWidth;
  fill?.classList.add('kick', kind === 'correct' ? 'overshoot' : 'drain-hit');
  window.setTimeout(() => fill?.classList.remove('kick', 'overshoot', 'drain-hit'), 520);

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
    fireCoreDrainBeam(clickedBtn);
    triggerChargeCoreBurst();
    triggerVillainSurge();
  } else {
    fireChoiceToCoreBeam(clickedBtn, c);
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
          triggerChargeCoreBurst();
          triggerVillainHit(c);
          if (c >= 3) {
            window.setTimeout(() => fireChoiceToCoreBeam(clickedBtn, Math.max(0, c - 1)), 60);
            window.setTimeout(() => fireChoiceToCoreBeam(clickedBtn, Math.max(0, c - 2)), 130);
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
  wrap.dataset.comboTier = game.combo >= 5 ? 'max' : game.combo >= 3 ? 'high' : game.combo >= 1 ? 'active' : 'base';

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
  const playerLevel = getCurrentLevel().current.level;
  game.battery = Math.min(55, 35 + (playerLevel - 1) * 3);
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
  game.auraLevel = 1 + (playerLevel - 1) * 0.35;

  const overlay = document.getElementById('charge-result-overlay');
  if (overlay) { overlay.className = 'charge-result-overlay'; overlay.style.display = 'none'; }

  showScreen('screen-charge-game');
  document.getElementById('charge-mode-label').textContent = `AI CORE REACTOR · ${game.sourceLabel} · Lv.${playerLevel} 보너스`;
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
    btn.textContent = choice === '모르겠음' ? '7. 모르겠음' : `${index + 1}. ${choice}`;
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
    recordTodaySummary({ correct: 1, xp: 10, weakAdded: 0 });
    document.getElementById('charge-feedback').textContent =
      bonus > 0 ? `정답입니다. 콤보 보너스 +${bonus}% 충전!` : '정답입니다. 에너지가 충전됐습니다.';
  } else {
    clickedBtn.classList.add('wrong');
    game.combo = 0;
    game.wrongCount++;
    game.wrongTerms.push(term.term);
    delta = isSkip ? -3 : -8;
    changeChargeAura(isSkip ? -0.8 : -1.8);
    const weakAdded = addFavorite(term.id);
    updateTermStat(term.id, false);
    recordTodaySummary({ correct: 0, xp: 0, weakAdded: weakAdded ? 1 : 0 });
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
  const reward = document.getElementById('res-reward');
  if (reward) {
    const { current } = getCurrentLevel();
    reward.textContent = complete
      ? `Lv.${current.level} ${current.name} 배지 효과로 코어가 완전 충전됐습니다.`
      : fail
        ? `Lv.${current.level} ${current.name} 보너스를 받고도 방전됐습니다. 오답 노트에서 재도전하세요.`
        : `최고 콤보 ${game.maxCombo}회 · 다음 전투에서 더 높은 아우라를 노려보세요.`;
  }
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


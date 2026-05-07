/**
 * validate-terms.js — 주차별 term JSON 파일의 일관성을 검사합니다.
 *
 * Usage: node tools/validate-terms.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REQUIRED = ['id', 'term', 'definition', 'week', 'category', 'difficulty', 'hint'];

// data/ 폴더에 있는 terms.weekN.json 파일을 자동 탐색
const WEEK_COUNT = (() => {
  let max = 0;
  fs.readdirSync(DATA_DIR).forEach(f => {
    const m = f.match(/^terms\.week(\d+)\.json$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return max;
})();
const VALID_DIFF = new Set(['easy', 'medium', 'hard']);

let errors   = 0;
let warnings = 0;
const seenIds   = new Map();
const seenTerms = new Map();
let total = 0;

for (let w = 1; w <= WEEK_COUNT; w++) {
  const filePath = path.join(DATA_DIR, `terms.week${w}.json`);

  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] 파일 없음: ${filePath}`);
    errors++;
    continue;
  }

  let items;
  try {
    items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`[ERROR] JSON 파싱 실패 (week${w}): ${e.message}`);
    errors++;
    continue;
  }

  if (!Array.isArray(items)) {
    console.error(`[ERROR] week${w}: 배열이 아닙니다`);
    errors++;
    continue;
  }

  console.log(`\n── week${w}.json (${items.length}개) ──`);

  items.forEach((t, i) => {
    const loc = `week${w}[${i}] id=${t.id || '?'}`;

    // 필수 필드 누락
    REQUIRED.forEach(field => {
      if (t[field] === undefined || t[field] === null || t[field] === '') {
        console.error(`  [ERROR] ${loc}: 필수 필드 누락 — ${field}`);
        errors++;
      }
    });

    // week 값 일치
    if (t.week !== w) {
      console.error(`  [ERROR] ${loc}: week 필드가 ${t.week}인데 파일은 week${w}`);
      errors++;
    }

    // difficulty 유효값
    if (t.difficulty && !VALID_DIFF.has(t.difficulty)) {
      console.warn(`  [WARN]  ${loc}: 잘못된 difficulty — "${t.difficulty}"`);
      warnings++;
    }

    // 중복 id
    if (t.id) {
      if (seenIds.has(t.id)) {
        console.error(`  [ERROR] ${loc}: id 중복 — "${t.id}" (첫 출현: ${seenIds.get(t.id)})`);
        errors++;
      } else {
        seenIds.set(t.id, loc);
      }
    }

    // 중복 term
    if (t.term) {
      const key = t.term.trim().toLowerCase();
      if (seenTerms.has(key)) {
        console.warn(`  [WARN]  ${loc}: term 중복 — "${t.term}" (첫 출현: ${seenTerms.get(key)})`);
        warnings++;
      } else {
        seenTerms.set(key, loc);
      }
    }
  });

  total += items.length;
}

console.log(`\n${'─'.repeat(48)}`);
console.log(`총 용어: ${total}  |  오류: ${errors}  |  경고: ${warnings}`);
if (errors > 0) {
  console.error('\n검증 실패 — 위 오류를 수정 후 재실행하세요.');
  process.exit(1);
} else {
  console.log('\n검증 통과 ✓');
}

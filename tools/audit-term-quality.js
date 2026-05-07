'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const weeks = process.argv.slice(2).length
  ? process.argv.slice(2).map((value) => Number(value.replace(/^week/i, '')))
  : Array.from({ length: 30 }, (_, index) => index + 1);

const badPhrases = [
  '정리된 책상',
  '핵심 개념입니다. 처음 배울 때는 이름보다',
  '특정 문제를 표현하거나 해결하기 위해 사용하는 개념입니다',
  '이름만 외우기보다 어떤 문제를 줄이는지'
];

let errors = 0;

function normalizeAnalogy(text, term) {
  return text.replaceAll(term, '{TERM}').replace(/\s+/g, ' ').trim();
}

for (const week of weeks) {
  const filePath = path.join(DATA_DIR, `terms.week${week}.json`);
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const definitions = new Map();
  const analogies = new Map();

  for (const item of items) {
    for (const phrase of badPhrases) {
      if (item.definition.includes(phrase) || item.detail.analogy.includes(phrase)) {
        console.error(`[ERROR] week${week} id=${item.id}: banned phrase "${phrase}"`);
        errors += 1;
      }
    }

    if (item.definition.length < 35) {
      console.error(`[ERROR] week${week} id=${item.id}: definition too short`);
      errors += 1;
    }

    if (item.detail.analogy.length < 45) {
      console.error(`[ERROR] week${week} id=${item.id}: analogy too short`);
      errors += 1;
    }

    definitions.set(item.definition, [...(definitions.get(item.definition) || []), item.id]);
    const analogyKey = normalizeAnalogy(item.detail.analogy, item.term);
    analogies.set(analogyKey, [...(analogies.get(analogyKey) || []), item.id]);
  }

  for (const [definition, ids] of definitions.entries()) {
    if (ids.length > 1) {
      console.error(`[ERROR] week${week}: repeated definition ids=${ids.join(', ')} :: ${definition}`);
      errors += 1;
    }
  }

  for (const [analogy, ids] of analogies.entries()) {
    if (ids.length > 1) {
      console.error(`[ERROR] week${week}: repeated analogy template ids=${ids.join(', ')} :: ${analogy}`);
      errors += 1;
    }
  }

  console.log(`audited week${week}: ${items.length} terms`);
}

if (errors > 0) {
  console.error(`quality audit failed: ${errors} issue(s)`);
  process.exit(1);
}

console.log('quality audit passed');

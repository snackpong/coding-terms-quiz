const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function hasFinalConsonant(word) {
  const chars = [...String(word || '')];
  if (chars.length === 0) return false;
  const code = chars[chars.length - 1].charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return ((code - 0xac00) % 28) !== 0;
  return false;
}

function josa(word, consonantForm, vowelForm) {
  return hasFinalConsonant(word) ? consonantForm : vowelForm;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function polishJosa(text, term) {
  const subject = josa(term, '은', '는');
  const object = josa(term, '을', '를');
  return String(text)
    .replace(new RegExp(`${escapeRegExp(term)}은`, 'g'), `${term}${subject}`)
    .replace(new RegExp(`${escapeRegExp(term)}는`, 'g'), `${term}${subject}`)
    .replace(new RegExp(`${escapeRegExp(term)}을`, 'g'), `${term}${object}`)
    .replace(new RegExp(`${escapeRegExp(term)}를`, 'g'), `${term}${object}`)
    .replace(/은\(는\)/g, subject)
    .replace(/을\(를\)/g, object);
}

function contextByCategory(category) {
  if (category.includes('웹')) return '요청과 응답이 오가는 흐름';
  if (category.includes('인프라')) return '서버가 요청을 처리하고 버티는 과정';
  if (category.includes('개발 도구')) return '코드를 검사하고 배포하는 작업 흐름';
  if (category.includes('아키텍처')) return '책임을 나누고 변경 영향을 줄이는 설계';
  if (category.includes('함수와 스코프')) return '함수 호출과 변수 접근 흐름';
  if (category.includes('AI')) return '모델이 데이터를 보고 예측하는 과정';
  if (category.includes('데이터')) return '데이터를 정리하고 해석하는 과정';
  return '코드를 읽고 문제를 해결하는 과정';
}

function polishGenericAnalogy(term) {
  const context = contextByCategory(term.category);
  return `${term.term}${josa(term.term, '은', '는')} ${context}에서 "${term.hint}" 역할을 맡습니다. 실제로는 ${term.definition} 이 설명을 떠올리면 언제 쓰이는 개념인지 더 분명해집니다.`;
}

function polishGenericTip(term) {
  const object = josa(term.term, '을', '를');
  return `퀴즈에서 "${term.hint}" 또는 "${term.definition.split('.')[0]}" 같은 단서가 보이면 ${term.term}${object} 먼저 떠올리세요. 비슷한 용어와 헷갈릴 때는 입력, 처리, 결과 중 어느 부분을 설명하는지 나누어 보면 좋습니다.`;
}

const genericAnalogyNeedles = [
  '지도 위의 표식',
  '작업장에서 쓰는 전용 도구',
  '책상 위에 흩어진 도구',
  '레시피의 한 단계',
];

const genericTipNeedles = [
  '비슷한 용어와 함께 나올 때 의미가 선명해집니다',
  '실무 문서에서 짧게 언급되는 경우가 많습니다',
  '정의만 외우지 말고',
];

let changed = 0;
for (let week = 1; week <= 30; week += 1) {
  const file = path.join(DATA_DIR, `terms.week${week}.json`);
  const terms = JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const term of terms) {
    if (!term.detail) continue;
    for (const key of ['easy', 'analogy', 'example', 'tip']) {
      const before = term.detail[key];
      const after = polishJosa(before, term.term);
      if (after !== before) {
        term.detail[key] = after;
        changed += 1;
      }
    }

    if (week >= 2 && week <= 4 && genericAnalogyNeedles.some(needle => term.detail.analogy.includes(needle))) {
      term.detail.analogy = polishGenericAnalogy(term);
      changed += 1;
    }

    if (week >= 2 && week <= 5 && genericTipNeedles.some(needle => term.detail.tip.includes(needle))) {
      term.detail.tip = polishGenericTip(term);
      changed += 1;
    }
  }

  fs.writeFileSync(file, `${JSON.stringify(terms, null, 2)}\n`, 'utf8');
}

console.log(`polished detail fields: ${changed}`);

# Term Bank Regeneration Resume Prompt

## 현재 상태

- 작업 위치: `C:\working\coding-terms-quiz`
- 목표: `terms.week6.json`부터 `terms.week30.json`까지 고품질 term bank JSON 재생성
- 품질 기준:
  - `definition`은 실제 용어 의미를 1~2문장으로 설명
  - `analogy`는 용어별 고유 비유 사용, 반복 템플릿 금지
  - `analogy` 소재로 택배·식당·도서관·마트·요리는 week6~11에서 이미 누적 9회 이상 사용됨 — 같은 소재 반복 금지, 주차 내에서도 같은 소재 2회 이상 사용 금지
  - `example`은 실행 가능한 코드, 주석은 한국어
  - 용어명은 `tools/term-bank-plan.json` 기준으로 사용
  - 전체 2100개 용어 중복 없음

## 완료된 작업

다음 주차는 재생성 및 검증 완료:

- week6: `data/terms.week6.json`
- week7: `data/terms.week7.json`
- week8: `data/terms.week8.json`
- week9: `data/terms.week9.json`
- week10: `data/terms.week10.json`
- week11: `data/terms.week11.json`

생성기:

- `tools/generate-week6-curated.js`
- `tools/generate-week7-curated.js`
- `tools/generate-week8-curated.js`
- `tools/generate-week9-curated.js`
- `tools/generate-week10-curated.js`
- `tools/generate-week11-curated.js`

보조 도구:

- `tools/build-term-bank-plan.js`
- `tools/term-bank-plan.json`
- `tools/audit-term-quality.js`
- 기존 저품질 일괄 생성기 `tools/generate-week6-week30-terms.js`는 사용 금지하도록 비활성화됨

## 마지막 검증 결과

week11 완료 후 실행 결과:

- `node tools\validate-terms.js`: 통과, 오류 0개, 경고 36개
- `node tools\audit-term-quality.js week11`: 통과
- week1~11 용어 중복: 0개
- week6~11 계획표 불일치: none
- week6~11 정의/비유/예제 고유성: 각 주차 `70/70`

남은 전체 경고 36개는 아직 재생성하지 않은 week12 이후 기존 파일의 중복 경고다.

## 다음 작업

다음은 `week12 자료구조`부터 진행한다.

1. 계획표에서 week12 용어 확인:

```powershell
node -e "const plan=require('./tools/term-bank-plan.json'); for (const x of plan.filter(t=>t.week===12)) console.log(x.id+' '+x.term+(x.originalTerm&&x.originalTerm!==x.term?' <- '+x.originalTerm:''));"
```

2. `tools/generate-week12-curated.js` 생성
   - `plan.filter((item) => item.week === 12)` 사용
   - `rows.length === 70` 검사
   - 각 row term이 plan term과 일치하는지 검사
   - 출력 파일: `data/terms.week12.json`
   - category: `자료구조`
   - phase: `3`
   - week: `12`
   - ID 시작: `771`
   - difficulty 비율 phase 3 기준:
     - easy 약 20%: 14개
     - medium 약 55%: 39개
     - hard 약 25%: 17개

3. 생성:

```powershell
node tools\generate-week12-curated.js
```

4. 검증:

```powershell
node tools\validate-terms.js
node tools\audit-term-quality.js week12
```

5. 중복 및 계획표 일치 확인:

```powershell
node -e "const fs=require('fs'); const seen=new Map(); const dups=[]; for(let w=1;w<=12;w++){const a=JSON.parse(fs.readFileSync('data/terms.week'+w+'.json','utf8')); for(const x of a){const k=x.term.trim().toLowerCase(); const loc='week'+w+' id='+x.id; if(seen.has(k)) dups.push(x.term+' :: '+seen.get(k)+' -> '+loc); else seen.set(k,loc);}} console.log('week1-12 duplicate count:',dups.length); if(dups.length) console.log(dups.join('\n'));"
```

```powershell
node -e "const fs=require('fs'); const plan=require('./tools/term-bank-plan.json'); for(let w=6;w<=12;w++){const a=JSON.parse(fs.readFileSync('data/terms.week'+w+'.json','utf8')); const pp=plan.filter(x=>x.week===w); const bad=[]; for(let i=0;i<a.length;i++){if(a[i].term!==pp[i].term) bad.push(a[i].id+': '+a[i].term+' != '+pp[i].term);} console.log('week'+w,'plan mismatch:',bad.length?bad.join('\n'):'none');}"
```

```powershell
node -e "const fs=require('fs'); for(let w=6;w<=12;w++){const a=JSON.parse(fs.readFileSync('data/terms.week'+w+'.json','utf8')); const defs=new Set(a.map(x=>x.definition)); const analog=new Set(a.map(x=>x.detail.analogy)); const ex=new Set(a.map(x=>x.detail.example)); console.log('week'+w,'unique defs/analogies/examples:',defs.size+'/'+a.length,analog.size+'/'+a.length,ex.size+'/'+a.length);}"
```

## 이어서 사용할 사용자 프롬프트

```text
TERM_BANK_RESUME_PROMPT.md를 읽고 이어서 진행해주세요.
week12 자료구조부터 재생성하고, 기존 방식처럼 생성기 추가 -> JSON 생성 -> validate -> audit -> week1~현재주차 중복 검사 -> 계획표 일치 검사까지 진행해주세요.
definition은 실제 의미, analogy는 용어별 고유 비유, example은 실행 가능한 코드로 작성해주세요.
analogy 소재로 택배·식당·도서관·마트·요리는 사용하지 마세요. 주차 내에서도 같은 소재를 2회 이상 쓰지 마세요.
```

# Term Bank Regeneration Completion Prompt

## 현재 상태

- 작업 위치: `C:\working\coding-terms-quiz`
- 목표였던 `terms.week6.json`부터 `terms.week30.json`까지 고품질 term bank JSON 재생성 완료
- 전체 term bank:
  - week1~week30
  - 총 2100개 용어
  - 전체 용어 중복 없음

## 품질 기준

- `definition`은 실제 용어 의미를 1~2문장으로 설명
- `analogy`는 용어별 고유 비유 사용, 반복 템플릿 금지
- `example`은 Python 3에서 실행 가능한 코드, 주석은 한국어
- 용어명은 `tools/term-bank-plan.json` 기준 사용
- 각 주차 70개 항목
- week6~week30은 계획표 순서와 JSON 용어명이 일치해야 함

## 완료된 작업

다음 주차는 재생성 및 검증 완료:

- week6~week30: `data/terms.week6.json` ~ `data/terms.week30.json`

생성기:

- `tools/generate-week6-curated.js` ~ `tools/generate-week30-curated.js`

보조 도구:

- `tools/build-term-bank-plan.js`
- `tools/term-bank-plan.json`
- `tools/audit-term-quality.js`
- `tools/validate-terms.js`
- 기존 저품질 일괄 생성기 `tools/generate-week6-week30-terms.js`는 사용 금지하도록 비활성화됨

## 마지막 검증 결과

2026-05-07 최종 실행 결과:

- `node tools\validate-terms.js`: 통과
  - 총 용어: 2100
  - 오류: 0
  - 경고: 0
- `node tools\audit-term-quality.js week30`: 통과
- week1~30 용어 중복: 0개
- week6~30 계획표 불일치: none
- week6~30 정의/비유/예제 고유성: 각 주차 `70/70`

마지막 전체 검증 명령:

```powershell
node tools\validate-terms.js
node tools\audit-term-quality.js week30
```

중복 검사:

```powershell
node -e "const fs=require('fs'); const seen=new Map(); const dups=[]; for(let w=1;w<=30;w++){const a=JSON.parse(fs.readFileSync('data/terms.week'+w+'.json','utf8')); for(const x of a){const k=x.term.trim().toLowerCase(); const loc='week'+w+' id='+x.id; if(seen.has(k)) dups.push(x.term+' :: '+seen.get(k)+' -> '+loc); else seen.set(k,loc);}} console.log('week1-30 duplicate count:',dups.length); if(dups.length) console.log(dups.join('\n'));"
```

계획표 일치 검사:

```powershell
node -e "const fs=require('fs'); const plan=require('./tools/term-bank-plan.json'); for(let w=6;w<=30;w++){const a=JSON.parse(fs.readFileSync('data/terms.week'+w+'.json','utf8')); const pp=plan.filter(x=>x.week===w); const bad=[]; for(let i=0;i<a.length;i++){if(a[i].term!==pp[i].term) bad.push(a[i].id+': '+a[i].term+' != '+pp[i].term);} console.log('week'+w,'plan mismatch:',bad.length?bad.join('\n'):'none');}"
```

고유성 검사:

```powershell
node -e "const fs=require('fs'); for(let w=6;w<=30;w++){const a=JSON.parse(fs.readFileSync('data/terms.week'+w+'.json','utf8')); const defs=new Set(a.map(x=>x.definition)); const analog=new Set(a.map(x=>x.detail.analogy)); const ex=new Set(a.map(x=>x.detail.example)); console.log('week'+w,'unique defs/analogies/examples:',defs.size+'/'+a.length,analog.size+'/'+a.length,ex.size+'/'+a.length);}"
```

## 이후 작업

재생성 작업 자체는 완료됐다. 다음 세션에서 할 일은 새 용어 데이터가 앱에서 문제없이 쓰이는지 확인하는 것이다.

권장 순서:

1. `git status --short`로 현재 변경 상태 확인
2. `node tools\validate-terms.js` 재실행
3. 앱이 week1~week30 데이터를 모두 정상 로드하는지 확인
4. 퀴즈/복습/충전 게임에서 30주 데이터 접근이 깨지지 않는지 확인
5. 필요하면 UI에서 긴 용어명, 긴 정의, 긴 예제 표시가 깨지지 않는지 점검
6. 이상 없으면 term bank 재생성 변경분을 커밋하거나 배포 준비

## 이어서 사용할 사용자 프롬프트

```text
TERM_BANK_RESUME_PROMPT.md를 읽고 이어서 진행해주세요.

week6~week30 term bank 재생성은 완료된 상태입니다.
먼저 git status와 검증 상태를 확인하고, `node tools\validate-terms.js`를 다시 실행해주세요.

그 다음 앱에서 week1~week30 데이터가 정상 로드되는지, 퀴즈/복습/충전 게임 흐름에서 새 term bank JSON이 문제없이 쓰이는지 확인해주세요.
긴 용어명, 긴 definition, detail.example 표시가 UI에서 깨지지 않는지도 점검해주세요.

기존 변경을 reset/revert하지 말고, 문제가 발견되면 관련 파일을 읽은 뒤 최소 범위로 수정하고 검증 명령을 다시 실행해주세요.
```

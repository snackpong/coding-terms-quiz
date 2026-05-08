# Next Work Prompt

프로젝트: `C:\working\coding-terms-quiz`

## 이전 작업 요약

- GitHub `master`까지 푸시 완료.
- 주요 커밋:
  - `afe3188 Improve term detail explanations`
  - `e332d27 Fix header and filter click targets`
  - `ee78c25 Polish term detail copy quality`
- 1-30주차 전체 2,100개 용어의 `detail.easy / detail.analogy / detail.example / detail.tip` 고유성 검증 완료.
- 2-5주차의 중복 템플릿 자세히 알기 데이터를 실제 단어별 설명/예시로 재작성.
- 자세히 알기 UI가 실제 `term.detail` 데이터를 표시하도록 수정.
- 헤더 메뉴와 컬렉션 필터 클릭 문제 수정.
- 조사 오류 및 반복 문구 일부 보정.
- 마지막 확인 시 `git status` clean.

## 다음 작업 목표

1. 실제 브라우저 화면 기준으로 UI 문구/깨진 한글/레이아웃을 점검한다.
2. 특히 다음 화면을 우선 확인:
   - Home
   - Collections
   - Review
   - Quiz result footer
   - 자세히 알기 modal/details
   - Games / 충전 게임
3. 깨진 한글, 어색한 버튼 문구, 겹침, 클릭 안 되는 요소가 있으면 수정한다.
4. 가능하면 1, 2, 3, 5, 10, 20, 30주차에서 몇 개씩 자세히 알기를 직접 샘플 확인한다.
5. 변경 후 아래 검증을 실행한다.

```powershell
node tools\validate-terms.js
node --check app.js
node --check scripts\app.part1.js
node --check scripts\app.part2.js
node --check scripts\app.part3.js
node --check scripts\app.part4.js
```

6. 이상 없으면 커밋 및 GitHub `master`로 푸시한다.

## 주의

- 사용자가 직접 만든 변경이 있을 수 있으니 `git status` 먼저 확인하고, 모르는 변경은 되돌리지 말 것.
- 자세히 알기 데이터는 이미 전체 고유성 검증이 끝났으므로 대규모 재생성은 필요할 때만 한다.
- 화면 문구 수정은 기능 코드와 분리해서 작게 커밋하는 것이 좋다.

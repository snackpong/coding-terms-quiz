'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_PATH = path.join(__dirname, 'term-bank-plan.json');

const replacementsById = {
  '361': ['함수 종속성', 'week5 정규화와 중복되어 정규화의 선행/핵심 개념으로 대체'],
  '366': ['트랜잭션 경계', 'week3 트랜잭션과 중복되어 실무 설계에서 쓰는 경계 개념으로 대체'],
  '368': ['커밋 로그', 'week3 커밋과 중복되어 DB 복구와 지속성에 가까운 개념으로 대체'],
  '373': ['질의 처리기', 'week1 쿼리와 중복되어 DB 내부 실행 구성요소로 대체'],
  '380': ['도메인 제약', 'week2 데이터 타입과 중복되어 값 범위 제약 개념으로 대체'],
  '381': ['NULL 전파', 'week2 NULL과 중복되어 SQL 연산에서 NULL이 전파되는 심화 개념으로 대체'],

  '491': ['라우트 매칭', 'week3 라우팅과 중복되어 URL을 라우트 규칙에 맞추는 심화 개념으로 대체'],
  '492': ['미들웨어 체인', 'week3 미들웨어와 중복되어 여러 미들웨어 실행 순서 개념으로 대체'],
  '500': ['CORS 자격 증명 요청', 'week3 CORS와 중복되어 쿠키/인증 포함 CORS 심화 개념으로 대체'],
  '502': ['DOM 기반 XSS', 'week3 XSS와 중복되어 브라우저 DOM 조작 기반 공격 유형으로 대체'],
  '543': ['HTTPS 리다이렉션', 'week3 HTTPS와 중복되어 HTTP 요청을 HTTPS로 강제 전환하는 운영 개념으로 대체'],

  '563': ['JWT 클레임', 'week3 JWT와 중복되어 토큰 내부 정보 필드 개념으로 대체'],

  '701': ['암묵적 상수 비용', 'week2 시간 복잡도와 중복되어 빅오에 숨겨지는 실제 비용 개념으로 대체'],
  '715': ['상태 전이', 'week4 메모이제이션과 중복되어 DP 상태 간 이동 개념으로 대체'],
  '723': ['파라메트릭 서치', 'week2 이진 탐색과 중복되어 답 공간에 이진 탐색을 적용하는 심화 기법으로 대체'],
  '726': ['셸 정렬', 'week2 버블 정렬과 중복되어 다른 비교 기반 정렬로 대체'],

  '792': ['해시 테이블 리해싱', 'week2 해시 테이블과 중복되어 크기 확장 시 재배치 개념으로 대체'],

  '842': ['모델 용량', 'week5 과소적합과 중복되어 과소/과대적합을 설명하는 모델 표현력 개념으로 대체'],
  '843': ['중첩 교차 검증', 'week5 교차 검증과 중복되어 튜닝과 평가를 분리하는 심화 검증으로 대체'],
  '846': ['탐색 공간', 'week5 하이퍼파라미터와 중복되어 튜닝 후보 범위 개념으로 대체'],
  '856': ['좌표 하강법', 'week5 경사 하강법과 중복되어 다른 최적화 기법으로 대체'],
  '858': ['배치 크기', 'week5 미니배치와 중복되어 학습 안정성과 속도에 영향을 주는 설정으로 대체'],
  '874': ['엑스트라 트리', 'week5 랜덤 포레스트와 중복되어 유사한 트리 앙상블 기법으로 대체'],
  '881': ['오차 행렬 해석', 'week5 혼동 행렬과 중복되어 행렬 결과 해석 개념으로 대체'],
  '883': ['매크로 F1', 'week5 F1 점수와 중복되어 클래스별 F1 평균 방식으로 대체'],
  '891': ['트리 가지치기', 'week5 결정 트리와 중복되어 트리 모델 복잡도 제어 기법으로 대체'],
  '893': ['K-중앙값', 'week5 K-평균과 중복되어 중심을 중앙값으로 잡는 군집화 변형으로 대체'],
  '899': ['하이브리드 추천', 'week5 추천 시스템과 중복되어 여러 추천 방식을 결합하는 개념으로 대체'],
  '900': ['아이템 기반 협업 필터링', 'week5 협업 필터링과 중복되어 아이템 유사도 중심 기법으로 대체'],
  '903': ['테스트 시간 증강(TTA)', 'week5 데이터 증강과 중복되어 추론 시 증강을 활용하는 기법으로 대체'],

  '911': ['맥컬록-피츠 뉴런', 'week5 퍼셉트론과 중복되어 초기 인공 뉴런 모델로 대체'],
  '917': ['ReLU6', 'week5 ReLU와 중복되어 모바일 모델에서 쓰는 ReLU 변형으로 대체'],
  '948': ['GAN 생성자 네트워크', 'week2 생성자와 중복되어 GAN 맥락의 생성자 의미로 명확화'],

  '994': ['컨텍스트 압축', 'week5 컨텍스트 윈도우와 중복되어 긴 입력을 줄여 쓰는 LLM 운영 기법으로 대체'],
  '1004': ['개발자 프롬프트', 'week5 시스템 프롬프트와 중복되어 시스템 지시 아래 개발자 지시 계층으로 대체'],

  '1057': ['운영성(Operability)', 'week4 유지보수성과 중복되어 운영하기 쉬운 시스템 품질 속성으로 대체'],

  '1130': ['정적 팩토리 메서드', 'week3 팩토리 패턴과 중복되어 객체 생성 메서드 관용구로 대체'],
  '1133': ['싱글톤 수명주기', 'week3 싱글톤 패턴과 중복되어 단일 인스턴스 생성/소멸 관리 개념으로 대체'],
  '1135': ['객체 어댑터', 'week4 어댑터 패턴과 중복되어 합성 기반 어댑터 변형으로 대체'],
  '1138': ['동적 데코레이션', 'week4 데코레이터 패턴과 중복되어 런타임 책임 추가 개념으로 대체'],
  '1139': ['서브시스템 파사드', 'week4 퍼사드 패턴과 중복되어 복잡한 하위 시스템 단순화 개념으로 대체'],
  '1147': ['이벤트 리스너 패턴', 'week3 옵저버 패턴과 중복되어 이벤트 기반 구독 처리 용어로 대체'],
  '1149': ['정책 객체 패턴', 'week4 전략 패턴과 중복되어 교체 가능한 정책 객체 개념으로 대체'],
  '1163': ['제네릭 타입 추론', 'week3 타입 추론과 중복되어 제네릭 인자 추론 심화 개념으로 대체'],

  '1309': ['운영 수준 목표(OLA)', 'week10 SLA와 중복되어 내부 운영 조직 간 목표 합의 개념으로 대체'],

  '1362': ['데이터 클리닝', 'week5 데이터 전처리와 중복되어 오류/노이즈 정제 단계로 대체'],
  '1367': ['매니폴드 학습', 'week5 차원 축소와 중복되어 비선형 저차원 구조 학습 개념으로 대체'],

  '1472': ['어니언 아키텍처', 'week4 헥사고날 아키텍처와 중복되어 의존성 방향 중심의 대체 아키텍처로 변경'],
  '1474': ['모듈러 모놀리스', 'week4 레이어드 아키텍처와 중복되어 배포 단위는 하나지만 모듈 경계를 나누는 구조로 대체'],

  '1762': ['메모리 단편화', 'week1 메모리 누수와 중복되어 할당 공간이 잘게 나뉘는 성능 문제로 대체'],

  '1895': ['승인 테스트', 'week25 계약 테스트와 중복되어 요구사항 충족 여부를 확인하는 테스트로 대체'],

  '2057': ['지속적 개선(Kaizen)', 'week28 점진적 개선과 중복되어 조직적 개선 문화 용어로 대체']
};

function readWeek(week) {
  const filePath = path.join(DATA_DIR, `terms.week${week}.json`);
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return items.map((item, index) => {
    const id = String(item.id).padStart(3, '0');
    const replacement = replacementsById[id];
    const term = replacement ? replacement[0] : item.term;
    return {
      id,
      week,
      phase: item.phase,
      category: item.category,
      difficulty: item.difficulty,
      term,
      originalTerm: item.term,
      source: replacement ? 'replacement' : 'existing',
      replaces: replacement ? item.term : null,
      reason: replacement ? replacement[1] : null,
      indexInWeek: index
    };
  });
}

const plan = [];
for (let week = 1; week <= 30; week += 1) {
  plan.push(...readWeek(week));
}

if (plan.length !== 2100) {
  throw new Error(`expected 2100 terms, got ${plan.length}`);
}

const seen = new Map();
const duplicates = [];
for (const item of plan) {
  const key = item.term.trim().toLowerCase();
  if (seen.has(key)) {
    duplicates.push({ term: item.term, first: seen.get(key), second: item.id });
  } else {
    seen.set(key, item.id);
  }
}

if (duplicates.length > 0) {
  console.error('duplicate terms remain after replacement:');
  for (const duplicate of duplicates) {
    console.error(`- ${duplicate.term}: ${duplicate.first} / ${duplicate.second}`);
  }
  throw new Error(`duplicate terms remain: ${duplicates.length}`);
}

fs.writeFileSync(OUT_PATH, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');

const replacementCount = plan.filter((item) => item.source === 'replacement').length;
console.log(`wrote ${path.relative(process.cwd(), OUT_PATH)}`);
console.log(`terms: ${plan.length}`);
console.log(`unique terms: ${seen.size}`);
console.log(`replacements: ${replacementCount}`);

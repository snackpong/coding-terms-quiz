# Codex Task: Generate Term Bank JSON Files (v2 — 재생성)

## 배경

이전 생성본에 치명적 품질 문제가 있어 전량 폐기하고 재생성합니다.

---

## ❌ 이전 생성본의 문제 (반드시 피할 것)

### 문제 1 — definition이 무의미한 템플릿
```
// 나쁜 예 (사용 금지)
"definition": "기본 키는 데이터베이스 기초에서 데이터베이스 문제를 더 명확하게
다루기 위한 핵심 개념입니다. 처음 배울 때는 이름보다 어떤 문제를 줄이는지
먼저 보면 이해하기 쉽습니다."
```
→ 용어의 실제 의미가 없음. definition은 **그 용어가 무엇인지** 정의해야 함.

```
// 좋은 예
"definition": "데이터베이스 테이블에서 각 행을 고유하게 식별하는 열.
중복이 없고 NULL이 불가능합니다. 예: 회원 테이블의 user_id."
```

### 문제 2 — analogy가 전 항목 동일
```
// 나쁜 예 (사용 금지)
"analogy": "일상생활로 비유하면 기본 키는 정리된 책상 위의 라벨과 같습니다.
라벨이 있으면 물건을 빨리 찾고, 어디에..."
// → 2100개 모두 "정리된 책상 라벨" 반복
```
→ 각 용어마다 **해당 용어에만 맞는 고유한 비유**를 사용해야 함.

```
// 좋은 예
"analogy": "학교 학생 명부에서 이름이 같아도 학번은 반드시 다릅니다.
기본 키는 그 학번처럼 각 행을 절대 겹치지 않게 구분하는 값입니다."
```

### 문제 3 — 하나의 용어를 변형해서 여러 개로 쪼갬
```
// 나쁜 예 (사용 금지)
"기본 키" / "기본 키 역할" / "기본 키 사용 예" / "기본 키 주의점" / "기본 키 확인법"
```
→ 이건 5개가 아니라 **1개**임. 아래 제공된 용어 목록만 사용할 것.

---

## ✅ 좋은 예시 (week1에서 발췌)

```json
{
  "id": "001",
  "term": "변수",
  "category": "프로그래밍 기초",
  "difficulty": "easy",
  "phase": 1,
  "week": 1,
  "definition": "프로그램에서 값을 저장하는 이름이 붙은 공간. 예: age = 25처럼 숫자, 이름, 상태 등을 담아 재사용합니다.",
  "hint": "데이터를 담는 이름 붙은 그릇",
  "detail": {
    "easy": "값을 기억하는 이름 붙은 상자",
    "analogy": "변수는 물건을 넣는 서랍과 같습니다. 서랍에 이름표(변수명)를 붙이고 숫자, 글자 등 무엇이든 넣을 수 있습니다. 나중에 그 이름을 부르면 안에 있는 값을 꺼낼 수 있습니다.",
    "example": "age = 25        # age라는 서랍에 숫자 25를 넣음\nname = \"홍길동\"  # name이라는 서랍에 이름을 넣음\nprint(age)       # 서랍 열기 → 25 출력",
    "tip": "변수 이름은 직관적으로 지을수록 좋습니다. \"a = 25\"보다 \"age = 25\"가 나중에 읽을 때 훨씬 이해하기 쉽습니다."
  }
}
```

```json
{
  "id": "003",
  "term": "반복문",
  "category": "프로그래밍 기초",
  "difficulty": "easy",
  "phase": 1,
  "week": 1,
  "definition": "같은 동작을 여러 번 반복하도록 하는 코드. 예: 1부터 100까지 출력할 때 100줄 대신 반복문 하나로 해결합니다.",
  "hint": "같은 동작을 반복 실행",
  "detail": {
    "easy": "똑같은 작업을 여러 번 자동으로 실행하는 명령",
    "analogy": "공장 컨베이어 벨트와 같습니다. 제품 100개가 지나가도 사람이 100번 스티커를 붙일 필요 없이 기계가 자동으로 반복합니다.",
    "example": "for i in range(5):      # 5번 반복\n    print(f\"{i+1}번째!\")\n# 결과: 1번째! 2번째! 3번째! 4번째! 5번째!",
    "tip": "\"이 작업을 100번 써야 하나?\"라는 생각이 들면 반복문이 답입니다."
  }
}
```

---

## JSON 스키마 (모든 필드 필수)

```json
{
  "id": "351",
  "term": "용어명 (아래 목록에서만 선택)",
  "category": "카테고리명",
  "difficulty": "easy | medium | hard",
  "phase": 2,
  "week": 6,
  "definition": "실제 의미를 설명하는 1~2문장. 예시 포함 권장.",
  "hint": "10자 이하 핵심 키워드",
  "detail": {
    "easy": "초등학생도 이해할 한 줄 설명",
    "analogy": "이 용어에만 맞는 고유한 일상 비유 2~4문장",
    "example": "실제 동작하는 코드 (주석 한국어)",
    "tip": "실무 팁 또는 주의점 1~2문장"
  }
}
```

**품질 체크리스트 (항목마다 확인)**
- [ ] definition: 용어가 **무엇인지** 실제로 설명하는가?
- [ ] analogy: 이 용어에만 해당하는 **고유한** 비유인가? 다른 항목과 다른가?
- [ ] example: 실제로 실행 가능한 코드인가?
- [ ] term: 아래 제공된 목록에 있는 이름을 그대로 사용했는가?

---

## Phase / Difficulty 매핑

| Phase | 주차 | easy | medium | hard |
|-------|------|------|--------|------|
| 2 | 6~10 | 50% | 40% | 10% |
| 3 | 11~17 | 20% | 55% | 25% |
| 4 | 18~24 | 10% | 50% | 40% |
| 5 | 25~30 | 5%  | 40% | 55% |

---

## ID 범위

| 파일 | week | phase | ID 범위 |
|------|------|-------|---------|
| terms.week6.json  | 6  | 2 | 351~420  |
| terms.week7.json  | 7  | 2 | 421~490  |
| terms.week8.json  | 8  | 2 | 491~560  |
| terms.week9.json  | 9  | 2 | 561~630  |
| terms.week10.json | 10 | 2 | 631~700  |
| terms.week11.json | 11 | 3 | 701~770  |
| terms.week12.json | 12 | 3 | 771~840  |
| terms.week13.json | 13 | 3 | 841~910  |
| terms.week14.json | 14 | 3 | 911~980  |
| terms.week15.json | 15 | 3 | 981~1050 |
| terms.week16.json | 16 | 3 | 1051~1120|
| terms.week17.json | 17 | 3 | 1121~1190|
| terms.week18.json | 18 | 4 | 1191~1260|
| terms.week19.json | 19 | 4 | 1261~1330|
| terms.week20.json | 20 | 4 | 1331~1400|
| terms.week21.json | 21 | 4 | 1401~1470|
| terms.week22.json | 22 | 4 | 1471~1540|
| terms.week23.json | 23 | 4 | 1541~1610|
| terms.week24.json | 24 | 4 | 1611~1680|
| terms.week25.json | 25 | 5 | 1681~1750|
| terms.week26.json | 26 | 5 | 1751~1820|
| terms.week27.json | 27 | 5 | 1821~1890|
| terms.week28.json | 28 | 5 | 1891~1960|
| terms.week29.json | 29 | 5 | 1961~2030|
| terms.week30.json | 30 | 5 | 2031~2100|

---

## 주차별 용어 목록 (이 이름을 그대로 사용)

### week6 — 데이터베이스 기초 (ID 351~420)
기본 키, 외래 키, 고유 키, 복합 키, 인덱스, 테이블, 행(레코드), 열(컬럼), 스키마, 제약조건, 정규화, 1정규형, 2정규형, 3정규형, 역정규화, 트랜잭션, ACID, 커밋, 롤백, 데이터베이스(DB), 관계형 데이터베이스(RDBMS), 비관계형 데이터베이스(NoSQL), 쿼리, 뷰(View), 저장 프로시저, 트리거, ERD, 카디널리티, 참조 무결성, 데이터 타입, NULL, 기본값(DEFAULT), 1:N 관계, N:M 관계, 데이터베이스 커넥션, 커넥션 풀, 실행 계획(EXPLAIN), 잠금(Lock), 교착상태(Deadlock), 격리 수준, 파티셔닝, 샤딩, 복제(Replication), 데이터 마이그레이션, 시퀀스(Sequence), AUTO_INCREMENT, 체크 제약조건, 유니크 제약조건, 인덱스 스캔, 풀 테이블 스캔, 데이터 무결성, 기본 키 충돌, 외래 키 충돌, CASCADE 삭제, 소프트 삭제, 하드 삭제, 스냅샷, 백업, 복구(Recovery), 데이터베이스 캐싱, 읽기 전용 복제본, 마스터-슬레이브, 데이터 웨어하우스, OLTP, OLAP, 컬럼 기반 저장, 행 기반 저장, 와이드 컬럼 스토어, 문서 데이터베이스, 키-값 저장소

### week7 — SQL 심화 (ID 421~490)
SELECT 문, WHERE 절, AND/OR 조건, LIKE 연산자, IN 연산자, BETWEEN 연산자, IS NULL, ORDER BY, LIMIT/OFFSET, GROUP BY, HAVING, 집계 함수(COUNT), 집계 함수(SUM/AVG), INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN, 셀프 조인, 서브쿼리, 상관 서브쿼리, EXISTS, NOT EXISTS, UNION, UNION ALL, INTERSECT, EXCEPT, WITH(CTE), 윈도우 함수, ROW_NUMBER(), RANK(), DENSE_RANK(), LEAD/LAG, PARTITION BY, 조건 표현식(CASE WHEN), COALESCE, NULLIF, CAST/CONVERT, 날짜 함수, 문자열 함수, 수학 함수, INSERT INTO, UPDATE SET, DELETE FROM, TRUNCATE, CREATE TABLE, ALTER TABLE, DROP TABLE, CREATE INDEX, EXPLAIN 분석, 쿼리 최적화, 인덱스 힌트, 임시 테이블, 뷰 생성, 저장 함수, 커서(Cursor), 트랜잭션 격리, SELECT FOR UPDATE, 락 타임아웃, 쿼리 캐시, 페이지네이션 최적화, 배치 INSERT, UPSERT(INSERT ON DUPLICATE), 집계 함수(MIN/MAX), WITH RECURSIVE(재귀 CTE), NTILE(), PERCENT_RANK(), CUME_DIST(), FIRST_VALUE()/LAST_VALUE(), PIVOT(행-열 전환)
### week8 — 웹 개발 심화 (ID 491~560)
라우팅, 미들웨어, 요청 객체(Request), 응답 객체(Response), HTTP 메서드(GET/POST/PUT/DELETE), 상태 코드(200/404/500), 헤더(Header), 쿠키(Cookie), 세션(Session), CORS, CSRF, XSS, SQL 인젝션, 입력 검증, 속도 제한(Rate Limiting), API 게이트웨이, 로드 밸런서, 역방향 프록시(Reverse Proxy), 정방향 프록시(Forward Proxy), CDN, WebSocket, SSE(Server-Sent Events), 롱 폴링, 단방향 통신, 양방향 통신, REST 원칙, RESTful 설계, HATEOAS, GraphQL, gRPC, OpenAPI/Swagger, 페이지네이션(Pagination), 필터링/정렬 API, 버전 관리(API Versioning), 인증 헤더(Authorization), Bearer 토큰, API 키, 웹훅(Webhook), 서버리스(Serverless), FaaS, BaaS, 정적 사이트 생성(SSG), 서버 사이드 렌더링(SSR), 클라이언트 사이드 렌더링(CSR), 점진적 웹 앱(PWA), 서비스 워커, 웹 캐싱, ETag, Cache-Control, 콘텐츠 협상, 멱등성(Idempotency), 압축(Gzip/Brotli), HTTPS, TLS 핸드셰이크, 인증서(Certificate), HTTP/2, HTTP/3, DNS 조회, URL 파싱, 쿼리 파라미터, 경로 파라미터, Same-Origin Policy, 프리플라이트 요청(Preflight), Content-Type 헤더, 멀티파트(Multipart) 요청, HEAD/OPTIONS 메서드, PATCH 메서드, Base64 인코딩, URL 인코딩(퍼센트), 웹소켓 핸드셰이크
### week9 — 인증·보안 (ID 561~630)
인증(Authentication), 인가(Authorization), JWT, JWT 서명, JWT 만료, 액세스 토큰, 리프레시 토큰, OAuth 2.0, OAuth 플로우, OpenID Connect, SSO(Single Sign-On), SAML, 세션 기반 인증, 토큰 기반 인증, 비밀번호 해싱, bcrypt, salt, 레인보우 테이블 공격, 브루트 포스 공격, 딕셔너리 공격, 계정 잠금, MFA(다중 인증), TOTP, FIDO2/WebAuthn, RBAC(역할 기반 접근제어), ABAC, 권한 상승, 최소 권한 원칙, 제로 트러스트, HTTPS 강제, HSTS, Content Security Policy, XSS 필터, CSRF 토큰, 클릭재킹 방지, SQL 인젝션 방어, 파라미터 바인딩, 입력 소독(Sanitization), 출력 인코딩, 보안 헤더, OWASP Top 10, 취약점 스캔, 침투 테스트, 공개키 암호화, 대칭키 암호화, AES, RSA, 디지털 서명, PKI, 인증서 체인, 환경 변수로 시크릿 관리, Vault, API 키 로테이션, 감사 로그(Audit Log), 세션 고정 공격, 세션 하이재킹, 쿠키 HttpOnly, 쿠키 Secure, SameSite 쿠키, CORS 화이트리스트, IP 화이트리스트, 보안 코드 리뷰, SAST, DAST, 패스키(Passkey), PKCE(코드 교환 증명), 비밀번호 없는 인증(Passwordless), 분산 세션, 세션 클러스터링, 클라이언트 인증서(mTLS)
### week10 — 클라우드·인프라 기초 (ID 631~700)
클라우드 컴퓨팅, IaaS, PaaS, SaaS, 퍼블릭 클라우드, 프라이빗 클라우드, 하이브리드 클라우드, 멀티 클라우드, 리전(Region), 가용 영역(AZ), 엣지 로케이션, VPC(가상 사설 클라우드), 서브넷, 보안 그룹, 네트워크 ACL, 탄력적 IP, NAT 게이트웨이, 인터넷 게이트웨이, EC2 인스턴스, 인스턴스 유형, AMI(머신 이미지), 오토 스케일링, 로드 밸런서(ALB/NLB), S3 스토리지, 객체 스토리지, 블록 스토리지, 파일 스토리지, RDS(관리형 DB), ElastiCache, CloudFront, Route 53, IAM(계정 권한 관리), IAM 역할, IAM 정책, 인프라스트럭처 코드(IaC), Terraform, CloudFormation, 앤서블(Ansible), 모니터링(CloudWatch), 알람(Alert), 로그 수집, 추적(Tracing), 비용 최적화, 예약 인스턴스, 스팟 인스턴스, 서버리스(Lambda), API Gateway(AWS), SQS 메시지 큐, SNS 알림, 이벤트 드리븐 아키텍처, 스토리지 클래스, 데이터 티어링, 재해 복구(DR), RTO/RPO, 장애 조치(Failover), 고가용성(HA), SLA, 비용 태깅(Cost Tagging), 리소스 그룹, Well-Architected Framework, 가상화(Virtualization), 하이퍼바이저(Hypervisor), 베어 메탈 서버, 엣지 컴퓨팅(Edge Computing), VPN 게이트웨이, 전용선(Direct Connect), VPC 피어링(Peering), 트랜짓 게이트웨이, DNS 장애 조치, 로그 아카이빙
### week11 — 알고리즘 기초 (ID 701~770)
시간 복잡도, 공간 복잡도, 빅오 표기법(O), O(1), O(n), O(n²), O(log n), O(n log n), 최선/평균/최악 케이스, 상수 인수 무시, 점근적 분석, 브루트 포스, 분할 정복, 동적 프로그래밍(DP), 메모이제이션, 탑다운 DP, 바텀업 DP, 그리디 알고리즘, 백트래킹, 분기 한정법, 슬라이딩 윈도우, 투 포인터, 이진 탐색, 선형 탐색, 해시 탐색, 버블 정렬, 선택 정렬, 삽입 정렬, 병합 정렬, 퀵 정렬, 힙 정렬, 계수 정렬, 기수 정렬, 위상 정렬, 안정 정렬, 제자리 정렬, BFS(너비 우선 탐색), DFS(깊이 우선 탐색), 다익스트라 알고리즘, 벨만-포드 알고리즘, 플로이드-워셜 알고리즘, 크루스칼 알고리즘, 프림 알고리즘, 최소 신장 트리(MST), 유니온-파인드, KMP 문자열 매칭, 라빈-카프 알고리즘, 최장 공통 부분 수열(LCS), 최장 증가 부분 수열(LIS), 배낭 문제(Knapsack), 동전 거스름돈 문제, 피보나치(DP), 행렬 체인 곱셈, 에라토스테네스의 체, 유클리드 호제법, 비트 연산, 비트마스크, 난수 알고리즘, 해시 충돌, 재귀 트리, 마스터 정리, 확률적 알고리즘, 근사 알고리즘, 온라인 알고리즘, 외부 정렬, 병렬 정렬, 허프만 코딩, 최대 유량(Max Flow), A* 알고리즘, 문자열 회전 판별
### week12 — 자료구조 (ID 771~840)
배열(Array), 동적 배열, 연결 리스트(Linked List), 이중 연결 리스트, 원형 연결 리스트, 스택(Stack), 큐(Queue), 덱(Deque), 우선순위 큐, 힙(Heap), 최대 힙, 최소 힙, 이진 트리, 이진 탐색 트리(BST), AVL 트리, 레드-블랙 트리, B-트리, B+트리, 트라이(Trie), 세그먼트 트리, 펜윅 트리(BIT), 해시 테이블, 해시 함수, 충돌 해결(체이닝), 충돌 해결(개방 주소법), 로드 팩터, 그래프(Graph), 방향 그래프, 무방향 그래프, 가중치 그래프, 인접 행렬, 인접 리스트, 희소 그래프, 밀집 그래프, 사이클, 연결 컴포넌트, 강연결 컴포넌트, DAG(방향 비순환 그래프), 트리의 높이/깊이, 균형 트리, 힙 정렬 과정, 힙 삽입/삭제, 스택 오버플로, 원형 큐, 슬라이딩 윈도우 큐, 모노토닉 스택, 모노토닉 큐, 희소 배열, 비트 배열, 해시 셋, 문자열 풀, 영속적 자료구조, 함수형 자료구조, 블룸 필터, 스킵 리스트, 피보나치 힙, 캐시 교체 정책(LRU), LFU 캐시, 구간 트리(Interval Tree), KD-트리, R-트리, 쿼드트리, 트레이(Treap), 스플레이 트리, XOR 연결 리스트, 로프(Rope) 자료구조, 이중 해싱(Double Hashing), 로빈 후드 해싱, 해시 맵 리사이징, 카운팅 블룸 필터
### week13 — AI/ML 심화 (ID 841~910)
편향-분산 트레이드오프, 과소적합, 교차 검증, K-폴드 교차검증, 홀드아웃, 하이퍼파라미터, 하이퍼파라미터 튜닝, 그리드 서치, 랜덤 서치, 베이즈 최적화, 학습률(Learning Rate), 학습률 스케줄러, 웜업(Warmup), 모멘텀(Momentum), Adam 옵티마이저, 경사 하강법, 확률적 경사 하강법(SGD), 미니배치, 배치 정규화(Batch Norm), 레이어 정규화, 드롭아웃(Dropout), 가중치 초기화, Xavier 초기화, He 초기화, 그래디언트 소실, 그래디언트 폭발, 그래디언트 클리핑, L1 정규화, L2 정규화, 엘라스틱넷, 앙상블 학습, 배깅(Bagging), 부스팅(Boosting), 랜덤 포레스트, XGBoost, LightGBM, 스태킹(Stacking), 특징 중요도, SHAP 값, LIME, 혼동 행렬, 정밀도/재현율, F1 점수, ROC-AUC, PR 곡선, 로그 손실, MAE/MSE/RMSE, 회귀 분석, 로지스틱 회귀, SVM(서포트 벡터 머신), 결정 트리, 클러스터링, K-평균, DBSCAN, 주성분 분석(PCA), t-SNE, UMAP, 이상 탐지, 추천 시스템, 협업 필터링, 콘텐츠 기반 필터링, 행렬 분해, 데이터 증강, 불균형 데이터, SMOTE, 클래스 가중치, 다중 레이블 분류, 반지도 학습(Semi-supervised), 연합 학습(Federated Learning), 능동 학습(Active Learning)
### week14 — 딥러닝 (ID 911~980)
퍼셉트론, 다층 퍼셉트론(MLP), 순전파(Forward Pass), 역전파(Backpropagation), 연쇄 법칙(Chain Rule), 활성화 함수 비교, ReLU, Leaky ReLU, GELU, Sigmoid, Tanh, Softmax, 합성곱 신경망(CNN), 합성곱 연산, 필터(커널), 특징 맵, 패딩, 스트라이드, 풀링(Pooling), 최대 풀링, 평균 풀링, 완전 연결층(FC Layer), ResNet, VGG, Inception, EfficientNet, 순환 신경망(RNN), LSTM, GRU, 게이트 메커니즘, 기울기 소실(RNN), 양방향 RNN, 시계열 예측, 자동 인코더(Autoencoder), 변분 오토인코더(VAE), 잠재 공간(Latent Space), GAN(생성적 적대 신경망), 생성자, 판별자, 모드 붕괴, 디퓨전 모델, 노이즈 제거 과정, 스코어 매칭, 그래프 신경망(GNN), 메시지 패싱, 전이 학습(Transfer Learning), 사전학습 모델(Pretrained Model), 파인튜닝(Fine-tuning), 특징 추출, 도메인 적응, 제로샷 학습, 원샷 학습, 메타 학습, 지식 증류(Knowledge Distillation), 가지치기(Pruning), 양자화(Quantization), 모델 압축, 하드웨어 가속(GPU/TPU), CUDA, 텐서 연산, 자동 미분(Autograd), 계산 그래프, 정적 그래프, 동적 그래프, PyTorch 기초, TensorFlow 기초, 신경 아키텍처 탐색(NAS), 혼합 정밀도 훈련(Mixed Precision), 그래디언트 누적, 그래디언트 체크포인팅
### week15 — LLM / 생성 AI (ID 981~1050)
대형 언어 모델(LLM), 트랜스포머 아키텍처, 셀프 어텐션, 멀티헤드 어텐션, 어텐션 스코어, 쿼리-키-값(Q-K-V), 포지셔널 인코딩, 인코더-디코더, 디코더 전용 모델, 토크나이저, BPE(바이트 쌍 인코딩), WordPiece, 어휘 크기(Vocabulary), 컨텍스트 윈도우, 토큰 예측(Next Token Prediction), 자기회귀(Autoregressive), 빔 서치(Beam Search), 탐욕적 디코딩, 온도(Temperature), Top-k 샘플링, Top-p 샘플링, 반복 패널티, 프롬프트 엔지니어링, 시스템 프롬프트, 퓨샷 프롬프팅(Few-shot), 제로샷 프롬프팅, 체인 오브 소트(CoT), 지시 튜닝(Instruction Tuning), RLHF, PPO(강화학습 정책 최적화), 보상 모델, DPO(직접 선호도 최적화), LoRA(저랭크 적응), QLoRA, 어댑터(Adapter), 프롬프트 튜닝, RAG(검색 증강 생성), 벡터 데이터베이스, 임베딩(Embedding), 코사인 유사도, 청킹(Chunking), 시맨틱 검색, 환각(Hallucination), 그라운딩, 에이전트(AI Agent), 도구 사용(Tool Use), 함수 호출(Function Calling), ReAct 패턴, 멀티 에이전트, 컨텍스트 길이, 긴 컨텍스트 처리, 플래시 어텐션, KV 캐시, 추론 최적화, 모델 서빙, 배치 추론, 스트리밍 출력, 멀티모달 모델, 비전-언어 모델, 이미지 캡셔닝, 크로스 모달 어텐션, 평가 벤치마크(MMLU/HumanEval), 프롬프트 인젝션(Prompt Injection), AI 안전성(AI Safety), 정렬 문제(Alignment), 헌법 AI(Constitutional AI), 해석 가능성(Interpretability), 프리픽스 캐싱(Prefix Caching), 모델 컨텍스트 프로토콜(MCP), AI 에이전트 오케스트레이션
### week16 — 시스템 디자인 기초 (ID 1051~1120)
확장성(Scalability), 수직 확장(Scale-up), 수평 확장(Scale-out), 가용성(Availability), 내구성(Durability), 신뢰성(Reliability), 유지보수성, 지연 시간(Latency), 처리량(Throughput), 대역폭, 병목 지점(Bottleneck), 단일 장애점(SPOF), 이중화(Redundancy), 페일오버(Failover), 서킷 브레이커(Circuit Breaker), 재시도 로직, 지수 백오프, 타임아웃, 헬스 체크, 그레이스풀 셧다운, 캐싱 전략, 캐시 히트/미스, TTL(만료 시간), 캐시 무효화, 라이트 스루 캐시, 라이트 백 캐시, 캐시 사이드, Redis 기초, Memcached, 메시지 큐 기초, Kafka 기초, RabbitMQ, 발행-구독 패턴, 이벤트 소싱, CQRS, CAP 정리, 일관성(Consistency), 가용성 vs 일관성, 최종 일관성(Eventual Consistency), 동기 통신, 비동기 통신, API 설계 원칙, 페이로드 크기 최적화, 데이터 직렬화, Protocol Buffers, MessagePack, 압축 알고리즘, 데이터 파티셔닝, 일관된 해싱(Consistent Hashing), 가상 노드, 읽기/쓰기 분리, 마스터-레플리카, 멀티 리더, 리더 없는 복제, 쓰기 충돌 해결, 벡터 시계, 분산 잠금, Zookeeper, etcd, 서비스 디스커버리, 사이드카 패턴, 더티 읽기(Dirty Read), 반복 불가 읽기(Non-repeatable Read), 팬텀 읽기(Phantom Read), 직렬화 가능(Serializable), WAL(Write-Ahead Log), 분산 카운터 설계, 리더보드 설계, 알림 시스템 설계, 검색 자동완성 설계
### week17 — 객체지향 프로그래밍 심화 (ID 1121~1190)
SOLID 원칙(전체), 단일 책임 원칙(SRP), 개방-폐쇄 원칙(OCP), 리스코프 치환 원칙(LSP), 인터페이스 분리 원칙(ISP), 의존성 역전 원칙(DIP), 의존성 주입(DI), 제어의 역전(IoC), IoC 컨테이너, 팩토리 패턴, 추상 팩토리 패턴, 빌더 패턴, 싱글톤 패턴, 프로토타입 패턴, 어댑터 패턴, 브리지 패턴, 컴포지트 패턴, 데코레이터 패턴, 퍼사드 패턴, 플라이웨이트 패턴, 프록시 패턴, 책임 연쇄 패턴, 커맨드 패턴, 이터레이터 패턴, 중재자 패턴, 메멘토 패턴, 옵저버 패턴, 상태 패턴, 전략 패턴, 템플릿 메서드 패턴, 방문자 패턴, 인터페이스 vs 추상 클래스, 덕 타이핑, 믹스인(Mixin), 컴포지션 vs 상속, 다이아몬드 문제, 메서드 오버로딩, 메서드 오버라이딩, 동적 디스패치, 공변성/반공변성, 제네릭(Generics), 타입 파라미터, 타입 추론, 구조적 타이핑, 명목적 타이핑, 불변 객체(Immutable), 값 객체(Value Object), 엔티티 객체, 애그리게이트, 도메인 이벤트, 리포지토리 패턴, 유비쿼터스 언어, 경계 컨텍스트(Bounded Context), 도메인 서비스, 응용 서비스, 도메인 주도 설계(DDD) 개요, 함수형 프로그래밍 원칙, 순수 함수(Pure Function), 참조 투명성, 함수 합성(Function Composition), 커링(Currying), 부분 적용(Partial Application), 모나드(Monad) 개념, 펑터(Functor), 불변 데이터 구조, 액터 모델(Actor Model), 반응형 프로그래밍(Rx), 이벤트 주도 설계, 메시지 주도 시스템, 공유 가변 상태 문제
### week18 — 보안 심화 (ID 1191~1260)
위협 모델링, STRIDE 모델, 공격 표면(Attack Surface), 취약점(Vulnerability), 익스플로잇(Exploit), 패치 관리, 제로데이 취약점, CVE, CVSS 점수, 버그 바운티, 침투 테스트(Pentest), 레드팀/블루팀, OWASP Top 10 상세, 인젝션 공격 종류, SSRF(서버 사이드 요청 위조), XXE(XML 외부 엔티티), IDOR(직접 객체 참조), 불안전한 역직렬화, 구성 오류, 로깅 부재, 공급망 공격, 의존성 취약점, npm audit, 컨테이너 보안, 런타임 보호, 네트워크 분리, 마이크로 세그멘테이션, 웹 방화벽(WAF), IDS/IPS, SIEM, 포렌식, 인시던트 대응, 사이버 킬 체인, MITRE ATT&CK, 피싱 공격, 소셜 엔지니어링, 랜섬웨어, APT 공격, DDoS 방어, 봇넷, 허니팟, 침해 지표(IOC), 암호화 키 관리, HSM(하드웨어 보안 모듈), 키 에스크로, 코드 서명, 바이너리 분석, 리버스 엔지니어링, 메모리 안전성, 버퍼 오버플로, 힙 스프레이, 형식 문자열 취약점, 경쟁 조건(Race Condition), TOCTOU, 샌드박스, 격리 실행, 컨테이너 탈출, 권한 상승(Linux), Capabilities, SELinux, AppArmor, 보안 기준선(Hardening), CIS Benchmark, 스테가노그래피, 타이밍 공격(Timing Attack), 사이드 채널 공격, 전력 분석 공격, 내부자 위협(Insider Threat), 디지털 포렌식 기법, 취약점 공개 정책(Responsible Disclosure)
### week19 — DevOps / CI-CD 심화 (ID 1261~1330)
DevOps 문화, SRE(사이트 신뢰성 엔지니어링), 에러 예산(Error Budget), 변경 실패율, 배포 빈도, 복구 시간(MTTR), 지속적 통합(CI), 지속적 전달(CD), 지속적 배포(CD 심화), 파이프라인 스테이지, 빌드 스테이지, 테스트 스테이지, 배포 스테이지, GitHub Actions, GitLab CI, Jenkins, 아티팩트(Artifact), 컨테이너 레지스트리, Docker 기초, Dockerfile, 도커 레이어, 멀티 스테이지 빌드, 도커 컴포즈, 쿠버네티스(K8s) 개요, Pod, Deployment, Service(K8s), Ingress, ConfigMap, Secret(K8s), Namespace, 롤링 업데이트, 카나리 배포, 블루-그린 배포, 피처 플래그(Feature Flag), A/B 테스트, 샤도우 트래픽, 모니터링 vs 옵저버빌리티, 메트릭(Metric), 로그(Log), 트레이스(Trace), 분산 추적, Jaeger, Prometheus, Grafana, 알람 피로, SLO, SLI, SLA, 포스트모템, 불변 인프라, GitOps, ArgoCD, Flux, 헬름(Helm), 오퍼레이터(Kubernetes Operator), 서비스 메시(Service Mesh), Istio, 사이드카 프록시, mTLS, 트래픽 미러링, 카오스 엔지니어링, 환경 분리(Dev/Staging/Prod), 트렁크 기반 개발, 모노레포(Monorepo), 폴리레포(Polyrepo), 의존성 자동 업데이트(Dependabot), 배포 파이프라인 최적화, 컨테이너 이미지 스캔, 비밀 스캔(Secret Scanning)
### week20 — 데이터 과학 (ID 1331~1400)
데이터 과학 워크플로, 탐색적 데이터 분석(EDA), 기술 통계, 평균/중앙값/최빈값, 분산과 표준편차, 사분위수(IQR), 이상값(Outlier) 탐지, 왜도와 첨도, 상관계수, 피어슨 상관, 스피어만 상관, 인과관계 vs 상관관계, 확률 기초, 조건부 확률, 베이즈 정리, 확률 분포, 정규 분포, 이항 분포, 포아송 분포, 가설 검정, 귀무가설/대립가설, p값, 유의 수준, t검정, 카이제곱 검정, 분산 분석(ANOVA), 신뢰 구간, 검정력(Power), 표본 크기 산출, A/B 테스트 설계, 멀티암드 밴딧, 데이터 전처리, 결측값 처리, 인코딩(Label/One-hot), 피처 스케일링, 표준화/정규화, 차원 축소, 피처 선택, 피처 추출, 피처 스토어, 데이터 파이프라인, ETL(추출-변환-적재), ELT, 데이터 레이크, 데이터 마트, 데이터 카탈로그, 데이터 리니지(Lineage), 데이터 품질, 데이터 거버넌스, 시각화 원칙, matplotlib/seaborn 기초, 대시보드 설계, 실험 설계, 교란 변수, 무작위 대조 실험(RCT), 관측 연구, 생존 분석, 시계열 분해, ARIMA, 이상 탐지(통계 기반), 나이브 베이즈(Naive Bayes), k-최근접 이웃(kNN), 다중 회귀(Multiple Regression), 다항 회귀(Polynomial Regression), 선형 판별 분석(LDA), 전진/후진 변수 선택, 교차 검증(데이터과학), 잔차 분석, 과적합 진단, 이중차분법(DiD)
### week21 — 프론트엔드 심화 (ID 1401~1470)
컴포넌트 기반 설계, 단방향 데이터 흐름, Virtual DOM, 재조정(Reconciliation), 파이버 아키텍처(React), Hooks(useState/useEffect), 커스텀 훅, 컨텍스트 API, 상태 끌어올리기, Props Drilling, 전역 상태 관리, Redux 기초, Redux Toolkit, Zustand, Jotai, 반응형 상태(Reactive State), 불변성(Immutability), 메모이제이션(useMemo/useCallback), React.memo, 가상화(Windowing), 코드 스플리팅, 지연 로딩(Lazy Loading), Suspense, 에러 바운더리, 서버 컴포넌트(RSC), 수화(Hydration), 점진적 수화, 스트리밍 SSR, 라우팅(SPA), 해시 라우팅, 히스토리 API, 빌드 도구(Vite/Webpack), 번들링, 트리 쉐이킹, 코드 압축(Minification), 소스맵, HMR(핫 모듈 교체), CSS-in-JS, CSS Modules, Tailwind CSS, 디자인 시스템, 접근성(A11y), ARIA 역할, 포커스 관리, 색상 대비, 국제화(i18n), 현지화(l10n), 다국어 날짜/숫자 포맷, 웹 성능 지표(CWV), LCP, FID/INP, CLS, 성능 프로파일링, Lighthouse, 브라우저 렌더링 파이프라인, 레이아웃 재계산(Reflow), 페인트(Repaint), 합성(Compositing), GPU 가속, 웹 워커, 공유 메모리, 마이크로 프론트엔드, 모듈 페더레이션(Module Federation), 웹 컴포넌트(Web Components), Shadow DOM, Custom Elements, 인터섹션 옵저버(Intersection Observer), ResizeObserver, MutationObserver, 캔버스(Canvas) API
### week22 — 백엔드 심화 (ID 1471~1540)
클린 아키텍처, 헥사고날 아키텍처, 포트와 어댑터, 레이어드 아키텍처, 도메인 레이어, 응용 레이어, 인프라 레이어, 트랜잭션 스크립트, 액티브 레코드 패턴, ORM 심화, N+1 문제, 즉시 로딩 vs 지연 로딩, 쿼리 빌더, 마이그레이션 관리, 시드 데이터, 연결 풀 튜닝, 데이터베이스 샤딩(앱 레벨), CQRS 구현, 이벤트 소싱 구현, 아웃박스 패턴, 사가 패턴(분산 트랜잭션), 보상 트랜잭션, 이중 쓰기 문제, 멱등성 구현, 낙관적 잠금, 비관적 잠금, 버전 필드, 배치 처리, 청크 처리, 스케줄링(cron), 큐 기반 처리, 작업자 풀(Worker Pool), 백프레셔(Backpressure), 속도 제한 구현(Token Bucket), 속도 제한(Leaky Bucket), API 캐싱 전략, HTTP 캐싱, ETag 구현, 조건부 요청, 스트리밍 응답, 청크 전송 인코딩, 파일 업로드(멀티파트), 대용량 파일 처리, 이메일 발송 큐, 알림 서비스, 웹훅 발송, 재시도 큐, 데드 레터 큐(DLQ), 오케스트레이션 vs 코레오그래피, 분산 설정 관리, 피처 토글, 테넌시(Multi-tenancy), 데이터 격리 전략, gRPC 개요, 단방향 스트리밍(gRPC), 양방향 스트리밍(gRPC), 프로토콜 버퍼(Protobuf), 인터셉터(gRPC), 헬스 체크(gRPC), 다중 테넌시 격리, 행 레벨 보안(RLS), 읽기/쓰기 분리(앱 레벨), 캐시 무효화(백엔드), 토큰 블랙리스트, 리프레시 토큰 로테이션, 활성 탐침(Liveness Probe), 준비 탐침(Readiness Probe), 시작 탐침(Startup Probe), 그레이스풀 종료(백엔드), 헬스 엔드포인트 설계
### week23 — 분산 시스템 (ID 1541~1610)
분산 시스템 개요, 네트워크 파티션, 노드 장애, 부분 장애, 비잔틴 장애, 분산 합의, Paxos 알고리즘, Raft 알고리즘, 리더 선출, 쿼럼(Quorum), 2단계 커밋(2PC), 3단계 커밋, 분산 트랜잭션, 글로벌 고유 ID(ULID/UUID), 스노우플레이크 ID, 타임스탬프 동기화, 논리적 시계, 람포트 시계(Lamport Clock), 벡터 시계 심화, CRDT(충돌 없는 복제 자료형), 읽기 복구, 쓰기 복구, 힌티드 핸드오프, 반엔트로피, 가십 프로토콜, 멤버십 프로토콜, 링 토폴로지, 코드 버전 관리(분산), 분산 파일 시스템, HDFS, 오브젝트 스토리지 아키텍처, 분산 캐시, 캐시 일관성 프로토콜, 리드-어-라이트(Read-Repair), 쓰기 증폭, 읽기 증폭, LSM 트리, SSTable, Compaction, Bloom Filter 활용, 분산 메시지 큐 설계, 파티션 리밸런싱, 소비자 그룹, 오프셋 관리, 정확히 한 번 전달(Exactly-once), 최소 한 번 전달(At-least-once), 최대 한 번 전달(At-most-once), 배압(Back Pressure) 분산, 서킷 브레이커 상태 머신, 벌크헤드 패턴, 타임아웃 전략, 분산 레이트 리미팅, 지역 분산 아키텍처, 지오 라우팅, 멀티 리전 복제, 분산 해시 테이블(DHT), P2P 네트워크 기초, 쓰기 정족수(Write Quorum), 읽기 정족수(Read Quorum), NWR 모델, 스플릿 브레인(Split Brain), 펜싱 토큰(Fencing Token), 분산 스냅샷, 체크포인트(분산), 상태 머신 복제, 로그 기반 복제, 복제 지연(Replication Lag), 데이터 복제 전략, 동적 멤버십, 네트워크 파티션 처리
### week24 — 클라우드 심화 (ID 1611~1680)
서비스 계정(Service Account), IRSA, Workload Identity, 클라우드 IAM 심화, 리소스 기반 정책, SCP(서비스 제어 정책), 조직 단위(OU), 랜딩 존(Landing Zone), 계정 팩토리, FinOps, 클라우드 비용 할당, 예약 인스턴스 vs Savings Plans, 컴퓨트 옵티마이저, 비용 이상 탐지, 태깅 전략, 클라우드 네이티브 패턴, 12 요소 앱, 컨테이너 오케스트레이션 심화, 노드 어피니티, 테인트/톨러레이션, 리소스 쿼터, HPA(수평 파드 자동 확장), VPA(수직 파드 자동 확장), KEDA(이벤트 기반 자동 확장), 클러스터 오토스케일러, 서비스 계정 토큰, OPA(정책 엔진), Kyverno, 이미지 스캔(Trivy), 런타임 보안(Falco), 네트워크 정책(K8s), Pod 보안 표준, 시크릿 관리(Vault), External Secrets Operator, GitOps 심화, 플럭스CD, 드리프트 감지, 멀티클러스터 관리, 클러스터 페더레이션, 서비스 메시 심화, 웨스트-이스트 트래픽, 상호 TLS(mTLS) 구현, 옵저버빌리티 플랫폼, OpenTelemetry, 분산 추적 구현, eBPF, 클라우드 마이그레이션 전략(6R), 리호스팅, 리플랫포밍, 리아키텍처링, 클라우드 탈출 전략, 벤더 종속(Lock-in) 최소화, 오픈소스 대안 선택, AWS EKS, GKE(Google Kubernetes Engine), AKS(Azure Kubernetes), 클라우드 런(Cloud Run), Lambda 계층(Layer), EventBridge, Step Functions, AWS Glue, AWS Athena, AWS Redshift, Kinesis 스트리밍, 서버리스 데이터베이스, 글로벌 데이터베이스, 크로스 리전 복제(DB), Lambda 콜드 스타트, 프로비저닝된 동시성, 클라우드 함수 최적화
### week25 — 마이크로서비스 (ID 1681~1750)
마이크로서비스 정의, 서비스 경계 설계, 도메인 분해 전략, 트랜잭션 분해, 데이터 소유권, 서비스 간 통신(동기), 서비스 간 통신(비동기), API 컴포지션, 서비스 레지스트리, 서비스 디스커버리(클라이언트/서버), 로드 밸런싱 전략, 트래픽 쉐이핑, 폴리글랏 퍼시스턴스, 폴리글랏 프로그래밍, 서비스 계약(Contract), 소비자 주도 계약 테스트(Pact), API 버전 관리 전략, 하위 호환성, 그레이스풀 디그레이데이션, 스트랭글러 피그 패턴(레거시 교체), 안티 코럽션 레이어, 이벤트 브로커(Kafka 심화), 토픽 파티셔닝 전략, 소비자 그룹 설계, 이벤트 스키마 진화, 스키마 레지스트리, Avro/Protobuf 스키마, 이벤트 스토밍, 핵심 도메인 vs 지원 도메인, 제네릭 서브도메인, 분산 모놀리스 안티패턴, 챗티 마이크로서비스, 공유 데이터베이스 안티패턴, 서비스 오케스트레이션(Temporal), 워크플로 엔진, 보상 트랜잭션 설계, 멱등 소비자, 체크포인팅, 실패 재처리 전략, 마이크로서비스 테스트 전략, 계약 테스트, 통합 테스트 전략, 테스트 컨테이너(Testcontainers), 서비스 가상화(Mountebank), 카오스 엔지니어링 도구, Chaos Monkey, 폴트 인젝션, 복원력 패턴 종합, 마이크로서비스 보안, 서비스 간 인증(mTLS/JWT), 내부 PKI, 상류-하류 관계(Upstream/Downstream), 파트너십 패턴(Partnership), 순응주의자(Conformist), 오픈 호스트 서비스, 공표된 언어(Published Language), 공유 커널(Shared Kernel), 상관 ID(Correlation ID), 요청 컨텍스트 전파, 분산 추적(마이크로서비스), API 집합(Aggregation) 패턴, 플러그인 아키텍처, AsyncAPI 스펙, 개별 배포 가능성, 마이크로서비스 공통 라이브러리, 사이드카 vs 라이브러리, 서비스 그래프(Service Graph), 데이터 컨시스턴시 패턴, 비동기 API 설계, 이벤트 기반 마이크로서비스
### week26 — 성능 최적화 (ID 1751~1820)
성능 최적화 방법론, 프로파일링 기법, CPU 프로파일링, 메모리 프로파일링, I/O 프로파일링, 화염 그래프(Flame Graph), 핫 패스 찾기, 가비지 컬렉션(GC), GC 종류(Mark-Sweep/G1/ZGC), GC 튜닝, 힙 크기 설정, 메모리 누수, 약한 참조/소프트 참조, 객체 풀링, 스택 할당 vs 힙 할당, CPU 캐시 계층, 캐시 라인, 데이터 지역성, SIMD 명령어, 벡터화, 병렬 처리 vs 동시 처리, 스레드 풀 튜닝, 논블로킹 I/O, 이벤트 루프 심화, 코루틴, 반응형 프로그래밍(Reactive), 배압 처리, 비동기 스트림, 제로 카피(Zero-copy), mmap, Direct I/O, 네트워크 튜닝, TCP 소켓 버퍼, Nagle 알고리즘, TCP_NODELAY, HTTP 연결 재사용, HTTP/2 멀티플렉싱, 데이터베이스 성능 튜닝, 인덱스 전략 심화, 파티션 프루닝, 통계 업데이트, 쿼리 플랜 강제, 연결 풀 최적화, N+1 해결 전략, 캐싱 패턴 심화(캐시 웜업), 사전 계산(Precomputation), 비동기 쓰기, 읽기 최적화 뷰, 검색 최적화(Elasticsearch), 역인덱스, 분석기(Analyzer), 스코어링 알고리즘, CDN 최적화, 이미지 최적화, 지연 로딩 전략, 웹 성능 예산, 성능 회귀 감지, JVM 튜닝, 가비지 컬렉션 로그 분석, 스레드 덤프 분석, 힙 덤프 분석, 슬로우 쿼리 로그, 인덱스 미스(Index Miss) 탐지, 디스크 I/O 최적화, 소켓 최적화, 성능 테스트 자동화, 부하 생성 도구(k6/JMeter), 성능 테스트 시나리오, 성능 회귀 파이프라인, 클라이언트 사이드 성능 측정
### week27 — MLOps / AI 시스템 (ID 1821~1890)
MLOps 개요, ML 파이프라인, 데이터 버전 관리(DVC), 실험 추적(MLflow), 아티팩트 저장소, 모델 레지스트리, 모델 버전 관리, 모델 태깅/스테이징, 피처 스토어(심화), 온라인 피처 서빙, 오프라인 피처 계산, 피처 드리프트, 데이터 드리프트, 컨셉 드리프트, 모델 모니터링, 예측 로깅, 레이블 지연, 지속 학습(Continuous Training), 트리거 기반 재학습, 스케줄 기반 재학습, 챔피언-챌린저 배포, 그림자 모드(Shadow Mode), 온라인 평가, 오프라인 평가, A/B 테스트(모델), 멀티암드 밴딧(모델 선택), 모델 서빙 아키텍처, REST 서빙, gRPC 서빙, 배치 추론 파이프라인, 실시간 추론, 스트리밍 추론, TensorRT 최적화, ONNX 변환, 모델 양자화(서빙), 추론 캐싱, 모델 앙상블 서빙, 다중 모델 서빙, Triton Inference Server, KServe, Ray Serve, LLM 서빙 최적화, vLLM, 연속 배치(Continuous Batching), 페이지드 어텐션(PagedAttention), 투기적 디코딩(Speculative Decoding), KV 캐시 관리, 멀티 GPU 추론, 텐서 병렬, 파이프라인 병렬, AI 거버넌스, 모델 카드, 책임 있는 AI, 편향 탐지, 공정성 지표, AI 규제 대응, 모델 평가 자동화, 데이터셋 버전 관리, 학습 재현성, 시드 고정(Random Seed), 결정론적 훈련, 분산 학습(DDP), 모델 체크포인트 전략, 조기 종료(Early Stopping), 학습 커브 분석, 검증 손실 추적, 데이터셋 카드(Dataset Card), 공정성 메트릭, ML 모니터링 대시보드, 피처 중요도 모니터링
### week28 — 코드 품질·테스트 (ID 1891~1960)
테스트 피라미드, 단위 테스트(Unit Test), 통합 테스트(Integration Test), E2E 테스트, 계약 테스트, 스모크 테스트, 회귀 테스트, 성능 테스트, 부하 테스트, 스트레스 테스트, 소크 테스트, 스파이크 테스트, 카오스 테스트, 뮤테이션 테스트, 속성 기반 테스트(Property-based), 테스트 더블(Test Double), 목(Mock), 스텁(Stub), 스파이(Spy), 페이크(Fake), 테스트 픽스처, 테스트 격리, 테스트 가독성, Given-When-Then, AAA(Arrange-Act-Assert), 테스트 커버리지, 브랜치 커버리지, 돌연변이 점수(Mutation Score), 코드 리뷰 원칙, PR 크기 최적화, 리뷰 체크리스트, 정적 분석, 린팅(Linting), 포맷팅, 타입 검사, 코드 복잡도(Cyclomatic), 중복 코드 탐지, 기술 부채 측정, 리팩터링 기법, 메서드 추출, 인라인 메서드, 변수 추출, 조건문 단순화, 가드 절(Guard Clause), 상태 패턴으로 분기 제거, 레거시 코드 개선, 특성 테스트, 시스템 이해를 위한 테스트, 코드 고정(Seam), 점진적 개선, 보이 스카우트 규칙, 변경 불안 극복, 문서화(코드 주석 원칙), API 문서화, 아키텍처 결정 기록(ADR), 시퀀스 다이어그램, C4 모델, 도구 체인 자동화, 테스트 주도 개발(TDD), 행동 주도 개발(BDD), 인수 테스트 주도 개발(ATDD), 탐색적 테스팅, 세션 기반 테스팅, 리스크 기반 테스팅, 테스트 오라클, 동등 분할(Equivalence Partitioning), 경계값 분석(Boundary Value), 결정 테이블(Decision Table), 상태 전이 테스트, 페어와이즈 테스팅(Pairwise)
### week29 — 데이터 엔지니어링 (ID 1961~2030)
데이터 엔지니어링 역할, 배치 처리 vs 스트림 처리, 람다 아키텍처, 카파 아키텍처, 데이터 플로우 모델, Apache Spark 기초, RDD, DataFrame(Spark), Spark SQL, Spark 스트리밍, Flink 개요, Kafka Streams, 데이터 직렬화(Avro/Parquet/ORC), 컬럼 기반 포맷(Parquet), 행 기반 포맷 비교, 압축 코덱(Snappy/Zstd), 데이터 레이크하우스, Delta Lake, Apache Iceberg, Apache Hudi, ACID on 데이터 레이크, 타임 트래블(Time Travel), 스키마 진화(데이터 레이크), 파티션 진화, 데이터 스큐(Data Skew), 셔플 최적화, 조인 최적화(브로드캐스트 조인), 동적 파티션 프루닝, 적응형 쿼리 실행(AQE), 데이터 품질 프레임워크(Great Expectations), 데이터 계약(Data Contract), 스트림-테이블 이중성, CDC(변경 데이터 캡처), Debezium, 데이터 메시(Data Mesh), 도메인 소유 데이터, 셀프 서비스 플랫폼, 데이터 오너십, 데이터 제품, 스트리밍 SQL, 이벤트 시간 vs 처리 시간, 워터마크(Watermark), 늦은 도착 데이터(Late Data), 윈도우 연산(Tumbling/Sliding/Session), 상태 저장 스트림 처리, 상태 백엔드, 체크포인트(Flink), 정확히 한 번(스트리밍), 실시간 대시보드 아키텍처, OLAP 엔진(ClickHouse/Druid), 실체화 뷰(Materialized View), Kafka Connect, Source Connector, Sink Connector, 스키마 레지스트리(Confluent), 토픽 보존 정책, 컴팩션 정책(Log Compaction), 오프셋 커밋 전략, 재처리(Reprocessing), 역추적(Backfilling), 멱등 프로듀서(Idempotent Producer), 트랜잭션 프로듀서(Kafka), 스트림-스트림 조인, 스트림-테이블 조인, 상태 저장 연산(Stateful), 이벤트 주도 아키텍처(데이터), 데이터 오케스트레이션(Airflow), Apache Airflow, DAG(워크플로 정의), 데이터 계보(Data Lineage) 추적
### week30 — 종합 심화 (ID 2031~2100)
소프트웨어 아키텍처 결정, 품질 속성(Quality Attributes), 아키텍처 트레이드오프, 기술 선택 프레임워크, 빌드 vs 구매 결정, 오픈소스 평가 기준, 기술 부채 상환 전략, 플랫폼 엔지니어링, 내부 개발자 플랫폼(IDP), 개발자 경험(DX), 골든 패스(Golden Path), 스캐폴딩, 셀프 서비스 인프라, 서비스 카탈로그, 팀 토폴로지, 스트림 정렬 팀, 플랫폼 팀, 인에이블링 팀, 복잡한 서브시스템 팀, 콘웨이의 법칙, 역 콘웨이 전략, 소프트웨어 설계 원칙 종합, 단순성 원칙(KISS), 반복 금지(DRY), 최소 놀람의 원칙, 명시적 코드, 점진적 개선, 피드백 루프 단축, 실험 문화, 포스트모템 문화, 심리적 안전, 생산성 측정(DORA), 코드 변경 용기, 기술 비전 수립, 로드맵 계획, 프로토타입 vs 프로덕션, 프루프 오브 컨셉(POC), MVP(최소 실행 가능 제품), 기술 스파이크, 아키텍처 스파이크, 레거시 현대화, 리플랫폼 전략, 마이그레이션 패턴 종합, 이중 운영(Parallel Run), 빅뱅 vs 점진적 마이그레이션, 기술 엑시트 전략, 소프트웨어 수명 주기, 일몰(Sunset) 계획, 문서화 문화, 지식 이전, 온보딩 최적화, 시스템 사고, 피드백 지연, 레버리지 포인트

---, 아키텍처 평가(ATAM), RFC 프로세스(기술 문서), 기술 레이더, 채택-평가-보류-중단, 기술 표준화, 이너소스(InnerSource), 기여 모델(Contribution Model), 코드 소유권(Code Ownership), CODEOWNERS 파일, 브랜치 전략 비교, 배포 파이프라인 표준화, 모니터링 표준화, 알람 표준화, 온콜(On-call) 문화, 장애 대응 런북(Runbook), SRE 실천 방법론
## 생성 지침

1. **파일 하나씩** `terms.week6.json`부터 `terms.week30.json`까지 순서대로 생성
2. **용어 목록 그대로** 위 목록에 있는 이름을 순서대로 사용 (임의 변형 금지)
3. **definition**: 용어가 **무엇인지** 실제로 설명 (템플릿 문장 금지)
4. **analogy**: 해당 용어에만 맞는 **고유한** 일상 비유 (반복 금지)
5. **example**: 실제 실행 가능한 코드 (해당 언어에 맞게)
6. **언어**: 모든 설명 한국어, 코드 주석 한국어
7. **검증**: 생성 후 `node tools/validate-terms.js` 실행

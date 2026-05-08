const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const WEEKS = [2, 3, 4, 5];

function firstSentence(text) {
  return String(text || '').split(/(?<=\.)\s+/)[0].replace(/\.$/, '').trim();
}

function stripExamplePrefix(text) {
  return String(text || '').replace(/^예:\s*/, '').trim();
}

function choose(items, seed) {
  return items[Math.abs(seed) % items.length];
}

function hasFinalConsonant(word) {
  const chars = [...String(word || '')];
  if (chars.length === 0) return false;
  const code = chars[chars.length - 1].charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return ((code - 0xac00) % 28) !== 0;
  }
  return false;
}

function josa(word, consonantForm, vowelForm) {
  return hasFinalConsonant(word) ? consonantForm : vowelForm;
}

function seedOf(term) {
  return [...term.id + term.term].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function categoryPurpose(category) {
  if (category.includes('AI')) return '모델이 무엇을 배우고 어떻게 판단하는지 설명할 때 기준점이 됩니다.';
  if (category.includes('데이터')) return '데이터를 정리하고 해석할 때 문제 지점을 빠르게 찾게 해줍니다.';
  if (category.includes('웹')) return '브라우저, 서버, 네트워크가 나누어 맡는 일을 이해하는 데 필요합니다.';
  if (category.includes('인프라')) return '서비스가 느려지거나 장애가 날 때 원인을 좁히는 데 도움이 됩니다.';
  if (category.includes('개발 도구')) return '코드를 만들고 검증하고 배포하는 흐름을 안정적으로 다루게 해줍니다.';
  if (category.includes('아키텍처')) return '코드를 어떤 책임으로 나눌지 판단하는 설계 언어가 됩니다.';
  if (category.includes('함수와 스코프')) return '함수 호출, 변수 접근, 실행 흐름을 헷갈리지 않게 잡아줍니다.';
  return '코드를 읽고 설명할 때 개념의 경계를 정확히 잡는 데 필요합니다.';
}

function buildEasy(term) {
  const base = stripExamplePrefix(term.definition);
  const subject = josa(term.term, '은', '는');
  const object = josa(term.term, '을', '를');
  const variants = [
    `${term.term}${subject} ${term.hint}입니다. ${base}`,
    `${term.term}을 한 줄로 보면 ${term.hint}입니다. ${base}`,
    `${term.term}${subject} ${base} 핵심은 "${term.hint}"라는 역할을 알아보는 것입니다.`,
    `${term.term}${subject} ${term.hint}${josa(term.hint, '을', '를')} 가리키는 말입니다. ${base}`,
  ];
  return choose(variants, seedOf(term)).replace(`${term.term}을 한 줄`, `${term.term}${object} 한 줄`);
}

function buildAnalogy(term) {
  const t = term.term;
  const category = term.category;
  const finalize = text => text.replace(`${t}은`, `${t}${josa(t, '은', '는')}`);
  const general = [
    `${t}은 책상 위에 흩어진 도구에 이름표를 붙여 필요한 순간 바로 집는 것과 같습니다. 이름과 역할을 알면 어떤 문제를 해결하는 도구인지 빠르게 떠올릴 수 있습니다.`,
    `${t}은 지도 위의 표식과 같습니다. 전체 길을 다 외우지 않아도 이 표식이 무엇을 가리키는지 알면 다음 행동을 정하기 쉬워집니다.`,
    `${t}은 작업장에서 쓰는 전용 도구와 같습니다. 모양은 낯설어도 어떤 작업에 쓰는지 알면 사용법을 훨씬 빨리 익힐 수 있습니다.`,
    `${t}은 레시피의 한 단계 이름과 같습니다. 그 단계가 재료 준비인지, 조리인지, 마무리인지 알면 전체 흐름을 놓치지 않습니다.`,
  ];
  const ai = [
    `${t}은 학생이 문제집을 푸는 방식에 붙인 이름과 같습니다. 정답지를 보고 배우는지, 비슷한 문제끼리 묶는지, 보상을 받으며 고치는지에 따라 학습 방식이 달라집니다.`,
    `${t}은 모델 훈련장의 표지판과 같습니다. 데이터가 어떤 역할을 하는지, 점수가 무엇을 뜻하는지 알면 학습 과정의 어느 부분을 보고 있는지 분명해집니다.`,
    `${t}은 요리사가 맛을 맞추는 기준 중 하나와 같습니다. 재료, 조리 시간, 평가 기준을 구분해야 결과가 왜 좋아지거나 나빠졌는지 설명할 수 있습니다.`,
  ];
  const data = [
    `${t}은 창고 재고표의 한 항목과 같습니다. 값이 비어 있는지, 너무 튀는지, 단위가 다른지 알아야 뒤의 계산이 믿을 만해집니다.`,
    `${t}은 설문지를 정리할 때 붙이는 표시와 같습니다. 빠진 답, 이상한 답, 기준이 다른 답을 구분해야 분석 결과가 흔들리지 않습니다.`,
  ];
  const web = [
    `${t}은 식당 주문이 주방까지 오가는 과정의 한 지점과 같습니다. 주문서 형식, 대기 시간, 전달 경로를 알아야 어디서 문제가 생겼는지 찾을 수 있습니다.`,
    `${t}은 택배 배송 과정의 규칙과 같습니다. 주소, 포장, 중간 물류센터, 수령 확인이 각각 다른 책임을 가지듯 웹 요청도 단계별 역할이 있습니다.`,
  ];
  const infra = [
    `${t}은 놀이공원 운영 지표와 같습니다. 대기 시간, 시간당 입장 인원, 입구 분산을 따로 봐야 병목을 정확히 찾을 수 있습니다.`,
    `${t}은 건물의 전기 설비를 늘리는 방식과 같습니다. 더 큰 장비를 들일지, 같은 장비를 여러 대 둘지에 따라 장단점이 달라집니다.`,
  ];
  const arch = [
    `${t}은 회사 조직도에서 팀의 책임선을 긋는 것과 같습니다. 누가 어떤 일을 맡는지 분명해야 일이 커져도 서로 덜 흔들립니다.`,
    `${t}은 건물 설계도에서 방과 복도의 역할을 나누는 것과 같습니다. 구조를 잘 나누면 나중에 한 부분을 고쳐도 전체가 무너지지 않습니다.`,
  ];
  const func = [
    `${t}은 무대 뒤에서 배우가 대기하고 들어오는 순서와 같습니다. 어떤 함수가 먼저 불렸고 어디로 돌아가야 하는지 알면 실행 흐름이 보입니다.`,
    `${t}은 서류함 안쪽 칸과 바깥쪽 칸을 나누는 것과 같습니다. 어디에 둔 이름표인지에 따라 꺼낼 수 있는 범위가 달라집니다.`,
  ];

  if (category.includes('AI')) return finalize(choose(ai, seedOf(term)));
  if (category.includes('데이터')) return finalize(choose(data, seedOf(term)));
  if (category.includes('웹')) return finalize(choose(web, seedOf(term)));
  if (category.includes('인프라')) return finalize(choose(infra, seedOf(term)));
  if (category.includes('아키텍처')) return finalize(choose(arch, seedOf(term)));
  if (category.includes('함수와 스코프')) return finalize(choose(func, seedOf(term)));
  return finalize(choose(general, seedOf(term)));
}

function codeBlock(lines) {
  return lines.join('\n');
}

function buildExample(term) {
  const t = term.term;
  const d = firstSentence(term.definition);

  const exact = {
    '부동소수점': codeBlock(['price = 3.14', 'discount = 0.5', 'print(price + discount)  # 3.64처럼 소수 계산에 사용']),
    '데이터 타입': codeBlock(['value = "3"', 'print(type(value))  # 문자열', 'value = int(value)', 'print(type(value))  # 정수']),
    '형변환': codeBlock(['age_text = "20"', 'age = int(age_text)', 'print(age + 1)  # 21']),
    'null': codeBlock(['selected_user = null', 'if (selected_user === null) {', '  console.log("아직 선택된 사용자가 없습니다.");', '}']),
    'undefined': codeBlock(['let score;', 'console.log(score); // undefined', 'score = 10;']),
    '원시 타입': codeBlock(['const name = "Jin";', 'const age = 18;', 'const active = true;', '// 문자열, 숫자, 불리언은 대표적인 원시 타입입니다.']),
    '참조 타입': codeBlock(['const a = { count: 1 };', 'const b = a;', 'b.count = 2;', 'console.log(a.count); // 2, 같은 객체를 가리킴']),
    '스코프': codeBlock(['function run() {', '  const message = "inside";', '}', '// console.log(message)는 함수 밖에서 사용할 수 없습니다.']),
    '지역 변수': codeBlock(['function addOne(n) {', '  const result = n + 1;', '  return result;', '}', '// result는 함수 안에서만 살아 있습니다.']),
    '전역 변수': codeBlock(['let currentUser = "guest";', 'function login(name) { currentUser = name; }', '// 어디서나 바꿀 수 있어 관리가 필요합니다.']),
    '호이스팅': codeBlock(['sayHello();', 'function sayHello() {', '  console.log("hello");', '}', '// 함수 선언은 실행 전에 준비됩니다.']),
    '매개변수': codeBlock(['function add(a, b) {', '  return a + b;', '}', '// a와 b가 매개변수입니다.']),
    '반환값': codeBlock(['function square(x) {', '  return x * x;', '}', 'const result = square(4); // 반환값 16을 저장']),
    '익명 함수': codeBlock(['const double = function (x) {', '  return x * 2;', '};']),
    '화살표 함수': codeBlock(['const double = x => x * 2;', 'console.log(double(4)); // 8']),
    '콜백 함수': codeBlock(['button.addEventListener("click", () => {', '  console.log("버튼을 눌렀습니다.");', '});']),
    '고차 함수': codeBlock(['const nums = [1, 2, 3];', 'const doubled = nums.map(n => n * 2);', 'console.log(doubled); // [2, 4, 6]']),
    '순수 함수': codeBlock(['function add(a, b) {', '  return a + b;', '}', '// 같은 입력이면 항상 같은 출력, 외부 값을 바꾸지 않음']),
    '사이드 이펙트': codeBlock(['let total = 0;', 'function addToTotal(n) {', '  total += n; // 함수 밖 값을 변경', '}']),
    '상속': codeBlock(['class Animal { speak() { return "sound"; } }', 'class Dog extends Animal { bark() { return "멍"; } }']),
    '다형성': codeBlock(['class Cat { speak() { return "야옹"; } }', 'class Dog { speak() { return "멍멍"; } }', '[new Cat(), new Dog()].forEach(a => console.log(a.speak()));']),
    '캡슐화': codeBlock(['class Wallet {', '  #money = 0;', '  deposit(n) { this.#money += n; }', '}']),
    '추상화': codeBlock(['payment.pay(10000);', '// 내부에서 카드 승인, 영수증 저장이 어떻게 되는지는 감추고 pay만 사용']),
    '인스턴스': codeBlock(['class User {}', 'const minsu = new User();', '// minsu가 User 클래스의 인스턴스입니다.']),
    '생성자': codeBlock(['class User {', '  constructor(name) { this.name = name; }', '}', 'const user = new User("민수");']),
    '메서드': codeBlock(['const user = {', '  login() { return "로그인"; }', '};', 'user.login();']),
    '프로퍼티': codeBlock(['const user = { name: "지수", age: 20 };', 'console.log(user.name);']),
    '인터페이스': codeBlock(['interface Repository {', '  save(item: Item): void;', '}', '// 구현 클래스는 save 기능을 제공해야 합니다.']),
    '오버라이딩': codeBlock(['class Animal { speak() { return "sound"; } }', 'class Cat extends Animal { speak() { return "야옹"; } }']),
    '오버로딩': codeBlock(['// TypeScript 예시', 'function format(value: string): string;', 'function format(value: number): string;']),
    '스택 (자료구조)': codeBlock(['const stack = [];', 'stack.push("A"); stack.push("B");', 'console.log(stack.pop()); // B']),
    '큐': codeBlock(['const queue = [];', 'queue.push("첫 번째"); queue.push("두 번째");', 'console.log(queue.shift()); // 첫 번째']),
    '링크드 리스트': codeBlock(['const node1 = { value: "A", next: null };', 'const node2 = { value: "B", next: null };', 'node1.next = node2;']),
    '트리 (자료구조)': codeBlock(['const root = {', '  name: "html",', '  children: [{ name: "head" }, { name: "body" }]', '};']),
    '해시 테이블': codeBlock(['const scores = { minsu: 90, jisu: 85 };', 'console.log(scores["minsu"]); // 90']),
    '이진 탐색': codeBlock(['const arr = [1, 3, 5, 7, 9];', '// 5를 찾을 때 가운데 값부터 비교해 왼쪽/오른쪽 절반을 버립니다.']),
    '버블 정렬': codeBlock(['const arr = [3, 1, 2];', '// 3과 1 비교 후 교환, 3과 2 비교 후 교환하며 큰 값이 뒤로 이동']),
    '시간 복잡도': codeBlock(['for (const item of items) {', '  console.log(item);', '}', '// 입력 n개를 한 번씩 보므로 O(n)']),
    '빅오 표기법': codeBlock(['O(1)      // 한 번에 접근', 'O(n)      // 전체를 한 번 훑음', 'O(n * n)  // 이중 반복']),
    'try-catch': codeBlock(['try {', '  JSON.parse("{broken json");', '} catch (error) {', '  console.log("파싱 실패");', '}']),
    '프로미스': codeBlock(['fetch("/api/user")', '  .then(res => res.json())', '  .then(user => console.log(user));']),
    'async/await': codeBlock(['async function loadUser() {', '  const res = await fetch("/api/user");', '  return await res.json();', '}']),
    '이벤트 루프': codeBlock(['console.log("A");', 'setTimeout(() => console.log("B"), 0);', 'console.log("C");', '// A, C, B 순서']),
    '이벤트': codeBlock(['input.addEventListener("input", event => {', '  console.log(event.target.value);', '});']),
    '이벤트 리스너': codeBlock(['window.addEventListener("resize", () => {', '  console.log("화면 크기 변경");', '});']),
    '모듈': codeBlock(['// math.js', 'export const add = (a, b) => a + b;', '// 기능을 파일 단위로 나눕니다.']),
    '임포트': codeBlock(['import { add } from "./math.js";', 'console.log(add(1, 2));']),
    '정규 표현식': codeBlock(['const email = "a@example.com";', 'console.log(/.+@.+\\..+/.test(email)); // true']),
    '직렬화': codeBlock(['const user = { name: "민수" };', 'const text = JSON.stringify(user);', 'console.log(text);']),
    '타입스크립트': codeBlock(['function add(a: number, b: number): number {', '  return a + b;', '}']),
    '런타임': codeBlock(['// 문법 검사는 통과했지만 실행 중 user가 null이면 런타임 오류가 날 수 있습니다.', 'console.log(user.name);']),
    'SDK': codeBlock(['// 결제 SDK 예시', 'paymentSdk.requestPay({ amount: 10000 });']),
    '객체지향 프로그래밍': codeBlock(['class User {', '  constructor(name) { this.name = name; }', '  login() { return `${this.name} 로그인`; }', '}', 'const user = new User("민수");']),
    '함수형 프로그래밍': codeBlock(['const prices = [1000, 2000, 3000];', 'const discounted = prices.map(price => price * 0.9);', '// 원본 배열을 바꾸지 않고 새 결과를 만듭니다.']),
    '선언형 프로그래밍': codeBlock(['const adults = users.filter(user => user.age >= 20);', '// 어떻게 반복할지보다 "성인만 고른다"는 결과를 코드에 드러냅니다.']),
    '정적 타입': codeBlock(['let age: number = 20;', '// age = "스무 살";  // 실행 전 타입 검사에서 잡힘']),
    '동적 타입': codeBlock(['let value = 10;', 'value = "열";', '// JavaScript처럼 실행 중 값에 따라 타입이 바뀔 수 있습니다.']),
    '타입 추론': codeBlock(['const count = 3;', '// TypeScript는 count를 number로 추론합니다.', '// count = "3"; 는 타입 오류가 됩니다.']),
    '제네릭': codeBlock(['function first<T>(items: T[]): T {', '  return items[0];', '}', 'first<number>([1, 2, 3]);']),
    '싱글톤 패턴': codeBlock(['const config = { apiUrl: "/api" };', 'export default config;', '// 앱 전체에서 같은 설정 객체 하나를 공유합니다.']),
    '팩토리 패턴': codeBlock(['function createUser(role) {', '  return role === "admin" ? new AdminUser() : new NormalUser();', '}']),
    '옵저버 패턴': codeBlock(['store.subscribe(() => render());', 'store.setState({ count: 1 });', '// 상태가 바뀌면 구독자가 자동으로 호출됩니다.']),
    'MVC 패턴': codeBlock(['Model: todo 목록 데이터', 'View: 화면에 보이는 체크리스트', 'Controller: 추가/삭제 버튼 처리']),
    '유닛 테스트': codeBlock(['test("add", () => {', '  expect(add(2, 3)).toBe(5);', '});']),
    'TDD': codeBlock(['1. 실패하는 테스트를 먼저 작성', '2. 테스트를 통과할 만큼만 코드 작성', '3. 중복을 줄이며 리팩터링']),
    '모의 객체 (Mock)': codeBlock(['const fakeApi = { getUser: () => ({ name: "테스트" }) };', '// 실제 서버 없이도 사용자 로딩 코드를 검증합니다.']),
    '로깅': codeBlock(['console.info("order.created", { orderId: 42 });', 'console.error("payment.failed", error);']),
    '미들웨어': codeBlock(['app.use((req, res, next) => {', '  console.log(req.method, req.url);', '  next();', '});']),
    '쿠키': codeBlock(['Set-Cookie: sessionId=abc123; HttpOnly', '// 브라우저가 이후 요청에 이 값을 함께 보냅니다.']),
    '세션': codeBlock(['session.userId = 42;', '// 서버가 로그인 상태를 기억하고 요청마다 확인합니다.']),
    '토큰': codeBlock(['Authorization: Bearer eyJhbGciOi...', '// 요청마다 토큰을 보내 사용자를 증명합니다.']),
    'JWT': codeBlock(['header.payload.signature', '// 사용자 ID, 만료 시간 같은 정보를 서명된 토큰에 담습니다.']),
    'CORS': codeBlock(['Access-Control-Allow-Origin: https://example.com', '// 다른 출처의 브라우저 요청을 허용할지 정합니다.']),
    '프록시': codeBlock(['브라우저 -> 프록시 서버 -> 실제 API 서버', '// 클라이언트는 실제 서버 주소를 몰라도 됩니다.']),
    '리버스 프록시': codeBlock(['사용자 -> nginx -> app server', '// nginx가 앞에서 요청을 받아 내부 서버로 전달합니다.']),
    '캐시': codeBlock(['Cache-Control: max-age=3600', '// 같은 이미지나 응답을 다시 내려받지 않고 재사용합니다.']),
    'CDN': codeBlock(['한국 사용자 -> 서울 CDN 엣지', '미국 사용자 -> LA CDN 엣지', '// 가까운 서버에서 정적 파일을 받습니다.']),
    '로드 밸런싱': codeBlock(['요청 1 -> 서버 A', '요청 2 -> 서버 B', '요청 3 -> 서버 C', '// 한 서버에 몰리지 않게 나눕니다.']),
    '멱등성': codeBlock(['PUT /profile/42 {"name":"민수"}', '같은 요청을 여러 번 보내도 최종 이름은 계속 "민수"입니다.', 'POST /orders는 여러 번 보내면 주문이 여러 개 생길 수 있습니다.']),
    '페이지네이션': codeBlock(['GET /posts?page=3&size=20', '// 게시글 전체가 아니라 3페이지의 20개만 가져옵니다.']),
    '레이턴시': codeBlock(['요청 시작: 10:00:00.000', '첫 응답 도착: 10:00:00.180', '레이턴시: 180ms']),
    '스루풋': codeBlock(['1초 동안 요청 1200개 처리', '// 초당 처리량이 1200 req/s인 상황입니다.']),
    '스케일링': codeBlock(['수직 스케일링: 서버 CPU/RAM을 더 크게', '수평 스케일링: 서버 대수를 2대, 3대로 늘림']),
    '파이프라인': codeBlock(['코드 push -> 테스트 -> 빌드 -> 배포', '// 앞 단계 결과가 다음 단계 입력이 됩니다.']),
    '네임스페이스': codeBlock(['App.User.create()', 'Admin.User.create()', '// User라는 이름이 같아도 그룹이 달라 충돌하지 않습니다.']),
    '아키텍처': codeBlock(['UI Layer -> Service Layer -> Repository Layer', '// 큰 구조와 의존 방향을 먼저 정합니다.']),
    '기술 부채': codeBlock(['// 급해서 중복 코드로 출시', '// 다음 달 기능 추가 때 같은 수정 5곳 필요', '// 나중에 이자가 붙는 부채처럼 비용이 커집니다.']),
    '부수 효과': codeBlock(['let saved = false;', 'function save() {', '  saved = true; // 반환값 외부 상태를 변경', '}']),
    '콜 스택': codeBlock(['function a() { b(); }', 'function b() { c(); }', 'function c() { console.log("run"); }', '// a -> b -> c 순서로 스택에 쌓입니다.']),
    '실행 컨텍스트': codeBlock(['function greet(name) {', '  const message = `hi ${name}`;', '}', '// name, message, this 같은 실행 정보를 담는 환경이 만들어집니다.']),
    '렉시컬 스코프': codeBlock(['const name = "밖";', 'function print() { console.log(name); }', '// 호출 위치가 아니라 작성 위치 기준으로 name을 찾습니다.']),
    '클로저': codeBlock(['function makeCounter() {', '  let count = 0;', '  return () => ++count;', '}', 'const counter = makeCounter();']),
    '커링': codeBlock(['const add = a => b => a + b;', 'const addTen = add(10);', 'console.log(addTen(5)); // 15']),
    '부분 적용': codeBlock(['function send(to, title, body) {}', 'const sendToAdmin = body => send("admin@example.com", "알림", body);']),
    '메모이제이션': codeBlock(['const cache = new Map();', 'function square(n) {', '  if (cache.has(n)) return cache.get(n);', '  cache.set(n, n * n);', '  return cache.get(n);', '}']),
    '구조 분해 할당': codeBlock(['const user = { name: "민수", age: 20 };', 'const { name, age } = user;']),
    '스프레드 문법': codeBlock(['const a = [1, 2];', 'const b = [...a, 3]; // [1, 2, 3]']),
    '레스트 파라미터': codeBlock(['function sum(...numbers) {', '  return numbers.reduce((a, b) => a + b, 0);', '}']),
    '콜백 지옥': codeBlock(['login(() => {', '  loadProfile(() => {', '    loadOrders(() => {', '      render();', '    });', '  });', '});']),
    '응집도': codeBlock(['UserService 안에 로그인, 로그아웃, 사용자 조회만 모음', '// 관련 기능이 한곳에 모여 응집도가 높습니다.']),
    '결합도': codeBlock(['OrderService가 PaymentService 내부 DB 테이블까지 직접 알면 결합도가 높습니다.', '인터페이스로 결제 요청만 보내면 결합도가 낮아집니다.']),
    '관심사 분리': codeBlock(['화면 표시: View', '주문 계산: Service', 'DB 저장: Repository']),
    '모듈화': codeBlock(['auth.js  // 로그인 관련', 'cart.js  // 장바구니 관련', 'payment.js // 결제 관련']),
    '단일 책임 원칙': codeBlock(['class InvoicePrinter { print(invoice) {} }', 'class InvoiceCalculator { total(invoice) {} }', '// 출력과 계산 책임을 나눕니다.']),
    '개방 폐쇄 원칙': codeBlock(['새 할인 정책을 추가할 때 기존 calculate 함수를 계속 고치기보다', 'DiscountPolicy 구현을 새로 추가하는 식으로 확장합니다.']),
    '어댑터 패턴': codeBlock(['oldPayment.payMoney(1000)', 'adapter.pay(1000)', '// 기존 API 모양을 새 인터페이스에 맞춥니다.']),
    '전략 패턴': codeBlock(['const shipping = isExpress ? expressShipping : normalShipping;', 'shipping.calculate(order);']),
    '데코레이터 패턴': codeBlock(['const withLogging = service => ({', '  save(data) { console.log(data); return service.save(data); }', '});']),
    '퍼사드 패턴': codeBlock(['checkout(order)', '// 내부에서는 재고 확인, 결제, 영수증 발송을 순서대로 처리하지만 호출자는 하나만 봅니다.']),
    '레이어드 아키텍처': codeBlock(['Controller -> Service -> Repository', '// 요청 처리, 업무 규칙, 데이터 접근을 층으로 나눕니다.']),
    '헥사고날 아키텍처': codeBlock(['Core Domain', '  <- Web Adapter', '  <- DB Adapter', '// 핵심 로직은 외부 도구와 직접 묶이지 않습니다.']),
    '모놀리식 아키텍처': codeBlock(['하나의 앱 안에 회원, 주문, 결제가 함께 있음', '한 번 빌드하고 한 덩어리로 배포합니다.']),
    '서비스 경계': codeBlock(['주문 서비스: 주문 생성/조회', '결제 서비스: 승인/취소', '// 데이터 책임선을 어디서 끊을지 정합니다.']),
    '계층 분리': codeBlock(['UI: 입력 받기', 'Service: 규칙 처리', 'Repository: 저장소 접근']),
    '지도 학습': '사진과 정답 라벨을 함께 줍니다. 입력: 고양이 사진, 정답: "고양이". 모델은 새 사진이 들어왔을 때 고양이인지 강아지인지 예측하도록 배웁니다.',
    '비지도 학습': '고객 구매 기록만 있고 정답 라벨은 없다고 해보세요. 모델은 비슷한 구매 패턴을 가진 고객끼리 자연스럽게 묶어냅니다.',
    '강화 학습': '게임 캐릭터가 장애물을 피하면 +1점, 부딪히면 -1점을 받습니다. 여러 번 시도하며 점수를 높이는 행동을 배우는 방식입니다.',
    '라벨': '메일 데이터에서 "스팸" 또는 "정상"이라고 붙은 정답 이름이 라벨입니다. 이미지 데이터라면 "고양이", "자동차" 같은 이름이 라벨이 됩니다.',
    '특징': '집값 예측에서 면적, 방 개수, 역과의 거리는 특징입니다. 모델은 이런 입력 속성을 보고 가격을 예측합니다.',
    '피처 엔지니어링': '생년월일 원본만 있는 데이터에서 나이, 연령대, 가입 후 경과일 같은 새 특징을 만들어 모델 입력으로 쓰는 작업입니다.',
    '학습 데이터': '모델이 공부하는 문제집입니다. 예를 들어 과거 주문 10만 건으로 사기 거래 패턴을 배우게 할 때 그 10만 건이 학습 데이터입니다.',
    '검증 데이터': '학습 중간에 모의고사를 보는 데이터입니다. 모델 설정을 바꿨을 때 성능이 좋아졌는지 확인하지만 최종 성적표로 쓰지는 않습니다.',
    '테스트 데이터': '학습과 설정 조정이 모두 끝난 뒤 마지막으로 열어보는 시험지입니다. 이 데이터 성능으로 모델이 실제로 얼마나 잘할지 가늠합니다.',
    '데이터 전처리': '키 정보가 "170cm", "1.70m", 빈 값으로 섞여 있으면 학습 전에 단위를 맞추고 빈 값을 처리해야 합니다. 이 정리 과정이 전처리입니다.',
    '정규화': '나이는 0-100, 소득은 0-100000000처럼 범위가 크게 다르면 학습이 불안정할 수 있습니다. 값을 0-1 범위처럼 맞추는 것이 정규화입니다.',
    '표준화': '시험 점수를 평균 0, 표준편차 1 기준으로 바꾸면 서로 다른 과목 점수를 비교하기 쉬워집니다. 모델 입력도 이런 방식으로 맞출 수 있습니다.',
    '결측치': '고객 나이 칸이 비어 있거나 배송 주소 일부가 없는 값입니다. 그대로 두면 평균 계산이나 모델 학습에서 오류가 나거나 결과가 흔들릴 수 있습니다.',
    '이상치': '대부분 주문 금액이 1만-10만 원인데 1억 원 주문이 하나 있다면 이상치 후보입니다. 실제 큰 주문인지 입력 오류인지 확인해야 합니다.',
    '경사 하강법': '산에서 가장 낮은 곳으로 내려가듯 손실이 줄어드는 방향을 조금씩 찾아갑니다. 너무 크게 움직이면 지나치고, 너무 작으면 오래 걸립니다.',
    '학습률': '경사 하강법의 보폭입니다. 0.001처럼 너무 작으면 느리고, 1처럼 너무 크면 최적 지점을 지나쳐 학습이 흔들릴 수 있습니다.',
    '에폭': '학습 데이터 1만 개를 처음부터 끝까지 한 번 모두 사용하면 1에폭입니다. 10에폭은 같은 데이터셋을 열 번 반복해 본 것입니다.',
    '배치': '데이터 1만 개를 한꺼번에 처리하기 어렵다면 100개씩 묶어 계산합니다. 이 한 묶음이 배치입니다.',
    '미니배치': '전체 데이터 중 32개나 64개처럼 작은 묶음으로 나누어 반복 학습하는 방식입니다. 속도와 안정성 사이의 균형을 잡습니다.',
    '손실 함수': '집값 예측이 실제보다 500만 원 틀렸다면 그 차이를 숫자로 계산합니다. 이 오차 점수를 만드는 기준이 손실 함수입니다.',
    '비용 함수': '여러 데이터의 손실을 모아 모델 전체가 얼마나 틀렸는지 계산합니다. 학습은 이 비용을 줄이는 방향으로 진행됩니다.',
    '옵티마이저': 'Adam, SGD처럼 손실을 줄이기 위해 가중치를 어떤 방식으로 바꿀지 정하는 알고리즘입니다.',
    '하이퍼파라미터': '학습률, 배치 크기, 에폭 수처럼 사람이 미리 정하는 설정입니다. 모델이 데이터에서 스스로 배우는 값과 구분합니다.',
    '모델 파라미터': '선형 회귀의 기울기와 절편, 신경망의 가중치처럼 학습 중 데이터에 맞춰 바뀌는 내부 값입니다.',
    '가중치': '집값 예측에서 면적 특징의 가중치가 크면 면적이 가격에 큰 영향을 준다는 뜻입니다.',
    '편향': '입력이 모두 0이어도 기본적으로 더해지는 기준값입니다. 모델의 출발점을 맞추는 조정값처럼 생각하면 됩니다.',
    '활성화 함수': '신경망이 단순 직선만 배우지 않고 복잡한 패턴을 배우게 해주는 문입니다. ReLU, 시그모이드가 대표적입니다.',
    'ReLU': '입력이 -3이면 0을 내고, 5이면 5를 그대로 냅니다. 음수 신호는 막고 양수 신호는 통과시키는 간단한 활성화 함수입니다.',
    '시그모이드': '어떤 숫자든 0과 1 사이 값으로 바꿉니다. 스팸일 확률처럼 두 선택지 중 하나를 판단할 때 자주 등장합니다.',
    '소프트맥스': '고양이 2.0, 강아지 1.0, 자동차 0.1 같은 점수를 확률처럼 바꿉니다. 여러 클래스 중 하나를 고를 때 씁니다.',
    '퍼셉트론': '입력값에 가중치를 곱해 더한 뒤 기준을 넘으면 1, 아니면 0을 내는 단순한 판단 장치입니다.',
    '은닉층': '이미지 입력과 최종 정답 사이에서 선, 모양, 패턴 같은 중간 특징을 계산하는 층입니다.',
    '출력층': '마지막에 "고양이 80%, 강아지 15%, 자동차 5%"처럼 모델의 최종 예측을 내는 부분입니다.',
    '역전파': '최종 예측이 틀렸을 때 오차를 뒤쪽 층에서 앞쪽 층으로 거슬러 보내며 각 가중치를 얼마나 고칠지 계산합니다.',
    '과소적합': '시험 문제도 못 풀고 연습 문제도 못 푸는 상태입니다. 모델이 너무 단순하거나 학습이 부족해 기본 패턴도 못 배운 경우입니다.',
    '일반화': '연습 문제만 외운 것이 아니라 새 문제도 잘 푸는 능력입니다. 모델이 처음 보는 데이터에 잘 맞으면 일반화가 좋다고 합니다.',
    '교차 검증': '데이터를 5등분해 돌아가며 4등분은 학습, 1등분은 검증에 쓰는 방식입니다. 한 번 나눈 운에 덜 흔들리게 합니다.',
    '혼동 행렬': '실제 스팸/정상과 예측 스팸/정상을 표로 놓고 맞힌 경우와 헷갈린 경우를 한눈에 보는 표입니다.',
    '정밀도': '모델이 스팸이라고 찍은 메일 100개 중 실제 스팸이 90개라면 정밀도는 90%입니다.',
    '재현율': '실제 스팸 메일 100개 중 모델이 80개를 찾아냈다면 재현율은 80%입니다.',
    'F1 점수': '정밀도만 높거나 재현율만 높은 상황을 피하려고 둘의 균형을 하나의 점수로 본 지표입니다.',
    'ROC 곡선': '스팸이라고 판단하는 기준을 조금씩 바꾸며 참 양성률과 거짓 양성률이 어떻게 변하는지 그린 곡선입니다.',
    'AUC': 'ROC 곡선 아래 면적입니다. 1에 가까울수록 양성과 음성을 잘 구분하고, 0.5면 찍기와 비슷합니다.',
    '회귀': '내일 기온, 집값, 매출처럼 숫자로 이어지는 값을 예측하는 문제입니다.',
    '분류 문제': '메일이 스팸인지 정상인지, 사진이 고양이인지 강아지인지처럼 정해진 종류 중 하나를 맞히는 문제입니다.',
    '군집화': '정답 없이 고객 행동을 보고 비슷한 고객끼리 묶습니다. 마케팅 그룹을 찾을 때 사용할 수 있습니다.',
    '차원 축소': '특징이 100개인 데이터를 중요한 정보만 남겨 2개나 3개 축으로 줄여 시각화하거나 학습을 쉽게 만듭니다.',
    'PCA': '데이터가 가장 많이 퍼진 방향을 찾아 새 축으로 삼습니다. 정보 손실을 줄이면서 차원을 줄이는 대표 방법입니다.',
    'K-평균': '처음에 K개의 중심점을 잡고 가까운 데이터끼리 묶은 뒤 중심을 다시 옮기는 과정을 반복합니다.',
    '결정 트리': '"나이가 20 이상인가?", "구매 횟수가 3회 이상인가?"처럼 질문을 가지로 나누며 예측합니다.',
    '랜덤 포레스트': '결정 트리 하나에만 맡기지 않고 여러 트리의 의견을 모아 더 안정적인 예측을 만듭니다.',
    '앙상블': '여러 모델의 예측을 투표나 평균으로 합칩니다. 한 사람보다 여러 전문가 의견을 모으는 방식과 비슷합니다.',
    '부스팅': '첫 모델이 틀린 데이터에 더 집중해 다음 모델을 학습시키고, 이런 모델들을 순서대로 쌓아 성능을 높입니다.',
    '서포트 벡터 머신': '두 그룹 사이의 간격이 가장 넓어지는 경계선을 찾습니다. 경계 가까이에 있는 데이터가 특히 중요합니다.',
    '나이브 베이즈': '메일에 "무료", "당첨" 같은 단어가 있을 확률을 이용해 스팸 가능성을 계산합니다.',
    'K-최근접 이웃': '새 고객이 들어오면 가장 비슷한 K명의 기존 고객을 보고 어떤 그룹인지 판단합니다.',
    '추천 시스템': '사용자가 본 영화, 좋아요를 누른 상품, 비슷한 사용자의 선택을 바탕으로 다음에 관심 가질 항목을 제안합니다.',
    '협업 필터링': '나와 비슷한 사용자가 좋아한 영화를 추천합니다. 콘텐츠 내용을 몰라도 행동 패턴만으로 추천할 수 있습니다.',
    '콘텐츠 기반 추천': '내가 SF 영화를 자주 봤다면 SF 장르, 우주 배경, 비슷한 감독의 영화를 추천합니다.',
    '자연어 처리': '검색어 이해, 문서 요약, 챗봇 답변처럼 사람의 언어를 컴퓨터가 다루는 분야입니다.',
    '컴퓨터 비전': '사진에서 얼굴을 찾거나, 도로 영상에서 차선을 인식하거나, 불량품 이미지를 판별하는 기술입니다.',
    '음성 인식': '마이크로 들어온 말을 "오늘 날씨 알려줘" 같은 텍스트나 명령으로 바꾸는 기술입니다.',
    '생성형 AI': '사용자가 "고양이 우주비행사 그림"을 요청하면 새 이미지를 만들거나, 요구사항을 보고 코드를 작성하는 AI입니다.',
    '환각': 'AI가 실제로 없는 논문 제목이나 존재하지 않는 함수명을 그럴듯하게 말하는 현상입니다.',
    '컨텍스트 윈도우': '긴 대화나 문서 중 모델이 한 번에 참고할 수 있는 범위입니다. 범위를 넘는 내용은 답변에 반영되지 않을 수 있습니다.',
    '시스템 프롬프트': 'AI에게 "너는 친절한 튜터다", "개인정보를 출력하지 마라"처럼 가장 위에서 행동 규칙을 정하는 지시입니다.',
    '샘플링': '다음 단어 후보가 여러 개 있을 때 확률에 따라 하나를 고르는 과정입니다. 항상 1등만 고르면 답이 단조로워질 수 있습니다.',
    '온도값': '온도가 낮으면 더 안정적이고 예측 가능한 답을, 높으면 더 다양하지만 흔들릴 수 있는 답을 만듭니다.',
    '탑-k 샘플링': '가능한 모든 후보가 아니라 확률이 높은 K개 후보 안에서만 다음 단어를 고르는 방식입니다.',
  };

  if (exact[t]) return exact[t];

  if (term.category.includes('AI')) {
    return `${t} 예시: 스팸 메일 분류 모델을 만든다고 하면, 메일 제목과 본문은 입력 데이터가 되고 "스팸/정상" 판단은 평가 대상이 됩니다. 이때 ${t}${josa(t, '은', '는')} ${d}라는 역할로 학습 과정의 특정 부분을 설명합니다.`;
  }
  if (term.category.includes('데이터')) {
    return `${t} 예시: 고객 나이 데이터에 빈 값, 999 같은 비정상 값, 문자열로 저장된 숫자가 섞여 있다고 가정해보세요. 분석 전에 ${t}${josa(t, '을', '를')} 확인해야 평균, 분류, 예측 결과가 왜곡되지 않습니다.`;
  }
  if (term.category.includes('웹')) {
    return `${t} 예시: 사용자가 로그인 버튼을 누르면 브라우저가 서버에 요청을 보내고 서버는 응답을 돌려줍니다. 이 흐름에서 ${t}${josa(t, '은', '는')} ${d}라는 부분을 설명할 때 쓰입니다.`;
  }
  if (term.category.includes('인프라')) {
    return `${t} 예시: 쇼핑몰 이벤트 날에 요청이 갑자기 늘면 서버 응답이 늦어지거나 일부 서버에 부하가 몰릴 수 있습니다. 이때 ${t}${josa(t, '을', '를')} 보면 성능 문제를 어떤 기준으로 다룰지 정할 수 있습니다.`;
  }
  if (term.category.includes('개발 도구')) {
    return `${t} 예시: 새 기능을 만든 뒤 자동 검사, 테스트, 빌드, 배포 과정을 통과해야 서비스에 올릴 수 있습니다. ${t}${josa(t, '은', '는')} 이 개발 흐름에서 코드 품질이나 작업 안정성을 높이는 역할을 합니다.`;
  }
  if (term.category.includes('아키텍처')) {
    return `${t} 예시: 주문 서비스에서 화면 코드는 주문 화면만, 결제 코드는 결제 처리만, 저장소 코드는 데이터 저장만 맡도록 나누는 상황을 떠올리면 됩니다. ${t}${josa(t, '은', '는')} 이런 책임 분리와 변경 영향 관리에 쓰입니다.`;
  }
  if (term.category.includes('함수와 스코프')) {
    return codeBlock([`// ${t} 예시`, 'function outer(value) {', '  const saved = value;', '  return function inner() {', '    return saved;', '  };', '}', `// ${d}`]);
  }
  return `${t} 예시: "${term.definition}"라는 설명이 나오는 문제에서는 보기 중 ${term.hint}에 가장 가까운 용어를 찾으면 됩니다. 실제 코드 리뷰나 문서에서 이 단어가 나오면 역할과 사용 시점을 함께 확인하세요.`;
}

function buildTip(term) {
  const t = term.term;
  const purpose = categoryPurpose(term.category);
  const cautionByTerm = [
    `${t}${josa(t, '을', '를')} 볼 때는 정의만 외우지 말고 "언제 쓰는가"와 "무엇과 헷갈리는가"를 같이 확인하세요. ${purpose}`,
    `${t}${josa(t, '은', '는')} 비슷한 용어와 함께 나올 때 의미가 선명해집니다. 예시를 직접 한 줄이라도 만들어보면 기억에 오래 남습니다.`,
    `${t} 문제를 풀 때는 설명 속 핵심 동사를 먼저 찾으세요. 저장한다, 나눈다, 기다린다, 평가한다 같은 말이 정답 단서가 됩니다.`,
    `${t}${josa(t, '은', '는')} 실무 문서에서 짧게 언급되는 경우가 많습니다. 지금 단계에서는 정확한 암기보다 역할을 말로 풀어 설명할 수 있는지가 더 중요합니다.`,
  ];

  if (/null|undefined/.test(t)) return `${t}${josa(t, '은', '는')} "없다"와 관련된 값이지만 원인이 다릅니다. 개발자가 일부러 비워둔 것인지, 아직 값이 들어오지 않은 것인지 구분하세요.`;
  if (/스코프|변수|this|클로저|호이스팅/.test(t)) return `${t}${josa(t, '은', '는')} 변수 이름을 어디서 찾는지와 연결됩니다. 코드가 길어질수록 "이 이름은 어느 범위의 값인가?"를 먼저 확인하세요.`;
  if (/테스트|TDD|Mock|모의/.test(t)) return `${t}${josa(t, '은', '는')} 버그를 나중에 찾는 대신 변경 순간에 잡기 위한 장치입니다. 실제 외부 서비스와 분리해 작게 검증하는 습관이 중요합니다.`;
  if (/학습|데이터|라벨|특징|파라미터|손실|정밀도|재현율|AUC|F1|ROC/.test(t)) return `${t}${josa(t, '은', '는')} 모델 성능을 설명할 때 자주 등장합니다. 숫자가 좋아 보여도 어떤 데이터와 기준으로 계산했는지 함께 봐야 합니다.`;
  if (/아키텍처|원칙|패턴|경계|계층|응집|결합/.test(t)) return `${t}${josa(t, '은', '는')} 코드를 더 멋지게 보이게 하려는 말이 아니라 변경 비용을 줄이기 위한 판단 기준입니다. 작게 적용할 수 있는 예부터 떠올리세요.`;
  return choose(cautionByTerm, seedOf(term));
}

function buildDetail(term) {
  return {
    easy: buildEasy(term),
    analogy: buildAnalogy(term),
    example: buildExample(term),
    tip: buildTip(term),
  };
}

for (const week of WEEKS) {
  const file = path.join(DATA_DIR, `terms.week${week}.json`);
  const terms = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const term of terms) {
    term.detail = buildDetail(term);
  }
  fs.writeFileSync(file, `${JSON.stringify(terms, null, 2)}\n`, 'utf8');
  console.log(`updated week${week}: ${terms.length} terms`);
}

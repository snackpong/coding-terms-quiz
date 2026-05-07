'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function sql(lines) {
  return lines.join('\n');
}

function py(lines) {
  return lines.join('\n');
}

const entries = [
  {
    term: 'SELECT 문',
    definition: '데이터베이스에서 원하는 열과 행을 조회해 결과 집합으로 돌려받는 SQL 문입니다. 예를 들어 users 테이블에서 이름과 이메일만 가져올 때 사용합니다.',
    hint: '조회문',
    easy: '데이터를 꺼내 보는 명령',
    analogy: '식당 메뉴판에서 원하는 음식 이름과 가격만 골라 보는 것과 같습니다. SELECT 문은 테이블 전체가 아니라 필요한 정보만 골라 보여 줍니다.',
    example: sql(['CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);', "INSERT INTO users VALUES (1, 'Ada', 'a@example.com');", 'SELECT name, email FROM users;']),
    tip: '운영 코드에서는 SELECT *보다 필요한 열을 명시하는 편이 좋습니다. 데이터 전송량과 의도하지 않은 컬럼 의존을 줄일 수 있습니다.'
  },
  {
    term: 'WHERE 절',
    definition: '조회, 수정, 삭제 대상 행을 조건으로 제한하는 SQL 절입니다. WHERE id = 1처럼 특정 행만 고를 때 사용합니다.',
    hint: '조건필터',
    easy: '조건에 맞는 줄만 고르기',
    analogy: '도서관에서 “프로그래밍 책 중 2024년 이후 책만” 달라고 조건을 붙이는 것과 같습니다. WHERE 절은 데이터베이스에 고를 기준을 알려 줍니다.',
    example: sql(['CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, year INTEGER);', "INSERT INTO books VALUES (1, 'SQL', 2024), (2, 'C', 2010);", 'SELECT title FROM books WHERE year >= 2020;']),
    tip: 'UPDATE나 DELETE에서 WHERE를 빠뜨리면 전체 행이 바뀔 수 있습니다. 실행 전 영향을 받는 행 수를 먼저 확인하세요.'
  },
  {
    term: 'AND/OR 조건',
    definition: '여러 조건을 함께 조합하는 논리 연산입니다. AND는 모든 조건이 참이어야 하고 OR은 조건 중 하나만 참이어도 됩니다.',
    hint: '조건조합',
    easy: '조건을 묶는 말',
    analogy: '놀이기구 탑승 조건이 “키 120cm 이상 AND 보호자 동의”라면 둘 다 필요합니다. “쿠폰 OR 포인트”라면 둘 중 하나만 있어도 됩니다.',
    example: sql(['CREATE TABLE products (name TEXT, price INTEGER, stock INTEGER);', "INSERT INTO products VALUES ('pen', 1000, 10), ('bag', 30000, 0);", 'SELECT name FROM products WHERE price < 5000 AND stock > 0;']),
    tip: 'AND와 OR을 섞을 때는 괄호를 사용해 의도를 분명히 하세요. 우선순위 오해는 조용한 데이터 오류를 만듭니다.'
  },
  {
    term: 'LIKE 연산자',
    definition: '문자열이 특정 패턴과 맞는지 검사하는 SQL 연산자입니다. %는 여러 글자, _는 한 글자를 뜻해 이름 검색 등에 사용합니다.',
    hint: '패턴검색',
    easy: '글자 모양으로 찾기',
    analogy: '연락처에서 “김”으로 시작하는 사람을 찾는 것과 같습니다. LIKE는 정확히 같은 값이 아니어도 글자 패턴이 맞는 행을 찾습니다.',
    example: sql(['CREATE TABLE users (name TEXT);', "INSERT INTO users VALUES ('김민수'), ('이영희'), ('김하나');", "SELECT name FROM users WHERE name LIKE '김%';"]),
    tip: '앞쪽에 %가 붙은 LIKE 검색은 인덱스를 잘 못 탈 수 있습니다. 큰 테이블의 부분 문자열 검색은 전문 검색 엔진도 고려하세요.'
  },
  {
    term: 'IN 연산자',
    definition: '값이 주어진 목록 중 하나에 포함되는지 검사하는 SQL 연산자입니다. WHERE status IN ("PAID", "SHIPPED")처럼 여러 값 비교를 간단히 표현합니다.',
    hint: '목록포함',
    easy: '여러 후보 중 하나인지 확인',
    analogy: '입장 가능한 명단에 내 이름이 있는지 확인하는 것과 같습니다. IN은 값이 허용 목록 안에 있는지 검사합니다.',
    example: sql(['CREATE TABLE orders (id INTEGER, status TEXT);', "INSERT INTO orders VALUES (1, 'PAID'), (2, 'CANCELLED'), (3, 'SHIPPED');", "SELECT id FROM orders WHERE status IN ('PAID', 'SHIPPED');"]),
    tip: 'IN 목록이 매우 길어지면 임시 테이블이나 조인을 쓰는 편이 나을 수 있습니다. NULL이 섞인 NOT IN은 특히 조심하세요.'
  },
  {
    term: 'BETWEEN 연산자',
    definition: '값이 시작값과 끝값 사이에 포함되는지 검사하는 SQL 연산자입니다. 날짜 범위나 가격 범위 조회에 자주 사용하며 양 끝값을 포함합니다.',
    hint: '범위검색',
    easy: '시작과 끝 사이 찾기',
    analogy: '키가 120cm부터 150cm까지인 학생을 줄 세워 찾는 것과 같습니다. BETWEEN은 정해진 범위 안에 들어오는 값을 고릅니다.',
    example: sql(['CREATE TABLE sales (day TEXT, amount INTEGER);', "INSERT INTO sales VALUES ('2026-05-01', 100), ('2026-05-06', 300);", "SELECT * FROM sales WHERE day BETWEEN '2026-05-01' AND '2026-05-31';"]),
    tip: 'BETWEEN은 양 끝을 포함합니다. 날짜와 시간 타입에서는 하루 끝 시각 누락을 피하려고 반열린 범위 >= 시작 AND < 다음날을 쓰기도 합니다.'
  },
  {
    term: 'IS NULL',
    definition: '값이 NULL인지 검사하는 SQL 조건입니다. NULL은 일반 값이 아니므로 = NULL이 아니라 IS NULL 또는 IS NOT NULL로 비교해야 합니다.',
    hint: 'NULL검사',
    easy: '값이 비었는지 확인',
    analogy: '설문지에서 0점이라고 쓴 것과 답을 비워 둔 것은 다릅니다. IS NULL은 답이 비어 있는 칸을 찾는 검사입니다.',
    example: sql(['CREATE TABLE profiles (id INTEGER, nickname TEXT);', "INSERT INTO profiles VALUES (1, NULL), (2, 'neo');", 'SELECT id FROM profiles WHERE nickname IS NULL;']),
    tip: 'NULL은 =, != 비교에서 기대와 다르게 동작합니다. 필수 값은 NOT NULL 제약으로 막는 것이 좋습니다.'
  },
  {
    term: 'ORDER BY',
    definition: '조회 결과의 행 순서를 특정 열이나 표현식 기준으로 정렬하는 SQL 절입니다. ASC는 오름차순, DESC는 내림차순입니다.',
    hint: '결과정렬',
    easy: '결과를 순서대로 놓기',
    analogy: '성적표를 이름순이나 점수 높은 순으로 다시 정렬하는 것과 같습니다. ORDER BY는 조회된 결과의 줄 세우기 기준을 정합니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('Ada', 90), ('Bob', 80);", 'SELECT name, score FROM scores ORDER BY score DESC;']),
    tip: 'ORDER BY가 없으면 결과 순서는 보장되지 않습니다. 페이지네이션에는 반드시 안정적인 정렬 기준을 넣으세요.'
  },
  {
    term: 'LIMIT/OFFSET',
    definition: '조회 결과에서 가져올 행 수와 건너뛸 행 수를 지정하는 SQL 절입니다. 목록 화면에서 한 페이지에 20개씩 보여 줄 때 사용할 수 있습니다.',
    hint: '개수제한',
    easy: '몇 개만 가져오고 앞은 건너뛰기',
    analogy: '책장에서 앞의 20권을 지나 다음 10권만 꺼내는 것과 같습니다. LIMIT/OFFSET은 결과 목록에서 필요한 구간만 가져옵니다.',
    example: sql(['CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT);', "INSERT INTO items VALUES (1, 'a'), (2, 'b'), (3, 'c');", 'SELECT * FROM items ORDER BY id LIMIT 2 OFFSET 1;']),
    tip: 'OFFSET이 커질수록 앞 행을 세느라 느려질 수 있습니다. 큰 목록은 키셋 페이지네이션을 고려하세요.'
  },
  {
    term: 'GROUP BY',
    definition: '같은 값을 가진 행들을 그룹으로 묶어 집계할 때 사용하는 SQL 절입니다. 지역별 매출 합계나 사용자별 주문 수를 계산할 때 사용합니다.',
    hint: '그룹집계',
    easy: '같은 것끼리 묶어 계산',
    analogy: '영수증을 지점별 상자에 나눈 뒤 각 상자의 합계를 계산하는 것과 같습니다. GROUP BY는 같은 기준의 행을 묶어 집계합니다.',
    example: sql(['CREATE TABLE sales (region TEXT, amount INTEGER);', "INSERT INTO sales VALUES ('KR', 100), ('KR', 200), ('US', 50);", 'SELECT region, SUM(amount) FROM sales GROUP BY region;']),
    tip: 'GROUP BY에 포함하지 않은 일반 컬럼을 SELECT하면 DBMS마다 오류나 애매한 결과가 생길 수 있습니다. 집계 기준을 명확히 하세요.'
  },
  {
    term: 'HAVING',
    definition: 'GROUP BY로 만든 그룹 결과에 조건을 거는 SQL 절입니다. WHERE가 개별 행을 거른다면 HAVING은 집계된 그룹을 거릅니다.',
    hint: '그룹조건',
    easy: '묶은 뒤 조건 걸기',
    analogy: '반별 평균 점수를 계산한 뒤 평균 80점 이상인 반만 고르는 것과 같습니다. HAVING은 계산된 그룹 결과를 기준으로 남길 그룹을 정합니다.',
    example: sql(['CREATE TABLE sales (region TEXT, amount INTEGER);', "INSERT INTO sales VALUES ('KR', 100), ('KR', 200), ('US', 50);", 'SELECT region, SUM(amount) AS total FROM sales GROUP BY region HAVING total >= 200;']),
    tip: '집계 전 필터는 WHERE, 집계 후 필터는 HAVING을 쓰세요. WHERE로 먼저 줄이면 처리할 행도 줄어 성능에 유리합니다.'
  },
  {
    term: '집계 함수(COUNT)',
    definition: '행의 개수를 세는 SQL 집계 함수입니다. COUNT(*)는 행 수를 세고 COUNT(column)은 NULL이 아닌 값의 개수를 셉니다.',
    hint: '개수세기',
    easy: '몇 개인지 세는 함수',
    analogy: '출석부에서 전체 학생 수를 세거나 결석 표시가 없는 학생만 세는 것과 같습니다. COUNT는 행이나 값의 개수를 계산합니다.',
    example: sql(['CREATE TABLE users (id INTEGER, email TEXT);', "INSERT INTO users VALUES (1, 'a@example.com'), (2, NULL);", 'SELECT COUNT(*) AS rows, COUNT(email) AS emails FROM users;']),
    tip: 'COUNT(column)은 NULL을 제외합니다. 전체 행 수가 필요한지, 값이 있는 행 수가 필요한지 구분하세요.'
  },
  {
    term: '집계 함수(SUM/AVG)',
    definition: 'SUM은 숫자 값의 합계를, AVG는 평균을 계산하는 SQL 집계 함수입니다. 매출 합계, 평균 주문 금액처럼 수치 요약에 사용합니다.',
    hint: '합계평균',
    easy: '더하고 평균 내기',
    analogy: '가계부에서 한 달 지출을 모두 더하고 하루 평균 지출을 계산하는 것과 같습니다. SUM과 AVG는 숫자 데이터를 요약합니다.',
    example: sql(['CREATE TABLE orders (amount INTEGER);', 'INSERT INTO orders VALUES (1000), (2000), (3000);', 'SELECT SUM(amount) AS total, AVG(amount) AS average FROM orders;']),
    tip: 'AVG는 NULL을 제외하고 계산합니다. 0과 NULL은 의미가 다르므로 결측값 처리를 먼저 결정하세요.'
  },
  {
    term: 'INNER JOIN',
    definition: '두 테이블에서 조인 조건이 서로 맞는 행만 결합해 반환하는 조인입니다. 회원이 있는 주문처럼 양쪽에 모두 존재하는 데이터만 보고 싶을 때 사용합니다.',
    hint: '일치조인',
    easy: '양쪽에 모두 있는 것만 연결',
    analogy: '초대 명단과 실제 참석 명단을 비교해 양쪽에 모두 있는 사람만 체크하는 것과 같습니다. INNER JOIN은 서로 매칭되는 행만 남깁니다.',
    example: sql(['CREATE TABLE users (id INTEGER, name TEXT);', 'CREATE TABLE orders (id INTEGER, user_id INTEGER);', "INSERT INTO users VALUES (1, 'Ada');", 'INSERT INTO orders VALUES (10, 1), (11, 99);', 'SELECT users.name, orders.id FROM users INNER JOIN orders ON users.id = orders.user_id;']),
    tip: 'INNER JOIN은 매칭되지 않는 행을 조용히 버립니다. 누락된 데이터도 확인해야 한다면 LEFT JOIN을 검토하세요.'
  },
  {
    term: 'LEFT JOIN',
    definition: '왼쪽 테이블의 모든 행을 유지하고 오른쪽 테이블에서 조건이 맞는 행만 붙이는 조인입니다. 주문이 없는 회원까지 보고 싶을 때 사용합니다.',
    hint: '왼쪽유지',
    easy: '왼쪽 표는 모두 남기기',
    analogy: '전체 학생 명단을 기준으로 시험 제출 여부를 붙이면 미제출 학생도 명단에 남습니다. LEFT JOIN은 기준 목록을 잃지 않습니다.',
    example: sql(['CREATE TABLE users (id INTEGER, name TEXT);', 'CREATE TABLE orders (id INTEGER, user_id INTEGER);', "INSERT INTO users VALUES (1, 'Ada'), (2, 'Bob');", 'INSERT INTO orders VALUES (10, 1);', 'SELECT users.name, orders.id FROM users LEFT JOIN orders ON users.id = orders.user_id;']),
    tip: 'LEFT JOIN 후 오른쪽 테이블 조건을 WHERE에 쓰면 INNER JOIN처럼 바뀔 수 있습니다. 오른쪽 조건은 ON에 둘지 WHERE에 둘지 신중히 정하세요.'
  },
  {
    term: 'RIGHT JOIN',
    definition: '오른쪽 테이블의 모든 행을 유지하고 왼쪽 테이블에서 조건이 맞는 행을 붙이는 조인입니다. LEFT JOIN의 방향을 반대로 생각하면 됩니다.',
    hint: '오른쪽유지',
    easy: '오른쪽 표는 모두 남기기',
    analogy: '전체 상품 목록을 기준으로 판매 내역을 붙이면 팔리지 않은 상품도 남습니다. RIGHT JOIN은 오른쪽 목록을 기준으로 결과를 만듭니다.',
    example: sql(['-- SQLite는 RIGHT JOIN 지원 버전에 따라 다르므로 LEFT JOIN으로 같은 결과를 표현합니다.', 'CREATE TABLE products (id INTEGER, name TEXT);', 'CREATE TABLE sales (product_id INTEGER, qty INTEGER);', "INSERT INTO products VALUES (1, 'pen'), (2, 'bag');", 'INSERT INTO sales VALUES (1, 3);', 'SELECT products.name, sales.qty FROM products LEFT JOIN sales ON products.id = sales.product_id;']),
    tip: 'RIGHT JOIN은 LEFT JOIN으로 바꿔 읽는 편이 이해하기 쉬운 경우가 많습니다. 팀 컨벤션에 맞춰 한 방향 조인을 일관되게 쓰세요.'
  },
  {
    term: 'FULL OUTER JOIN',
    definition: '양쪽 테이블의 모든 행을 유지하고 조건이 맞는 행은 결합하며, 매칭되지 않은 쪽은 NULL로 채우는 조인입니다. 두 데이터 목록의 차이를 비교할 때 유용합니다.',
    hint: '양쪽유지',
    easy: '양쪽 표를 모두 남기기',
    analogy: '동창회 참석 예정 명단과 실제 참석 명단을 합쳐 누가 빠졌고 누가 새로 왔는지 모두 보는 것과 같습니다. FULL OUTER JOIN은 양쪽의 불일치도 보여 줍니다.',
    example: sql(['-- SQLite에서는 UNION으로 FULL OUTER JOIN을 흉내낼 수 있습니다.', 'CREATE TABLE a (id INTEGER, name TEXT);', 'CREATE TABLE b (id INTEGER, name TEXT);', "INSERT INTO a VALUES (1, 'left');", "INSERT INTO b VALUES (2, 'right');", 'SELECT a.id, a.name, b.name FROM a LEFT JOIN b USING (id)', 'UNION', 'SELECT b.id, a.name, b.name FROM b LEFT JOIN a USING (id);']),
    tip: 'FULL OUTER JOIN은 결과가 커질 수 있습니다. 비교 목적이면 필요한 키와 상태 컬럼만 먼저 조회하세요.'
  },
  {
    term: 'CROSS JOIN',
    definition: '두 테이블의 모든 행 조합을 만드는 조인입니다. 왼쪽 3행과 오른쪽 4행을 CROSS JOIN하면 12행이 만들어집니다.',
    hint: '모든조합',
    easy: '가능한 모든 짝 만들기',
    analogy: '셔츠 3벌과 바지 4벌로 만들 수 있는 모든 코디 조합을 나열하는 것과 같습니다. CROSS JOIN은 두 목록의 모든 조합을 만듭니다.',
    example: sql(['CREATE TABLE colors (name TEXT);', 'CREATE TABLE sizes (name TEXT);', "INSERT INTO colors VALUES ('red'), ('blue');", "INSERT INTO sizes VALUES ('S'), ('M');", 'SELECT colors.name, sizes.name FROM colors CROSS JOIN sizes;']),
    tip: 'CROSS JOIN은 행 수가 곱으로 늘어납니다. 실수로 조건 없는 조인을 만들면 큰 장애가 될 수 있습니다.'
  },
  {
    term: '셀프 조인',
    definition: '같은 테이블을 두 번 참조해 자기 자신과 조인하는 방식입니다. 직원과 관리자처럼 같은 테이블 안의 계층 관계를 조회할 때 사용합니다.',
    hint: '자기조인',
    easy: '같은 표를 두 역할로 연결',
    analogy: '회사 직원 명단 하나에서 직원 이름과 그 직원의 팀장 이름을 함께 찾는 것과 같습니다. 같은 명단을 직원용과 관리자용으로 두 번 보는 셈입니다.',
    example: sql(['CREATE TABLE employees (id INTEGER, name TEXT, manager_id INTEGER);', "INSERT INTO employees VALUES (1, 'CEO', NULL), (2, 'Ada', 1);", 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;']),
    tip: '셀프 조인은 별칭(alias)이 필수에 가깝습니다. 같은 테이블을 어떤 역할로 쓰는지 alias 이름에 드러내세요.'
  },
  {
    term: '서브쿼리',
    definition: 'SQL 문 안에 포함된 또 다른 SELECT 쿼리입니다. 내부 쿼리 결과를 바깥 쿼리의 조건, 컬럼, 테이블처럼 사용할 수 있습니다.',
    hint: '쿼리안쿼리',
    easy: '질문 안에 작은 질문 넣기',
    analogy: '선생님에게 “평균 점수보다 높은 학생을 알려 주세요”라고 하면 먼저 평균을 계산해야 합니다. 서브쿼리는 그 안쪽 계산을 SQL 안에 넣습니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('Ada', 90), ('Bob', 70);", 'SELECT name FROM scores WHERE score > (SELECT AVG(score) FROM scores);']),
    tip: '서브쿼리가 반복 실행되면 느려질 수 있습니다. 실행 계획을 보고 조인이나 CTE로 바꾸는 것이 나은지 확인하세요.'
  },
  {
    term: '상관 서브쿼리',
    definition: '내부 서브쿼리가 바깥 쿼리의 현재 행 값을 참조하는 서브쿼리입니다. 바깥 행마다 내부 쿼리가 달라질 수 있습니다.',
    hint: '행별서브쿼리',
    easy: '바깥 줄을 보며 실행되는 작은 쿼리',
    analogy: '각 학생마다 자기 반 평균과 비교하려면 학생이 속한 반을 알아야 합니다. 상관 서브쿼리는 바깥 행의 정보를 들고 안쪽 질문을 합니다.',
    example: sql(['CREATE TABLE orders (user_id INTEGER, amount INTEGER);', 'INSERT INTO orders VALUES (1, 100), (1, 300), (2, 50);', 'SELECT o.user_id, o.amount FROM orders o WHERE o.amount > (SELECT AVG(i.amount) FROM orders i WHERE i.user_id = o.user_id);']),
    tip: '상관 서브쿼리는 행마다 실행되는 형태가 될 수 있어 비용이 큽니다. 인덱스와 대체 조인 방식을 함께 검토하세요.'
  },
  {
    term: 'EXISTS',
    definition: '서브쿼리 결과가 하나라도 존재하는지 검사하는 SQL 조건입니다. 실제 값을 가져오기보다 존재 여부만 확인할 때 사용합니다.',
    hint: '존재확인',
    easy: '하나라도 있는지 보기',
    analogy: '우편함 안에 편지가 하나라도 있는지만 확인하고 편지 내용을 읽지는 않는 것과 같습니다. EXISTS는 결과가 있는지만 빠르게 판단합니다.',
    example: sql(['CREATE TABLE users (id INTEGER, name TEXT);', 'CREATE TABLE orders (user_id INTEGER);', "INSERT INTO users VALUES (1, 'Ada'), (2, 'Bob');", 'INSERT INTO orders VALUES (1);', 'SELECT name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);']),
    tip: 'EXISTS는 매칭되는 첫 행을 찾으면 충분합니다. 존재 여부 검사에는 IN보다 의도가 명확할 때가 많습니다.'
  },
  {
    term: 'NOT EXISTS',
    definition: '서브쿼리 결과가 하나도 없을 때 참이 되는 SQL 조건입니다. 주문이 없는 회원처럼 관련 데이터가 없는 대상을 찾을 때 사용합니다.',
    hint: '부재확인',
    easy: '관련 행이 없는지 보기',
    analogy: '대출 기록이 없는 회원을 찾기 위해 대출 장부에 이름이 없는 사람만 고르는 것과 같습니다. NOT EXISTS는 연결된 기록이 없는 대상을 찾습니다.',
    example: sql(['CREATE TABLE users (id INTEGER, name TEXT);', 'CREATE TABLE orders (user_id INTEGER);', "INSERT INTO users VALUES (1, 'Ada'), (2, 'Bob');", 'INSERT INTO orders VALUES (1);', 'SELECT name FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);']),
    tip: 'NULL이 섞일 수 있는 NOT IN보다 NOT EXISTS가 안전한 경우가 많습니다. 특히 외래 키가 nullable이면 주의하세요.'
  },
  {
    term: 'UNION',
    definition: '두 SELECT 결과를 위아래로 합치면서 중복 행을 제거하는 집합 연산자입니다. 두 목록을 하나로 합치되 같은 항목은 한 번만 보고 싶을 때 사용합니다.',
    hint: '합집합중복제거',
    easy: '두 결과를 합치고 중복 빼기',
    analogy: '두 반의 참가자 명단을 합치면서 같은 학생 이름은 한 번만 적는 것과 같습니다. UNION은 결과를 합친 뒤 중복을 제거합니다.',
    example: sql(['SELECT "Ada" AS name', 'UNION', 'SELECT "Ada"', 'UNION', 'SELECT "Bob";']),
    tip: 'UNION은 중복 제거 비용이 있습니다. 중복 제거가 필요 없다면 UNION ALL이 더 빠를 수 있습니다.'
  },
  {
    term: 'UNION ALL',
    definition: '두 SELECT 결과를 위아래로 합치되 중복 행을 제거하지 않는 집합 연산자입니다. 원본 행 수를 그대로 보존해야 할 때 사용합니다.',
    hint: '합집합전체',
    easy: '두 결과를 그대로 이어 붙이기',
    analogy: '두 매장의 판매 영수증을 그대로 한 묶음으로 모으면 같은 상품이 여러 번 나와도 지우지 않습니다. UNION ALL은 중복을 그대로 둡니다.',
    example: sql(['SELECT "Ada" AS name', 'UNION ALL', 'SELECT "Ada"', 'UNION ALL', 'SELECT "Bob";']),
    tip: '로그나 거래 내역처럼 중복도 의미가 있는 데이터는 UNION ALL을 사용하세요. 성능도 보통 UNION보다 좋습니다.'
  },
  {
    term: 'INTERSECT',
    definition: '두 SELECT 결과에 공통으로 존재하는 행만 반환하는 집합 연산자입니다. 두 조건을 모두 만족하는 목록을 비교할 때 사용합니다.',
    hint: '교집합',
    easy: '양쪽에 다 있는 것만 찾기',
    analogy: '축구부 명단과 장학금 명단을 비교해 두 명단에 모두 있는 학생만 찾는 것과 같습니다. INTERSECT는 공통 항목만 남깁니다.',
    example: sql(['SELECT "Ada" AS name', 'INTERSECT', 'SELECT "Ada"', 'UNION ALL SELECT "Bob" WHERE 0;']),
    tip: 'INTERSECT 지원 여부와 문법은 DBMS마다 다릅니다. 지원하지 않으면 INNER JOIN이나 EXISTS로 표현할 수 있습니다.'
  },
  {
    term: 'EXCEPT',
    definition: '첫 번째 SELECT 결과에서 두 번째 SELECT 결과에 있는 행을 제외해 반환하는 집합 연산자입니다. 한 목록에는 있지만 다른 목록에는 없는 값을 찾을 때 사용합니다.',
    hint: '차집합',
    easy: '앞 목록에서 뒤 목록 빼기',
    analogy: '신청자 명단에서 결제 완료 명단을 빼면 아직 결제하지 않은 사람이 남습니다. EXCEPT는 두 결과의 차이를 구합니다.',
    example: sql(['SELECT "Ada" AS name', 'UNION SELECT "Bob"', 'EXCEPT', 'SELECT "Ada";']),
    tip: 'EXCEPT도 DBMS별 지원과 중복 처리 방식이 다릅니다. 대량 데이터 비교에서는 키 인덱스가 중요합니다.'
  },
  {
    term: 'WITH(CTE)',
    definition: '하나의 SQL 문 안에서 이름 붙인 임시 결과를 정의해 재사용하는 문법입니다. 복잡한 쿼리를 단계별로 나누어 읽기 쉽게 만들 수 있습니다.',
    hint: '임시결과',
    easy: '쿼리 안의 이름 붙인 중간 결과',
    analogy: '요리 레시피에서 먼저 소스를 만들어 이름 붙여 두고 다음 단계에서 쓰는 것과 같습니다. CTE는 중간 쿼리 결과에 이름을 붙입니다.',
    example: sql(['WITH high_scores AS (', '  SELECT "Ada" AS name, 90 AS score', ')', 'SELECT name FROM high_scores WHERE score >= 80;']),
    tip: 'CTE는 가독성을 높이지만 DBMS에 따라 최적화 방식이 다릅니다. 성능이 중요하면 실행 계획을 확인하세요.'
  },
  {
    term: '윈도우 함수',
    definition: '행을 그룹으로 접지 않고 현재 행 주변의 행 집합을 기준으로 순위, 누적합, 이전 값 등을 계산하는 SQL 함수입니다.',
    hint: '행별분석',
    easy: '각 줄을 유지하며 계산하기',
    analogy: '달리기 기록표에서 선수별 행은 그대로 두고 전체 순위만 옆 칸에 적는 것과 같습니다. 윈도우 함수는 행을 유지하면서 분석 값을 붙입니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('Ada', 90), ('Bob', 80);", 'SELECT name, score, RANK() OVER (ORDER BY score DESC) AS rank FROM scores;']),
    tip: '윈도우 함수는 GROUP BY보다 결과 행을 보존합니다. 상세 행과 집계 정보를 동시에 보여 줄 때 강력합니다.'
  },
  {
    term: 'ROW_NUMBER()',
    definition: '윈도우 안에서 정렬 기준에 따라 각 행에 1부터 시작하는 고유한 순번을 붙이는 함수입니다. 동점이어도 서로 다른 번호를 받습니다.',
    hint: '행번호',
    easy: '줄마다 순번 붙이기',
    analogy: '줄 선 사람에게 앞에서부터 1번, 2번, 3번 번호표를 주는 것과 같습니다. ROW_NUMBER는 같은 값이 있어도 행마다 다른 번호를 붙입니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('Ada', 90), ('Bob', 90);", 'SELECT name, ROW_NUMBER() OVER (ORDER BY score DESC) AS rn FROM scores;']),
    tip: 'ROW_NUMBER로 중복 데이터 중 하나만 남기는 작업을 자주 합니다. 정렬 기준이 안정적이어야 결과가 예측 가능합니다.'
  },
  {
    term: 'RANK()',
    definition: '정렬 기준에 따라 순위를 매기되 동점자는 같은 순위를 받고 다음 순위는 동점자 수만큼 건너뛰는 윈도우 함수입니다.',
    hint: '건너뛰는순위',
    easy: '동점이면 같은 등수, 다음 등수 건너뛰기',
    analogy: '공동 1등이 두 명이면 다음 사람은 3등이 되는 경기 순위와 같습니다. RANK는 동점 수만큼 순위에 빈자리를 둡니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('Ada', 90), ('Bob', 90), ('Cara', 80);", 'SELECT name, RANK() OVER (ORDER BY score DESC) AS rank FROM scores;']),
    tip: '등수에 빈칸이 생기는 것이 맞는 요구인지 확인하세요. 빈칸 없는 순위가 필요하면 DENSE_RANK를 쓰세요.'
  },
  {
    term: 'DENSE_RANK()',
    definition: '정렬 기준에 따라 순위를 매기되 동점자는 같은 순위를 받고 다음 순위를 건너뛰지 않는 윈도우 함수입니다.',
    hint: '촘촘한순위',
    easy: '동점 후에도 다음 등수 이어가기',
    analogy: '공동 1등이 있어도 다음 그룹을 2등으로 부르는 방식과 같습니다. DENSE_RANK는 순위 번호를 촘촘하게 유지합니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('Ada', 90), ('Bob', 90), ('Cara', 80);", 'SELECT name, DENSE_RANK() OVER (ORDER BY score DESC) AS rank FROM scores;']),
    tip: '카테고리별 상위 N개 그룹을 구할 때 DENSE_RANK가 유용합니다. 동점 포함 정책을 먼저 정하세요.'
  },
  {
    term: 'LEAD/LAG',
    definition: '현재 행을 기준으로 다음 행의 값(LEAD)이나 이전 행의 값(LAG)을 가져오는 윈도우 함수입니다. 전일 대비 변화량 계산에 자주 사용합니다.',
    hint: '앞뒤값',
    easy: '이전 값과 다음 값 가져오기',
    analogy: '달력에서 오늘 옆의 어제와 내일 일정을 같이 보는 것과 같습니다. LEAD/LAG는 현재 행 주변의 값을 참조합니다.',
    example: sql(['CREATE TABLE visits (day TEXT, count INTEGER);', "INSERT INTO visits VALUES ('2026-05-01', 10), ('2026-05-02', 15);", 'SELECT day, count, LAG(count) OVER (ORDER BY day) AS prev_count FROM visits;']),
    tip: 'LEAD/LAG는 정렬 기준이 핵심입니다. 시간 순서가 중복될 수 있으면 보조 정렬 컬럼을 추가하세요.'
  },
  {
    term: 'PARTITION BY',
    definition: '윈도우 함수에서 계산 범위를 특정 그룹으로 나누는 절입니다. 사용자별 순위, 지역별 누적합처럼 그룹마다 독립적으로 계산할 때 사용합니다.',
    hint: '윈도우분할',
    easy: '그룹별로 따로 계산하기',
    analogy: '학년별로 따로 등수를 매기면 1학년과 2학년의 순위가 섞이지 않습니다. PARTITION BY는 계산할 칸막이를 만듭니다.',
    example: sql(['CREATE TABLE scores (class TEXT, name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('A', 'Ada', 90), ('A', 'Bob', 80), ('B', 'Cara', 95);", 'SELECT class, name, RANK() OVER (PARTITION BY class ORDER BY score DESC) AS rank FROM scores;']),
    tip: 'PARTITION BY와 GROUP BY를 혼동하지 마세요. PARTITION BY는 행을 유지한 채 계산 범위만 나눕니다.'
  },
  {
    term: '조건 표현식(CASE WHEN)',
    definition: 'SQL 안에서 조건에 따라 다른 값을 반환하는 표현식입니다. 점수에 따라 A/B/C 등급을 붙이거나 상태 값을 사람이 읽기 좋게 바꿀 때 사용합니다.',
    hint: '조건값',
    easy: '조건별로 다른 값 만들기',
    analogy: '시험 점수에 따라 90점 이상은 A, 80점 이상은 B라고 성적표에 적는 규칙과 같습니다. CASE WHEN은 SQL 결과에 조건부 라벨을 붙입니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('Ada', 90), ('Bob', 70);", "SELECT name, CASE WHEN score >= 80 THEN 'PASS' ELSE 'FAIL' END AS result FROM scores;"]),
    tip: 'CASE WHEN이 너무 길어지면 규칙 테이블로 분리하는 편이 나을 수 있습니다. 비즈니스 규칙 변경 가능성을 고려하세요.'
  },
  {
    term: 'COALESCE',
    definition: '여러 값 중 NULL이 아닌 첫 번째 값을 반환하는 SQL 함수입니다. 닉네임이 없으면 이름을 보여 주는 식의 대체값 처리에 사용합니다.',
    hint: '대체값',
    easy: '비어 있으면 다음 값 쓰기',
    analogy: '연락이 안 되면 휴대폰, 집 전화, 이메일 순서로 시도하는 것과 같습니다. COALESCE는 앞 값이 비어 있으면 다음 후보를 사용합니다.',
    example: sql(['CREATE TABLE users (name TEXT, nickname TEXT);', "INSERT INTO users VALUES ('Ada', NULL), ('Bob', 'B');", 'SELECT COALESCE(nickname, name) AS display_name FROM users;']),
    tip: 'COALESCE는 표시용 기본값에 유용하지만 원본 NULL 의미를 숨길 수 있습니다. 저장 데이터와 출력 데이터를 구분하세요.'
  },
  {
    term: 'NULLIF',
    definition: '두 값이 같으면 NULL을 반환하고 다르면 첫 번째 값을 반환하는 SQL 함수입니다. 0으로 나누기 방지나 특정 값을 결측처럼 처리할 때 사용합니다.',
    hint: '같으면NULL',
    easy: '같은 값이면 비우기',
    analogy: '설문에서 “해당 없음”이라고 쓴 답은 실제 답변으로 세지 않고 빈칸으로 처리하는 것과 같습니다. NULLIF는 특정 값을 NULL처럼 바꿉니다.',
    example: sql(['CREATE TABLE metrics (success INTEGER, total INTEGER);', 'INSERT INTO metrics VALUES (5, 0), (8, 10);', 'SELECT success * 1.0 / NULLIF(total, 0) AS rate FROM metrics;']),
    tip: 'NULLIF는 나눗셈 오류 방지에 자주 쓰입니다. 결과가 NULL이 될 수 있으므로 이후 표시 방식도 정하세요.'
  },
  {
    term: 'CAST/CONVERT',
    definition: '값의 데이터 타입을 다른 타입으로 변환하는 SQL 기능입니다. 문자열 숫자를 정수로 바꾸거나 날짜 값을 문자열로 표현할 때 사용합니다.',
    hint: '타입변환',
    easy: '값의 종류 바꾸기',
    analogy: '외국 돈을 원화로 환전해야 계산할 수 있는 것과 같습니다. CAST/CONVERT는 DB가 값을 원하는 타입으로 다루게 바꿉니다.',
    example: sql([
      'WITH raw_values(value_text) AS (',
      '  SELECT "123"',
      ')',
      'SELECT CAST(value_text AS INTEGER) + 7 AS result FROM raw_values;'
    ]),
    tip: '타입 변환은 인덱스 사용을 방해할 수 있습니다. WHERE에서 컬럼을 변환하기보다 비교 값의 타입을 맞추는 편이 좋습니다.'
  },
  {
    term: '날짜 함수',
    definition: '날짜와 시간 값을 만들고, 더하고, 빼고, 형식화하거나 일부만 추출하는 SQL 함수입니다. 월별 집계나 만료일 계산에 사용합니다.',
    hint: '날짜계산',
    easy: '날짜를 계산하는 함수',
    analogy: '달력에서 오늘부터 7일 뒤를 세거나 이번 달만 표시하는 것과 같습니다. 날짜 함수는 시간 데이터를 원하는 단위로 다룹니다.',
    example: sql(["SELECT date('2026-05-06', '+7 day') AS next_week;", "SELECT strftime('%Y-%m', '2026-05-06') AS month;"]),
    tip: '시간대와 저장 형식을 먼저 정하세요. UTC 저장, 로컬 표시 원칙을 지키면 날짜 버그가 줄어듭니다.'
  },
  {
    term: '문자열 함수',
    definition: '문자열을 자르거나 붙이고, 길이를 구하고, 대소문자를 바꾸는 SQL 함수입니다. 검색 키 정리나 표시 문자열 생성에 사용합니다.',
    hint: '글자처리',
    easy: '글자를 자르고 붙이는 함수',
    analogy: '문서 편집기에서 글자를 잘라 붙이거나 일부만 복사하는 것과 같습니다. 문자열 함수는 텍스트 값을 SQL 안에서 다룹니다.',
    example: sql([
      'WITH words(value) AS (',
      "  SELECT 'database'",
      ')',
      'SELECT upper(value) AS upper_name, substr(value, 1, 4) AS short_name FROM words;'
    ]),
    tip: '문자열 함수로 컬럼을 가공한 조건은 인덱스를 못 탈 수 있습니다. 검색용 정규화 컬럼을 따로 두는 방법도 있습니다.'
  },
  {
    term: '수학 함수',
    definition: '숫자 값을 반올림, 절댓값 계산, 나머지 계산 등으로 처리하는 SQL 함수입니다. 가격 계산, 점수 계산, 통계 전처리에 사용합니다.',
    hint: '숫자계산',
    easy: '숫자를 계산하는 함수',
    analogy: '계산기에서 반올림 버튼이나 절댓값 버튼을 누르는 것과 같습니다. 수학 함수는 숫자를 원하는 형태로 계산합니다.',
    example: sql([
      'WITH numbers(value) AS (',
      '  SELECT -3.14159',
      ')',
      'SELECT abs(value) AS positive, round(abs(value), 2) AS rounded FROM numbers;'
    ]),
    tip: '금액 계산은 부동소수점보다 정수 단위나 DECIMAL 타입을 쓰는 것이 안전합니다. 반올림 위치도 명확히 정하세요.'
  },
  {
    term: 'INSERT INTO',
    definition: '테이블에 새 행을 추가하는 SQL 문입니다. 회원 가입, 주문 생성처럼 새로운 데이터를 저장할 때 사용합니다.',
    hint: '행추가',
    easy: '새 줄 넣기',
    analogy: '명부에 새 회원 정보를 한 줄 추가하는 것과 같습니다. INSERT INTO는 테이블에 새로운 레코드를 넣습니다.',
    example: sql(['CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);', "INSERT INTO users (id, name) VALUES (1, 'Ada');", 'SELECT * FROM users;']),
    tip: '컬럼 목록을 명시하면 테이블 구조가 바뀌어도 실수를 줄일 수 있습니다. 대량 입력은 배치 INSERT를 고려하세요.'
  },
  {
    term: 'UPDATE SET',
    definition: '테이블에 이미 있는 행의 값을 수정하는 SQL 문입니다. WHERE 조건으로 어떤 행을 바꿀지 제한하고 SET으로 새 값을 지정합니다.',
    hint: '행수정',
    easy: '기존 값을 고치기',
    analogy: '주소록에서 이사한 친구의 주소만 새 주소로 고치는 것과 같습니다. UPDATE SET은 기존 행의 특정 칸을 바꿉니다.',
    example: sql(['CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);', "INSERT INTO users VALUES (1, 'Ada');", "UPDATE users SET name = 'Ada Lovelace' WHERE id = 1;", 'SELECT * FROM users;']),
    tip: 'UPDATE 전에는 같은 WHERE로 SELECT를 실행해 대상 행을 확인하세요. 조건 누락은 대량 데이터 손상으로 이어질 수 있습니다.'
  },
  {
    term: 'DELETE FROM',
    definition: '테이블에서 조건에 맞는 행을 삭제하는 SQL 문입니다. WHERE가 없으면 테이블의 모든 행을 삭제할 수 있습니다.',
    hint: '행삭제',
    easy: '조건에 맞는 줄 지우기',
    analogy: '명부에서 탈퇴한 회원의 줄을 지우는 것과 같습니다. DELETE FROM은 테이블의 행을 제거합니다.',
    example: sql(['CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);', "INSERT INTO users VALUES (1, 'Ada'), (2, 'Bob');", 'DELETE FROM users WHERE id = 2;', 'SELECT * FROM users;']),
    tip: '운영 데이터 삭제는 트랜잭션과 백업 확인 후 진행하세요. 감사가 필요한 데이터는 소프트 삭제가 더 적합할 수 있습니다.'
  },
  {
    term: 'TRUNCATE',
    definition: '테이블 구조는 남기고 모든 행을 빠르게 제거하는 DDL 성격의 명령입니다. DBMS에 따라 롤백 가능 여부와 트리거 동작이 DELETE와 다릅니다.',
    hint: '전체비우기',
    easy: '표 내용만 한 번에 비우기',
    analogy: '서랍 자체는 두고 안에 든 종이만 한꺼번에 비우는 것과 같습니다. TRUNCATE는 테이블 껍데기는 남기고 데이터를 제거합니다.',
    example: sql(['-- SQLite에는 TRUNCATE가 없어 DELETE로 같은 결과를 보입니다.', 'CREATE TABLE logs (id INTEGER);', 'INSERT INTO logs VALUES (1), (2);', 'DELETE FROM logs;', 'SELECT COUNT(*) FROM logs;']),
    tip: 'TRUNCATE는 빠르지만 영향이 큽니다. 외래 키, 권한, 롤백 가능 여부를 DBMS별로 확인하세요.'
  },
  {
    term: 'CREATE TABLE',
    definition: '새 테이블의 이름, 열, 데이터 타입, 제약조건을 정의해 생성하는 SQL 문입니다. 데이터 저장 구조를 처음 만들 때 사용합니다.',
    hint: '표생성',
    easy: '새 표 만들기',
    analogy: '새 장부를 만들면서 칸 이름과 작성 규칙을 정하는 것과 같습니다. CREATE TABLE은 데이터가 들어갈 표의 틀을 만듭니다.',
    example: sql(['CREATE TABLE tasks (', '  id INTEGER PRIMARY KEY,', '  title TEXT NOT NULL,', '  done INTEGER DEFAULT 0', ');', 'SELECT name FROM sqlite_master WHERE type = "table" AND name = "tasks";']),
    tip: '테이블 생성 시 기본 키, NOT NULL, 기본값을 함께 설계하세요. 나중에 대규모 테이블을 바꾸는 비용이 더 큽니다.'
  },
  {
    term: 'ALTER TABLE',
    definition: '기존 테이블의 구조를 변경하는 SQL 문입니다. 열 추가, 이름 변경, 제약조건 변경 같은 스키마 변경에 사용합니다.',
    hint: '표변경',
    easy: '이미 만든 표의 구조 바꾸기',
    analogy: '사용 중인 신청서 양식에 새 항목을 추가하는 것과 같습니다. ALTER TABLE은 이미 운영 중인 테이블의 틀을 바꿉니다.',
    example: sql(['CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);', 'ALTER TABLE users ADD COLUMN email TEXT;', "INSERT INTO users VALUES (1, 'Ada', 'a@example.com');", 'SELECT * FROM users;']),
    tip: '큰 테이블의 ALTER는 잠금이나 긴 마이그레이션을 만들 수 있습니다. 무중단 배포가 필요하면 단계적 변경을 설계하세요.'
  },
  {
    term: 'DROP TABLE',
    definition: '테이블 구조와 그 안의 데이터를 모두 삭제하는 SQL 문입니다. 실행하면 일반적으로 테이블 자체가 사라집니다.',
    hint: '표제거',
    easy: '표 자체를 없애기',
    analogy: '내용을 비우는 것이 아니라 장부 자체를 폐기하는 것과 같습니다. DROP TABLE은 테이블이라는 보관함을 통째로 없앱니다.',
    example: sql(['CREATE TABLE temp_data (id INTEGER);', 'DROP TABLE temp_data;', 'SELECT "dropped" AS status;']),
    tip: 'DROP TABLE은 복구가 어렵습니다. 운영 환경에서는 권한 제한과 백업 확인, 명확한 변경 절차가 필요합니다.'
  },
  {
    term: 'CREATE INDEX',
    definition: '특정 테이블 열에 인덱스를 만들어 조회 성능을 높이는 SQL 문입니다. WHERE나 JOIN에 자주 쓰는 열에 적용합니다.',
    hint: '인덱스생성',
    easy: '빠른 검색용 색인 만들기',
    analogy: '책을 출판한 뒤 뒤쪽에 찾아보기 페이지를 추가하는 것과 같습니다. CREATE INDEX는 데이터베이스가 빨리 찾을 수 있는 색인을 만듭니다.',
    example: sql(['CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT);', 'CREATE INDEX idx_users_email ON users(email);', "EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'a@example.com';"]),
    tip: '인덱스 이름에는 테이블과 열 이름을 담아 관리하기 쉽게 하세요. 생성 후 실제 쿼리가 인덱스를 쓰는지도 확인해야 합니다.'
  },
  {
    term: 'EXPLAIN 분석',
    definition: 'EXPLAIN 또는 유사 명령으로 쿼리 실행 계획을 읽고 병목 원인을 파악하는 작업입니다. 인덱스 사용 여부, 조인 순서, 스캔 방식을 확인합니다.',
    hint: '계획읽기',
    easy: 'DB가 어떻게 찾는지 보기',
    analogy: '배송이 늦을 때 택배 이동 경로를 추적해 어디서 막혔는지 보는 것과 같습니다. EXPLAIN 분석은 쿼리가 느린 지점을 찾는 추적 작업입니다.',
    example: sql(['CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER);', 'CREATE INDEX idx_orders_user_id ON orders(user_id);', 'EXPLAIN QUERY PLAN SELECT * FROM orders WHERE user_id = 1;']),
    tip: '실행 계획은 추정치일 수 있습니다. 실제 실행 시간, 읽은 행 수, 통계 최신 여부를 함께 보세요.'
  },
  {
    term: '쿼리 최적화',
    definition: '같은 결과를 더 적은 시간과 자원으로 얻도록 SQL, 인덱스, 스키마, 통계를 조정하는 작업입니다. 느린 화면이나 배치 작업을 개선할 때 필요합니다.',
    hint: '쿼리개선',
    easy: '같은 결과를 더 빠르게 만들기',
    analogy: '목적지는 같지만 막히는 길을 피해 더 빠른 길로 가는 것과 같습니다. 쿼리 최적화는 데이터베이스가 덜 헤매고 결과를 찾게 합니다.',
    example: sql(['CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, created_at TEXT);', 'CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);', "SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;"]),
    tip: '최적화는 측정 없이 시작하지 마세요. 느린 쿼리 로그와 EXPLAIN으로 병목을 확인한 뒤 바꾸는 것이 안전합니다.'
  },
  {
    term: '인덱스 힌트',
    definition: 'DB 옵티마이저가 특정 인덱스를 사용하거나 피하도록 개발자가 명시적으로 알려 주는 기능입니다. DBMS별 문법이 다르고 SQLite에는 일반적인 힌트 문법이 없습니다.',
    hint: '인덱스지시',
    easy: '어떤 인덱스를 쓸지 알려주기',
    analogy: '내비게이션이 자동 경로를 고르지만 운전자가 “고속도로로 가자”고 지정하는 것과 같습니다. 인덱스 힌트는 옵티마이저 선택에 개입합니다.',
    example: sql(['-- MySQL 예시 문법:', '-- SELECT * FROM orders FORCE INDEX (idx_orders_user_id) WHERE user_id = 1;', 'print("인덱스 힌트는 DBMS별 문법을 확인해야 합니다.")']),
    tip: '힌트는 통계 변화나 데이터 증가 후 오히려 성능을 망칠 수 있습니다. 임시 처방으로 쓰고 근본 원인을 함께 해결하세요.'
  },
  {
    term: '임시 테이블',
    definition: '세션이나 트랜잭션 동안만 사용할 중간 데이터를 저장하는 테이블입니다. 복잡한 계산을 단계별로 나누거나 반복 참조할 결과를 잠시 보관할 때 사용합니다.',
    hint: '임시저장',
    easy: '잠깐 쓰는 표',
    analogy: '요리 중 재료를 잠시 담아 두는 보조 그릇과 같습니다. 임시 테이블은 최종 결과를 만들기 전 중간 데이터를 담습니다.',
    example: sql(['CREATE TEMP TABLE temp_scores (name TEXT, score INTEGER);', "INSERT INTO temp_scores VALUES ('Ada', 90), ('Bob', 80);", 'SELECT AVG(score) FROM temp_scores;']),
    tip: '임시 테이블도 너무 커지면 디스크와 잠금 비용이 생깁니다. 생명주기와 인덱스 필요 여부를 확인하세요.'
  },
  {
    term: '뷰 생성',
    definition: 'CREATE VIEW 문으로 저장된 조회를 만드는 작업입니다. 복잡한 SELECT에 이름을 붙여 재사용하거나 사용자에게 제한된 열만 보여 줄 때 사용합니다.',
    hint: '뷰만들기',
    easy: '조회 결과에 이름 붙이기',
    analogy: '원본 장부에서 필요한 칸만 보이는 맞춤 보고서를 만들어 두는 것과 같습니다. 뷰 생성은 그런 보고서 화면을 DB에 등록합니다.',
    example: sql(['CREATE TABLE orders (id INTEGER, amount INTEGER);', 'INSERT INTO orders VALUES (1, 1000), (2, 3000);', 'CREATE VIEW big_orders AS SELECT * FROM orders WHERE amount >= 2000;', 'SELECT * FROM big_orders;']),
    tip: '뷰는 권한과 가독성에 좋지만 복잡한 뷰 위에 또 뷰를 쌓으면 성능 분석이 어려워질 수 있습니다.'
  },
  {
    term: '저장 함수',
    definition: '데이터베이스 안에 저장해 두고 SQL 문에서 값처럼 호출할 수 있는 함수입니다. 계산 규칙이나 변환 로직을 DB 내부에서 재사용할 때 사용합니다.',
    hint: 'DB함수',
    easy: 'DB 안에 저장한 계산 함수',
    analogy: '계산대에 할인 계산 버튼이 있어 직원이 매번 공식을 외우지 않아도 되는 것과 같습니다. 저장 함수는 DB 안에 공식을 이름으로 저장합니다.',
    example: py(['# SQLite 저장 함수 등록 예시', 'import sqlite3', 'conn = sqlite3.connect(":memory:")', 'conn.create_function("double", 1, lambda x: x * 2)', 'print(conn.execute("SELECT double(21)").fetchone()[0])']),
    tip: '저장 함수는 쿼리 가독성을 높일 수 있지만 인덱스 사용과 이식성에 영향을 줄 수 있습니다. 성능이 중요한 WHERE 절에서는 조심하세요.'
  },
  {
    term: '커서(Cursor)',
    definition: '쿼리 결과 집합을 한 번에 모두 처리하지 않고 현재 위치를 유지하며 행 단위로 읽어 가는 객체나 기능입니다. 대량 결과를 순차 처리할 때 사용합니다.',
    hint: '결과포인터',
    easy: '결과를 한 줄씩 읽는 손가락',
    analogy: '책갈피를 꽂아 두고 책을 한 줄씩 읽어 내려가는 것과 같습니다. 커서는 결과 집합 안에서 현재 읽는 위치를 기억합니다.',
    example: py(['import sqlite3', 'conn = sqlite3.connect(":memory:")', 'conn.execute("CREATE TABLE t (id INTEGER)")', 'conn.executemany("INSERT INTO t VALUES (?)", [(1,), (2,)])', 'cursor = conn.execute("SELECT id FROM t ORDER BY id")', 'for row in cursor:', '    print(row[0])']),
    tip: '커서는 편하지만 행별 반복 처리는 느릴 수 있습니다. 가능하면 집합 기반 SQL로 처리하고, 필요한 경우에만 커서를 쓰세요.'
  },
  {
    term: '트랜잭션 격리',
    definition: '동시에 실행되는 트랜잭션이 서로의 중간 변경을 어떻게 보거나 숨길지 제어하는 개념입니다. 더티 읽기, 반복 불가 읽기, 팬텀 읽기 같은 현상을 다룹니다.',
    hint: '동시성격리',
    easy: '동시에 바꿀 때 서로 얼마나 보일지 정하기',
    analogy: '여러 사람이 같은 문서를 고칠 때 초안까지 서로 볼지, 저장된 버전만 볼지 정하는 것과 같습니다. 트랜잭션 격리는 중간 상태 노출 범위를 정합니다.',
    example: sql(['-- PostgreSQL 예시 문법입니다.', '-- BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;', '-- SELECT * FROM accounts WHERE id = 1;', '-- COMMIT;', 'print("격리 수준은 DBMS마다 설정 문법이 다릅니다.")']),
    tip: '격리를 강하게 하면 정확성은 높아지지만 충돌과 대기가 늘 수 있습니다. 업무 요구에 맞는 최소 수준을 선택하세요.'
  },
  {
    term: 'SELECT FOR UPDATE',
    definition: '조회한 행을 이후 수정할 의도로 잠가 다른 트랜잭션의 동시 수정을 막는 SQL 구문입니다. 재고 차감이나 계좌 잔액 변경처럼 경쟁 조건을 막을 때 사용합니다.',
    hint: '수정잠금',
    easy: '읽으면서 고칠 행을 잠그기',
    analogy: '상품을 계산대에 가져가면 다른 손님이 그 상품을 집어 갈 수 없게 잡아 두는 것과 같습니다. SELECT FOR UPDATE는 읽은 행을 수정 전까지 예약합니다.',
    example: sql(['-- PostgreSQL/MySQL 예시 문법입니다.', '-- BEGIN;', '-- SELECT stock FROM inventory WHERE id = 1 FOR UPDATE;', '-- UPDATE inventory SET stock = stock - 1 WHERE id = 1;', '-- COMMIT;', 'print("SQLite에는 동일 문법이 없어 트랜잭션 잠금 방식이 다릅니다.")']),
    tip: 'SELECT FOR UPDATE는 트랜잭션 안에서 의미가 있습니다. 잠금 범위를 작게 하고 빠르게 커밋하세요.'
  },
  {
    term: '락 타임아웃',
    definition: '잠금을 얻기 위해 기다릴 수 있는 최대 시간을 정한 설정 또는 그 시간이 초과된 상태입니다. 오래 대기하는 쿼리를 실패시켜 장애 전파를 줄입니다.',
    hint: '잠금대기제한',
    easy: '잠금을 기다리는 시간 제한',
    analogy: '식당 대기표를 받고 30분 넘게 자리가 안 나면 다른 식당으로 가는 것과 같습니다. 락 타임아웃은 잠금 대기를 무한정 하지 않게 막습니다.',
    example: py(['import sqlite3', 'conn = sqlite3.connect(":memory:", timeout=1.0)', 'conn.execute("CREATE TABLE t (id INTEGER)")', 'print("SQLite 연결의 잠금 대기 timeout은 1초입니다.")']),
    tip: '타임아웃은 실패를 숨기지 않습니다. 애플리케이션에서 재시도 가능 여부와 사용자 안내를 함께 설계하세요.'
  },
  {
    term: '쿼리 캐시',
    definition: '같은 쿼리나 같은 결과를 다시 계산하지 않도록 저장해 두는 캐시입니다. DB 내부 기능일 수도 있고 애플리케이션이나 Redis 같은 외부 캐시일 수도 있습니다.',
    hint: '결과캐시',
    easy: '쿼리 결과를 잠깐 저장',
    analogy: '자주 묻는 질문 답변을 미리 적어 두면 매번 담당자에게 물어보지 않아도 됩니다. 쿼리 캐시는 반복 조회 결과를 재사용합니다.',
    example: py(['cache = {}', 'def run_query(sql):', '    if sql not in cache:', '        cache[sql] = ["Ada"]  # DB 결과라고 가정', '    return cache[sql]', 'print(run_query("SELECT name FROM users"))']),
    tip: '캐시는 무효화가 핵심입니다. 원본 데이터가 바뀌었는데 캐시가 남으면 오래된 결과를 보여 줄 수 있습니다.'
  },
  {
    term: '페이지네이션 최적화',
    definition: '목록을 페이지 단위로 조회할 때 큰 OFFSET 비용이나 불안정한 정렬 문제를 줄이는 최적화입니다. 보통 마지막으로 본 키를 기준으로 다음 페이지를 가져오는 키셋 방식이 쓰입니다.',
    hint: '목록최적화',
    easy: '긴 목록을 빠르게 나눠 보기',
    analogy: '책갈피를 꽂아 둔 다음 그 위치부터 이어 읽으면 처음부터 페이지를 세지 않아도 됩니다. 키셋 페이지네이션은 마지막 위치를 기억해 다음 구간을 찾습니다.',
    example: sql(['CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT);', "INSERT INTO posts VALUES (1, 'a'), (2, 'b'), (3, 'c');", '-- 마지막으로 본 id가 1일 때 다음 페이지', 'SELECT * FROM posts WHERE id > 1 ORDER BY id LIMIT 2;']),
    tip: '정렬 기준은 고유하고 안정적이어야 합니다. created_at만으로 부족하면 id를 보조 정렬로 함께 쓰세요.'
  },
  {
    term: '배치 INSERT',
    definition: '여러 행을 한 번의 INSERT 문이나 한 트랜잭션 안에서 묶어 입력하는 방식입니다. 네트워크 왕복과 커밋 비용을 줄여 대량 입력 성능을 높입니다.',
    hint: '묶음입력',
    easy: '여러 줄을 한 번에 넣기',
    analogy: '택배를 한 상자씩 보내는 대신 큰 박스에 묶어 보내면 접수 시간이 줄어듭니다. 배치 INSERT는 여러 행을 묶어 DB에 넣습니다.',
    example: sql(['CREATE TABLE logs (id INTEGER, message TEXT);', "INSERT INTO logs VALUES (1, 'a'), (2, 'b'), (3, 'c');", 'SELECT COUNT(*) FROM logs;']),
    tip: '배치 크기는 너무 작아도, 너무 커도 문제입니다. DB 로그, 잠금, 메모리 사용량을 보며 적절한 크기를 찾으세요.'
  },
  {
    term: 'UPSERT(INSERT ON DUPLICATE)',
    definition: '새 행을 삽입하되 고유 키 충돌이 나면 기존 행을 갱신하는 동작입니다. 설정값 저장이나 사용자별 카운터 갱신에 사용합니다.',
    hint: '삽입또는수정',
    easy: '없으면 넣고 있으면 고치기',
    analogy: '주소록에 새 사람이면 추가하고 이미 있는 사람이면 전화번호만 고치는 것과 같습니다. UPSERT는 삽입과 수정을 한 동작으로 처리합니다.',
    example: sql(['CREATE TABLE counters (name TEXT PRIMARY KEY, value INTEGER);', "INSERT INTO counters VALUES ('login', 1);", "INSERT INTO counters(name, value) VALUES ('login', 2) ON CONFLICT(name) DO UPDATE SET value = excluded.value;", 'SELECT * FROM counters;']),
    tip: 'UPSERT는 충돌 기준이 되는 유니크 키가 필요합니다. 어떤 값이 같은 대상을 뜻하는지 먼저 명확히 하세요.'
  },
  {
    term: '집계 함수(MIN/MAX)',
    definition: 'MIN은 그룹 안의 가장 작은 값을, MAX는 가장 큰 값을 반환하는 SQL 집계 함수입니다. 최저가, 최고 점수, 최초 날짜, 최근 날짜를 찾을 때 사용합니다.',
    hint: '최소최대',
    easy: '가장 작은 값과 큰 값 찾기',
    analogy: '반에서 가장 작은 키와 가장 큰 키를 찾는 것과 같습니다. MIN/MAX는 숫자나 날짜 같은 값의 양끝을 찾아 줍니다.',
    example: sql(['CREATE TABLE scores (score INTEGER);', 'INSERT INTO scores VALUES (70), (90), (80);', 'SELECT MIN(score) AS lowest, MAX(score) AS highest FROM scores;']),
    tip: '최신 행 전체가 필요할 때 MAX(date)만 구하면 다른 컬럼과 안 맞을 수 있습니다. 윈도우 함수나 정렬 LIMIT을 함께 고려하세요.'
  },
  {
    term: 'WITH RECURSIVE(재귀 CTE)',
    definition: 'CTE가 자기 자신을 참조해 계층 구조나 반복 계산을 처리할 수 있게 하는 SQL 문법입니다. 조직도, 카테고리 트리, 숫자 시퀀스 생성에 사용합니다.',
    hint: '재귀쿼리',
    easy: '자기 자신을 반복해서 부르는 쿼리',
    analogy: '조직도에서 사장부터 시작해 부하 직원을 따라 계속 내려가는 것과 같습니다. 재귀 CTE는 이전 결과를 바탕으로 다음 단계 결과를 반복해 만듭니다.',
    example: sql(['WITH RECURSIVE nums(n) AS (', '  SELECT 1', '  UNION ALL', '  SELECT n + 1 FROM nums WHERE n < 5', ')', 'SELECT n FROM nums;']),
    tip: '재귀 CTE에는 종료 조건이 반드시 필요합니다. 계층 데이터에서는 순환 참조가 없는지도 확인하세요.'
  },
  {
    term: 'NTILE()',
    definition: '정렬된 결과를 지정한 개수의 그룹으로 최대한 균등하게 나누고 각 행에 그룹 번호를 붙이는 윈도우 함수입니다. 사분위, 분위 분석에 사용합니다.',
    hint: '분위나누기',
    easy: '순서대로 몇 묶음으로 나누기',
    analogy: '성적순으로 줄을 세운 뒤 네 조로 최대한 비슷하게 나누는 것과 같습니다. NTILE은 정렬된 데이터를 균등한 구간으로 나눕니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('A', 100), ('B', 90), ('C', 80), ('D', 70);", 'SELECT name, NTILE(2) OVER (ORDER BY score DESC) AS bucket FROM scores;']),
    tip: 'NTILE은 값의 범위가 아니라 행 개수를 기준으로 나눕니다. 같은 점수의 행이 다른 버킷에 들어갈 수 있습니다.'
  },
  {
    term: 'PERCENT_RANK()',
    definition: '현재 행의 상대적 순위를 0부터 1 사이 값으로 반환하는 윈도우 함수입니다. 전체 순위에서 어느 정도 위치인지 비율로 보고 싶을 때 사용합니다.',
    hint: '상대순위',
    easy: '몇 퍼센트 위치인지 보기',
    analogy: '달리기 순위를 단순 등수가 아니라 전체 중 상위 몇 퍼센트 위치인지 표시하는 것과 같습니다. PERCENT_RANK는 순위를 비율로 바꿉니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('A', 100), ('B', 90), ('C', 80);", 'SELECT name, PERCENT_RANK() OVER (ORDER BY score DESC) AS pct_rank FROM scores;']),
    tip: 'PERCENT_RANK는 첫 행이 0입니다. 백분위 의미가 필요한지, 누적 분포가 필요한지에 따라 CUME_DIST와 구분하세요.'
  },
  {
    term: 'CUME_DIST()',
    definition: '현재 행의 값 이하 또는 이상에 해당하는 행의 누적 비율을 반환하는 윈도우 함수입니다. 특정 점수 이하가 전체의 몇 퍼센트인지 볼 때 사용합니다.',
    hint: '누적분포',
    easy: '여기까지 몇 퍼센트인지 보기',
    analogy: '시험 점수표에서 내 점수 이상인 학생이 전체의 몇 퍼센트인지 보는 것과 같습니다. CUME_DIST는 현재 위치까지의 누적 비율을 계산합니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('A', 100), ('B', 90), ('C', 80);", 'SELECT name, CUME_DIST() OVER (ORDER BY score DESC) AS dist FROM scores;']),
    tip: '동점 값은 같은 누적 분포를 가질 수 있습니다. 순위 함수들과 결과 의미를 비교해 보고 선택하세요.'
  },
  {
    term: 'FIRST_VALUE()/LAST_VALUE()',
    definition: '윈도우 범위 안에서 첫 번째 값 또는 마지막 값을 가져오는 함수입니다. 그룹별 최고 점수나 기간 내 마지막 상태를 각 행에 붙일 때 사용합니다.',
    hint: '처음끝값',
    easy: '범위의 첫 값과 끝 값 가져오기',
    analogy: '줄 선 사람들 중 맨 앞 사람과 맨 뒤 사람의 이름을 각 명단 옆에 적는 것과 같습니다. FIRST_VALUE와 LAST_VALUE는 창 안의 양끝 값을 가져옵니다.',
    example: sql(['CREATE TABLE scores (name TEXT, score INTEGER);', "INSERT INTO scores VALUES ('A', 100), ('B', 90), ('C', 80);", 'SELECT name, FIRST_VALUE(name) OVER (ORDER BY score DESC) AS top_name FROM scores;']),
    tip: 'LAST_VALUE는 기본 윈도우 프레임 때문에 기대와 다를 수 있습니다. 필요하면 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING을 명시하세요.'
  },
  {
    term: 'PIVOT(행-열 전환)',
    definition: '행으로 나열된 값을 열 형태로 바꾸어 교차표처럼 보여 주는 변환입니다. 월별 매출을 지역별 열로 펼치는 보고서에 사용합니다.',
    hint: '행열전환',
    easy: '세로 목록을 가로 표로 바꾸기',
    analogy: '학생별 과목 점수가 세로로 적힌 명단을 과목별 칸이 있는 성적표로 다시 만드는 것과 같습니다. PIVOT은 보고서에 맞게 행과 열 방향을 바꿉니다.',
    example: sql(['CREATE TABLE sales (region TEXT, month TEXT, amount INTEGER);', "INSERT INTO sales VALUES ('KR', 'May', 100), ('US', 'May', 50);", "SELECT month, SUM(CASE WHEN region = 'KR' THEN amount ELSE 0 END) AS kr, SUM(CASE WHEN region = 'US' THEN amount ELSE 0 END) AS us FROM sales GROUP BY month;"]),
    tip: 'DBMS별 PIVOT 문법이 다릅니다. 이식성이 필요하면 CASE WHEN 집계로 명시적으로 작성하는 방식도 좋습니다.'
  }
];

const expectedTerms = [
  'SELECT 문', 'WHERE 절', 'AND/OR 조건', 'LIKE 연산자', 'IN 연산자', 'BETWEEN 연산자', 'IS NULL', 'ORDER BY', 'LIMIT/OFFSET', 'GROUP BY',
  'HAVING', '집계 함수(COUNT)', '집계 함수(SUM/AVG)', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', '셀프 조인', '서브쿼리',
  '상관 서브쿼리', 'EXISTS', 'NOT EXISTS', 'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'WITH(CTE)', '윈도우 함수', 'ROW_NUMBER()',
  'RANK()', 'DENSE_RANK()', 'LEAD/LAG', 'PARTITION BY', '조건 표현식(CASE WHEN)', 'COALESCE', 'NULLIF', 'CAST/CONVERT', '날짜 함수', '문자열 함수',
  '수학 함수', 'INSERT INTO', 'UPDATE SET', 'DELETE FROM', 'TRUNCATE', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'CREATE INDEX', 'EXPLAIN 분석',
  '쿼리 최적화', '인덱스 힌트', '임시 테이블', '뷰 생성', '저장 함수', '커서(Cursor)', '트랜잭션 격리', 'SELECT FOR UPDATE', '락 타임아웃', '쿼리 캐시',
  '페이지네이션 최적화', '배치 INSERT', 'UPSERT(INSERT ON DUPLICATE)', '집계 함수(MIN/MAX)', 'WITH RECURSIVE(재귀 CTE)', 'NTILE()', 'PERCENT_RANK()', 'CUME_DIST()', 'FIRST_VALUE()/LAST_VALUE()', 'PIVOT(행-열 전환)'
];

if (entries.length !== expectedTerms.length) {
  throw new Error(`week7 entry count mismatch: ${entries.length}`);
}

entries.forEach((entry, index) => {
  if (entry.term !== expectedTerms[index]) {
    throw new Error(`term mismatch at ${index}: expected ${expectedTerms[index]}, got ${entry.term}`);
  }
});

const output = entries.map((entry, index) => ({
  id: String(421 + index),
  term: entry.term,
  category: 'SQL 심화',
  difficulty: index < 35 ? 'easy' : index < 63 ? 'medium' : 'hard',
  phase: 2,
  week: 7,
  definition: entry.definition,
  hint: entry.hint,
  detail: {
    easy: entry.easy,
    analogy: entry.analogy,
    example: entry.example,
    tip: entry.tip
  }
}));

fs.writeFileSync(path.join(DATA_DIR, 'terms.week7.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log('wrote data/terms.week7.json');

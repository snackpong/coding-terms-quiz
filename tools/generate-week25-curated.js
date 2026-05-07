'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const plan = require('./term-bank-plan.json').filter((item) => item.week === 25);

function example(term, lines) {
  return [`# ${term} 예시: Python 3에서 실행 가능한 코드`, ...lines].join('\n');
}

const rows = [
  ['마이크로서비스 정의', '마이크로서비스는 큰 애플리케이션을 작은 독립 서비스로 나누고 각 서비스가 명확한 책임과 배포 단위를 갖게 하는 아키텍처입니다. 팀 자율성, 장애 격리, 빠른 변경을 얻는 대신 분산 시스템 복잡도를 관리해야 합니다.', '대형 백화점을 하나의 거대한 계산대가 아니라 식품, 의류, 가전 매장이 각자 재고와 직원을 책임지는 구조로 나누는 것과 같습니다.', ['services = {"catalog": "상품", "order": "주문"}', 'for name, role in services.items():', '    print(f"{name} 서비스는 {role} 책임을 가집니다")']],
  ['서비스 경계 설계', '서비스 경계 설계는 어떤 기능과 데이터를 같은 서비스 안에 묶고 어디서 분리할지 결정하는 작업입니다. 응집도는 높이고 서비스 간 결합과 왕복 호출은 줄이는 것이 핵심입니다.', '아파트 평면을 그릴 때 주방, 욕실, 침실의 벽을 어디에 세울지 정해 생활 동선과 독립성을 맞추는 일과 비슷합니다.', ['orders = {"id": 1, "payment": "paid"}', 'boundary = "order" if "payment" in orders else "catalog"', 'print(boundary)']],
  ['도메인 분해 전략', '도메인 분해 전략은 비즈니스 능력, 하위 도메인, 변경 빈도, 조직 구조를 기준으로 시스템을 서비스 후보로 나누는 방법입니다. 기술 계층보다 업무 의미를 먼저 기준으로 삼습니다.', '도서관을 책 크기가 아니라 문학, 과학, 어린이 자료처럼 찾는 목적에 맞춰 서가로 나누는 방식과 같습니다.', ['domains = ["billing", "shipping", "support"]', 'print([d.upper() for d in domains])']],
  ['트랜잭션 분해', '트랜잭션 분해는 하나의 ACID 트랜잭션으로 처리하던 일을 여러 서비스의 지역 트랜잭션과 메시지 흐름으로 나누는 설계입니다. 일관성 모델, 보상 동작, 실패 재시도가 함께 정해져야 합니다.', '한 식당 주문을 주방, 음료 바, 계산대가 각자 처리하되 주문표와 취소 규칙으로 전체 흐름을 맞추는 것과 같습니다.', ['steps = ["reserve_stock", "charge_card", "ship"]', 'completed = []', 'for step in steps:', '    completed.append(step)', 'print(completed)']],
  ['데이터 소유권', '데이터 소유권은 특정 데이터의 변경 권한과 진실의 원천을 한 서비스가 책임지도록 정하는 원칙입니다. 다른 서비스는 직접 테이블을 수정하지 않고 API나 이벤트를 통해 접근합니다.', '주민등록 원본은 동사무소가 관리하고 다른 기관은 복사본이나 조회 결과를 받아 쓰는 구조와 같습니다.', ['owners = {"customer": "profile-service", "invoice": "billing-service"}', 'print(owners["invoice"])']],
  ['서비스 간 통신(동기)', '서비스 간 동기 통신은 호출자가 HTTP나 gRPC 응답을 기다리며 다음 단계를 진행하는 방식입니다. 즉시 결과가 필요한 조회나 검증에 적합하지만 지연과 장애 전파에 주의해야 합니다.', '전화로 상대 부서에 바로 확인하고 답을 들은 뒤 서류를 넘기는 업무 방식과 같습니다.', ['def call_inventory(sku):', '    # 재고 서비스가 즉시 응답한다고 가정합니다.', '    return {"sku": sku, "stock": 3}', 'print(call_inventory("A-1")["stock"])']],
  ['서비스 간 통신(비동기)', '서비스 간 비동기 통신은 메시지나 이벤트를 발행하고 수신자가 나중에 처리하는 방식입니다. 송신자와 수신자의 시간을 분리해 탄력성을 높이지만 순서와 중복 처리를 고려해야 합니다.', '민원함에 신청서를 넣어 두면 담당자가 순서대로 꺼내 처리하고 결과를 따로 알려주는 방식과 같습니다.', ['queue = []', 'queue.append({"event": "OrderCreated", "id": 7})', 'print(queue.pop(0)["event"])']],
  ['API 컴포지션', 'API 컴포지션은 여러 서비스의 응답을 조합해 클라이언트가 원하는 하나의 결과를 만드는 패턴입니다. 주로 API 게이트웨이나 조합 서비스에서 화면용 데이터를 모을 때 사용합니다.', '여행사가 항공권, 호텔, 렌터카 정보를 따로 확인한 뒤 고객에게 하나의 일정표로 묶어 주는 것과 같습니다.', ['user = {"name": "Kim"}', 'orders = [{"total": 30000}]', 'print({"user": user["name"], "orders": len(orders)})']],
  ['서비스 레지스트리', '서비스 레지스트리는 실행 중인 서비스 인스턴스의 위치와 상태를 기록하는 저장소입니다. 동적으로 늘고 줄어드는 인스턴스를 찾기 위한 기반이 됩니다.', '택배 기사들이 오늘 문을 연 지점 주소를 계속 갱신해 두는 배달 가능 지점 목록과 같습니다.', ['registry = {"payment": ["10.0.0.3", "10.0.0.4"]}', 'print(registry["payment"][0])']],
  ['서비스 디스커버리(클라이언트/서버)', '서비스 디스커버리는 호출자가 필요한 서비스 인스턴스를 찾아 연결하는 과정입니다. 클라이언트가 레지스트리를 직접 보거나 서버 측 로드 밸런서가 대신 찾는 방식이 있습니다.', '손님이 직접 영업 중인 매장을 검색해 찾아가거나 안내 데스크가 열린 창구로 보내 주는 두 방식과 같습니다.', ['registry = {"search": ["host1", "host2"]}', 'mode = "client-side"', 'target = registry["search"][0] if mode.startswith("client") else "load-balancer"', 'print(target)']],
  ['로드 밸런싱 전략', '로드 밸런싱 전략은 여러 인스턴스에 요청을 어떻게 나눌지 정하는 방법입니다. 라운드 로빈, 최소 연결, 가중치, 지연 기반 분산처럼 목적에 따라 선택합니다.', '콜센터가 상담원에게 전화를 순서대로 돌리거나 가장 한가한 상담원에게 먼저 연결하는 운영 규칙과 같습니다.', ['servers = ["a", "b", "c"]', 'for i in range(5):', '    print(servers[i % len(servers)])']],
  ['트래픽 쉐이핑', '트래픽 쉐이핑은 요청 흐름을 의도적으로 조절해 일부 버전, 지역, 사용자 그룹으로 보내는 기술입니다. 카나리 배포, A/B 테스트, 장애 우회에 활용됩니다.', '도로 공사 중 차선을 일부 막고 차량을 우회로와 본선으로 비율에 맞춰 나누는 교통 통제와 같습니다.', ['request_id = 42', 'target = "canary" if request_id % 10 == 0 else "stable"', 'print(target)']],
  ['폴리글랏 퍼시스턴스', '폴리글랏 퍼시스턴스는 서비스별 데이터 성격에 맞춰 서로 다른 저장소를 선택하는 접근입니다. 주문은 관계형 DB, 검색은 검색 엔진, 세션은 키-값 저장소처럼 나눌 수 있습니다.', '요리 재료를 모두 같은 냉장고 칸에 넣지 않고 냉동실, 양념장, 와인 셀러에 맞게 보관하는 것과 같습니다.', ['stores = {"order": "postgres", "search": "opensearch", "cache": "redis"}', 'print(stores["search"])']],
  ['폴리글랏 프로그래밍', '폴리글랏 프로그래밍은 서비스의 요구에 맞춰 여러 프로그래밍 언어와 런타임을 조합하는 방식입니다. 팀 역량과 운영 표준을 함께 고려하지 않으면 유지보수 비용이 커집니다.', '병원에서 외과, 영상의학과, 약국이 각자 전문 도구를 쓰되 환자 기록 양식은 맞추는 것과 같습니다.', ['languages = {"api": "TypeScript", "ml": "Python", "stream": "Java"}', 'print(sorted(languages.values()))']],
  ['서비스 계약(Contract)', '서비스 계약은 API 요청, 응답, 오류, 이벤트 형식처럼 서비스 간 약속을 문서나 스키마로 명확히 표현한 것입니다. 계약이 안정적이면 독립 배포와 병렬 개발이 쉬워집니다.', '납품서에 크기, 수량, 포장 기준을 적어 공장과 매장이 같은 기대를 갖게 하는 약속과 같습니다.', ['contract = {"path": "/orders/{id}", "response": ["id", "total"]}', 'print("total" in contract["response"])']],
  ['소비자 주도 계약 테스트(Pact)', '소비자 주도 계약 테스트는 API 소비자가 기대하는 요청과 응답을 계약으로 만들고 제공자가 이를 만족하는지 검증하는 테스트입니다. Pact는 이 흐름을 지원하는 대표 도구입니다.', '식당 손님들이 알레르기와 메뉴 요구를 미리 적어 두고 주방이 실제로 그 조건을 지키는지 확인하는 절차와 같습니다.', ['consumer_expects = {"status": 200, "field": "orderId"}', 'provider_response = {"status": 200, "orderId": 1}', 'print(consumer_expects["field"] in provider_response)']],
  ['API 버전 관리 전략', 'API 버전 관리 전략은 기존 소비자를 깨뜨리지 않으면서 계약을 변경하기 위한 규칙입니다. URL, 헤더, 미디어 타입, 점진적 폐기 정책을 함께 설계합니다.', '버스 노선을 개편할 때 기존 승객을 위해 구노선과 신노선을 일정 기간 함께 운행하는 것과 같습니다.', ['clients = {"mobile": "v1", "web": "v2"}', 'print(set(clients.values()))']],
  ['하위 호환성', '하위 호환성은 새 서비스나 API가 이전 버전 소비자의 기대를 계속 만족하는 성질입니다. 필드 추가는 보통 안전하지만 필드 삭제나 의미 변경은 위험합니다.', '새 충전기가 예전 케이블도 꽂을 수 있게 어댑터 규격을 유지하는 설계와 같습니다.', ['old_fields = {"id", "name"}', 'new_fields = {"id", "name", "email"}', 'print(old_fields <= new_fields)']],
  ['그레이스풀 디그레이데이션', '그레이스풀 디그레이데이션은 일부 의존성이 실패해도 핵심 기능은 제한된 형태로 계속 제공하는 설계입니다. 추천, 통계, 부가 정보를 생략하고 주문 같은 핵심 흐름을 유지할 수 있습니다.', '백화점 전광판이 고장 나도 종이 안내도와 직원 안내로 영업을 이어 가는 상황과 같습니다.', ['recommendation_ok = False', 'page = {"product": "book"}', 'if recommendation_ok:', '    page["recommend"] = ["pen"]', 'print(page)']],
  ['스트랭글러 피그 패턴(레거시 교체)', '스트랭글러 피그 패턴은 레거시 시스템 주변에 새 기능을 점진적으로 만들고 트래픽을 옮겨 기존 시스템을 서서히 대체하는 방식입니다. 한 번에 전면 재작성하는 위험을 낮춥니다.', '오래된 다리 옆에 새 다리를 조금씩 완성하고 차량 흐름을 단계적으로 옮긴 뒤 낡은 다리를 철거하는 과정과 같습니다.', ['routes = {"legacy": 80, "new": 20}', 'routes["new"] += 10', 'routes["legacy"] -= 10', 'print(routes)']],
  ['안티 코럽션 레이어', '안티 코럽션 레이어는 외부나 레거시 모델이 내부 도메인 모델을 오염시키지 않도록 변환 계층을 두는 패턴입니다. 용어, 데이터 형식, 오류 의미를 경계에서 번역합니다.', '해외 지사와 본사가 서로 다른 양식을 쓰더라도 통역 담당자가 본사 양식으로 바꿔 전달하는 것과 같습니다.', ['legacy = {"cust_nm": "Lee"}', 'modern = {"customerName": legacy["cust_nm"]}', 'print(modern)']],
  ['이벤트 브로커(Kafka 심화)', '이벤트 브로커는 서비스가 직접 서로를 호출하지 않고 이벤트를 발행하고 구독하도록 중간에서 전달하는 인프라입니다. Kafka는 파티션, 오프셋, 소비자 그룹을 통해 대용량 스트림을 처리합니다.', '방송국 송출실이 여러 프로그램 신호를 내보내면 각 가정이 필요한 채널을 맞춰 보는 구조와 같습니다.', ['broker = []', 'broker.append(("orders", {"id": 3}))', 'topic, event = broker[0]', 'print(topic, event["id"])']],
  ['토픽 파티셔닝 전략', '토픽 파티셔닝 전략은 이벤트를 여러 파티션에 나눠 병렬 처리와 순서 보장을 조절하는 설계입니다. 키 선택이 처리량, 핫스팟, 같은 키 순서 보장에 직접 영향을 줍니다.', '우편물을 지역 번호별 창구로 나눠 처리하되 같은 동네 편지는 같은 줄에서 순서를 지키는 방식과 같습니다.', ['order_id = 125', 'partitions = 6', 'partition = order_id % partitions', 'print(partition)']],
  ['소비자 그룹 설계', '소비자 그룹 설계는 같은 토픽을 읽는 소비자들을 묶어 파티션을 나눠 처리하게 하는 방식입니다. 병렬성, 장애 복구, 중복 처리 정책을 함께 맞춰야 합니다.', '신문 배달팀에서 구역을 나눠 맡아 한 집에 같은 신문이 여러 번 가지 않게 배정하는 것과 같습니다.', ['partitions = [0, 1, 2, 3]', 'consumers = ["c1", "c2"]', 'assignment = {p: consumers[p % 2] for p in partitions}', 'print(assignment)']],
  ['이벤트 스키마 진화', '이벤트 스키마 진화는 발행된 이벤트 형식을 시간이 지나며 안전하게 변경하는 규칙입니다. 새 필드 추가, 기본값, 필드 폐기 절차를 통해 과거 소비자와 미래 소비자를 함께 보호합니다.', '병원 문진표에 새 문항을 추가하되 예전 양식을 제출한 환자도 접수할 수 있게 처리하는 것과 같습니다.', ['old_event = {"id": 1}', 'new_event = {**old_event, "currency": "KRW"}', 'print(new_event.get("currency", "KRW"))']],
  ['스키마 레지스트리', '스키마 레지스트리는 이벤트나 메시지의 스키마 버전을 저장하고 호환성을 검사하는 중앙 저장소입니다. 생산자와 소비자가 같은 데이터 계약을 공유하도록 돕습니다.', '건축 도면 보관소가 최신 도면과 이전 도면을 관리해 시공팀이 잘못된 규격을 쓰지 않게 하는 것과 같습니다.', ['schemas = {"OrderCreated": [1, 2]}', 'print(max(schemas["OrderCreated"]))']],
  ['Avro/Protobuf 스키마', 'Avro와 Protobuf 스키마는 메시지 구조와 타입을 명시해 직렬화와 역직렬화를 안정적으로 만드는 형식입니다. 바이너리 인코딩과 스키마 기반 호환성 관리에 자주 쓰입니다.', '택배 상자의 규격표에 가로, 세로, 무게 단위를 정해 어느 물류센터에서도 같은 방식으로 읽게 하는 것과 같습니다.', ['schema = {"id": "int", "name": "string"}', 'record = {"id": 1, "name": "desk"}', 'print(all(k in record for k in schema))']],
  ['이벤트 스토밍', '이벤트 스토밍은 도메인 전문가와 개발자가 비즈니스 이벤트를 시간 순서로 붙이며 프로세스, 명령, 정책, 경계를 찾는 워크숍 기법입니다. 서비스 분해와 공통 언어 발견에 유용합니다.', '수사팀이 벽에 사건 카드를 시간 순서로 붙이며 원인, 행동, 결과를 함께 맞춰 보는 회의와 같습니다.', ['events = ["OrderPlaced", "PaymentCaptured", "ItemShipped"]', 'print(" -> ".join(events))']],
  ['핵심 도메인 vs 지원 도메인', '핵심 도메인은 비즈니스 경쟁력을 직접 만드는 영역이고 지원 도메인은 핵심을 가능하게 하지만 차별화의 중심은 아닌 영역입니다. 투자 우선순위와 서비스 품질 목표를 다르게 정할 수 있습니다.', '레스토랑에서 대표 메뉴 레시피는 핵심이고 예약 관리와 청소 일정은 중요하지만 지원 업무에 가까운 것과 같습니다.', ['domains = {"pricing": "core", "email": "support"}', 'print([k for k, v in domains.items() if v == "core"])']],
  ['제네릭 서브도메인', '제네릭 서브도메인은 여러 회사에서 비슷하게 필요한 범용 기능 영역입니다. 인증, 결제 연동, 알림처럼 직접 만들기보다 제품이나 표준 솔루션을 활용하는 판단이 자주 나옵니다.', '어느 사무실이나 필요한 복사기와 정수기처럼 회사만의 차별점은 아니지만 업무에는 꼭 필요한 설비와 같습니다.', ['subdomains = {"auth": "generic", "recommendation": "core"}', 'print(subdomains["auth"])']],
  ['분산 모놀리스 안티패턴', '분산 모놀리스는 서비스가 나뉘어 보이지만 배포, 데이터, 호출 순서가 강하게 묶여 실제로는 하나처럼 움직이는 안티패턴입니다. 분산 비용만 늘고 독립성은 얻지 못합니다.', '부서 이름표는 따로 붙였지만 모든 결재가 한 사람 책상에서만 진행되어 누구도 독립적으로 움직이지 못하는 회사와 같습니다.', ['deploy_together = True', 'shared_db = True', 'print(deploy_together and shared_db)']],
  ['챗티 마이크로서비스', '챗티 마이크로서비스는 하나의 사용자 요청을 처리하기 위해 서비스 간 작은 호출이 과도하게 많이 발생하는 문제입니다. 지연, 장애 전파, 네트워크 비용이 크게 증가합니다.', '주문 하나를 처리하려고 직원이 창고와 계산대와 포장대를 열 번씩 오가며 확인하는 비효율과 같습니다.', ['calls = ["user", "stock", "price", "coupon", "stock"]', 'print(len(calls) > 4)']],
  ['공유 데이터베이스 안티패턴', '공유 데이터베이스 안티패턴은 여러 서비스가 같은 데이터베이스 테이블을 직접 읽고 쓰며 내부 구현에 결합되는 문제입니다. 서비스 경계와 데이터 소유권이 흐려집니다.', '여러 부서가 같은 장부를 각자 지우개로 고치면서 누가 어떤 숫자를 책임지는지 모르게 되는 상황과 같습니다.', ['writers = {"orders": ["order-service", "report-service"]}', 'print(len(writers["orders"]) > 1)']],
  ['서비스 오케스트레이션(Temporal)', '서비스 오케스트레이션은 여러 서비스 작업의 순서, 재시도, 타임아웃, 보상을 중앙 워크플로로 조정하는 방식입니다. Temporal은 오래 걸리는 분산 워크플로를 코드로 안정적으로 관리하는 도구입니다.', '결혼식 진행자가 사진, 식사, 축가 순서를 잡고 문제가 생기면 대체 순서를 안내하는 역할과 같습니다.', ['workflow = ["book", "pay", "notify"]', 'for task in workflow:', '    print("run", task)']],
  ['워크플로 엔진', '워크플로 엔진은 여러 단계로 이루어진 업무를 상태와 규칙에 따라 실행하고 추적하는 시스템입니다. 재시도, 지연 실행, 승인, 분기 처리를 코드 밖에서 관리할 수 있습니다.', '공항 수하물이 체크인, 보안 검색, 분류, 적재 단계를 컨베이어 규칙에 따라 이동하는 구조와 같습니다.', ['state = "submitted"', 'transitions = {"submitted": "approved", "approved": "done"}', 'state = transitions[state]', 'print(state)']],
  ['보상 트랜잭션 설계', '보상 트랜잭션 설계는 이미 성공한 지역 트랜잭션을 되돌리거나 상쇄하는 별도 작업을 정의하는 방식입니다. 분산 환경에서 전역 롤백 대신 취소, 환불, 재고 복원 같은 동작을 사용합니다.', '여행 패키지 예약 중 항공권 결제 후 호텔 예약이 실패하면 항공권 취소 절차를 따로 실행하는 것과 같습니다.', ['done = ["reserve_stock", "charge"]', 'compensate = {"charge": "refund", "reserve_stock": "release_stock"}', 'print([compensate[x] for x in reversed(done)])']],
  ['멱등 소비자', '멱등 소비자는 같은 메시지를 여러 번 받아도 결과가 한 번 처리한 것과 같도록 만드는 소비자입니다. 메시지 재전송과 중복 전달이 가능한 이벤트 시스템에서 필수적입니다.', '택배 수령 확인 버튼을 두 번 눌러도 배송 상태가 두 번 완료로 계산되지 않는 접수 시스템과 같습니다.', ['processed = set()', 'event_id = "evt-1"', 'if event_id not in processed:', '    processed.add(event_id)', 'print(len(processed))']],
  ['체크포인팅', '체크포인팅은 스트림이나 긴 작업에서 어디까지 처리했는지 위치를 저장하는 방식입니다. 장애 후 처음부터 다시 시작하지 않고 마지막 안전 지점부터 재개할 수 있습니다.', '긴 책을 읽다가 책갈피를 꽂아 두면 다음 날 처음부터 다시 읽지 않아도 되는 것과 같습니다.', ['records = ["a", "b", "c"]', 'checkpoint = 0', 'for i, record in enumerate(records, start=1):', '    checkpoint = i', 'print(checkpoint)']],
  ['실패 재처리 전략', '실패 재처리 전략은 일시적 오류와 영구 오류를 구분해 재시도, 지수 백오프, 데드 레터 큐, 수동 복구를 정하는 설계입니다. 무한 재시도와 데이터 손상을 피해야 합니다.', '배달 실패 시 바로 한 번 더 가고, 계속 실패하면 보관소에 맡긴 뒤 고객센터가 연락하는 절차와 같습니다.', ['attempts = 0', 'max_attempts = 3', 'while attempts < max_attempts:', '    attempts += 1', 'print("dead-letter" if attempts == max_attempts else "retry")']],
  ['마이크로서비스 테스트 전략', '마이크로서비스 테스트 전략은 단위, 계약, 통합, 엔드투엔드, 카오스 테스트를 계층화해 빠른 피드백과 실제 연동 신뢰성을 균형 있게 확보하는 접근입니다. 모든 것을 E2E로 검증하면 느리고 취약해집니다.', '자동차 검사에서 부품 검사, 조립 검사, 주행 시험을 나눠 문제를 빨리 찾고 최종 안전도 확인하는 방식과 같습니다.', ['tests = {"unit": 120, "contract": 20, "e2e": 5}', 'print(sum(tests.values()))']],
  ['계약 테스트', '계약 테스트는 서비스 제공자와 소비자 사이의 API 또는 이벤트 약속이 실제 구현에서 지켜지는지 확인하는 테스트입니다. 독립 배포 중에도 연동 깨짐을 빠르게 찾게 해 줍니다.', '부품 업체가 보낸 나사가 조립 공장의 규격표와 맞는지 출고 전에 재는 품질 검사와 같습니다.', ['expected = {"id", "status"}', 'actual = {"id", "status", "createdAt"}', 'print(expected <= actual)']],
  ['통합 테스트 전략', '통합 테스트 전략은 여러 서비스, 데이터베이스, 브로커가 함께 동작할 때 계약과 설정이 맞는지 검증하는 계획입니다. 범위를 좁혀 중요한 경로부터 테스트해야 속도와 신뢰성을 유지합니다.', '오케스트라에서 각 악기 연습 뒤 현악, 관악, 타악이 함께 맞는지 리허설하는 순서와 같습니다.', ['components = ["api", "db", "broker"]', 'ready = {name: True for name in components}', 'print(all(ready.values()))']],
  ['테스트 컨테이너(Testcontainers)', 'Testcontainers는 테스트 중 실제 데이터베이스나 브로커를 컨테이너로 띄워 통합 테스트 환경을 코드로 구성하는 도구입니다. 운영과 유사한 의존성을 쓰면서도 테스트 격리를 유지합니다.', '요리 시험장에 실제 오븐과 냉장고를 임시로 설치해 레시피가 현장 장비에서도 되는지 확인하는 것과 같습니다.', ['containers = ["postgres", "kafka"]', 'running = [f"{name}:ready" for name in containers]', 'print(running)']],
  ['서비스 가상화(Mountebank)', '서비스 가상화는 아직 준비되지 않았거나 호출하기 어려운 외부 서비스를 흉내 내는 테스트 대역을 만드는 기법입니다. Mountebank는 HTTP 같은 프로토콜 응답을 가짜 서비스로 제공할 수 있습니다.', '영화 촬영장에서 실제 공항 대신 세트장을 만들어 배우의 동선과 장면을 미리 맞추는 것과 같습니다.', ['stub = {"/payment": {"status": "approved"}}', 'print(stub["/payment"]["status"])']],
  ['카오스 엔지니어링 도구', '카오스 엔지니어링 도구는 지연, 장애, 인스턴스 종료 같은 혼란을 통제된 방식으로 주입해 시스템 복원력을 검증합니다. 실험 범위와 중단 조건을 명확히 정해야 합니다.', '소방 훈련에서 실제 불을 내지 않고도 연기와 경보 상황을 만들어 대피 절차를 점검하는 것과 같습니다.', ['experiments = ["latency", "pod-kill"]', 'print("pod-kill" in experiments)']],
  ['Chaos Monkey', 'Chaos Monkey는 운영 중 인스턴스를 무작위로 종료해 장애에 견디는 구조인지 확인하도록 만든 대표적인 카오스 도구입니다. 자동 복구와 중복 구성이 제대로 되어 있는지 드러냅니다.', '훈련 교관이 예고 없이 한 계산대를 닫아도 매장이 다른 계산대로 손님을 처리할 수 있는지 보는 실험과 같습니다.', ['instances = ["i-1", "i-2", "i-3"]', 'terminated = instances.pop(0)', 'print(terminated, len(instances))']],
  ['폴트 인젝션', '폴트 인젝션은 네트워크 지연, 오류 응답, 디스크 실패 같은 결함을 의도적으로 넣어 시스템 반응을 검증하는 기법입니다. 장애 대응 로직이 문서가 아니라 실제로 작동하는지 확인합니다.', '항공기 시뮬레이터에서 엔진 경고와 난기류를 넣어 조종사가 절차대로 대응하는지 보는 훈련과 같습니다.', ['fault = {"latency_ms": 500, "error_rate": 0.1}', 'print(fault["latency_ms"] > 100)']],
  ['복원력 패턴 종합', '복원력 패턴 종합은 타임아웃, 재시도, 회로 차단기, 벌크헤드, 캐시, 폴백을 조합해 장애 영향을 제한하는 설계입니다. 패턴은 서로 보완되지만 잘못 조합하면 부하를 키울 수 있습니다.', '배 한 척에 방수 격벽, 구명정, 비상 펌프, 대피 절차를 함께 갖춰 침수 피해를 제한하는 것과 같습니다.', ['patterns = {"timeout": True, "fallback": True, "retry": False}', 'print([k for k, v in patterns.items() if v])']],
  ['마이크로서비스 보안', '마이크로서비스 보안은 서비스, 사용자, 데이터, 네트워크 경계를 모두 고려해 인증, 인가, 암호화, 비밀 관리, 감사 추적을 설계하는 영역입니다. 내부 호출도 신뢰하지 않는 관점이 중요합니다.', '회사 건물 안에 들어왔다고 모든 사무실 금고를 열 수 없게 층별 출입증과 기록을 따로 두는 것과 같습니다.', ['request = {"service": "billing", "token": "present"}', 'print(request["token"] == "present")']],
  ['서비스 간 인증(mTLS/JWT)', '서비스 간 인증은 한 서비스가 다른 서비스를 호출할 때 상대 신원과 권한을 확인하는 절차입니다. mTLS는 인증서로 양방향 신뢰를 만들고 JWT는 서명된 토큰으로 주장 정보를 전달합니다.', '직원이 다른 부서 창고에 들어갈 때 사원증과 승인 문서를 함께 제시하는 절차와 같습니다.', ['jwt = {"sub": "order-service", "scope": "payment:read"}', 'print(jwt["scope"].endswith(":read"))']],
  ['내부 PKI', '내부 PKI는 조직 내부 서비스와 장비에 인증서를 발급, 갱신, 폐기하는 공개키 기반 구조입니다. mTLS, 서명 검증, 암호화 통신의 신뢰 뿌리가 됩니다.', '회사 자체 인감 관리실이 공식 도장을 발급하고 만료된 도장은 회수해 문서 신뢰를 유지하는 것과 같습니다.', ['cert = {"subject": "inventory", "days_left": 30}', 'print(cert["days_left"] > 0)']],
  ['상류-하류 관계(Upstream/Downstream)', '상류와 하류 관계는 데이터나 API를 제공하는 쪽과 사용하는 쪽의 의존 방향을 나타냅니다. 변경 영향, 협상력, 장애 전파를 이해하는 데 중요합니다.', '강 상류 공장의 수문 조절이 하류 농장의 물 공급에 영향을 주는 관계와 같습니다.', ['dependency = {"upstream": "catalog", "downstream": "checkout"}', 'print(f"{dependency[\"downstream\"]} depends on {dependency[\"upstream\"]}")']],
  ['파트너십 패턴(Partnership)', '파트너십 패턴은 두 bounded context가 서로 강하게 의존하고 양쪽 팀이 협력해 모델과 인터페이스를 함께 발전시키는 관계입니다. 일정과 변경을 공동 조율할 수 있을 때 적합합니다.', '두 회사가 공동 브랜드 제품을 만들며 포장, 품질, 출시일을 같이 결정하는 협업 방식과 같습니다.', ['teams = {"pricing", "checkout"}', 'decision = "joint release" if len(teams) == 2 else "solo"', 'print(decision)']],
  ['순응주의자(Conformist)', '순응주의자는 하류 팀이 상류 모델을 거의 그대로 받아들이는 도메인 관계 패턴입니다. 상류를 바꿀 영향력이 작거나 변환 비용이 이득보다 클 때 나타납니다.', '입점 매장이 쇼핑몰의 정해진 영수증 양식과 정산 규칙을 그대로 따르는 상황과 같습니다.', ['upstream_model = {"customer_id": "C1"}', 'downstream_model = upstream_model.copy()', 'print(downstream_model)']],
  ['오픈 호스트 서비스', '오픈 호스트 서비스는 여러 소비자가 사용할 수 있도록 안정적이고 공개된 프로토콜이나 API를 제공하는 패턴입니다. 소비자별 임시 연동을 줄이고 표준 접점을 유지합니다.', '공항이 항공사마다 다른 출입문을 만들지 않고 표준 탑승 게이트와 안내 시스템을 제공하는 것과 같습니다.', ['api = {"protocol": "REST", "consumers": ["web", "partner"]}', 'print(len(api["consumers"]))']],
  ['공표된 언어(Published Language)', '공표된 언어는 여러 컨텍스트가 데이터를 교환할 때 공동으로 쓰는 문서화된 메시지 형식이나 표준 용어입니다. 내부 모델이 달라도 교환 지점에서는 같은 언어를 사용합니다.', '국제 회의에서 각 나라가 내부 언어를 쓰더라도 공식 문서는 합의된 영어 양식으로 제출하는 것과 같습니다.', ['message = {"type": "InvoiceIssued", "amount": 100}', 'print(message["type"])']],
  ['공유 커널(Shared Kernel)', '공유 커널은 여러 팀이 공통으로 사용하는 작은 도메인 모델이나 라이브러리를 함께 소유하는 패턴입니다. 공유 범위가 커지면 독립 배포와 변경 속도를 해칠 수 있습니다.', '두 식당이 같은 반죽 레시피만 공동 관리하고 나머지 메뉴와 운영은 각자 가져가는 구조와 같습니다.', ['shared = {"Money": ["amount", "currency"]}', 'print("currency" in shared["Money"])']],
  ['상관 ID(Correlation ID)', '상관 ID는 하나의 사용자 요청이나 업무 흐름에 포함된 여러 로그와 메시지를 연결하는 공통 식별자입니다. 분산 환경에서 문제 추적과 지연 분석에 필수적입니다.', '택배 상자, 운송장, 고객 문의에 같은 송장 번호를 붙여 이동 경로를 한 번에 찾는 것과 같습니다.', ['correlation_id = "req-123"', 'logs = [f"{correlation_id}: start", f"{correlation_id}: done"]', 'print(logs)']],
  ['요청 컨텍스트 전파', '요청 컨텍스트 전파는 인증 정보, 상관 ID, 로케일, 테넌트 같은 요청 관련 정보를 서비스 호출 체인에 전달하는 방식입니다. 누락되면 추적, 권한, 사용자 경험이 깨질 수 있습니다.', '병원 진료 의뢰서가 접수, 검사실, 약국까지 함께 전달되어 같은 환자 정보를 참조하게 하는 절차와 같습니다.', ['context = {"trace": "t1", "tenant": "shop-a"}', 'next_headers = context.copy()', 'print(next_headers["tenant"])']],
  ['분산 추적(마이크로서비스)', '분산 추적은 여러 서비스를 지나는 하나의 요청을 span과 trace로 기록해 전체 호출 경로와 지연 원인을 분석하는 관찰성 기법입니다. 로그와 메트릭만으로 보기 어려운 경계를 보여 줍니다.', '기차 여행에서 각 역의 도착과 출발 시간을 찍어 지연이 어느 구간에서 생겼는지 찾는 기록표와 같습니다.', ['spans = [{"name": "api", "ms": 30}, {"name": "db", "ms": 80}]', 'print(sum(s["ms"] for s in spans))']],
  ['API 집합(Aggregation) 패턴', 'API 집합 패턴은 여러 하위 서비스 호출 결과를 하나의 응답으로 묶어 클라이언트의 호출 수와 조합 부담을 줄이는 패턴입니다. 화면 요구에 맞춘 조합 로직이 별도 계층에 위치합니다.', '도시락 가게가 밥, 반찬, 국을 각 조리대에서 받아 하나의 도시락 상자로 포장해 주는 과정과 같습니다.', ['parts = {"profile": "Kim", "points": 1200, "coupons": 2}', 'response = {"summary": f"{parts[\"profile\"]}:{parts[\"points\"]}"}', 'print(response)']],
  ['플러그인 아키텍처', '플러그인 아키텍처는 핵심 시스템은 안정적으로 두고 확장 기능을 독립 모듈로 추가하거나 교체할 수 있게 하는 구조입니다. 확장 지점, 버전, 격리, 권한 관리가 중요합니다.', '전동 공구 본체에 드릴, 샌더, 커터 같은 헤드를 상황에 맞게 갈아 끼우는 방식과 같습니다.', ['plugins = {"markdown": lambda text: text.upper()}', 'print(plugins["markdown"]("doc"))']],
  ['AsyncAPI 스펙', 'AsyncAPI 스펙은 이벤트 기반 또는 메시지 기반 API의 채널, 메시지, 스키마, 보안 정보를 문서화하는 표준입니다. REST API의 OpenAPI처럼 비동기 계약을 명확히 표현합니다.', '버스 노선도에 정류장, 배차 간격, 승하차 규칙을 적어 승객과 기사 모두 같은 흐름을 이해하게 하는 문서와 같습니다.', ['asyncapi = {"channel": "orders.created", "message": "OrderCreated"}', 'print(asyncapi["channel"])']],
  ['개별 배포 가능성', '개별 배포 가능성은 한 서비스를 다른 서비스 배포 없이 독립적으로 릴리스할 수 있는 성질입니다. 계약 안정성, 데이터 소유권, 자동 테스트, 관찰성이 뒷받침되어야 합니다.', '기차의 한 객차 내부 좌석을 수리해도 전체 노선 운행을 멈추지 않는 정비 방식과 같습니다.', ['services = {"catalog": "v2", "order": "v1"}', 'services["catalog"] = "v3"', 'print(services)']],
  ['마이크로서비스 공통 라이브러리', '마이크로서비스 공통 라이브러리는 로깅, 인증 클라이언트, 오류 형식처럼 여러 서비스가 반복 사용하는 코드를 묶은 패키지입니다. 과도하게 커지면 서비스들이 같은 배포 주기에 묶이는 위험이 있습니다.', '여러 매장이 같은 포장 테이프와 가격표 양식은 공유하되 메뉴판과 조리법까지 강제로 공유하지 않는 원칙과 같습니다.', ['common = {"logging": "1.2.0", "errors": "1.0.0"}', 'print(common["logging"])']],
  ['사이드카 vs 라이브러리', '사이드카는 서비스 옆의 별도 프로세스로 공통 기능을 제공하고 라이브러리는 애플리케이션 코드 안에 포함됩니다. 배포 독립성, 언어 중립성, 성능, 운영 복잡도를 비교해야 합니다.', '자전거에 붙인 보조 바구니가 사이드카라면, 가방 안에 넣은 정리 파우치는 라이브러리와 비슷합니다.', ['choice = {"needs_language_neutral": True}', 'print("sidecar" if choice["needs_language_neutral"] else "library")']],
  ['서비스 그래프(Service Graph)', '서비스 그래프는 서비스 간 호출, 이벤트, 의존 관계를 노드와 간선으로 표현한 지도입니다. 장애 영향 분석, 병목 찾기, 소유권 파악에 사용됩니다.', '지하철 노선도가 역과 환승 관계를 보여 주어 막힌 구간이 어느 노선에 영향을 주는지 알게 하는 것과 같습니다.', ['graph = {"api": ["order", "catalog"], "order": ["payment"]}', 'print(graph["api"])']],
  ['데이터 컨시스턴시 패턴', '데이터 컨시스턴시 패턴은 분산 서비스 사이에서 데이터 일관성을 맞추기 위한 설계 묶음입니다. 사가, 아웃박스, 이벤트 소싱, 최종 일관성 같은 선택지가 상황별로 쓰입니다.', '여러 지점 재고 장부가 즉시 완전히 같지는 않아도 마감 때 대조표와 조정 절차로 맞춰지는 운영과 같습니다.', ['stock_a = 10', 'stock_b = 8', 'event = {"delta": -2}', 'stock_a += event["delta"]', 'print(stock_a == stock_b)']],
  ['비동기 API 설계', '비동기 API 설계는 요청 즉시 결과를 주지 않고 작업 ID, 콜백, 웹훅, 이벤트로 진행 상태와 완료 결과를 전달하는 방식입니다. 긴 작업과 느슨한 결합에 적합합니다.', '사진관에 필름을 맡기면 접수증을 받고 나중에 완료 문자를 받은 뒤 찾아가는 절차와 같습니다.', ['job = {"id": "job-7", "status": "queued"}', 'job["status"] = "done"', 'print(job)']],
  ['이벤트 기반 마이크로서비스', '이벤트 기반 마이크로서비스는 상태 변화나 업무 사건을 이벤트로 발행하고 다른 서비스가 이를 구독해 반응하도록 구성한 마이크로서비스 스타일입니다. 서비스 간 시간 결합을 낮추고 확장성을 높입니다.', '시장 방송에서 경매 종료 소식이 나오면 포장팀, 배송팀, 회계팀이 각자 필요한 일을 시작하는 구조와 같습니다.', ['events = [{"type": "PaymentCompleted", "order": 9}]', 'for event in events:', '    if event["type"] == "PaymentCompleted":', '        print("start shipping", event["order"])']],
];

if (plan.length !== 70) {
  throw new Error(`Expected 70 plan terms for week25, got ${plan.length}`);
}

if (rows.length !== 70) {
  throw new Error(`Expected 70 rows for week25, got ${rows.length}`);
}

const terms = rows.map((row, index) => {
  const [term, definition, analogy, codeLines] = row;
  const planItem = plan[index];
  if (term !== planItem.term) {
    throw new Error(`row ${index + 1} term mismatch: ${term} !== ${planItem.term}`);
  }

  return {
    id: String(1681 + index).padStart(3, '0'),
    term,
    category: '마이크로서비스',
    difficulty: index < 4 ? 'easy' : index < 32 ? 'medium' : 'hard',
    phase: 5,
    week: 25,
    definition,
    hint: term.replace(/\(.+\)/, '').replace(/\s+/g, '').slice(0, 12),
    detail: {
      easy: `${term}은 마이크로서비스를 독립적으로 설계하고 운영하기 위해 알아야 하는 개념입니다.`,
      analogy,
      example: example(term, codeLines),
      tip: `${term}을 적용할 때는 서비스 경계, 데이터 소유권, 장애 전파, 배포 독립성을 함께 검토하세요.`,
    },
  };
});

fs.writeFileSync(
  path.join(DATA_DIR, 'terms.week25.json'),
  `${JSON.stringify(terms, null, 2)}\n`,
  'utf8',
);

console.log('wrote data/terms.week25.json');

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const plan = require('./term-bank-plan.json').filter((item) => item.week === 18);

function example(term, lines) {
  return [`# ${term} 예시: Python 3에서 실행 가능한 코드`, ...lines].join('\n');
}

const rows = [
  ['위협 모델링', '위협 모델링은 시스템의 자산, 공격자, 진입점, 가능한 위협, 완화책을 구조적으로 식별하는 보안 설계 활동입니다. 개발 초기에 수행하면 나중에 발견되는 보안 결함의 비용을 줄일 수 있습니다.', '새 건물을 짓기 전에 출입문, 창문, 금고 위치를 보며 도둑이 어디로 들어올지 미리 그려 보는 것과 같습니다. 문제가 생긴 뒤 자물쇠를 붙이는 것보다 설계 때 반영하는 편이 낫습니다.', ['assets = ["user_data", "api_key"]', 'entry_points = ["login", "upload"]', 'for asset in assets:', '    print(asset, "needs protection at", entry_points)']],
  ['STRIDE 모델', 'STRIDE는 Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege로 위협을 분류하는 모델입니다. 설계 검토에서 빠뜨리기 쉬운 보안 관점을 체계적으로 점검하게 합니다.', '집을 점검할 때 위장 출입, 물건 변조, 발뺌, 비밀 노출, 통로 막기, 권한 침범을 각각 체크하는 보안 점검표와 같습니다.', ['stride = ["Spoofing", "Tampering", "Repudiation", "InfoDisclosure", "DoS", "EoP"]', 'print(len(stride), stride[0])']],
  ['공격 표면(Attack Surface)', '공격 표면은 공격자가 시스템과 상호작용할 수 있는 모든 지점의 집합입니다. 공개 API, 로그인 화면, 업로드 기능, 네트워크 포트, 의존성 등이 모두 포함됩니다.', '성의 성문, 창문, 하수구, 담장 틈까지 모두 침입 가능한 경로로 보는 것과 같습니다. 문 하나만 잠갔다고 전체가 안전해지는 것은 아닙니다.', ['routes = ["/login", "/upload", "/admin"]', 'public = [r for r in routes if r != "/admin"]', 'print(public)']],
  ['취약점(Vulnerability)', '취약점은 공격자가 보안 목표를 깨뜨리는 데 이용할 수 있는 약점입니다. 코드 결함, 설정 실수, 설계 문제, 오래된 라이브러리 등 다양한 형태로 존재합니다.', '튼튼해 보이는 울타리에 작은 녹슨 경첩이 있어 그곳으로 문이 열리는 상황과 같습니다. 전체 구조보다 작은 약점 하나가 침입 경로가 될 수 있습니다.', ['checks = {"input_validated": False, "patched": True}', 'print([k for k, ok in checks.items() if not ok])']],
  ['익스플로잇(Exploit)', '익스플로잇은 취약점을 실제로 이용해 권한 탈취, 정보 유출, 서비스 중단 같은 결과를 내는 방법이나 코드입니다. 방어자는 익스플로잇 가능성을 기준으로 위험 우선순위를 정합니다.', '벽의 균열이 취약점이라면 그 균열에 맞춰 만든 지렛대가 익스플로잇과 같습니다. 약점이 있어도 실제로 이용 가능할 때 위험이 커집니다.', ['vulnerability = True', 'has_working_exploit = False', 'risk = "high" if vulnerability and has_working_exploit else "review"', 'print(risk)']],
  ['패치 관리', '패치 관리는 소프트웨어와 운영체제의 보안 업데이트를 식별, 테스트, 배포, 추적하는 과정입니다. 빠른 적용과 서비스 안정성 사이의 균형이 중요합니다.', '건물의 고장 난 자물쇠 목록을 관리하고 새 자물쇠를 검수한 뒤 순서대로 교체하는 시설 관리와 같습니다. 어떤 문을 고쳤는지 기록도 필요합니다.', ['packages = {"libA": "old", "libB": "current"}', 'to_patch = [name for name, state in packages.items() if state == "old"]', 'print(to_patch)']],
  ['제로데이 취약점', '제로데이 취약점은 공급자나 방어자가 아직 패치를 제공하지 못한 상태에서 알려졌거나 악용되는 취약점입니다. 서명 기반 탐지만으로 막기 어려워 격리와 행위 탐지가 중요합니다.', '제조사도 아직 모르는 새 방식으로 열리는 자물쇠 결함과 같습니다. 공식 수리 키트가 나오기 전까지 임시 차단과 감시가 필요합니다.', ['known_patch = False', 'observed_exploit = True', 'print("emergency controls" if observed_exploit and not known_patch else "normal")']],
  ['CVE', 'CVE는 공개적으로 알려진 보안 취약점에 부여되는 표준 식별자입니다. 취약점 정보를 제품, 도구, 조직 사이에서 같은 이름으로 추적하게 해 줍니다.', '전국 분실물에 붙는 고유 접수 번호와 같습니다. 같은 사건을 각자 다른 이름으로 부르지 않고 하나의 번호로 찾습니다.', ['cve = "CVE-2026-12345"', 'print(cve.startswith("CVE-"))']],
  ['CVSS 점수', 'CVSS 점수는 취약점의 심각도를 0.0부터 10.0까지 수치화하는 표준 점수 체계입니다. 공격 난이도, 영향 범위, 권한 필요 여부 등을 반영해 우선순위 판단에 도움을 줍니다.', '응급실에서 환자 상태를 중증도 점수로 분류하는 것과 같습니다. 점수만으로 모든 상황을 설명하진 않지만 먼저 볼 대상을 정하는 데 유용합니다.', ['score = 9.8', 'severity = "critical" if score >= 9 else "lower"', 'print(severity)']],
  ['버그 바운티', '버그 바운티는 외부 연구자가 취약점을 책임 있게 신고하면 보상을 제공하는 프로그램입니다. 조직은 다양한 관점의 보안 검토를 얻고 연구자는 합법적인 보고 경로를 갖습니다.', '건물 주인이 안전 점검 전문가들에게 약점을 찾아 신고하면 포상금을 주는 제도와 같습니다. 몰래 악용하지 않고 정해진 창구로 알려야 합니다.', ['reports = [{"valid": True, "severity": "high"}, {"valid": False}]', 'rewards = [1000 for r in reports if r.get("valid")]', 'print(sum(rewards))']],
  ['침투 테스트(Pentest)', '침투 테스트는 허가된 범위 안에서 실제 공격자처럼 시스템을 점검해 취약점과 영향도를 확인하는 활동입니다. 결과는 보완 계획과 위험 우선순위로 이어져야 합니다.', '소방 훈련에서 실제 연기와 대피 절차를 시험해 건물이 얼마나 준비됐는지 확인하는 것과 같습니다. 허가된 연습 공격입니다.', ['scope = ["web", "api"]', 'finding = {"target": "api", "risk": "medium"}', 'print(finding["target"] in scope)']],
  ['레드팀/블루팀', '레드팀은 공격자 관점에서 보안을 시험하고 블루팀은 탐지, 방어, 대응을 담당합니다. 두 팀의 훈련은 실제 공격에 대한 조직의 준비도를 높입니다.', '축구 훈련에서 공격팀이 빈틈을 파고들고 수비팀이 막는 연습과 같습니다. 공격과 방어가 함께 좋아져야 실제 경기력이 올라갑니다.', ['red_action = "phishing simulation"', 'blue_action = "alert triage"', 'print(red_action, "vs", blue_action)']],
  ['OWASP Top 10 상세', 'OWASP Top 10은 웹 애플리케이션에서 자주 발생하고 영향이 큰 보안 위험을 정리한 목록입니다. 접근 제어 실패, 암호화 실패, 인젝션 등 웹 보안 검토의 출발점으로 사용됩니다.', '식당 위생 점검에서 가장 자주 걸리는 10가지 항목을 먼저 확인하는 체크리스트와 같습니다. 전부는 아니지만 중요한 문제를 빠르게 훑습니다.', ['owasp_items = ["Access Control", "Cryptographic Failures", "Injection"]', 'print("Injection" in owasp_items)']],
  ['인젝션 공격 종류', '인젝션 공격은 사용자 입력이 명령이나 쿼리의 일부로 잘못 해석되어 의도하지 않은 실행이 일어나는 공격입니다. SQL, OS 명령, LDAP, NoSQL 인젝션처럼 대상 해석기에 따라 종류가 나뉩니다.', '주문서 비고란에 주방 직원용 명령을 몰래 적어 넣었는데 직원이 그대로 따르는 상황과 같습니다. 손님 입력과 내부 명령을 분리해야 합니다.', ['user_input = "alice"', 'query = "SELECT * FROM users WHERE name = ?" ', 'params = [user_input]', 'print(query, params)']],
  ['SSRF(서버 사이드 요청 위조)', 'SSRF는 공격자가 서버가 보내는 요청의 목적지를 조작해 내부망이나 메타데이터 서비스에 접근하게 만드는 취약점입니다. URL 검증, 허용 목록, 네트워크 차단으로 줄일 수 있습니다.', '배달원에게 겉으로는 정상 주소를 준 뒤 사실은 직원 전용 창고 문으로 가게 만드는 것과 같습니다. 서버가 대신 접근한다는 점이 핵심입니다.', ['url = "https://example.com/image.png"', 'allowed = url.startswith("https://example.com/")', 'print("fetch" if allowed else "block")']],
  ['XXE(XML 외부 엔티티)', 'XXE는 XML 파서가 외부 엔티티를 해석하면서 로컬 파일이나 내부 네트워크 자원을 읽게 되는 취약점입니다. 외부 엔티티 비활성화와 안전한 파서 설정이 방어의 핵심입니다.', '서류 양식 안의 참고 문구가 사무실 내부 금고 문서를 가져오라는 지시로 해석되는 상황과 같습니다. 문서 해석 기능이 과도하면 위험합니다.', ['parser_config = {"external_entities": False}', 'print("safe" if not parser_config["external_entities"] else "risky")']],
  ['IDOR(직접 객체 참조)', 'IDOR는 사용자가 객체 ID를 바꿔 다른 사람의 데이터에 접근할 수 있는 접근 제어 취약점입니다. ID를 숨기는 것보다 서버 측 권한 검사가 반드시 필요합니다.', '물품 보관함 번호만 바꿔 입력하면 남의 보관함도 열리는 키오스크와 같습니다. 번호를 아는 것과 열 권한이 있는 것은 다릅니다.', ['current_user = 7', 'record = {"owner_id": 7, "id": 100}', 'print(record["owner_id"] == current_user)']],
  ['불안전한 역직렬화', '불안전한 역직렬화는 신뢰할 수 없는 직렬화 데이터를 객체로 복원하는 과정에서 코드 실행이나 상태 조작이 발생하는 취약점입니다. 허용된 형식과 타입만 안전하게 처리해야 합니다.', '누군가 보낸 조립 키트를 설명서대로 열었더니 안에 몰래 작동하는 장치가 들어 있는 상황과 같습니다. 포장된 데이터라고 무조건 믿으면 안 됩니다.', ['import json', 'text = "{\"role\": \"user\"}"', 'data = json.loads(text)', 'print(data["role"])']],
  ['구성 오류', '구성 오류는 보안 기능이 꺼져 있거나 기본 비밀번호, 과도한 권한, 공개 저장소처럼 설정이 잘못된 상태입니다. 코드가 안전해도 운영 설정이 틀리면 침해로 이어질 수 있습니다.', '튼튼한 금고를 샀지만 비밀번호를 0000으로 두고 문 앞에 붙여 둔 것과 같습니다. 제품보다 설정이 약점이 됩니다.', ['config = {"debug": False, "default_password": False}', 'print(all(config.values()) if False else not config["debug"] and not config["default_password"])']],
  ['로깅 부재', '로깅 부재는 보안 이벤트와 시스템 활동 기록이 부족해 공격 탐지와 사고 분석이 어려운 상태입니다. 로그인 실패, 권한 변경, 관리자 행동 같은 핵심 이벤트는 기록되어야 합니다.', '상점에 CCTV와 계산 기록이 없어 물건이 사라져도 언제 누가 왔는지 알 수 없는 상황과 같습니다. 사고 뒤에는 흔적이 필요합니다.', ['events = []', 'events.append({"type": "login_failed", "user": "kim"})', 'print(events)']],
  ['공급망 공격', '공급망 공격은 조직이 직접 만든 코드가 아니라 의존 라이브러리, 빌드 도구, 업데이트 서버, 외부 협력사를 통해 침투하는 공격입니다. 신뢰 경로 전체를 관리해야 합니다.', '식당 주방은 깨끗하지만 납품받은 재료 상자에 문제가 숨어 있는 상황과 같습니다. 내부만 점검해서는 충분하지 않습니다.', ['dependencies = {"safe-lib": "verified", "new-lib": "unknown"}', 'print([k for k, v in dependencies.items() if v != "verified"])']],
  ['의존성 취약점', '의존성 취약점은 애플리케이션이 사용하는 외부 패키지나 라이브러리에 존재하는 보안 결함입니다. 버전 추적, 보안 스캔, 업데이트 정책으로 관리해야 합니다.', '집을 지을 때 사용한 외부 부품 중 특정 모델 나사가 쉽게 부러지는 결함과 같습니다. 내 설계가 좋아도 부품 결함이 영향을 줍니다.', ['deps = {"libA": "1.0", "libB": "2.3"}', 'vulnerable = {"libA"}', 'print([d for d in deps if d in vulnerable])']],
  ['npm audit', 'npm audit은 Node.js 프로젝트 의존성에서 알려진 취약점을 검사하는 npm 도구입니다. 보고된 취약점의 심각도와 수정 가능한 버전을 확인하는 데 사용됩니다.', '창고에 있는 부품 목록을 리콜 데이터베이스와 대조해 문제가 있는 부품을 찾는 검사와 같습니다. 결과를 보고 교체 여부를 결정합니다.', ['audit = [{"name": "pkg", "severity": "high"}]', 'print([x["name"] for x in audit if x["severity"] in {"high", "critical"}])']],
  ['컨테이너 보안', '컨테이너 보안은 이미지, 런타임, 권한, 네트워크, 비밀값, 호스트 접근을 안전하게 관리하는 활동입니다. 작은 이미지, 취약점 스캔, 비루트 실행이 중요합니다.', '이삿짐 컨테이너에 위험물, 열린 자물쇠, 불필요한 물건이 없는지 확인하는 작업과 같습니다. 컨테이너가 가볍고 잠겨 있어야 합니다.', ['image = {"runs_as_root": False, "secrets_inside": False}', 'print(not image["runs_as_root"] and not image["secrets_inside"])']],
  ['런타임 보호', '런타임 보호는 애플리케이션이 실행 중일 때 이상 행동을 탐지하거나 차단하는 보안 기법입니다. 파일 변경, 의심스러운 프로세스, 비정상 네트워크 호출 등을 감시합니다.', '매장 영업 중 순찰 직원이 수상한 행동을 확인하고 즉시 제지하는 것과 같습니다. 문을 잠그는 사전 보안만으로는 부족합니다.', ['events = ["read_config", "spawn_shell"]', 'alerts = [e for e in events if "shell" in e]', 'print(alerts)']],
  ['네트워크 분리', '네트워크 분리는 시스템을 구역별로 나누어 불필요한 통신을 차단하는 방어 기법입니다. 침해가 발생해도 공격자가 내부 전체로 쉽게 이동하지 못하게 합니다.', '건물 각 층마다 출입문과 출입증을 따로 두어 한 층에 들어왔다고 모든 층을 갈 수 없게 하는 것과 같습니다.', ['allowed = {("web", "api"), ("api", "db")}', 'print(("web", "db") in allowed)']],
  ['마이크로 세그멘테이션', '마이크로 세그멘테이션은 네트워크를 매우 작은 단위로 나누고 워크로드별 통신 정책을 세밀하게 적용하는 방식입니다. 제로 트러스트와 내부 이동 차단에 유용합니다.', '사무실 전체 출입증 하나가 아니라 회의실마다 별도 권한을 확인하는 구조와 같습니다. 같은 건물 안에서도 필요한 방만 갈 수 있습니다.', ['policy = {("serviceA", "serviceB"): True, ("serviceA", "db"): False}', 'print(policy[("serviceA", "db")])']],
  ['웹 방화벽(WAF)', '웹 방화벽은 HTTP 요청을 검사해 웹 공격 패턴을 탐지하거나 차단하는 보안 장비나 서비스입니다. SQL 인젝션, XSS, 악성 봇 요청 같은 위험을 줄입니다.', '식당 입구에서 위험 물품과 이상한 주문서를 확인하는 보안 직원과 같습니다. 주방에 도착하기 전에 수상한 요청을 걸러냅니다.', ['request = {"path": "/search", "query": "normal"}', 'blocked = "DROP TABLE" in request["query"].upper()', 'print(blocked)']],
  ['IDS/IPS', 'IDS는 침입을 탐지해 알리고 IPS는 의심 트래픽을 차단까지 수행하는 시스템입니다. 네트워크나 호스트 활동을 분석해 공격 징후를 찾습니다.', 'IDS가 CCTV 관제실이라면 IPS는 수상한 사람이 보이면 자동으로 출입문을 잠그는 보안문과 같습니다. 탐지만 할지 차단도 할지가 다릅니다.', ['traffic = ["normal", "scan", "normal"]', 'alerts = [t for t in traffic if t == "scan"]', 'print(alerts)']],
  ['SIEM', 'SIEM은 여러 시스템의 로그와 이벤트를 수집, 상관분석, 경보화하는 보안 정보 이벤트 관리 플랫폼입니다. 분산된 흔적을 모아 사고 탐지와 조사에 활용합니다.', '도시 곳곳의 CCTV와 신고 전화를 한 관제센터에서 모아 이상 상황을 찾는 것과 같습니다. 단일 로그보다 연결된 패턴이 중요합니다.', ['logs = [{"host": "web", "event": "fail"}, {"host": "db", "event": "login"}]', 'print([l for l in logs if l["event"] == "fail"])']],
  ['포렌식', '포렌식은 사고 이후 디지털 증거를 수집, 보존, 분석해 무슨 일이 있었는지 밝히는 활동입니다. 증거 무결성과 체계적인 절차가 중요합니다.', '범죄 현장에서 지문과 발자국을 훼손하지 않고 봉투에 담아 분석하는 것과 같습니다. 성급히 치우면 진실을 잃을 수 있습니다.', ['evidence = ["disk_image", "memory_dump", "logs"]', 'chain_of_custody = list(enumerate(evidence, 1))', 'print(chain_of_custody)']],
  ['인시던트 대응', '인시던트 대응은 보안 사고를 식별, 격리, 제거, 복구, 사후 분석하는 절차입니다. 미리 역할과 플레이북을 정해 두면 사고 중 혼란을 줄일 수 있습니다.', '화재가 났을 때 신고, 대피, 진화, 복구, 원인 조사를 순서대로 진행하는 소방 절차와 같습니다. 즉흥 대응만으로는 늦습니다.', ['steps = ["identify", "contain", "eradicate", "recover", "learn"]', 'print(" -> ".join(steps))']],
  ['사이버 킬 체인', '사이버 킬 체인은 공격자가 정찰부터 목표 달성까지 거치는 단계를 설명하는 모델입니다. 각 단계에서 탐지와 차단 지점을 설계할 수 있습니다.', '도둑이 사전 답사, 침입 도구 준비, 침입, 물건 운반을 거치는 과정을 단계별로 나눈 지도와 같습니다. 어느 단계든 끊으면 피해를 줄일 수 있습니다.', ['chain = ["recon", "weaponize", "deliver", "exploit", "act"]', 'print(chain.index("exploit"))']],
  ['MITRE ATT&CK', 'MITRE ATT&CK는 실제 공격자 전술과 기법을 체계적으로 정리한 지식 베이스입니다. 탐지 룰, 위협 헌팅, 보안 통제 검토에 공통 언어를 제공합니다.', '축구 상대팀의 전술 노트를 포지션과 패턴별로 정리한 분석집과 같습니다. 어떤 움직임을 막아야 하는지 구체적으로 볼 수 있습니다.', ['technique = {"id": "T1059", "name": "Command and Scripting Interpreter"}', 'print(technique["id"])']],
  ['피싱 공격', '피싱 공격은 신뢰할 수 있는 사람이나 기관으로 가장해 사용자의 비밀번호, 금융정보, 실행 행동을 유도하는 공격입니다. 링크 확인, 다단계 인증, 교육이 방어에 중요합니다.', '가짜 택배 문자를 보내 현관 비밀번호를 입력하게 만드는 속임수와 같습니다. 겉모습은 익숙하지만 목적지가 다릅니다.', ['email = {"from": "support@example.com", "link": "http://fake.test"}', 'suspicious = not email["link"].startswith("https://")', 'print(suspicious)']],
  ['소셜 엔지니어링', '소셜 엔지니어링은 기술 취약점보다 사람의 신뢰, 호기심, 압박감, 실수를 이용하는 공격입니다. 절차 검증과 보안 문화가 방어의 핵심입니다.', '유니폼을 입고 급한 척하며 직원 전용문을 열어 달라고 부탁하는 사람과 같습니다. 자물쇠보다 사람의 판단을 노립니다.', ['request = {"urgent": True, "verified": False}', 'print("deny" if request["urgent"] and not request["verified"] else "allow")']],
  ['랜섬웨어', '랜섬웨어는 파일이나 시스템을 암호화하거나 접근을 막고 금전을 요구하는 악성코드입니다. 백업, 권한 제한, 탐지, 복구 훈련이 피해를 줄입니다.', '창고 문을 납치범이 새 자물쇠로 잠그고 열쇠값을 요구하는 상황과 같습니다. 별도 창고에 복사본이 있으면 협상력이 달라집니다.', ['has_backup = True', 'encrypted = True', 'print("restore" if encrypted and has_backup else "crisis")']],
  ['APT 공격', 'APT 공격은 충분한 자원과 시간을 가진 공격자가 특정 조직을 장기간 지속적으로 노리는 공격입니다. 단발성 차단보다 탐지, 위협 인텔리전스, 장기 모니터링이 필요합니다.', '도둑이 하루에 담을 넘는 것이 아니라 몇 달 동안 경비 교대와 출입 습관을 관찰하는 상황과 같습니다. 끈질긴 맞춤형 공격입니다.', ['signals = ["low_noise_login", "rare_tool", "data_stage"]', 'print(len(signals) >= 3)']],
  ['DDoS 방어', 'DDoS 방어는 대량 트래픽으로 서비스를 마비시키려는 분산 공격을 흡수하거나 차단하는 전략입니다. CDN, 레이트 리밋, 트래픽 필터링, 오토스케일링이 사용됩니다.', '가게 입구에 한꺼번에 몰려든 가짜 손님들 때문에 진짜 손님이 못 들어오는 상황을 줄 세우기와 보안문으로 관리하는 것과 같습니다.', ['requests_per_ip = {"1.1.1.1": 500, "2.2.2.2": 5}', 'blocked = [ip for ip, n in requests_per_ip.items() if n > 100]', 'print(blocked)']],
  ['봇넷', '봇넷은 악성코드에 감염된 여러 기기가 공격자의 명령을 받아 함께 움직이는 네트워크입니다. DDoS, 스팸, 크리덴셜 스터핑 등에 악용됩니다.', '도둑이 남의 집 우편함 열쇠를 몰래 모아 여러 사람에게 동시에 전단지를 뿌리게 하는 것과 같습니다. 감염된 기기가 조종됩니다.', ['bots = ["pc1", "camera7", "router3"]', 'command = "send traffic"', 'print([(b, command) for b in bots])']],
  ['허니팟', '허니팟은 공격자를 유인하고 행동을 관찰하기 위해 의도적으로 노출한 미끼 시스템입니다. 실제 자산을 보호하면서 공격 기법과 지표를 수집할 수 있습니다.', '도둑을 잡기 위해 귀중품처럼 보이는 가짜 금고에 센서를 달아 두는 것과 같습니다. 진짜 금고가 아니라 관찰용 미끼입니다.', ['connections = [{"ip": "9.9.9.9", "target": "honeypot"}]', 'print([c["ip"] for c in connections if c["target"] == "honeypot"])']],
  ['침해 지표(IOC)', '침해 지표는 공격이나 침해를 의심하게 하는 IP, 도메인, 파일 해시, 프로세스명, 로그 패턴 같은 단서입니다. 탐지 룰과 위협 헌팅에 사용됩니다.', '범죄 현장 주변의 특정 신발자국이나 차량 번호처럼 사건과 연결될 수 있는 흔적과 같습니다. 단서 하나만으로 단정하지 않고 맥락을 봅니다.', ['ioc_hashes = {"abc123"}', 'file_hash = "abc123"', 'print(file_hash in ioc_hashes)']],
  ['암호화 키 관리', '암호화 키 관리는 키 생성, 저장, 회전, 접근 제어, 폐기를 안전하게 수행하는 활동입니다. 강한 암호화도 키가 노출되면 보호 효과를 잃습니다.', '금고가 아무리 튼튼해도 열쇠를 현관 매트 밑에 두면 소용없는 것과 같습니다. 열쇠의 보관과 교체가 핵심입니다.', ['keys = {"active": "k2", "old": "k1"}', 'print(keys["active"])']],
  ['HSM(하드웨어 보안 모듈)', 'HSM은 암호화 키를 안전한 하드웨어 안에서 생성하고 보관하며 암호 연산을 수행하는 장치입니다. 키가 일반 서버 메모리로 직접 노출되지 않도록 돕습니다.', '열쇠가 밖으로 나오지 않는 특수 금고 안에서만 문서에 도장을 찍어 주는 장치와 같습니다. 열쇠 자체를 꺼내 주지 않습니다.', ['hsm = {"key_exportable": False, "can_sign": True}', 'print(hsm["can_sign"] and not hsm["key_exportable"])']],
  ['키 에스크로', '키 에스크로는 암호화 키나 복구 키를 신뢰된 제3자나 안전한 절차에 맡겨 필요 시 복구할 수 있게 하는 방식입니다. 편의와 프라이버시, 오남용 위험의 균형이 필요합니다.', '아파트 예비 열쇠를 관리사무소 금고에 맡겨 두는 것과 같습니다. 잃어버렸을 때 도움 되지만 금고 관리가 허술하면 위험합니다.', ['escrow = {"stored": True, "approvals_required": 2}', 'print(escrow["stored"] and escrow["approvals_required"] >= 2)']],
  ['코드 서명', '코드 서명은 소프트웨어에 디지털 서명을 붙여 배포자가 누구인지와 코드가 변조되지 않았는지 확인하게 하는 기술입니다. 사용자는 신뢰된 서명으로 실행 여부를 판단할 수 있습니다.', '택배 상자에 봉인 스티커와 발송자 도장이 있어 중간에 열렸는지 확인하는 것과 같습니다. 누가 보냈는지도 함께 확인합니다.', ['package = {"signed_by": "trusted", "hash_ok": True}', 'print(package["signed_by"] == "trusted" and package["hash_ok"])']],
  ['바이너리 분석', '바이너리 분석은 실행 파일의 구조와 동작을 살펴 취약점, 악성 행위, 내부 로직을 파악하는 작업입니다. 정적 분석과 동적 분석을 함께 사용할 수 있습니다.', '분해 설명서가 없는 기계를 겉과 내부 부품을 보며 어떤 기능을 하는지 알아내는 작업과 같습니다. 실행하지 않고 볼 수도 있고 직접 돌려 볼 수도 있습니다.', ['binary = b"\\x7fELF...."', 'print(binary.startswith(b"\\x7fELF"))']],
  ['리버스 엔지니어링', '리버스 엔지니어링은 완성된 소프트웨어나 장치를 분석해 내부 구조와 동작 원리를 추론하는 작업입니다. 보안 분석, 호환성, 악성코드 조사에 활용됩니다.', '완성된 시계를 분해해 톱니바퀴 배열과 작동 원리를 알아내는 것과 같습니다. 설계도를 받지 않고 결과물에서 원리를 추적합니다.', ['observed_inputs = [1, 2, 3]', 'observed_outputs = [2, 4, 6]', 'rule = "x*2" if all(o == i*2 for i, o in zip(observed_inputs, observed_outputs)) else "unknown"', 'print(rule)']],
  ['메모리 안전성', '메모리 안전성은 프로그램이 할당된 메모리 범위를 벗어나 읽거나 쓰지 않고, 해제된 메모리를 잘못 사용하지 않는 성질입니다. Rust 같은 언어와 런타임 검사가 이를 강화합니다.', '호텔 객실 키가 자기 방만 열 수 있고 이미 반납한 방에는 들어갈 수 없게 하는 규칙과 같습니다. 잘못된 방 접근이 막혀야 합니다.', ['arr = [1, 2, 3]', 'i = 2', 'print(arr[i] if 0 <= i < len(arr) else "blocked")']],
  ['버퍼 오버플로', '버퍼 오버플로는 고정된 크기의 메모리 공간에 허용량보다 많은 데이터를 써서 인접 메모리를 덮어쓰는 취약점입니다. 길이 검사와 안전한 언어 사용으로 줄일 수 있습니다.', '작은 컵에 물을 계속 부어 넘친 물이 옆 서류를 적시는 상황과 같습니다. 용량을 확인하지 않으면 주변까지 망가집니다.', ['buf_size = 5', 'data = "abcdef"', 'print("reject" if len(data) > buf_size else "copy")']],
  ['힙 스프레이', '힙 스프레이는 공격자가 메모리 힙에 특정 패턴을 대량 배치해 취약점 악용 성공 확률을 높이는 기법입니다. 현대 방어는 ASLR, DEP, 샌드박스 등으로 난이도를 높입니다.', '넓은 들판에 같은 표식을 잔뜩 깔아 어디로 떨어져도 표식에 닿게 만드는 전략과 비슷합니다. 방어자는 배치 예측을 어렵게 만듭니다.', ['heap_blocks = ["marker"] * 5', 'print(heap_blocks.count("marker"))']],
  ['형식 문자열 취약점', '형식 문자열 취약점은 사용자 입력이 printf 같은 형식 문자열로 잘못 사용되어 메모리 읽기나 쓰기 문제가 생기는 취약점입니다. 입력은 형식이 아니라 데이터로 다뤄야 합니다.', '손님 이름을 명찰 칸에 적어야 하는데 인쇄기 명령어로 해석해 버리는 상황과 같습니다. 이름과 명령 양식을 분리해야 합니다.', ['name = "%s%s"', 'safe = "Hello, {}".format(name)', 'print(safe)']],
  ['경쟁 조건(Race Condition)', '경쟁 조건은 여러 실행 흐름이 공유 자원에 접근하는 순서에 따라 결과가 달라지는 문제입니다. 잠금, 트랜잭션, 원자적 연산으로 줄일 수 있습니다.', '두 직원이 같은 재고 숫자를 동시에 보고 각자 1개씩 빼서 적으면 실제보다 하나만 빠진 것처럼 기록될 수 있는 상황과 같습니다.', ['stock = 1', 'can_buy = stock > 0', 'if can_buy:', '    stock -= 1', 'print(stock)']],
  ['TOCTOU', 'TOCTOU는 검사한 시점과 사용한 시점 사이에 상태가 바뀌어 보안 문제가 생기는 경쟁 조건입니다. 파일 권한 확인 후 열기 전 교체되는 경우가 대표적입니다.', '문 앞에서 손님의 티켓을 확인했는데 입장문까지 걸어가는 사이 다른 사람이 티켓을 바꿔치기하는 상황과 같습니다.', ['checked_owner = "alice"', 'current_owner = "bob"', 'print("recheck" if checked_owner != current_owner else "use")']],
  ['샌드박스', '샌드박스는 프로그램을 제한된 환경 안에서 실행해 파일, 네트워크, 프로세스 접근을 통제하는 격리 기법입니다. 신뢰할 수 없는 코드 실행 위험을 줄입니다.', '아이들이 모래놀이를 정해진 모래판 안에서만 하게 해 집 전체에 모래가 퍼지지 않게 하는 것과 같습니다. 놀 수는 있지만 경계가 있습니다.', ['permissions = {"read_tmp": True, "read_home": False}', 'print(permissions["read_tmp"] and not permissions["read_home"])']],
  ['격리 실행', '격리 실행은 코드나 서비스를 별도 프로세스, VM, 컨테이너, 권한 영역에서 실행해 서로 영향을 줄이는 방식입니다. 장애와 침해가 전체 시스템으로 번지는 것을 막습니다.', '실험실에서 위험한 화학 실험을 별도 후드 안에서 진행하는 것과 같습니다. 문제가 생겨도 다른 방으로 퍼지지 않게 합니다.', ['tasks = {"trusted": "main", "untrusted": "isolated"}', 'print(tasks["untrusted"])']],
  ['컨테이너 탈출', '컨테이너 탈출은 컨테이너 내부에서 호스트나 다른 컨테이너 영역으로 권한을 벗어나는 공격입니다. 런타임 취약점, 과도한 권한, 민감한 마운트가 원인이 될 수 있습니다.', '임시 작업실 안에 있어야 할 사람이 잠금이 허술한 문을 통해 건물 관리실까지 들어가는 상황과 같습니다. 컨테이너 경계가 깨진 것입니다.', ['container = {"privileged": False, "host_mount": False}', 'print("lower risk" if not container["privileged"] and not container["host_mount"] else "risky")']],
  ['권한 상승(Linux)', '권한 상승은 낮은 권한의 사용자가 취약점이나 설정 실수를 이용해 더 높은 권한을 얻는 공격입니다. Linux에서는 SUID, sudo 설정, 커널 취약점 등이 주요 점검 대상입니다.', '일반 출입증을 가진 사람이 관리자의 마스터키를 얻어 제한 구역까지 들어가는 상황과 같습니다. 작은 권한이 큰 권한으로 바뀝니다.', ['user = {"sudo": False, "uid": 1000}', 'print("root" if user["uid"] == 0 else "limited")']],
  ['Capabilities', 'Capabilities는 Linux에서 root 권한을 작은 권한 단위로 나누어 프로세스에 부여하는 기능입니다. 필요한 권한만 부여하면 전체 root 권한 노출을 줄일 수 있습니다.', '직원에게 건물 전체 마스터키 대신 서버실 문만 여는 키를 주는 것과 같습니다. 필요한 문만 열 수 있게 세분화합니다.', ['caps = {"CAP_NET_BIND_SERVICE"}', 'print("CAP_SYS_ADMIN" in caps)']],
  ['SELinux', 'SELinux는 Linux에서 강제 접근 제어 정책을 적용해 프로세스와 파일의 접근을 세밀하게 제한하는 보안 모듈입니다. 전통적인 사용자 권한을 넘어 정책 기반 통제를 제공합니다.', '회사 규정상 직원 직급이 높아도 특정 문서실은 업무 라벨이 맞아야 들어갈 수 있는 구조와 같습니다. 신분과 정책을 함께 봅니다.', ['context = {"process": "web_t", "file": "httpd_sys_content_t"}', 'print(context["process"].startswith("web"))']],
  ['AppArmor', 'AppArmor는 프로그램별 프로파일로 파일, 네트워크, 권한 접근을 제한하는 Linux 보안 모듈입니다. 경로 기반 정책으로 애플리케이션이 할 수 있는 일을 좁힙니다.', '각 직원에게 업무별 허용 구역 목록을 적은 출입 카드를 주는 것과 같습니다. 카드에 없는 방은 들어갈 수 없습니다.', ['profile = {"allow": ["/var/www", "/tmp/app"]}', 'path = "/etc/shadow"', 'print(any(path.startswith(p) for p in profile["allow"]))']],
  ['보안 기준선(Hardening)', '보안 기준선은 시스템을 안전한 기본 상태로 만들기 위한 설정과 통제의 묶음입니다. 불필요한 서비스 제거, 권한 최소화, 로깅, 패치 적용 등이 포함됩니다.', '새 집에 입주할 때 기본 비밀번호를 바꾸고 창문 잠금장치를 확인하며 필요 없는 출입문을 막는 점검과 같습니다.', ['baseline = {"ssh_root_login": False, "firewall": True, "patched": True}', 'print(all(baseline.values()) if False else baseline["firewall"] and baseline["patched"] and not baseline["ssh_root_login"])']],
  ['CIS Benchmark', 'CIS Benchmark는 운영체제, 클라우드, 데이터베이스, 애플리케이션에 대한 보안 설정 권고 기준입니다. 조직은 이를 기준으로 하드닝과 감사 자동화를 수행할 수 있습니다.', '차량 정기검사표처럼 제조사와 모델별로 확인해야 할 안전 항목이 정리된 표와 같습니다. 점검 결과를 기준과 비교합니다.', ['checks = {"password_policy": True, "unused_services_disabled": False}', 'failed = [k for k, ok in checks.items() if not ok]', 'print(failed)']],
  ['스테가노그래피', '스테가노그래피는 메시지의 존재 자체를 숨기기 위해 이미지, 오디오, 문서 같은 매체 안에 정보를 감추는 기법입니다. 암호화가 내용을 숨긴다면 스테가노그래피는 존재를 숨기는 데 초점을 둡니다.', '평범한 엽서 그림 속 특정 점 배열에 비밀 약속을 숨기는 것과 같습니다. 남들이 보기에는 그냥 그림입니다.', ['pixels = [120, 121, 118]', 'hidden_bits = [p & 1 for p in pixels]', 'print(hidden_bits)']],
  ['타이밍 공격(Timing Attack)', '타이밍 공격은 연산에 걸리는 시간 차이를 관찰해 비밀 정보의 일부를 추론하는 사이드 채널 공격입니다. 비밀번호 비교나 암호 연산은 상수 시간 처리가 필요할 수 있습니다.', '금고 번호를 누를 때 맞는 자리마다 관리자가 아주 잠깐 멈추는 습관을 보고 번호를 추측하는 것과 같습니다. 결과가 아니라 시간 차이를 봅니다.', ['import hmac', 'a = "secret"', 'b = "secret"', 'print(hmac.compare_digest(a, b))']],
  ['사이드 채널 공격', '사이드 채널 공격은 알고리즘 결과가 아니라 시간, 전력, 소리, 캐시 사용 같은 부가 정보를 이용해 비밀을 추론하는 공격입니다. 구현과 실행 환경의 정보 누출을 줄여야 합니다.', '상자 안을 직접 보지 않고 무게, 흔들리는 소리, 냄새로 내용물을 추측하는 것과 같습니다. 공식 출력 밖의 단서가 새어 나갑니다.', ['observations = {"time_ms": 12, "power": 3.4}', 'print(observations.keys())']],
  ['전력 분석 공격', '전력 분석 공격은 장치가 암호 연산을 수행할 때 소비 전력 패턴을 측정해 키나 내부 연산을 추론하는 공격입니다. 스마트카드와 임베디드 장치 보안에서 중요합니다.', '기계 안을 보지 않고 전기 계량기 바늘 움직임만 보고 어떤 작업을 하는지 짐작하는 것과 같습니다. 전력 흔적이 정보가 됩니다.', ['power_trace = [1.0, 1.2, 0.9, 1.5]', 'print(max(power_trace) - min(power_trace))']],
  ['내부자 위협(Insider Threat)', '내부자 위협은 조직 내부 권한을 가진 사람이 고의 또는 실수로 보안을 해치는 위험입니다. 최소 권한, 감사 로그, 직무 분리, 이상 행위 탐지가 필요합니다.', '가게 열쇠를 가진 직원이 실수로 문을 열어 두거나 일부러 물건을 빼돌리는 상황과 같습니다. 외부 침입자만 위험한 것은 아닙니다.', ['access = {"user": "staff1", "downloads": 500}', 'print("review" if access["downloads"] > 100 else "ok")']],
  ['디지털 포렌식 기법', '디지털 포렌식 기법은 디스크 이미지 분석, 메모리 분석, 로그 타임라인, 파일 복구, 네트워크 흔적 분석 등을 포함합니다. 증거 보존과 재현 가능한 분석 절차가 중요합니다.', '사건 현장의 사진, 지문, CCTV 시간을 맞춰 전체 이동 경로를 복원하는 수사와 같습니다. 조각 단서를 시간순으로 연결합니다.', ['artifacts = ["disk", "memory", "network", "logs"]', 'timeline = sorted(["10:02 login", "10:05 download"])', 'print(artifacts, timeline)']],
  ['취약점 공개 정책(Responsible Disclosure)', '취약점 공개 정책은 연구자가 취약점을 발견했을 때 조직에 안전하게 신고하고, 패치 전 공개로 인한 피해를 줄이도록 정한 절차입니다. 신고 채널, 일정, 보상, 공개 조건을 명확히 합니다.', '건물 균열을 발견한 사람이 바로 SNS에 올리기보다 관리사무소에 먼저 알려 보수 시간을 주는 절차와 같습니다. 공익과 피해 최소화의 균형입니다.', ['policy = {"contact": "security@example.com", "embargo_days": 90}', 'print(policy["contact"], policy["embargo_days"])']]
];

if (rows.length !== 70) {
  throw new Error(`Expected 70 rows, got ${rows.length}`);
}

const data = rows.map(([term, definition, analogy, code], index) => {
  const planned = plan[index];
  if (!planned || planned.term !== term) {
    throw new Error(`Plan mismatch at ${index}: expected ${planned && planned.term}, got ${term}`);
  }
  return {
    id: String(1191 + index).padStart(3, '0'),
    term,
    category: '보안',
    difficulty: index < 10 ? 'easy' : index < 49 ? 'medium' : 'hard',
    phase: 4,
    week: 18,
    definition,
    hint: term.replace(/\(.+\)/, '').trim(),
    detail: {
      easy: `${term}은 시스템의 위험을 줄이고 사고를 예방하거나 대응하기 위한 보안 개념입니다.`,
      analogy,
      example: example(term, code),
      tip: `${term}을 다룰 때는 공격 가능성, 영향도, 탐지 가능성, 완화책을 함께 검토하세요.`
    }
  };
});

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'terms.week18.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('wrote data/terms.week18.json');

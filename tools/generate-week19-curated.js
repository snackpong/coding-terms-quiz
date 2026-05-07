'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const plan = require('./term-bank-plan.json').filter((item) => item.week === 19);

function example(term, lines) {
  return [`# ${term} 예시: Python 3에서 실행 가능한 코드`, ...lines].join('\n');
}

const rows = [
  ['DevOps 문화', 'DevOps 문화는 개발과 운영이 분리된 책임을 넘어서 함께 빠르고 안정적인 배포와 운영을 목표로 협력하는 방식입니다. 자동화, 측정, 공유 책임, 지속적 개선이 핵심입니다.', '주방과 홀 직원이 서로 탓하지 않고 주문부터 서빙까지 같은 목표로 움직이는 식당과 같습니다. 한쪽만 빨라도 전체 경험은 좋아지지 않습니다.', ['teams = {"dev": "build", "ops": "run"}', 'shared_goal = "reliable delivery"', 'print(shared_goal, list(teams.keys()))']],
  ['SRE(사이트 신뢰성 엔지니어링)', 'SRE는 소프트웨어 엔지니어링 방법으로 운영 문제를 해결해 서비스 신뢰성을 관리하는 접근입니다. SLO, 에러 예산, 자동화, 포스트모템을 통해 안정성과 출시 속도의 균형을 맞춥니다.', '교통 관제사가 도로를 직접 수리할 뿐 아니라 신호 시스템을 자동화해 사고를 줄이는 역할과 같습니다. 운영을 반복 노동이 아니라 엔지니어링 문제로 봅니다.', ['availability = 99.9', 'automation = True', 'print(availability, automation)']],
  ['에러 예산(Error Budget)', '에러 예산은 목표 신뢰도에서 허용되는 실패량입니다. 예산이 남아 있으면 출시 속도를 유지하고, 소진되면 안정화와 장애 예방에 집중하는 의사결정 기준이 됩니다.', '한 달에 허용되는 지각 횟수와 같습니다. 여유가 있으면 새로운 시도를 할 수 있지만 모두 쓰면 생활 패턴을 고쳐야 합니다.', ['slo = 99.9', 'actual = 99.95', 'print("budget left" if actual >= slo else "freeze changes")']],
  ['변경 실패율', '변경 실패율은 배포나 변경 중 장애, 롤백, 긴급 수정으로 이어진 비율입니다. 배포 품질과 위험도를 보는 DORA 지표 중 하나입니다.', '새 메뉴를 낼 때 손님 불만으로 바로 내린 메뉴의 비율과 같습니다. 자주 실패한다면 출시 절차를 점검해야 합니다.', ['changes = 20', 'failed = 2', 'print(failed / changes)']],
  ['배포 빈도', '배포 빈도는 일정 기간 동안 프로덕션에 변경을 배포하는 횟수입니다. 빈도가 높다고 항상 좋은 것은 아니지만 작은 변경을 자주 안전하게 내보내는 능력을 보여 줍니다.', '택배를 한 달에 한 번 몰아 보내는지 매일 조금씩 보내는지의 차이와 같습니다. 자주 보내려면 포장과 검수 절차가 안정적이어야 합니다.', ['deploys_this_week = [1, 0, 2, 1, 1]', 'print(sum(deploys_this_week))']],
  ['복구 시간(MTTR)', '복구 시간은 장애가 발생한 뒤 정상 상태로 회복하는 데 걸린 평균 시간입니다. 빠른 탐지, 롤백, 자동화된 복구 절차가 MTTR을 줄입니다.', '정전이 난 뒤 다시 불이 켜질 때까지 걸리는 시간과 같습니다. 고장이 나지 않는 것도 중요하지만 빨리 회복하는 능력도 중요합니다.', ['incidents = [12, 30, 18]', 'print(sum(incidents) / len(incidents))']],
  ['지속적 통합(CI)', '지속적 통합은 코드 변경을 자주 병합하고 자동 빌드와 테스트로 문제를 빠르게 발견하는 개발 방식입니다. 큰 통합 충돌을 줄이고 품질 피드백을 앞당깁니다.', '여러 사람이 퍼즐을 각자 오래 숨겨 두지 않고 조금씩 맞춰 보며 맞지 않는 조각을 바로 찾는 것과 같습니다.', ['checks = ["lint", "unit", "build"]', 'print(all(checks))']],
  ['지속적 전달(CD)', '지속적 전달은 언제든 배포 가능한 상태로 소프트웨어를 준비하는 자동화된 릴리스 방식입니다. 배포 결정은 사람이 할 수 있지만 빌드, 테스트, 패키징은 자동화됩니다.', '빵을 항상 포장까지 끝내 두고 매장 진열 여부만 매니저가 결정하는 제과점과 같습니다. 내보낼 준비가 늘 되어 있습니다.', ['pipeline_ok = True', 'manual_approval = False', 'print("ready" if pipeline_ok else "blocked")']],
  ['지속적 배포(CD 심화)', '지속적 배포는 자동화된 검증을 통과한 변경을 사람 승인 없이 프로덕션까지 자동 배포하는 방식입니다. 테스트와 모니터링 신뢰도가 높아야 안전하게 운영할 수 있습니다.', '검수대를 통과한 상품이 자동으로 진열대에 올라가는 물류 라인과 같습니다. 검수 기준이 허술하면 문제가 바로 손님에게 갑니다.', ['tests_passed = True', 'deploy = tests_passed', 'print(deploy)']],
  ['파이프라인 스테이지', '파이프라인 스테이지는 CI/CD 흐름을 빌드, 테스트, 보안 검사, 배포 같은 단계로 나눈 단위입니다. 단계별 성공 여부가 다음 단계 실행을 결정합니다.', '공항 수속에서 발권, 보안 검색, 탑승이 순서대로 진행되는 것과 같습니다. 앞 단계가 실패하면 다음 단계로 갈 수 없습니다.', ['stages = ["build", "test", "deploy"]', 'for stage in stages:', '    print(stage)']],
  ['빌드 스테이지', '빌드 스테이지는 소스 코드를 실행 가능한 바이너리, 번들, 컨테이너 이미지 같은 산출물로 만드는 단계입니다. 재현 가능한 빌드는 배포 안정성의 기본입니다.', '재료를 모아 판매 가능한 도시락으로 포장하는 조리 단계와 같습니다. 같은 재료와 레시피로 같은 결과가 나와야 합니다.', ['source_files = ["app.py", "lib.py"]', 'artifact = "app.tar" if source_files else None', 'print(artifact)']],
  ['테스트 스테이지', '테스트 스테이지는 자동화된 단위, 통합, E2E, 보안 테스트로 변경의 품질을 확인하는 단계입니다. 실패를 빠르게 발견해 잘못된 배포를 막습니다.', '출고 전 제품을 흔들고 눌러 불량을 찾는 품질 검사대와 같습니다. 문제가 있으면 창고 밖으로 나가지 않습니다.', ['tests = {"unit": True, "integration": True, "e2e": False}', 'print(all(tests.values()))']],
  ['배포 스테이지', '배포 스테이지는 검증된 산출물을 실제 실행 환경에 반영하는 단계입니다. 롤링, 카나리, 블루-그린 같은 전략으로 위험을 조절합니다.', '완성된 책을 인쇄소에서 서점 진열대로 옮기는 마지막 물류 단계와 같습니다. 옮기는 방식에 따라 독자에게 미치는 위험이 달라집니다.', ['artifact = "app:v2"', 'environment = "prod"', 'print(f"deploy {artifact} to {environment}")']],
  ['GitHub Actions', 'GitHub Actions는 GitHub 저장소 이벤트에 반응해 워크플로를 실행하는 CI/CD 자동화 서비스입니다. push, pull request, schedule 같은 트리거로 빌드와 테스트를 자동화합니다.', '창고 문이 열리거나 새 주문서가 들어오면 자동으로 작업 지시가 내려가는 작업장과 같습니다. 저장소 이벤트가 실행 신호입니다.', ['event = "push"', 'workflow = "ci.yml"', 'print(event, "runs", workflow)']],
  ['GitLab CI', 'GitLab CI는 GitLab 저장소와 통합된 CI/CD 기능으로 `.gitlab-ci.yml`에 정의한 잡과 스테이지를 실행합니다. 코드 관리와 파이프라인 운영을 한 플랫폼에서 다룰 수 있습니다.', '공장 사무실과 생산 라인이 같은 건물에 있어 주문서가 바로 작업 지시로 이어지는 구조와 같습니다.', ['stages = ["build", "test"]', 'jobs = {"unit": "test"}', 'print(jobs["unit"] in stages)']],
  ['Jenkins', 'Jenkins는 플러그인 생태계가 큰 오픈소스 자동화 서버입니다. 다양한 환경의 빌드, 테스트, 배포 파이프라인을 구성할 수 있지만 운영 관리가 필요합니다.', '도구가 잔뜩 있는 오래된 공방과 같습니다. 무엇이든 만들 수 있지만 정리와 유지보수를 꾸준히 해야 합니다.', ['plugins = ["git", "docker", "slack"]', 'print("docker" in plugins)']],
  ['아티팩트(Artifact)', '아티팩트는 빌드 결과로 생성되어 저장, 전달, 배포되는 산출물입니다. 바이너리, 패키지, 테스트 리포트, 컨테이너 이미지 등이 포함됩니다.', '공장에서 만들어진 완제품 상자와 같습니다. 다음 단계는 원재료가 아니라 이 상자를 받아 검사하거나 배송합니다.', ['artifact = {"name": "app", "version": "1.2.0"}', 'print(artifact["name"], artifact["version"])']],
  ['컨테이너 레지스트리', '컨테이너 레지스트리는 컨테이너 이미지를 저장하고 버전 태그로 배포 대상이 가져갈 수 있게 하는 저장소입니다. Docker Hub, GHCR, ECR 같은 서비스가 예입니다.', '냉동식품 창고에 제품별 라벨과 유통기한을 붙여 보관하는 것과 같습니다. 배포 서버는 필요한 이미지를 창고에서 꺼냅니다.', ['registry = {"app:1.0": "sha256:abc"}', 'print(registry.get("app:1.0"))']],
  ['Docker 기초', 'Docker는 애플리케이션과 실행에 필요한 파일을 컨테이너 이미지로 포장하고 격리된 프로세스로 실행하는 도구입니다. 환경 차이를 줄이고 배포 단위를 표준화합니다.', '요리 재료와 조리도구를 이동식 주방 박스에 담아 어디서든 같은 방식으로 요리하게 하는 것과 같습니다.', ['image = "python:3.12"', 'command = "python app.py"', 'print(image, command)']],
  ['Dockerfile', 'Dockerfile은 컨테이너 이미지를 만들기 위한 명령을 순서대로 적은 파일입니다. 베이스 이미지, 파일 복사, 의존성 설치, 실행 명령을 재현 가능하게 정의합니다.', '이동식 주방 박스를 만드는 조립 설명서와 같습니다. 어떤 선반을 넣고 어떤 재료를 담을지 순서대로 적습니다.', ['dockerfile = ["FROM python:3.12", "COPY . /app", "CMD python app.py"]', 'print("\\n".join(dockerfile))']],
  ['도커 레이어', '도커 레이어는 이미지 빌드 명령마다 쌓이는 변경 단위입니다. 캐시와 재사용을 통해 빌드 속도를 높이지만 불필요한 레이어는 이미지 크기를 키울 수 있습니다.', '샌드위치를 빵, 치즈, 채소 순서로 쌓는 것과 같습니다. 아래층이 바뀌면 위층도 다시 만들어야 합니다.', ['layers = ["base", "deps", "app"]', 'print(layers[-1])']],
  ['멀티 스테이지 빌드', '멀티 스테이지 빌드는 빌드용 환경과 실행용 이미지를 분리해 최종 이미지에 필요한 파일만 남기는 Dockerfile 기법입니다. 이미지 크기와 공격 표면을 줄입니다.', '공장에서 큰 장비로 제품을 만든 뒤 배송 상자에는 완제품만 넣고 장비는 빼는 것과 같습니다.', ['build_files = ["compiler", "app.bin"]', 'runtime_files = [f for f in build_files if f.endswith(".bin")]', 'print(runtime_files)']],
  ['도커 컴포즈', '도커 컴포즈는 여러 컨테이너 서비스를 하나의 설정 파일로 정의하고 함께 실행하는 도구입니다. 로컬 개발 환경에서 앱, DB, 캐시를 묶어 띄우는 데 자주 사용됩니다.', '밴드 공연에서 보컬, 기타, 드럼을 한 공연표로 함께 부르는 것과 같습니다. 각 파트는 다르지만 한 무대로 실행됩니다.', ['services = {"web": 1, "db": 1, "redis": 1}', 'print(list(services))']],
  ['쿠버네티스(K8s) 개요', '쿠버네티스는 컨테이너화된 애플리케이션의 배포, 확장, 복구, 네트워킹을 자동화하는 오케스트레이션 플랫폼입니다. 선언한 원하는 상태를 유지하도록 클러스터를 조정합니다.', '항구 관제 시스템이 여러 컨테이너를 어느 배와 창고에 둘지 자동으로 배치하고 문제가 생기면 다시 옮기는 것과 같습니다.', ['desired_replicas = 3', 'running = 2', 'print("create pod" if running < desired_replicas else "ok")']],
  ['Pod', 'Pod는 쿠버네티스에서 하나 이상의 컨테이너를 함께 배치하고 네트워크와 저장소를 공유하는 최소 실행 단위입니다. 보통 애플리케이션 컨테이너와 보조 컨테이너가 한 Pod 안에 들어갑니다.', '같은 방을 쓰는 작은 작업팀과 같습니다. 팀원은 각자 일을 하지만 주소와 일부 도구를 공유합니다.', ['pod = {"containers": ["app", "sidecar"], "ip": "10.0.0.5"}', 'print(pod["containers"])']],
  ['Deployment', 'Deployment는 쿠버네티스에서 Pod 복제본의 원하는 상태와 업데이트 전략을 관리하는 리소스입니다. 롤링 업데이트와 롤백을 통해 애플리케이션 배포를 안정적으로 수행합니다.', '매장 점장이 직원 몇 명이 근무해야 하는지와 교대 방식을 관리하는 것과 같습니다. 빠진 직원이 있으면 새 직원을 배치합니다.', ['deployment = {"image": "app:v2", "replicas": 3}', 'print(deployment["replicas"])']],
  ['Service(K8s)', 'Service는 쿠버네티스에서 동적으로 바뀌는 Pod 집합에 안정적인 네트워크 접근점을 제공하는 리소스입니다. 클라이언트는 개별 Pod IP가 아니라 Service 이름으로 접근합니다.', '직원이 바뀌어도 대표 전화번호는 그대로인 고객센터와 같습니다. 손님은 누가 받는지 몰라도 같은 번호로 연결됩니다.', ['pods = ["10.0.0.1", "10.0.0.2"]', 'service_name = "api.default"', 'print(service_name, "->", pods[0])']],
  ['Ingress', 'Ingress는 클러스터 외부 HTTP/HTTPS 요청을 내부 Service로 라우팅하는 쿠버네티스 리소스입니다. 도메인, 경로, TLS 설정을 중앙에서 관리합니다.', '건물 안내 데스크가 방문 목적지와 층을 보고 적절한 사무실로 안내하는 것과 같습니다. 외부 요청의 입구 역할입니다.', ['rules = {"/api": "api-service", "/": "web-service"}', 'path = "/api/users"', 'target = rules["/api"] if path.startswith("/api") else rules["/"]', 'print(target)']],
  ['ConfigMap', 'ConfigMap은 쿠버네티스에서 비밀이 아닌 설정값을 Pod에 주입하기 위한 리소스입니다. 이미지 재빌드 없이 환경별 설정을 바꿀 수 있게 합니다.', '요리법은 그대로 두고 매장별 영업시간이나 안내 문구만 별도 메모로 붙이는 것과 같습니다.', ['config = {"LOG_LEVEL": "INFO", "FEATURE_X": "true"}', 'print(config["LOG_LEVEL"])']],
  ['Secret(K8s)', 'Secret은 비밀번호, 토큰, 인증서처럼 민감한 값을 쿠버네티스에서 관리하는 리소스입니다. 단순 저장만으로 충분하지 않으며 접근 제어와 암호화 설정이 중요합니다.', '직원 공지판이 아니라 잠긴 금고에 보관해야 하는 열쇠 봉투와 같습니다. 필요한 사람만 열 수 있어야 합니다.', ['secret_keys = {"DB_PASSWORD": "***"}', 'print("DB_PASSWORD" in secret_keys)']],
  ['Namespace', 'Namespace는 쿠버네티스 클러스터 안에서 리소스를 논리적으로 분리하는 범위입니다. 팀, 환경, 프로젝트별로 이름 충돌과 권한 범위를 나눌 수 있습니다.', '한 건물 안에서도 회사별 사무실 층을 나누어 문패와 출입 권한을 따로 관리하는 것과 같습니다.', ['resource = {"namespace": "staging", "name": "api"}', 'print(resource["namespace"] + "/" + resource["name"])']],
  ['롤링 업데이트', '롤링 업데이트는 기존 인스턴스를 한꺼번에 내리지 않고 일부씩 새 버전으로 교체하는 배포 방식입니다. 서비스 중단을 줄이지만 새 버전과 구버전이 잠시 공존합니다.', '버스 노선을 멈추지 않고 차량을 한 대씩 새 버스로 교체하는 것과 같습니다. 승객 서비스는 계속됩니다.', ['old, new = 3, 0', 'old -= 1; new += 1', 'print({"old": old, "new": new})']],
  ['카나리 배포', '카나리 배포는 새 버전을 일부 사용자나 트래픽에만 먼저 노출해 문제를 확인한 뒤 점진적으로 확대하는 전략입니다. 위험을 작게 시작해 관찰할 수 있습니다.', '새 메뉴를 모든 매장에 내기 전에 한 지점에서 소량 판매해 반응을 보는 것과 같습니다. 문제가 있으면 영향이 작습니다.', ['traffic = {"v1": 95, "v2": 5}', 'print(traffic["v2"])']],
  ['블루-그린 배포', '블루-그린 배포는 현재 운영 환경과 새 버전 환경을 별도로 준비한 뒤 트래픽을 한 번에 전환하는 배포 전략입니다. 빠른 롤백이 가능하지만 환경을 두 벌 유지해야 합니다.', '공연장을 하나 더 준비해 새 무대를 리허설한 뒤 관객 입구만 새 공연장으로 돌리는 것과 같습니다.', ['active = "blue"', 'ready = {"green": True}', 'active = "green" if ready["green"] else active', 'print(active)']],
  ['피처 플래그(Feature Flag)', '피처 플래그는 코드 배포와 기능 공개를 분리하기 위해 런타임 설정으로 기능을 켜고 끄는 기법입니다. 점진적 출시, 실험, 긴급 비활성화에 유용합니다.', '매장에 새 기계를 설치해 두되 스위치를 켠 지점에서만 사용하게 하는 것과 같습니다. 설치와 사용 시작을 분리합니다.', ['flags = {"new_checkout": False}', 'print("new" if flags["new_checkout"] else "old")']],
  ['A/B 테스트', 'A/B 테스트는 사용자 일부에게 서로 다른 버전을 보여 주고 지표 차이를 비교하는 실험 방법입니다. 기능이나 UI 변경의 실제 효과를 데이터로 판단합니다.', '두 가지 간판을 서로 다른 골목에 걸어 보고 어느 쪽이 손님을 더 많이 부르는지 비교하는 것과 같습니다.', ['visits = {"A": 100, "B": 100}', 'conversions = {"A": 8, "B": 11}', 'print({k: conversions[k]/visits[k] for k in visits})']],
  ['샤도우 트래픽', '샤도우 트래픽은 실제 사용자 요청을 새 시스템에도 복사해 보내되 응답은 사용자에게 사용하지 않는 검증 방식입니다. 새 버전의 성능과 오류를 실제 부하에서 안전하게 확인합니다.', '실제 주문서를 복사해 연습 주방에도 보내 보지만 손님에게는 기존 주방 음식만 내는 것과 같습니다. 새 주방은 몰래 시험됩니다.', ['request = {"id": 1}', 'primary = "respond"', 'shadow = request.copy()', 'print(primary, shadow["id"])']],
  ['모니터링 vs 옵저버빌리티', '모니터링은 미리 정한 지표와 알람을 보는 활동이고, 옵저버빌리티는 알 수 없는 문제도 내부 신호로 탐색할 수 있는 능력입니다. 메트릭, 로그, 트레이스가 함께 쓰입니다.', '모니터링이 자동차 계기판의 경고등이라면 옵저버빌리티는 정비사가 엔진 내부 원인까지 추적할 수 있는 진단 포트와 같습니다.', ['signals = {"metrics": True, "logs": True, "traces": True}', 'print(all(signals.values()))']],
  ['메트릭(Metric)', '메트릭은 시간에 따라 측정되는 숫자형 지표입니다. CPU 사용률, 요청 수, 오류율, 지연 시간처럼 추세와 임계값 알람에 적합합니다.', '매시간 기록하는 체온계 숫자와 같습니다. 한 줄 설명보다 숫자 변화가 상태 추세를 보여 줍니다.', ['metrics = {"requests": 120, "errors": 3}', 'print(metrics["errors"] / metrics["requests"])']],
  ['로그(Log)', '로그는 시스템에서 발생한 이벤트와 상태를 시간순으로 남긴 기록입니다. 디버깅, 감사, 사고 분석에 쓰이며 구조화된 로그가 검색과 분석에 유리합니다.', '가게 업무 일지처럼 누가 언제 무엇을 했는지 적어 두는 기록입니다. 문제가 생긴 뒤 되짚어 볼 단서가 됩니다.', ['log = {"level": "INFO", "event": "user_login", "user": "kim"}', 'print(log["event"])']],
  ['트레이스(Trace)', '트레이스는 하나의 요청이 여러 서비스와 단계를 지나간 경로와 시간을 기록한 정보입니다. 마이크로서비스 환경에서 느린 구간과 실패 위치를 찾는 데 중요합니다.', '택배가 집화, 허브, 지역 센터, 배송 기사까지 거친 이동 기록과 같습니다. 어디에서 오래 머물렀는지 알 수 있습니다.', ['trace = [("api", 20), ("db", 80), ("cache", 5)]', 'print(max(trace, key=lambda x: x[1]))']],
  ['분산 추적', '분산 추적은 여러 서비스에 걸친 요청 흐름을 trace id로 연결해 전체 호출 경로를 관찰하는 기법입니다. 서비스가 많을수록 장애 원인 분석에 필수적입니다.', '여러 환승역을 거친 여행자의 티켓 번호를 따라 전체 이동 경로를 복원하는 것과 같습니다. 각 역 기록을 하나로 묶습니다.', ['trace_id = "abc"', 'spans = [{"trace": trace_id, "svc": "api"}, {"trace": trace_id, "svc": "db"}]', 'print([s["svc"] for s in spans if s["trace"] == trace_id])']],
  ['Jaeger', 'Jaeger는 분산 추적 데이터를 수집하고 시각화하는 오픈소스 도구입니다. 요청의 span, 지연 시간, 서비스 간 호출 관계를 분석하는 데 사용됩니다.', '택배 배송 경로를 지도에 표시해 어느 물류센터에서 지연됐는지 보여 주는 관제 화면과 같습니다.', ['spans = [{"name": "api", "ms": 30}, {"name": "db", "ms": 90}]', 'print(sum(s["ms"] for s in spans))']],
  ['Prometheus', 'Prometheus는 시계열 메트릭을 수집하고 질의하며 알림을 만들 수 있는 모니터링 시스템입니다. pull 방식 수집과 PromQL을 특징으로 합니다.', '공장 기계마다 온도계를 붙이고 관제실이 주기적으로 숫자를 읽어 기록하는 시스템과 같습니다.', ['samples = [1, 2, 3, 5]', 'rate = samples[-1] - samples[-2]', 'print(rate)']],
  ['Grafana', 'Grafana는 메트릭, 로그, 트레이스 데이터를 대시보드로 시각화하는 도구입니다. 여러 데이터 소스를 연결해 운영 상태를 한 화면에서 볼 수 있게 합니다.', '비행기 조종석 계기판처럼 속도, 고도, 연료, 경고등을 한곳에 배치하는 화면과 같습니다.', ['panels = ["latency", "errors", "traffic"]', 'print("dashboard:", ", ".join(panels))']],
  ['알람 피로', '알람 피로는 너무 많은 알림이나 낮은 품질의 알림 때문에 운영자가 중요한 경고를 놓치게 되는 상태입니다. 알림은 행동 가능하고 우선순위가 명확해야 합니다.', '하루 종일 울리는 잡음 많은 초인종 때문에 진짜 비상벨도 무시하게 되는 상황과 같습니다. 소음이 신호를 덮습니다.', ['alerts = [{"actionable": False}, {"actionable": True}]', 'print(sum(1 for a in alerts if a["actionable"]))']],
  ['SLO', 'SLO는 사용자가 기대하는 서비스 품질을 수치 목표로 정한 것입니다. 예를 들어 99.9% 요청이 성공하거나 p95 지연 시간이 300ms 이하인 목표를 둘 수 있습니다.', '식당이 “주문 후 10분 안에 95%의 음식을 제공한다”라고 내부 목표를 세우는 것과 같습니다. 측정 가능한 약속이어야 합니다.', ['slo = {"success_rate": 99.9}', 'actual = 99.95', 'print(actual >= slo["success_rate"])']],
  ['SLI', 'SLI는 SLO 달성 여부를 측정하는 구체적인 지표입니다. 성공률, 가용성, 지연 시간, 신선도처럼 사용자가 느끼는 품질을 숫자로 표현합니다.', '식당의 목표가 빠른 서빙이라면 실제로 재는 “주문부터 음식까지 걸린 시간”이 SLI와 같습니다. 목표를 판단할 눈금입니다.', ['requests = 1000', 'successful = 998', 'sli = successful / requests', 'print(sli)']],
  ['운영 수준 목표(OLA)', '운영 수준 목표는 조직 내부 팀이나 구성 요소 사이에서 서비스 목표를 달성하기 위해 합의한 운영 기준입니다. 외부 고객 약속보다 내부 지원과 책임 경계를 명확히 하는 데 초점을 둡니다.', '식당이 손님에게 10분 서빙을 약속하려면 주방은 7분 안에 조리하고 홀은 3분 안에 전달하기로 내부 약속을 나누는 것과 같습니다.', ['ola = {"kitchen_minutes": 7, "serving_minutes": 3}', 'print(sum(ola.values()) <= 10)']],
  ['포스트모템', '포스트모템은 장애 후 원인, 영향, 대응, 재발 방지 조치를 정리하는 회고 문서와 과정입니다. 비난보다 학습과 시스템 개선에 초점을 둬야 합니다.', '넘어진 뒤 누구 잘못인지 싸우기보다 바닥이 왜 미끄러웠고 표지판은 왜 없었는지 기록해 다음 사고를 막는 회의와 같습니다.', ['postmortem = {"root_cause": "missing timeout", "actions": ["add timeout"]}', 'print(postmortem["actions"])']],
  ['불변 인프라', '불변 인프라는 서버를 직접 수정하지 않고 새 이미지나 새 인스턴스로 교체하는 운영 방식입니다. 환경 드리프트를 줄이고 롤백과 재현성을 높입니다.', '전시품을 현장에서 덧칠하지 않고 새로 완성된 전시품으로 통째로 교체하는 박물관 운영과 같습니다. 손댄 흔적이 남지 않습니다.', ['old = "server:v1"', 'new = "server:v2"', 'active = new', 'print(active)']],
  ['GitOps', 'GitOps는 인프라와 애플리케이션 원하는 상태를 Git에 선언하고 자동화 도구가 클러스터를 그 상태로 맞추는 운영 방식입니다. 변경 이력, 리뷰, 롤백을 Git 흐름으로 관리합니다.', '매장 배치도를 공식 문서함에 두고 직원들이 실제 매장을 그 도면과 계속 맞추는 것과 같습니다. 도면 변경이 운영 변경입니다.', ['git_state = {"replicas": 3}', 'cluster_state = {"replicas": 2}', 'print("sync" if git_state != cluster_state else "ok")']],
  ['ArgoCD', 'ArgoCD는 Kubernetes 환경에서 GitOps 방식으로 애플리케이션 배포와 동기화를 수행하는 도구입니다. Git의 선언 상태와 클러스터 실제 상태 차이를 감지하고 맞춥니다.', '공식 배치도와 실제 매장을 비교해 어긋난 진열대를 자동으로 바로잡는 매장 관리자와 같습니다.', ['desired = "app:v2"', 'live = "app:v1"', 'print("out-of-sync" if desired != live else "synced")']],
  ['Flux', 'Flux는 Kubernetes 클러스터를 Git 저장소의 선언 상태와 지속적으로 동기화하는 GitOps 도구입니다. 이미지 업데이트 자동화와 선언적 배포 흐름을 지원합니다.', '정기적으로 본사 지침서를 확인해 매장 가격표와 진열을 최신 지침에 맞추는 자동 점검원과 같습니다.', ['repo_version = 5', 'cluster_version = 4', 'print(repo_version > cluster_version)']],
  ['헬름(Helm)', 'Helm은 Kubernetes 리소스를 차트라는 패키지로 묶어 설치, 업그레이드, 롤백을 쉽게 하는 패키지 관리자입니다. 템플릿 값으로 환경별 설정을 조정할 수 있습니다.', '여러 가구와 설명서를 한 세트 상품으로 포장해 방 크기에 맞춰 옵션만 바꾸는 조립 키트와 같습니다.', ['chart = {"name": "web", "values": {"replicas": 2}}', 'print(chart["values"]["replicas"])']],
  ['오퍼레이터(Kubernetes Operator)', '오퍼레이터는 특정 애플리케이션 운영 지식을 코드로 자동화한 Kubernetes 확장 패턴입니다. 백업, 업그레이드, 장애 복구 같은 도메인 작업을 컨트롤러가 수행합니다.', '숙련된 DBA의 반복 운영 절차를 자동 로봇에게 가르쳐 데이터베이스를 관리하게 하는 것과 같습니다.', ['desired = {"db_version": "2.0"}', 'current = {"db_version": "1.0"}', 'print("upgrade" if desired != current else "ok")']],
  ['서비스 메시(Service Mesh)', '서비스 메시는 서비스 간 통신을 프록시 계층에서 관리해 mTLS, 라우팅, 관찰성, 재시도를 제공하는 인프라 계층입니다. 애플리케이션 코드 변경 없이 통신 정책을 적용할 수 있습니다.', '도시의 모든 도로에 신호등과 CCTV, 통행 규칙을 깔아 차량들이 직접 규칙을 구현하지 않아도 안전하게 이동하게 하는 것과 같습니다.', ['mesh_features = ["mTLS", "routing", "metrics"]', 'print("mTLS" in mesh_features)']],
  ['Istio', 'Istio는 Envoy 프록시 기반의 대표적인 서비스 메시 구현입니다. 트래픽 관리, 보안 통신, 정책 적용, 관찰성을 Kubernetes 환경에서 제공합니다.', '복잡한 도로망에 중앙 교통 제어 시스템을 설치해 우회로, 속도 제한, 통행 기록을 관리하는 것과 같습니다.', ['traffic_split = {"v1": 90, "v2": 10}', 'print(traffic_split["v2"])']],
  ['사이드카 프록시', '사이드카 프록시는 애플리케이션 컨테이너 옆에 배치되어 들어오고 나가는 네트워크 트래픽을 대신 처리하는 프록시입니다. 서비스 메시에서 통신 제어를 맡습니다.', '운전기사 옆 보조석에 앉아 길 안내와 통행료 결제를 대신 처리하는 동승자와 같습니다. 운전자는 목적지에 집중합니다.', ['pod = {"app": "orders", "proxy": "envoy"}', 'print(pod["proxy"])']],
  ['mTLS', 'mTLS는 클라이언트와 서버가 서로의 인증서를 검증하며 암호화 통신을 하는 방식입니다. 서비스 간 통신에서 양쪽 신원을 모두 확인해 위장과 도청 위험을 줄입니다.', '두 사람이 악수하기 전에 서로 신분증을 확인하고 잠긴 회의실에서 대화하는 것과 같습니다. 한쪽만 확인하지 않습니다.', ['client_cert_ok = True', 'server_cert_ok = True', 'print(client_cert_ok and server_cert_ok)']],
  ['트래픽 미러링', '트래픽 미러링은 실제 요청을 복사해 새 버전이나 분석 시스템에 보내되 사용자 응답에는 영향을 주지 않는 방식입니다. 실서비스 부하로 안전하게 검증할 수 있습니다.', '가게 주문서를 복사해 연습 주방에도 보내 보지만 손님에게는 본 주방 음식만 제공하는 것과 같습니다.', ['request = {"path": "/pay"}', 'mirror = request.copy()', 'print("primary response", mirror["path"])']],
  ['카오스 엔지니어링', '카오스 엔지니어링은 통제된 방식으로 장애를 주입해 시스템의 회복력과 가정을 검증하는 실험입니다. 실제 장애 전에 약점을 발견하는 데 목적이 있습니다.', '소방 훈련에서 일부러 비상벨을 울려 대피 절차가 작동하는지 확인하는 것과 같습니다. 무작정 망가뜨리는 것이 아니라 실험입니다.', ['experiment = {"kill_pod": True, "blast_radius": "small"}', 'print(experiment["blast_radius"])']],
  ['환경 분리(Dev/Staging/Prod)', '환경 분리는 개발, 검증, 운영 환경을 나누어 변경을 단계적으로 확인하는 방식입니다. 운영 데이터와 설정을 보호하고 출시 위험을 낮춥니다.', '연극을 연습실, 리허설 무대, 실제 공연장으로 나눠 준비하는 것과 같습니다. 연습 실수가 관객에게 바로 보이면 안 됩니다.', ['envs = ["dev", "staging", "prod"]', 'print(envs.index("prod"))']],
  ['트렁크 기반 개발', '트렁크 기반 개발은 개발자들이 짧은 수명의 브랜치나 직접 메인 브랜치에 자주 통합하는 방식입니다. 큰 병합 충돌을 줄이고 CI 피드백을 빠르게 받습니다.', '여러 사람이 각자 오래 숨겨 둔 퍼즐 조각을 나중에 합치지 않고 매일 중앙 판에 조금씩 맞춰 보는 것과 같습니다.', ['branches = ["main", "feature-short"]', 'print("main" in branches)']],
  ['모노레포(Monorepo)', '모노레포는 여러 프로젝트나 패키지를 하나의 저장소에서 관리하는 방식입니다. 공통 변경과 통합 테스트가 쉬워지지만 빌드 최적화와 권한 관리가 중요합니다.', '여러 부서 문서를 하나의 큰 사무실 파일룸에 보관하는 것과 같습니다. 찾기와 공유는 쉽지만 정리 규칙이 필요합니다.', ['repo = {"apps": ["web", "api"], "libs": ["common"]}', 'print(repo["apps"])']],
  ['폴리레포(Polyrepo)', '폴리레포는 프로젝트나 서비스별로 별도 저장소를 사용하는 방식입니다. 독립 배포와 권한 분리가 쉽지만 공통 변경 조율과 버전 관리가 복잡할 수 있습니다.', '각 부서가 자기 파일 캐비닛을 따로 관리하는 것과 같습니다. 독립성은 높지만 부서 간 문서 동기화가 필요합니다.', ['repos = ["web-repo", "api-repo", "lib-repo"]', 'print(len(repos))']],
  ['의존성 자동 업데이트(Dependabot)', '의존성 자동 업데이트는 외부 패키지의 새 버전이나 보안 패치를 자동으로 감지해 업데이트 제안을 만드는 자동화입니다. 테스트와 리뷰를 함께 연결해야 안전합니다.', '부품 리콜이나 새 부품이 나오면 자동으로 교체 신청서를 만들어 주는 창고 시스템과 같습니다. 신청서는 검수 후 반영해야 합니다.', ['updates = [{"pkg": "libA", "security": True}]', 'print([u["pkg"] for u in updates if u["security"]])']],
  ['배포 파이프라인 최적화', '배포 파이프라인 최적화는 빌드와 테스트, 배포 흐름의 중복과 대기 시간을 줄여 더 빠르고 안정적인 피드백을 얻는 작업입니다. 캐시, 병렬화, 단계 분리, 실패 빠른 감지가 쓰입니다.', '공항 보안 검색 줄에서 같은 검사를 두 번 하지 않고 승객을 여러 줄로 나눠 병목을 줄이는 것과 같습니다.', ['steps = {"build": 5, "test": 12, "deploy": 3}', 'critical = max(steps, key=steps.get)', 'print(critical)']],
  ['컨테이너 이미지 스캔', '컨테이너 이미지 스캔은 이미지 안의 OS 패키지와 라이브러리 취약점, 비밀값, 설정 위험을 검사하는 과정입니다. 배포 전 공급망 위험을 줄이는 데 중요합니다.', '배송 상자를 출고 전에 열어 리콜 부품이나 금지 물품이 들어 있는지 확인하는 것과 같습니다.', ['findings = [{"severity": "low"}, {"severity": "critical"}]', 'print(any(f["severity"] == "critical" for f in findings))']],
  ['비밀 스캔(Secret Scanning)', '비밀 스캔은 코드 저장소나 이미지에서 API 키, 토큰, 비밀번호 같은 민감 정보가 실수로 포함됐는지 찾는 검사입니다. 발견 시 키 폐기와 재발 방지가 필요합니다.', '우편물 발송 전에 봉투 겉면에 신용카드 번호가 적혀 있지 않은지 확인하는 검사와 같습니다. 노출된 비밀은 회수보다 교체가 중요합니다.', ['files = {"app.py": "print(1)", ".env": "API_KEY=abc"}', 'leaks = [name for name, text in files.items() if "KEY=" in text]', 'print(leaks)']]
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
    id: String(1261 + index).padStart(3, '0'),
    term,
    category: 'DevOps / CI-CD',
    difficulty: index < 10 ? 'easy' : index < 49 ? 'medium' : 'hard',
    phase: 4,
    week: 19,
    definition,
    hint: term.replace(/\(.+\)/, '').trim(),
    detail: {
      easy: `${term}은 소프트웨어를 더 빠르고 안정적으로 빌드, 배포, 운영하기 위한 DevOps 개념입니다.`,
      analogy,
      example: example(term, code),
      tip: `${term}을 적용할 때는 자동화 수준, 장애 대응, 보안 검증, 운영 관찰성을 함께 점검하세요.`
    }
  };
});

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'terms.week19.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('wrote data/terms.week19.json');

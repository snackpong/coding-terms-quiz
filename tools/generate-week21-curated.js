'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const plan = require('./term-bank-plan.json').filter((item) => item.week === 21);

function example(term, lines) {
  return [`# ${term} 예시: Python 3에서 실행 가능한 코드`, ...lines].join('\n');
}

const rows = [
  ['컴포넌트 기반 설계', '컴포넌트 기반 설계는 UI를 독립적인 조각으로 나누고 각 조각이 상태, 입력, 출력을 갖도록 구성하는 방식입니다. 재사용과 테스트, 변경 범위 관리에 유리합니다.', '레고 블록처럼 버튼, 카드, 목록을 각각 만들고 조합해 화면을 완성하는 것과 같습니다. 블록 하나를 고쳐도 전체 성을 다시 만들 필요가 없습니다.', ['components = ["Header", "Card", "Button"]', 'page = " + ".join(components)', 'print(page)']],
  ['단방향 데이터 흐름', '단방향 데이터 흐름은 데이터가 부모에서 자식 또는 정해진 방향으로만 흐르게 하는 UI 설계 원칙입니다. 상태 변화의 원인을 추적하기 쉬워지고 예측 가능한 렌더링을 돕습니다.', '강물이 상류에서 하류로 흐르듯 정보가 한 방향으로 움직이는 구조와 같습니다. 물길이 뒤섞이면 어디서 오염됐는지 찾기 어렵습니다.', ['state = {"count": 1}', 'props = {"count": state["count"]}', 'print(props["count"])']],
  ['Virtual DOM', 'Virtual DOM은 실제 DOM을 직접 조작하기 전에 메모리상의 가벼운 UI 표현을 비교하는 개념입니다. 변경된 부분만 실제 DOM에 반영해 렌더링 비용을 줄이는 데 사용됩니다.', '가구를 바로 옮기기 전에 종이 도면 위에서 배치를 비교하고 필요한 가구만 움직이는 것과 같습니다. 실제 방을 매번 통째로 뒤집지 않습니다.', ['old = {"text": "A"}', 'new = {"text": "B"}', 'print(old != new)']],
  ['재조정(Reconciliation)', '재조정은 이전 UI 트리와 새 UI 트리를 비교해 실제 화면에 반영할 최소 변경을 결정하는 과정입니다. 키와 컴포넌트 타입은 비교 효율과 상태 보존에 영향을 줍니다.', '창고 재고표를 새 주문표와 비교해 바뀐 물건만 교체하는 작업과 같습니다. 모든 선반을 비우고 다시 채우지 않습니다.', ['old = ["a", "b", "c"]', 'new = ["a", "c", "d"]', 'changes = [x for x in new if x not in old]', 'print(changes)']],
  ['파이버 아키텍처(React)', '파이버 아키텍처는 React가 렌더링 작업을 작은 단위로 나누고 우선순위를 조절할 수 있게 만든 내부 구조입니다. 긴 렌더링 작업을 중단하거나 재개해 사용자 입력 반응성을 높입니다.', '큰 청소를 한 번에 끝내지 않고 방별 작업 카드로 나눠 급한 손님 응대가 오면 잠시 멈추는 관리 방식과 같습니다.', ['tasks = [("input", 1), ("list render", 5)]', 'print(sorted(tasks, key=lambda x: x[1])[0])']],
  ['Hooks(useState/useEffect)', 'Hooks는 함수형 컴포넌트에서 상태와 생명주기 관련 기능을 사용할 수 있게 하는 React API입니다. useState는 상태를, useEffect는 렌더 이후 부수 효과를 다룹니다.', '요리사가 작업대 옆에 메모장과 타이머를 두고 현재 재료 상태와 후속 작업을 관리하는 것과 같습니다.', ['state = 0', 'def set_state(v):', '    return v', 'state = set_state(state + 1)', 'print(state)']],
  ['커스텀 훅', '커스텀 훅은 여러 컴포넌트에서 반복되는 Hook 기반 로직을 함수로 분리한 것입니다. UI와 상태 관리 로직을 나눠 재사용성을 높입니다.', '여러 요리에 반복되는 기본 육수 만드는 법을 별도 레시피 카드로 빼 두는 것과 같습니다. 요리마다 같은 과정을 다시 쓰지 않습니다.', ['def use_toggle(initial=False):', '    value = initial', '    return value, (lambda: not value)', 'value, toggle = use_toggle()', 'print(value, toggle())']],
  ['컨텍스트 API', '컨텍스트 API는 React 컴포넌트 트리에서 여러 하위 컴포넌트가 공통 값을 직접 전달받을 수 있게 하는 기능입니다. 테마, 언어, 인증 정보처럼 전역에 가까운 값에 적합합니다.', '건물 전체 방송으로 공지하면 각 방마다 전언을 전달하지 않아도 모두 같은 정보를 받는 것과 같습니다.', ['context = {"theme": "dark"}', 'def child(ctx): return ctx["theme"]', 'print(child(context))']],
  ['상태 끌어올리기', '상태 끌어올리기는 여러 자식 컴포넌트가 공유해야 하는 상태를 가장 가까운 공통 부모로 이동하는 패턴입니다. 한 곳의 상태를 기준으로 자식 UI를 일관되게 유지합니다.', '두 계산대가 같은 재고를 봐야 할 때 각자 장부를 쓰지 않고 매장 중앙 재고판을 공유하는 것과 같습니다.', ['parent_state = {"selected": "A"}', 'child1 = parent_state["selected"]', 'child2 = parent_state["selected"]', 'print(child1 == child2)']],
  ['Props Drilling', 'Props Drilling은 깊은 컴포넌트까지 값을 전달하기 위해 중간 컴포넌트들이 직접 쓰지 않는 props를 계속 넘기는 상황입니다. 구조가 깊어지면 코드가 장황해지고 변경 영향이 커질 수 있습니다.', '소포를 꼭대기 층 사람에게 보내려고 각 층 직원이 자기 물건도 아닌 상자를 계속 전달하는 모습과 같습니다.', ['props = {"user": "Kim"}', 'level1 = props', 'level2 = level1', 'print(level2["user"])']],
  ['전역 상태 관리', '전역 상태 관리는 여러 화면이나 컴포넌트에서 공유되는 상태를 중앙 저장소나 공통 메커니즘으로 관리하는 방식입니다. 인증, 장바구니, 앱 설정처럼 넓게 쓰이는 상태에 필요합니다.', '모든 부서가 보는 중앙 상황판에 현재 재고와 공지사항을 적어 두는 것과 같습니다. 각자 복사본을 들고 다니면 금방 어긋납니다.', ['store = {"cart_count": 2}', 'def read_store(): return store["cart_count"]', 'print(read_store())']],
  ['Redux 기초', 'Redux는 단일 store, action, reducer를 통해 상태 변경을 예측 가능하게 만드는 상태 관리 패턴입니다. 상태는 직접 바꾸지 않고 action을 reducer가 처리해 새 상태를 만듭니다.', '은행 거래 장부처럼 입금과 출금 전표만 접수하고 장부 담당자가 규칙대로 잔액을 갱신하는 방식과 같습니다.', ['def reducer(state, action):', '    return state + 1 if action == "inc" else state', 'state = reducer(0, "inc")', 'print(state)']],
  ['Redux Toolkit', 'Redux Toolkit은 Redux 사용에 필요한 보일러플레이트를 줄이고 slice, configureStore 같은 권장 도구를 제공하는 패키지입니다. 불변 업데이트와 액션 생성을 더 간결하게 만듭니다.', '복잡한 조리 도구를 미리 세트로 묶어 초보자도 표준 레시피를 쉽게 따르게 하는 키트와 같습니다.', ['slice_state = {"value": 0}', 'def increment(s):', '    return {"value": s["value"] + 1}', 'print(increment(slice_state))']],
  ['Zustand', 'Zustand는 작은 API로 전역 상태를 만들고 컴포넌트가 필요한 조각만 구독하게 하는 React 상태 관리 라이브러리입니다. Redux보다 설정이 단순한 경우가 많습니다.', '작은 동네 게시판에서 필요한 사람만 특정 공지 칸을 보는 방식과 같습니다. 큰 본부 절차 없이 빠르게 공유합니다.', ['store = {"count": 0}', 'def set_count(v): store["count"] = v', 'set_count(3)', 'print(store["count"])']],
  ['Jotai', 'Jotai는 상태를 atom이라는 작은 단위로 쪼개 조합하는 React 상태 관리 라이브러리입니다. 필요한 atom을 구독해 세밀한 업데이트를 만들 수 있습니다.', '여러 스위치가 각각 작은 전구 하나를 담당하고 필요하면 스위치를 묶어 큰 조명을 만드는 것과 같습니다.', ['atoms = {"count": 1, "name": "Kim"}', 'derived = atoms["count"] * 2', 'print(derived)']],
  ['반응형 상태(Reactive State)', '반응형 상태는 값이 바뀌면 그 값을 의존하는 계산이나 UI가 자동으로 갱신되는 상태 모델입니다. 수동으로 모든 업데이트 지점을 호출하지 않아도 변화가 전파됩니다.', '온도계 값이 바뀌면 연결된 난방기가 자동으로 켜지고 꺼지는 장치와 같습니다. 상태 변화가 반응을 일으킵니다.', ['state = {"temperature": 28}', 'message = "hot" if state["temperature"] > 25 else "ok"', 'print(message)']],
  ['불변성(Immutability)', '불변성은 기존 객체를 직접 수정하지 않고 새 객체를 만들어 상태 변화를 표현하는 성질입니다. React의 변경 감지와 예측 가능한 상태 관리에 중요합니다.', '원본 계약서에 낙서하지 않고 수정본을 새로 발급하는 방식과 같습니다. 이전 문서를 비교하고 되돌리기 쉽습니다.', ['old = {"count": 1}', 'new = {**old, "count": old["count"] + 1}', 'print(old, new)']],
  ['메모이제이션(useMemo/useCallback)', '메모이제이션은 같은 입력에 대한 계산 결과나 함수 참조를 저장해 불필요한 재계산과 재렌더링을 줄이는 기법입니다. useMemo와 useCallback은 React에서 이를 돕습니다.', '자주 묻는 계산 결과를 메모지에 적어 두었다가 같은 질문이 오면 다시 계산하지 않는 것과 같습니다.', ['cache = {}', 'def square(x):', '    cache[x] = cache.get(x, x*x)', '    return cache[x]', 'print(square(4), square(4))']],
  ['React.memo', 'React.memo는 props가 바뀌지 않았을 때 함수형 컴포넌트의 재렌더링을 건너뛰도록 돕는 최적화 도구입니다. 렌더링 비용이 큰 순수 컴포넌트에 유용합니다.', '사진이 그대로라면 액자를 다시 만들지 않고 이전 액자를 그대로 쓰는 것과 같습니다. 입력이 같으면 결과도 같다는 전제가 필요합니다.', ['prev_props = {"name": "Kim"}', 'next_props = {"name": "Kim"}', 'print(prev_props == next_props)']],
  ['가상화(Windowing)', '가상화는 긴 목록에서 화면에 보이는 일부 항목만 렌더링해 성능을 높이는 기법입니다. 수천 개 행을 한꺼번에 DOM에 만들지 않아 스크롤 성능을 유지합니다.', '긴 두루마리를 한 번에 펼치지 않고 창문 크기만큼만 보여 주는 것과 같습니다. 사용자가 내려가면 다음 부분을 보여 줍니다.', ['items = list(range(1000))', 'start, size = 20, 5', 'print(items[start:start+size])']],
  ['코드 스플리팅', '코드 스플리팅은 애플리케이션 번들을 여러 조각으로 나누어 필요한 시점에 로드하는 최적화입니다. 초기 로딩 시간을 줄이고 사용하지 않는 기능의 비용을 미룰 수 있습니다.', '여행 가방에 모든 짐을 들고 다니지 않고 필요한 도시에서 필요한 짐을 택배로 받는 방식과 같습니다.', ['chunks = {"main": 120, "settings": 40}', 'initial = chunks["main"]', 'print(initial)']],
  ['지연 로딩(Lazy Loading)', '지연 로딩은 이미지, 코드, 데이터 등을 실제로 필요할 때까지 불러오지 않는 기법입니다. 초기 로딩 비용을 줄이고 사용자에게 필요한 리소스에 우선순위를 둡니다.', '식당에서 모든 코스를 한꺼번에 내지 않고 손님이 먹을 차례가 되면 다음 음식을 가져오는 것과 같습니다.', ['visible = False', 'resource_loaded = visible', 'print(resource_loaded)']],
  ['Suspense', 'Suspense는 React에서 비동기 컴포넌트나 데이터가 준비될 때까지 대체 UI를 보여 주는 메커니즘입니다. 로딩 상태를 컴포넌트 경계에서 선언적으로 다룰 수 있습니다.', '택배가 도착하기 전까지 현관에 “배송 중” 안내판을 걸어 두는 것과 같습니다. 내용물이 오면 안내판을 교체합니다.', ['ready = False', 'ui = "content" if ready else "loading..."', 'print(ui)']],
  ['에러 바운더리', '에러 바운더리는 하위 컴포넌트 렌더링 중 발생한 오류를 잡아 전체 앱이 무너지는 것을 막는 React 컴포넌트입니다. 오류 UI를 보여 주고 로깅할 수 있습니다.', '전기 차단기가 한 방의 고장으로 집 전체가 꺼지는 것을 막는 것과 같습니다. 문제가 난 구역만 격리합니다.', ['try:', '    raise ValueError("render failed")', 'except ValueError:', '    print("fallback UI")']],
  ['서버 컴포넌트(RSC)', '서버 컴포넌트는 서버에서 렌더링되고 클라이언트 번들에 포함되지 않는 React 컴포넌트 모델입니다. 데이터 접근과 번들 크기 절감에 유리하지만 클라이언트 상호작용에는 제약이 있습니다.', '주방에서 완성된 접시를 가져오는 것과 같습니다. 손님 테이블에서 조리도구를 모두 들고 직접 만들 필요가 없습니다.', ['server_data = {"title": "Report"}', 'html = f"<h1>{server_data[\"title\"]}</h1>"', 'print(html)']],
  ['수화(Hydration)', '수화는 서버에서 만들어진 HTML에 클라이언트 JavaScript 이벤트와 상태를 연결해 상호작용 가능하게 만드는 과정입니다. SSR 화면이 실제 앱처럼 동작하려면 필요합니다.', '마네킹에 옷을 입혀 전시한 뒤 나중에 관절과 모터를 연결해 움직이게 하는 것과 같습니다. 겉모습에 동작을 붙입니다.', ['html_ready = True', 'js_attached = True', 'print(html_ready and js_attached)']],
  ['점진적 수화', '점진적 수화는 페이지 전체를 한 번에 수화하지 않고 중요한 영역부터 단계적으로 상호작용을 붙이는 방식입니다. 초기 반응성을 높이고 자원 사용을 조절할 수 있습니다.', '축제장 전체 조명을 한꺼번에 켜지 않고 입구와 주요 무대부터 순서대로 켜는 것과 같습니다. 중요한 곳부터 살아납니다.', ['areas = ["nav", "hero", "comments"]', 'hydrated = areas[:2]', 'print(hydrated)']],
  ['스트리밍 SSR', '스트리밍 SSR은 서버가 완성된 HTML 전체를 기다리지 않고 준비된 조각부터 브라우저로 보내는 렌더링 방식입니다. 사용자는 초기 내용을 더 빨리 볼 수 있습니다.', '긴 보고서를 모두 인쇄한 뒤 전달하지 않고 첫 장부터 바로 넘겨주는 프린터와 같습니다. 뒤쪽은 계속 준비됩니다.', ['chunks = ["<header>", "<main>", "<footer>"]', 'for chunk in chunks:', '    print(chunk)']],
  ['라우팅(SPA)', '라우팅은 단일 페이지 애플리케이션에서 URL에 따라 보여 줄 화면 컴포넌트를 결정하는 기능입니다. 브라우저 전체 새로고침 없이 화면 전환을 처리합니다.', '백화점 안내판에서 층 번호를 보고 같은 건물 안의 다른 매장으로 안내하는 것과 같습니다. 건물 자체를 새로 짓지 않습니다.', ['routes = {"/": "Home", "/about": "About"}', 'path = "/about"', 'print(routes[path])']],
  ['해시 라우팅', '해시 라우팅은 URL의 `#` 뒤 조각을 이용해 클라이언트 화면을 전환하는 라우팅 방식입니다. 서버 설정이 단순하지만 URL 형태가 덜 깔끔할 수 있습니다.', '건물 주소는 같고 안내판의 섹션 번호만 바꿔 내부 위치를 찾는 것과 같습니다. 외부 우편 주소는 변하지 않습니다.', ['url = "site/#/settings"', 'route = url.split("#", 1)[1]', 'print(route)']],
  ['히스토리 API', '히스토리 API는 브라우저 주소와 방문 기록을 JavaScript로 조작해 SPA 라우팅을 자연스러운 URL로 구현하게 합니다. 서버는 새로고침 요청도 같은 앱으로 처리하도록 설정해야 합니다.', '책갈피 기록을 직접 정리하면서도 사용자는 정상적인 페이지 이동처럼 느끼게 하는 안내원과 같습니다.', ['history = ["/"]', 'history.append("/settings")', 'print(history[-1])']],
  ['빌드 도구(Vite/Webpack)', '빌드 도구는 모듈을 해석하고 변환, 번들링, 개발 서버, 최적화를 제공해 프론트엔드 코드를 브라우저가 실행할 형태로 준비합니다. Vite와 Webpack은 대표적인 도구입니다.', '여러 재료와 포장지를 받아 판매 가능한 상품 세트로 조립하는 공장 라인과 같습니다. 개발 중에는 빠른 시식대도 제공합니다.', ['modules = ["main.js", "style.css"]', 'bundle = "+".join(modules)', 'print(bundle)']],
  ['번들링', '번들링은 여러 JavaScript, CSS, 자산 파일을 브라우저가 효율적으로 로드할 수 있는 묶음으로 만드는 과정입니다. 의존성 그래프를 따라 필요한 파일을 결합합니다.', '여행에 필요한 티켓, 지도, 예약증을 한 파일철에 묶는 것과 같습니다. 흩어진 종이를 하나씩 찾지 않아도 됩니다.', ['files = ["a.js", "b.js", "c.css"]', 'print("bundle:", len(files), "files")']],
  ['트리 쉐이킹', '트리 쉐이킹은 사용하지 않는 코드를 번들에서 제거하는 최적화입니다. ES 모듈의 정적 구조를 활용해 실제로 참조되는 export만 남깁니다.', '나무에서 열매 없는 가지를 잘라 햇빛과 영양을 중요한 가지에 집중시키는 것과 같습니다. 쓰지 않는 코드 무게를 줄입니다.', ['exports = {"used": True, "unused": False}', 'kept = [k for k, used in exports.items() if used]', 'print(kept)']],
  ['코드 압축(Minification)', '코드 압축은 공백, 주석, 긴 이름 등을 줄여 파일 크기를 작게 만드는 최적화입니다. 의미는 유지하면서 네트워크 전송량을 줄입니다.', '같은 문장을 약어와 작은 글씨로 적어 종이 공간을 아끼는 것과 같습니다. 읽기는 어려워져도 기계는 실행할 수 있습니다.', ['code = "function add(a, b) { return a + b; }"', 'minified = code.replace(" ", "")', 'print(len(code), len(minified))']],
  ['소스맵', '소스맵은 압축 또는 변환된 코드 위치를 원본 코드 위치와 연결해 주는 매핑 파일입니다. 프로덕션 오류를 디버깅할 때 원래 소스의 줄 번호를 확인할 수 있게 합니다.', '접힌 지도를 펼쳤을 때 현재 표시가 원래 어느 거리였는지 알려 주는 좌표표와 같습니다. 압축된 결과를 원본으로 되돌려 봅니다.', ['sourcemap = {"bundle.js:1": "src/app.js:10"}', 'print(sourcemap["bundle.js:1"])']],
  ['HMR(핫 모듈 교체)', 'HMR은 개발 서버에서 전체 페이지 새로고침 없이 바뀐 모듈만 교체하는 기능입니다. 상태를 유지한 채 빠르게 UI 변경을 확인할 수 있습니다.', '연극 리허설 중 무대 전체를 내리지 않고 소품 하나만 바꿔 다시 장면을 이어 가는 것과 같습니다.', ['modules = {"button": 1}', 'modules["button"] = 2', 'print(modules)']],
  ['CSS-in-JS', 'CSS-in-JS는 JavaScript 코드 안에서 스타일을 정의하고 컴포넌트와 함께 관리하는 방식입니다. 동적 스타일과 스코프 관리에 유리하지만 런타임 비용과 도구 선택을 고려해야 합니다.', '옷 설명서가 옷걸이에 붙어 있어 옷과 스타일 지시가 항상 함께 이동하는 것과 같습니다. 분리된 옷장 목록을 찾지 않아도 됩니다.', ['props = {"primary": True}', 'style = {"color": "blue" if props["primary"] else "gray"}', 'print(style)']],
  ['CSS Modules', 'CSS Modules는 CSS 클래스 이름을 파일 단위로 지역화해 전역 클래스 충돌을 줄이는 방식입니다. 컴포넌트별 스타일을 안전하게 분리할 수 있습니다.', '각 반 교실 안에서만 통하는 별명을 쓰게 해 학교 전체 별명 충돌을 막는 것과 같습니다. 같은 이름도 방이 다르면 다르게 관리됩니다.', ['local_class = "button__a1b2"', 'print(local_class.startswith("button"))']],
  ['Tailwind CSS', 'Tailwind CSS는 미리 정의된 유틸리티 클래스를 조합해 스타일을 만드는 CSS 프레임워크입니다. 디자인 토큰 기반으로 빠르게 일관된 UI를 구성할 수 있습니다.', '완성된 색연필과 자, 스티커를 조합해 포스터를 만드는 키트와 같습니다. 직접 물감을 섞기보다 준비된 도구를 씁니다.', ['classes = ["flex", "p-4", "text-sm"]', 'print(" ".join(classes))']],
  ['디자인 시스템', '디자인 시스템은 색, 타이포그래피, 컴포넌트, 패턴, 사용 규칙을 문서화한 제품 UI의 공통 기반입니다. 여러 팀이 일관된 경험을 만들고 중복 설계를 줄입니다.', '프랜차이즈 매장의 간판, 메뉴판, 유니폼, 응대 규칙을 모은 운영 매뉴얼과 같습니다. 어느 지점이든 같은 브랜드로 느껴집니다.', ['tokens = {"color.primary": "#0055ff", "radius.sm": 4}', 'print(tokens["color.primary"])']],
  ['접근성(A11y)', '접근성은 장애나 다양한 사용 환경을 가진 사람도 웹을 사용할 수 있게 만드는 품질입니다. 키보드 조작, 스크린 리더, 색 대비, 의미 있는 HTML이 중요합니다.', '건물에 계단뿐 아니라 경사로와 점자 안내판을 함께 두는 것과 같습니다. 더 많은 사람이 같은 서비스를 이용할 수 있어야 합니다.', ['button = {"role": "button", "label": "저장"}', 'print(bool(button["label"]))']],
  ['ARIA 역할', 'ARIA 역할은 스크린 리더 같은 보조 기술에 요소의 의미와 상태를 전달하기 위한 속성입니다. 기본 HTML 의미를 우선하고 부족할 때 보완적으로 사용해야 합니다.', '겉모양만 문처럼 생긴 장식에 “실제 출입문” 표지판을 붙이는 것과 같습니다. 표지는 의미를 알려 주지만 문 자체가 제대로 만들어지는 것이 먼저입니다.', ['element = {"role": "dialog", "aria-modal": True}', 'print(element["role"])']],
  ['포커스 관리', '포커스 관리는 키보드 사용자가 현재 어느 요소를 조작 중인지 예측 가능하게 이동시키는 작업입니다. 모달, 메뉴, 라우팅 전환에서 특히 중요합니다.', '손전등 불빛이 현재 조작할 버튼을 비춰 주는 것과 같습니다. 불빛이 엉뚱한 곳으로 사라지면 길을 잃습니다.', ['focus_order = ["open", "confirm", "close"]', 'current = focus_order[1]', 'print(current)']],
  ['색상 대비', '색상 대비는 글자와 배경의 밝기 차이가 충분해 내용을 읽기 쉬운 정도입니다. 낮은 대비는 시력이 낮거나 밝은 환경의 사용자에게 큰 장벽이 됩니다.', '흰 종이에 연한 노란색 연필로 글씨를 쓰면 읽기 어려운 것과 같습니다. 글자와 배경이 충분히 구분되어야 합니다.', ['fg, bg = 0, 255', 'contrast = abs(bg - fg)', 'print(contrast > 125)']],
  ['국제화(i18n)', '국제화는 애플리케이션이 여러 언어와 지역 형식을 지원할 수 있도록 코드와 리소스를 설계하는 작업입니다. 문자열 분리, 날짜/숫자 형식, 방향성 등을 고려합니다.', '여러 나라 손님을 맞을 수 있게 메뉴판 틀을 만들고 번역 문구를 갈아 끼울 수 있게 하는 것과 같습니다.', ['messages = {"ko": "안녕", "en": "Hello"}', 'locale = "ko"', 'print(messages[locale])']],
  ['현지화(l10n)', '현지화는 특정 지역과 언어에 맞게 번역, 날짜, 통화, 문화적 표현을 조정하는 작업입니다. 국제화된 구조 위에 실제 지역 콘텐츠를 채웁니다.', '같은 매장 메뉴판을 한국 지점에는 원화와 한국어로, 미국 지점에는 달러와 영어로 바꾸는 작업과 같습니다.', ['price = 12000', 'formatted = f"{price:,}원"', 'print(formatted)']],
  ['다국어 날짜/숫자 포맷', '다국어 날짜/숫자 포맷은 지역별로 다른 날짜 순서, 구분자, 통화, 소수점 표기를 맞추는 작업입니다. 같은 값도 사용자 지역에 맞게 보여야 혼란이 줄어듭니다.', '같은 약속 시간을 어떤 나라는 월/일/년으로, 어떤 나라는 년-월-일로 적는 차이를 맞춰 주는 안내 데스크와 같습니다.', ['date = {"year": 2026, "month": 5, "day": 7}', 'print(f"{date[\"year\"]}-{date[\"month\"]:02d}-{date[\"day\"]:02d}")']],
  ['웹 성능 지표(CWV)', '웹 성능 지표(Core Web Vitals)는 사용자 경험과 관련된 로딩, 반응성, 시각 안정성을 측정하는 주요 지표입니다. LCP, INP, CLS가 대표적입니다.', '식당 평가에서 음식 나오는 시간, 직원 반응 속도, 테이블 흔들림을 따로 재는 것과 같습니다. 체감 품질을 숫자로 봅니다.', ['cwv = {"LCP": 2.0, "INP": 150, "CLS": 0.05}', 'print(cwv)']],
  ['LCP', 'LCP는 Largest Contentful Paint의 약자로 화면에서 가장 큰 주요 콘텐츠가 렌더링되기까지 걸린 시간입니다. 사용자가 페이지가 로드됐다고 느끼는 속도와 관련이 큽니다.', '식당에서 메인 요리가 테이블에 올라오기까지 걸리는 시간과 같습니다. 작은 반찬보다 핵심 콘텐츠가 중요합니다.', ['lcp_seconds = 2.1', 'print("good" if lcp_seconds <= 2.5 else "slow")']],
  ['FID/INP', 'FID와 INP는 사용자의 입력에 페이지가 얼마나 빠르게 반응하는지 보는 지표입니다. INP는 여러 상호작용 전반의 반응성을 더 폭넓게 평가합니다.', '엘리베이터 버튼을 눌렀을 때 불이 바로 들어오는지 보는 것과 같습니다. 누른 뒤 멈칫하면 답답합니다.', ['interaction_ms = 180', 'print("responsive" if interaction_ms < 200 else "laggy")']],
  ['CLS', 'CLS는 Cumulative Layout Shift로 페이지 로딩 중 예기치 않은 레이아웃 이동의 누적 정도를 측정합니다. 버튼이나 글이 갑자기 밀리면 사용자 실수와 불편을 유발합니다.', '신문을 읽는데 광고가 늦게 끼어들어 읽던 줄이 아래로 밀리는 상황과 같습니다. 화면이 안정적이어야 합니다.', ['shifts = [0.01, 0.02, 0.03]', 'print(sum(shifts))']],
  ['성능 프로파일링', '성능 프로파일링은 애플리케이션 실행 중 어디에서 시간이 쓰이고 병목이 생기는지 측정하는 작업입니다. 추측이 아니라 데이터로 최적화 대상을 정합니다.', '공장 라인에서 각 작업대의 처리 시간을 재어 가장 느린 작업대를 찾는 것과 같습니다. 느린 곳부터 고쳐야 합니다.', ['times = {"render": 12, "fetch": 80, "parse": 20}', 'print(max(times, key=times.get))']],
  ['Lighthouse', 'Lighthouse는 웹 페이지의 성능, 접근성, SEO, 권장사항을 자동 점검하는 도구입니다. 점수와 진단 항목을 통해 개선 방향을 찾을 수 있습니다.', '자동차 정기검사표처럼 속도, 안전, 배출가스 항목을 한 번에 점검해 점수와 고칠 부분을 알려 주는 도구와 같습니다.', ['scores = {"performance": 92, "accessibility": 88}', 'print(min(scores.values()))']],
  ['브라우저 렌더링 파이프라인', '브라우저 렌더링 파이프라인은 HTML/CSS/JS가 파싱, 스타일 계산, 레이아웃, 페인트, 합성을 거쳐 화면이 되는 과정입니다. 각 단계의 비용을 이해해야 성능 병목을 줄일 수 있습니다.', '원고가 편집, 조판, 인쇄, 제본을 거쳐 책이 되는 출판 라인과 같습니다. 어느 단계가 느린지 알아야 개선할 수 있습니다.', ['pipeline = ["parse", "style", "layout", "paint", "composite"]', 'print(" -> ".join(pipeline))']],
  ['레이아웃 재계산(Reflow)', '레이아웃 재계산은 요소의 크기와 위치가 바뀌어 브라우저가 문서 배치를 다시 계산하는 과정입니다. 잦은 reflow는 성능 저하를 일으킬 수 있습니다.', '방 안 가구 하나의 크기가 바뀌어 주변 가구 위치를 다시 재는 작업과 같습니다. 큰 방일수록 비용이 커집니다.', ['width = 100', 'new_width = 120', 'print("layout needed" if width != new_width else "skip")']],
  ['페인트(Repaint)', '페인트는 요소의 색, 그림자, 배경처럼 시각적 픽셀을 다시 그리는 과정입니다. 위치 변화가 없어도 스타일 변화는 repaint를 유발할 수 있습니다.', '가구 위치는 그대로 두고 벽 색만 다시 칠하는 작업과 같습니다. 배치는 안 바뀌지만 픽셀은 다시 그립니다.', ['old_color = "red"', 'new_color = "blue"', 'print(old_color != new_color)']],
  ['합성(Compositing)', '합성은 여러 렌더링 레이어를 최종 화면으로 조합하는 단계입니다. transform이나 opacity 변화는 레이아웃과 페인트를 피하고 합성 단계에서 처리될 수 있습니다.', '투명 필름 여러 장을 겹쳐 최종 그림을 만드는 작업과 같습니다. 각 필름을 다시 그리지 않고 위치만 조합할 수 있습니다.', ['layers = ["background", "card", "modal"]', 'print(layers[-1])']],
  ['GPU 가속', 'GPU 가속은 그래픽 처리 장치를 활용해 애니메이션, 합성, 계산을 빠르게 처리하는 방식입니다. 적절히 쓰면 부드러운 UI를 만들지만 과도한 레이어는 메모리 비용이 생깁니다.', '복잡한 그림을 한 명이 그리지 않고 여러 화가가 동시에 색칠하는 것과 같습니다. 병렬 작업에 강합니다.', ['frames = 60', 'gpu_layers = 3', 'print(frames * gpu_layers)']],
  ['웹 워커', '웹 워커는 브라우저 메인 스레드 밖에서 JavaScript를 실행해 무거운 계산이 UI를 막지 않게 하는 기능입니다. DOM에는 직접 접근할 수 없고 메시지로 통신합니다.', '매장 계산대는 손님 응대를 계속하고, 재고 계산은 뒤 사무실 직원에게 맡기는 것과 같습니다. 서로 메시지로 결과를 주고받습니다.', ['main = "UI responsive"', 'worker_result = sum(range(1000))', 'print(main, worker_result)']],
  ['공유 메모리', '공유 메모리는 여러 실행 주체가 같은 메모리 영역을 함께 읽고 쓸 수 있게 하는 기능입니다. 웹에서는 SharedArrayBuffer와 동기화 제약이 관련되며 보안 격리가 중요합니다.', '여러 직원이 같은 화이트보드에 숫자를 적는 것과 같습니다. 빠르지만 동시에 쓰면 규칙이 필요합니다.', ['shared = {"count": 0}', 'shared["count"] += 1', 'print(shared["count"])']],
  ['마이크로 프론트엔드', '마이크로 프론트엔드는 큰 프론트엔드 앱을 여러 팀이 독립적으로 개발하고 배포할 수 있는 작은 프론트엔드 조각으로 나누는 아키텍처입니다. 통합 방식과 일관된 사용자 경험 관리가 중요합니다.', '백화점 안 각 매장을 독립 운영하되 고객은 하나의 백화점처럼 느끼게 하는 구조와 같습니다. 자유와 통일감의 균형이 필요합니다.', ['apps = {"checkout": "team-a", "profile": "team-b"}', 'print(apps.keys())']],
  ['모듈 페더레이션(Module Federation)', '모듈 페더레이션은 Webpack 5의 기능으로, 서로 다른 빌드가 런타임에 모듈을 공유하고 로드할 수 있게 합니다. 마이크로 프론트엔드 통합에 자주 사용됩니다.', '여러 매장이 자기 창고의 상품을 다른 매장 진열대에서도 즉석으로 가져다 쓸 수 있게 하는 공유 물류망과 같습니다.', ['remote = {"Button": "remote/Button"}', 'print(remote["Button"])']],
  ['웹 컴포넌트(Web Components)', '웹 컴포넌트는 Custom Elements, Shadow DOM, HTML Templates 등을 이용해 프레임워크와 독립적인 재사용 UI 요소를 만드는 표준 기술입니다. 여러 환경에서 같은 컴포넌트를 쓸 수 있습니다.', '어느 브랜드 주방에도 꽂아 쓸 수 있는 표준 규격 커피머신과 같습니다. 특정 프레임워크 주방에만 묶이지 않습니다.', ['component = {"tag": "user-card", "shadow": True}', 'print(component["tag"])']],
  ['Shadow DOM', 'Shadow DOM은 요소 내부에 캡슐화된 DOM과 스타일 범위를 만들어 외부 문서와 충돌을 줄이는 기술입니다. 웹 컴포넌트의 스타일 격리에 중요합니다.', '투명한 전시 케이스 안의 미니 정원처럼 바깥 장식 규칙이 내부 식물 배치에 쉽게 섞이지 않는 구조와 같습니다.', ['shadow_styles = {"button": "local"}', 'global_styles = {"button": "global"}', 'print(shadow_styles["button"])']],
  ['Custom Elements', 'Custom Elements는 개발자가 새로운 HTML 태그를 정의하고 생명주기 동작을 붙일 수 있게 하는 웹 표준입니다. 재사용 가능한 브라우저 네이티브 컴포넌트의 기반입니다.', '기존 메뉴판에 없는 전용 주문 버튼을 표준 규격으로 새로 등록하는 것과 같습니다. 브라우저가 그 태그를 알아보게 됩니다.', ['registry = {}', 'registry["user-card"] = "UserCardClass"', 'print("user-card" in registry)']],
  ['인터섹션 옵저버(Intersection Observer)', '인터섹션 옵저버는 요소가 뷰포트나 부모 영역과 교차하는지 비동기적으로 감지하는 API입니다. 무한 스크롤, lazy loading, 노출 측정에 사용됩니다.', '매장 입구 센서가 손님이 문 근처에 왔는지 감지해 불을 켜는 것과 같습니다. 계속 눈으로 확인하지 않아도 됩니다.', ['viewport = (0, 100)', 'item = (80, 140)', 'visible = item[0] < viewport[1] and item[1] > viewport[0]', 'print(visible)']],
  ['ResizeObserver', 'ResizeObserver는 요소의 크기 변화를 관찰하는 브라우저 API입니다. 컨테이너 크기에 따라 레이아웃이나 캔버스를 조정할 때 유용합니다.', '액자 크기가 바뀌면 안의 사진 배치를 다시 맞추라고 알려 주는 센서와 같습니다. 창 크기뿐 아니라 요소 자체를 봅니다.', ['old_size = (100, 50)', 'new_size = (120, 50)', 'print(old_size != new_size)']],
  ['MutationObserver', 'MutationObserver는 DOM 노드의 추가, 제거, 속성 변경 같은 변화를 관찰하는 API입니다. 외부 스크립트나 동적 UI 변화에 반응해야 할 때 사용합니다.', '게시판에 새 쪽지가 붙거나 떨어질 때마다 알려 주는 관리인과 같습니다. 계속 게시판을 바라보지 않아도 됩니다.', ['old_nodes = ["a"]', 'new_nodes = ["a", "b"]', 'print([n for n in new_nodes if n not in old_nodes])']],
  ['캔버스(Canvas) API', '캔버스 API는 JavaScript로 픽셀 기반 2D 그래픽을 그릴 수 있는 웹 API입니다. 차트, 게임, 이미지 편집, 시각화처럼 직접 그리기가 필요한 화면에 사용됩니다.', '빈 도화지 위에 선, 사각형, 글자를 직접 그리는 화실과 같습니다. DOM 요소를 배치하기보다 픽셀을 칠합니다.', ['canvas = [["." for _ in range(3)] for _ in range(2)]', 'canvas[0][1] = "#"', 'print(canvas)']]
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
    id: String(1401 + index).padStart(3, '0'),
    term,
    category: '프론트엔드',
    difficulty: index < 10 ? 'easy' : index < 49 ? 'medium' : 'hard',
    phase: 4,
    week: 21,
    definition,
    hint: term.replace(/\(.+\)/, '').trim(),
    detail: {
      easy: `${term}은 사용자 인터페이스를 안정적이고 빠르게 만들기 위한 프론트엔드 핵심 개념입니다.`,
      analogy,
      example: example(term, code),
      tip: `${term}을 적용할 때는 사용자 경험, 접근성, 렌더링 비용, 유지보수성을 함께 확인하세요.`
    }
  };
});

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'terms.week21.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('wrote data/terms.week21.json');

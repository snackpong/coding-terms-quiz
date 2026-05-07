'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const plan = require('./term-bank-plan.json').filter((item) => item.week === 12);

function example(term, lines) {
  return [`# ${term} 예시: Python 3에서 실행 가능한 코드`, ...lines].join('\n');
}

const rows = [
  {
    term: '배열(Array)',
    definition: '배열은 같은 종류의 값을 연속된 인덱스 위치에 저장하는 자료구조입니다. 인덱스를 알면 원하는 원소에 바로 접근할 수 있지만, 중간 삽입과 삭제는 뒤 원소를 옮겨야 할 수 있습니다.',
    analogy: '영화관 좌석처럼 번호가 붙은 자리가 한 줄로 이어져 있는 모습과 비슷합니다. 12번 좌석은 바로 찾을 수 있지만, 중간에 새 좌석을 끼우려면 뒤쪽 좌석 배치를 다시 조정해야 합니다.',
    code: ['arr = [10, 20, 30]', 'print(arr[1])', 'arr[1] = 25', 'print(arr)']
  },
  {
    term: '동적 배열',
    definition: '동적 배열은 원소 수가 늘어나면 내부 저장 공간을 더 크게 다시 할당하는 배열입니다. 대부분의 끝 삽입은 빠르지만, 용량을 늘리는 순간에는 기존 원소를 복사하는 비용이 발생합니다.',
    analogy: '손님이 늘 때마다 더 큰 테이블로 옮기는 식당과 같습니다. 평소에는 빈 의자에 바로 앉히지만, 자리가 꽉 차면 모두가 더 큰 테이블로 이동해야 합니다.',
    code: ['items = []', 'for n in range(5):', '    items.append(n)', 'print(items, len(items))']
  },
  {
    term: '연결 리스트(Linked List)',
    definition: '연결 리스트는 각 노드가 값과 다음 노드의 위치를 함께 저장하는 선형 자료구조입니다. 중간 삽입은 포인터만 바꾸면 되지만, 특정 위치로 바로 이동하려면 앞에서부터 따라가야 합니다.',
    analogy: '보물찾기 쪽지처럼 다음 장소가 적힌 종이를 차례로 따라가는 구조입니다. 새 쪽지를 끼워 넣기는 쉽지만, 다섯 번째 쪽지를 보려면 첫 쪽지부터 순서대로 확인해야 합니다.',
    code: ['node3 = ("C", None)', 'node2 = ("B", node3)', 'node1 = ("A", node2)', 'cur = node1', 'while cur:', '    print(cur[0])', '    cur = cur[1]']
  },
  {
    term: '이중 연결 리스트',
    definition: '이중 연결 리스트는 각 노드가 다음 노드와 이전 노드의 참조를 모두 저장하는 연결 리스트입니다. 양방향 이동과 노드 삭제가 편하지만 포인터 저장 공간이 더 필요합니다.',
    analogy: '앞차와 뒷차 번호를 모두 적어 둔 기차 객차 목록과 같습니다. 어느 객차에 있든 앞뒤로 움직일 수 있지만, 객차마다 기록해야 할 정보가 하나 더 늘어납니다.',
    code: ['nodes = {"B": {"prev": "A", "next": "C"}}', 'print(nodes["B"]["prev"])', 'print(nodes["B"]["next"])']
  },
  {
    term: '원형 연결 리스트',
    definition: '원형 연결 리스트는 마지막 노드가 다시 첫 노드를 가리키도록 만든 연결 리스트입니다. 끝을 만나도 순환이 계속되므로 라운드 로빈 처리나 반복 순회에 적합합니다.',
    analogy: '끝이 없는 회전 초밥 레일과 같습니다. 마지막 접시 다음에는 다시 첫 접시가 오기 때문에 계속 같은 순서로 돌 수 있습니다.',
    code: ['items = ["A", "B", "C"]', 'idx = 0', 'for _ in range(5):', '    print(items[idx])', '    idx = (idx + 1) % len(items)']
  },
  {
    term: '스택(Stack)',
    definition: '스택은 나중에 넣은 값이 먼저 나오는 LIFO 자료구조입니다. 함수 호출, 되돌리기, 괄호 검사처럼 최근 작업을 먼저 처리해야 할 때 사용합니다.',
    analogy: '접시를 위로 쌓아 두는 선반과 같습니다. 가장 나중에 올린 접시가 맨 위에 있으므로 가장 먼저 꺼내게 됩니다.',
    code: ['stack = []', 'stack.append("첫 작업")', 'stack.append("둘째 작업")', 'print(stack.pop())', 'print(stack)']
  },
  {
    term: '큐(Queue)',
    definition: '큐는 먼저 들어온 값이 먼저 나가는 FIFO 자료구조입니다. 대기열, 작업 처리, 너비 우선 탐색처럼 도착 순서를 지켜야 할 때 쓰입니다.',
    analogy: '은행 창구 줄과 같습니다. 먼저 줄을 선 사람이 먼저 처리되고, 새로 온 사람은 줄의 뒤에 붙습니다.',
    code: ['from collections import deque', 'q = deque(["A", "B"])', 'q.append("C")', 'print(q.popleft())', 'print(list(q))']
  },
  {
    term: '덱(Deque)',
    definition: '덱은 양쪽 끝에서 삽입과 삭제가 모두 가능한 자료구조입니다. 스택과 큐의 역할을 모두 할 수 있어 슬라이딩 윈도우나 양방향 탐색에 자주 사용됩니다.',
    analogy: '앞문과 뒷문이 모두 열리는 버스와 같습니다. 승객을 앞에서도 태우고 뒤에서도 내릴 수 있어 상황에 맞게 양쪽을 활용합니다.',
    code: ['from collections import deque', 'd = deque([2, 3])', 'd.appendleft(1)', 'd.append(4)', 'print(d.pop(), d.popleft())']
  },
  {
    term: '우선순위 큐',
    definition: '우선순위 큐는 들어온 순서보다 우선순위가 높은 원소를 먼저 꺼내는 자료구조입니다. 다익스트라 알고리즘, 작업 스케줄링, 이벤트 처리에 많이 쓰입니다.',
    analogy: '응급실 접수와 같습니다. 먼저 온 순서도 중요하지만, 더 위급한 환자가 있으면 그 환자를 먼저 진료합니다.',
    code: ['import heapq', 'pq = []', 'heapq.heappush(pq, (2, "보통"))', 'heapq.heappush(pq, (1, "긴급"))', 'print(heapq.heappop(pq))']
  },
  {
    term: '힙(Heap)',
    definition: '힙은 부모와 자식 사이에 정해진 대소 관계를 유지하는 완전 이진 트리 기반 자료구조입니다. 최솟값이나 최댓값을 빠르게 확인하고 꺼내는 데 적합합니다.',
    analogy: '가장 급한 서류가 항상 맨 위에 오도록 정리되는 서류함과 같습니다. 새 서류를 넣으면 규칙에 맞게 위아래 위치가 조정됩니다.',
    code: ['import heapq', 'heap = [5, 1, 3]', 'heapq.heapify(heap)', 'print(heap[0])', 'print(heapq.heappop(heap))']
  },
  {
    term: '최대 힙',
    definition: '최대 힙은 부모 노드가 자식 노드보다 크거나 같은 힙입니다. 가장 큰 값을 빠르게 꺼내야 하는 순위 계산이나 상위 K개 문제에 사용할 수 있습니다.',
    analogy: '가장 큰 상자가 항상 맨 위로 올라오는 창고 리프트와 같습니다. 새 상자를 넣어도 무게 순서가 다시 맞춰져 제일 큰 상자를 바로 볼 수 있습니다.',
    code: ['import heapq', 'nums = [4, 9, 1]', 'heap = [-n for n in nums]', 'heapq.heapify(heap)', 'print(-heapq.heappop(heap))']
  },
  {
    term: '최소 힙',
    definition: '최소 힙은 부모 노드가 자식 노드보다 작거나 같은 힙입니다. Python의 heapq처럼 많은 라이브러리에서 기본 힙 형태로 제공됩니다.',
    analogy: '가장 빠른 마감 시간이 적힌 카드가 맨 앞에 놓이는 일정함과 같습니다. 새 카드를 넣어도 가장 임박한 일정은 계속 바로 확인할 수 있습니다.',
    code: ['import heapq', 'heap = []', 'for x in [7, 2, 5]:', '    heapq.heappush(heap, x)', 'print(heapq.heappop(heap))']
  },
  {
    term: '이진 트리',
    definition: '이진 트리는 각 노드가 최대 두 개의 자식 노드를 가지는 트리 자료구조입니다. 계층적 데이터를 표현하고 탐색, 정렬, 우선순위 구조의 기반으로 사용됩니다.',
    analogy: '각 질문에서 예/아니오 두 갈래로만 내려가는 결정표와 같습니다. 한 단계씩 내려가며 선택지가 둘로 갈라집니다.',
    code: ['tree = ("A", ("B", None, None), ("C", None, None))', 'root, left, right = tree', 'print(root, left[0], right[0])']
  },
  {
    term: '이진 탐색 트리(BST)',
    definition: '이진 탐색 트리는 왼쪽 서브트리에는 더 작은 값, 오른쪽 서브트리에는 더 큰 값을 두는 이진 트리입니다. 균형이 잘 맞으면 검색, 삽입, 삭제를 빠르게 수행합니다.',
    analogy: '사전의 중간 페이지를 기준으로 작은 단어는 왼쪽 묶음, 큰 단어는 오른쪽 묶음에 두는 책장과 같습니다. 규칙이 유지되면 원하는 단어가 있는 방향을 빠르게 고를 수 있습니다.',
    code: ['def search(node, target):', '    if node is None: return False', '    value, left, right = node', '    if value == target: return True', '    return search(left, target) if target < value else search(right, target)', 'tree = (5, (3, None, None), (8, None, None))', 'print(search(tree, 8))']
  },
  {
    term: 'AVL 트리',
    definition: 'AVL 트리는 모든 노드에서 왼쪽과 오른쪽 서브트리 높이 차이를 작게 유지하는 자가 균형 이진 탐색 트리입니다. 삽입과 삭제 후 회전을 통해 검색 성능이 한쪽으로 치우치지 않게 합니다.',
    analogy: '양쪽 접시 무게 차이가 커지면 즉시 위치를 바꾸는 저울 선반과 같습니다. 물건을 추가해도 선반이 심하게 기울지 않도록 계속 보정합니다.',
    code: ['left_height = 2', 'right_height = 1', 'balance = left_height - right_height', 'print(abs(balance) <= 1)']
  },
  {
    term: '레드-블랙 트리',
    definition: '레드-블랙 트리는 노드 색과 규칙을 이용해 높이가 지나치게 커지지 않도록 유지하는 균형 이진 탐색 트리입니다. 엄격한 균형보다 삽입과 삭제 비용을 안정적으로 유지하는 데 초점을 둡니다.',
    analogy: '검은 표지판과 빨간 표지판을 번갈아 세워 길의 길이가 너무 달라지지 않게 관리하는 산책로와 같습니다. 완벽히 같은 길이는 아니어도 어느 길도 과하게 길어지지 않습니다.',
    code: ['node = {"value": 10, "color": "black"}', 'child = {"value": 7, "color": "red"}', 'print(node["color"], child["color"])']
  },
  {
    term: 'B-트리',
    definition: 'B-트리는 하나의 노드에 여러 키와 자식을 저장해 디스크 접근 횟수를 줄이는 균형 탐색 트리입니다. 데이터베이스 인덱스와 파일 시스템처럼 큰 블록 단위 저장소에서 유리합니다.',
    analogy: '한 페이지에 여러 갈림길 안내가 들어 있는 큰 지도책과 같습니다. 페이지를 한 번 펼칠 때마다 여러 범위를 동시에 좁힐 수 있어 책장을 덜 넘깁니다.',
    code: ['node_keys = [10, 20, 30]', 'x = 25', 'bucket = sum(x > key for key in node_keys)', 'print(bucket)']
  },
  {
    term: 'B+트리',
    definition: 'B+트리는 실제 데이터나 레코드 포인터를 주로 리프 노드에 모으고 리프끼리 연결한 B-트리 변형입니다. 범위 검색과 순차 읽기에 특히 강합니다.',
    analogy: '목차는 위층에 있고 실제 상품은 아래층 진열대에 순서대로 놓인 매장과 같습니다. 특정 위치를 찾은 뒤에는 진열대를 따라 옆으로 이동하며 범위를 읽을 수 있습니다.',
    code: ['leaves = [[1, 2], [3, 4], [5, 6]]', 'result = []', 'for leaf in leaves:', '    result.extend(x for x in leaf if 2 <= x <= 5)', 'print(result)']
  },
  {
    term: '트라이(Trie)',
    definition: '트라이는 문자열을 문자 단위 경로로 저장하는 트리 자료구조입니다. 접두사 검색, 자동완성, 사전 구현에서 공통 접두사를 효율적으로 공유합니다.',
    analogy: '단어의 첫 글자부터 복도 표지판을 따라 내려가는 사전 건물과 같습니다. 같은 접두사를 가진 단어들은 같은 복도를 함께 사용합니다.',
    code: ['trie = {}', 'for word in ["to", "tea"]:', '    cur = trie', '    for ch in word:', '        cur = cur.setdefault(ch, {})', '    cur["$"] = True', 'print("t" in trie)']
  },
  {
    term: '세그먼트 트리',
    definition: '세그먼트 트리는 배열 구간 정보를 트리에 저장해 구간 질의와 원소 갱신을 빠르게 처리하는 자료구조입니다. 합, 최솟값, 최댓값 같은 결합 가능한 연산에 자주 쓰입니다.',
    analogy: '아파트 층별 전기 사용량을 동, 라인, 층 묶음별로 미리 적어 둔 관리표와 같습니다. 한 구간의 총량을 물으면 필요한 묶음 몇 개만 더하면 됩니다.',
    code: ['arr = [2, 1, 5, 3]', 'prefix = [0]', 'for x in arr:', '    prefix.append(prefix[-1] + x)', 'print(prefix[3] - prefix[1])']
  },
  {
    term: '펜윅 트리(BIT)',
    definition: '펜윅 트리는 배열의 누적 합과 값 갱신을 로그 시간에 처리하는 인덱스 기반 자료구조입니다. 세그먼트 트리보다 구현과 메모리가 간단한 경우가 많습니다.',
    analogy: '금액 장부를 1일, 2일 묶음, 4일 묶음처럼 겹치지 않는 단위로 적어 둔 회계 노트와 같습니다. 합계를 낼 때 필요한 묶음만 골라 빠르게 더합니다.',
    code: ['bit = [0] * 5', 'def add(i, v):', '    while i < len(bit):', '        bit[i] += v; i += i & -i', 'add(1, 3); add(3, 2)', 'print(bit)']
  },
  {
    term: '해시 테이블 리해싱',
    definition: '해시 테이블 리해싱은 버킷 수나 해시 기준이 바뀔 때 기존 키를 새 테이블 위치로 다시 배치하는 작업입니다. 테이블이 커지거나 충돌이 많아질 때 성능을 회복하기 위해 수행합니다.',
    analogy: '사물함 번호 체계를 바꾸면서 모든 물건을 새 번호표 기준으로 다시 넣는 작업과 같습니다. 번호표만 바꾸면 되는 것이 아니라 실제 물건 위치도 모두 다시 정해야 합니다.',
    code: ['old = {"a": 1, "b": 2}', 'new_size = 8', 'slots = [[] for _ in range(new_size)]', 'for k, v in old.items():', '    slots[hash(k) % new_size].append((k, v))', 'print(sum(len(s) for s in slots))']
  },
  {
    term: '해시 함수',
    definition: '해시 함수는 키를 고정된 범위의 숫자나 비트열로 변환하는 함수입니다. 해시 테이블에서는 이 값을 이용해 키가 들어갈 버킷 위치를 정합니다.',
    analogy: '손님의 이름을 사물함 번호로 바꿔 주는 접수 규칙과 같습니다. 규칙이 고르게 배정할수록 한 사물함에 사람이 몰리지 않습니다.',
    code: ['def simple_hash(text, size):', '    return sum(ord(ch) for ch in text) % size', 'print(simple_hash("cat", 10))']
  },
  {
    term: '충돌 해결(체이닝)',
    definition: '체이닝은 같은 해시 버킷에 여러 키가 들어오면 리스트나 연결 리스트에 함께 저장하는 충돌 해결 방법입니다. 버킷 안에서 다시 키를 비교해 원하는 값을 찾습니다.',
    analogy: '같은 우편함 번호로 분류된 편지를 우편함 안의 묶음으로 보관하는 방식과 같습니다. 번호가 같아도 봉투 이름을 다시 확인하면 정확한 편지를 찾을 수 있습니다.',
    code: ['bucket = []', 'bucket.append(("ad", 1))', 'bucket.append(("bc", 2))', 'print([v for k, v in bucket if k == "bc"][0])']
  },
  {
    term: '충돌 해결(개방 주소법)',
    definition: '개방 주소법은 충돌이 발생하면 같은 배열 안의 다른 빈 칸을 탐사해 저장하는 해시 충돌 해결 방법입니다. 선형 탐사, 제곱 탐사, 이중 해싱 같은 방식이 있습니다.',
    analogy: '예약한 주차 칸이 차 있으면 같은 주차장 안에서 다음 빈 칸을 찾아 주차하는 방식과 같습니다. 멀리 갈수록 찾는 시간은 늘 수 있습니다.',
    code: ['table = [None] * 5', 'for key in [0, 5]:', '    i = key % len(table)', '    while table[i] is not None:', '        i = (i + 1) % len(table)', '    table[i] = key', 'print(table)']
  },
  {
    term: '로드 팩터',
    definition: '로드 팩터는 해시 테이블에서 저장된 원소 수를 버킷 수로 나눈 값입니다. 값이 커질수록 충돌 가능성이 높아져 리사이징이나 리해싱이 필요해질 수 있습니다.',
    analogy: '주차장의 점유율과 같습니다. 빈자리가 많을 때는 쉽게 주차하지만, 거의 꽉 차면 빈 칸을 찾느라 시간이 오래 걸립니다.',
    code: ['items = 7', 'buckets = 10', 'load_factor = items / buckets', 'print(load_factor > 0.7)']
  },
  {
    term: '그래프(Graph)',
    definition: '그래프는 정점과 정점 사이의 간선으로 관계를 표현하는 자료구조입니다. 네트워크, 길 찾기, 의존성, 추천 관계처럼 연결 구조가 중요한 문제에 사용됩니다.',
    analogy: '도시 지도에서 장소는 점, 도로는 선으로 표시한 모습과 같습니다. 어디가 어디와 연결되는지가 핵심 정보입니다.',
    code: ['graph = {"A": ["B", "C"], "B": ["A"], "C": ["A"]}', 'print(graph["A"])']
  },
  {
    term: '방향 그래프',
    definition: '방향 그래프는 간선에 방향이 있어 한쪽에서 다른 쪽으로만 이동할 수 있는 그래프입니다. 팔로우 관계, 작업 선후 관계, 일방통행 도로를 표현할 때 적합합니다.',
    analogy: '일방통행 도로 지도와 같습니다. A에서 B로 갈 수 있어도 같은 길로 B에서 A로 돌아올 수 있다는 뜻은 아닙니다.',
    code: ['graph = {"A": ["B"], "B": []}', 'print("B" in graph["A"])', 'print("A" in graph["B"])']
  },
  {
    term: '무방향 그래프',
    definition: '무방향 그래프는 간선에 방향이 없어 연결된 두 정점 사이를 양쪽으로 이동할 수 있는 그래프입니다. 친구 관계나 양방향 도로처럼 대칭 관계를 표현합니다.',
    analogy: '서로 악수한 사람들의 관계표와 같습니다. A가 B와 악수했다면 B도 A와 악수한 관계입니다.',
    code: ['graph = {"A": set(), "B": set()}', 'graph["A"].add("B")', 'graph["B"].add("A")', 'print(graph)']
  },
  {
    term: '가중치 그래프',
    definition: '가중치 그래프는 간선마다 거리, 비용, 시간 같은 숫자 값을 붙인 그래프입니다. 최단 경로, 최소 비용 연결, 네트워크 최적화 문제에서 사용됩니다.',
    analogy: '도로마다 통행료나 소요 시간이 적힌 지도와 같습니다. 연결 여부뿐 아니라 각 길을 지날 때 드는 비용도 함께 봐야 합니다.',
    code: ['edges = {("A", "B"): 5, ("A", "C"): 2}', 'print(min(edges, key=edges.get), min(edges.values()))']
  },
  {
    term: '인접 행렬',
    definition: '인접 행렬은 정점 쌍의 연결 여부나 가중치를 2차원 배열에 저장하는 그래프 표현 방식입니다. 두 정점이 연결됐는지 빠르게 확인할 수 있지만 정점 수가 크면 메모리를 많이 씁니다.',
    analogy: '모든 학생 쌍에 대해 친한지 아닌지를 표 칸으로 적어 둔 출석부와 같습니다. 확인은 빠르지만 학생이 많아지면 표가 매우 커집니다.',
    code: ['matrix = [[0, 1, 0], [1, 0, 1], [0, 1, 0]]', 'print(matrix[0][1] == 1)']
  },
  {
    term: '인접 리스트',
    definition: '인접 리스트는 각 정점마다 직접 연결된 이웃 정점 목록을 저장하는 그래프 표현 방식입니다. 간선이 적은 그래프에서 메모리를 아끼고 순회하기 좋습니다.',
    analogy: '각 사람 이름 옆에 그 사람이 직접 아는 사람만 적어 둔 연락처 목록과 같습니다. 관계가 적을 때 빈칸을 많이 만들지 않아도 됩니다.',
    code: ['adj = {0: [1], 1: [0, 2], 2: [1]}', 'for neighbor in adj[1]:', '    print(neighbor)']
  },
  {
    term: '희소 그래프',
    definition: '희소 그래프는 가능한 간선 수에 비해 실제 간선 수가 적은 그래프입니다. 인접 리스트가 보통 효율적이며, 모든 정점 쌍을 확인하는 방식은 낭비가 커질 수 있습니다.',
    analogy: '대부분 지역 사이에 직항이 없는 항공 노선도와 같습니다. 가능한 연결은 많지만 실제 노선은 일부만 존재합니다.',
    code: ['n = 100', 'edges = 120', 'possible = n * (n - 1) // 2', 'print(edges / possible < 0.1)']
  },
  {
    term: '밀집 그래프',
    definition: '밀집 그래프는 가능한 간선 수에 비해 실제 간선 수가 많은 그래프입니다. 많은 정점 쌍이 직접 연결되어 있어 인접 행렬도 고려할 수 있습니다.',
    analogy: '거의 모든 도시 사이에 직행 버스가 있는 교통망과 같습니다. 어느 두 도시를 골라도 직접 연결된 경우가 많습니다.',
    code: ['n = 5', 'edges = 9', 'possible = n * (n - 1) // 2', 'print(edges / possible)']
  },
  {
    term: '사이클',
    definition: '사이클은 그래프에서 한 정점에서 출발해 간선을 따라 이동한 뒤 다시 같은 정점으로 돌아오는 경로입니다. 의존성 검사, 위상 정렬 가능 여부, 순환 참조 탐지에서 중요합니다.',
    analogy: '산책로를 따라 걷다가 출발한 입구로 다시 돌아오는 순환 코스와 같습니다. 계속 돌 수 있기 때문에 종료 조건이 없으면 같은 길을 반복할 수 있습니다.',
    code: ['path = ["A", "B", "C", "A"]', 'print(path[0] == path[-1])']
  },
  {
    term: '연결 컴포넌트',
    definition: '연결 컴포넌트는 무방향 그래프에서 서로 도달 가능한 정점들이 이루는 최대 묶음입니다. 그래프가 몇 개의 독립된 덩어리로 나뉘는지 분석할 때 사용합니다.',
    analogy: '서로 길로 이어진 섬 무리와 같습니다. 같은 무리 안에서는 이동할 수 있지만 다른 무리로는 다리가 없습니다.',
    code: ['visited = set()', 'component = {"A", "B", "C"}', 'visited |= component', 'print("B" in visited, len(component))']
  },
  {
    term: '강연결 컴포넌트',
    definition: '강연결 컴포넌트는 방향 그래프에서 묶음 안의 어떤 두 정점도 서로 왕복 도달 가능한 최대 집합입니다. 웹 링크, 의존성, 순환 구조 분석에 사용됩니다.',
    analogy: '일방통행 골목이 많은 동네에서 서로 오갈 수 있는 블록 묶음과 같습니다. 한쪽으로만 갈 수 있는 장소는 같은 묶음에 넣지 않습니다.',
    code: ['reach_ab = True', 'reach_ba = True', 'print(reach_ab and reach_ba)']
  },
  {
    term: 'DAG(방향 비순환 그래프)',
    definition: 'DAG는 방향 간선을 가지면서 사이클이 없는 그래프입니다. 작업 순서, 빌드 의존성, 위상 정렬처럼 선후 관계가 명확한 구조를 표현합니다.',
    analogy: '선수 과목이 정해진 수강 계획표와 같습니다. 뒤 과목에서 앞 과목으로 다시 돌아가는 순환이 없어야 정상적으로 순서를 세울 수 있습니다.',
    code: ['edges = [("기초", "응용"), ("응용", "프로젝트")]', 'order = ["기초", "응용", "프로젝트"]', 'print(all(order.index(a) < order.index(b) for a, b in edges))']
  },
  {
    term: '트리의 높이/깊이',
    definition: '트리에서 깊이는 루트에서 특정 노드까지의 간선 수이고, 높이는 해당 노드에서 가장 먼 리프까지의 간선 수입니다. 트리 알고리즘의 시간 복잡도와 균형 상태를 판단하는 기준이 됩니다.',
    analogy: '건물에서 깊이는 로비에서 해당 방까지 내려간 층수이고, 높이는 그 방 아래로 더 내려갈 수 있는 최대 층수와 같습니다.',
    code: ['depth_of_node = 3', 'height_of_node = 2', 'print(depth_of_node, height_of_node)']
  },
  {
    term: '균형 트리',
    definition: '균형 트리는 서브트리 높이 차이를 제한해 전체 높이가 너무 커지지 않게 유지하는 트리입니다. 검색과 삽입 성능이 최악의 연결 리스트처럼 무너지는 것을 막습니다.',
    analogy: '양쪽 가지를 계속 가지치기해 한쪽만 길게 자라지 않게 관리하는 정원수와 같습니다. 어느 방향으로 가도 길이가 비슷해야 찾는 시간이 안정적입니다.',
    code: ['left_height = 3', 'right_height = 4', 'print(abs(left_height - right_height) <= 1)']
  },
  {
    term: '힙 정렬 과정',
    definition: '힙 정렬은 배열을 힙으로 만든 뒤 루트 원소를 반복해서 꺼내 정렬된 순서를 만드는 정렬 방법입니다. 추가 메모리를 적게 쓰면서 O(n log n) 시간에 정렬할 수 있습니다.',
    analogy: '가장 큰 물건을 계속 맨 앞으로 올리는 자동 선반에서 하나씩 꺼내 뒤쪽에 놓는 작업과 같습니다. 매번 선반을 다시 정리해 다음 큰 물건을 찾습니다.',
    code: ['import heapq', 'nums = [4, 1, 3]', 'heapq.heapify(nums)', 'sorted_nums = [heapq.heappop(nums) for _ in range(len(nums))]', 'print(sorted_nums)']
  },
  {
    term: '힙 삽입/삭제',
    definition: '힙 삽입은 새 원소를 끝에 넣고 부모와 비교하며 위로 올리는 작업이고, 삭제는 루트를 제거한 뒤 마지막 원소를 내려 보내며 힙 조건을 회복하는 작업입니다.',
    analogy: '새 직원의 우선순위가 높으면 조직도에서 위로 승진시키고, 팀장이 빠지면 마지막 직원을 올린 뒤 적절한 자리까지 내려 보내는 과정과 같습니다.',
    code: ['import heapq', 'heap = []', 'heapq.heappush(heap, 3)', 'heapq.heappush(heap, 1)', 'removed = heapq.heappop(heap)', 'print(removed, heap)']
  },
  {
    term: '스택 오버플로',
    definition: '스택 오버플로는 호출 스택이나 스택 메모리가 허용 한계를 넘어설 때 발생하는 오류입니다. 종료 조건이 없는 재귀나 너무 깊은 재귀 호출에서 흔히 나타납니다.',
    analogy: '서류를 책상 위에 계속 쌓다가 더 이상 버티지 못하고 무너지는 상황과 같습니다. 일을 끝내며 서류를 빼지 않으면 어느 순간 한계에 닿습니다.',
    code: ['def countdown(n):', '    if n == 0:', '        return "끝"', '    return countdown(n - 1)', 'print(countdown(3))']
  },
  {
    term: '원형 큐',
    definition: '원형 큐는 배열의 끝 다음 위치를 다시 처음으로 연결해 공간을 순환 사용하도록 만든 큐입니다. 고정 크기 버퍼에서 앞뒤 포인터만 움직여 효율적으로 대기열을 관리합니다.',
    analogy: '회전문처럼 마지막 칸 다음이 다시 첫 칸으로 이어지는 대기 공간과 같습니다. 앞사람이 나가면 생긴 빈자리를 뒤쪽 요청이 다시 사용할 수 있습니다.',
    code: ['buf = [None] * 3', 'front = rear = 0', 'buf[rear] = "A"; rear = (rear + 1) % len(buf)', 'buf[rear] = "B"; rear = (rear + 1) % len(buf)', 'print(buf, front, rear)']
  },
  {
    term: '슬라이딩 윈도우 큐',
    definition: '슬라이딩 윈도우 큐는 일정 범위 안의 원소만 큐에 유지하면서 창이 이동할 때 오래된 원소를 제거하는 방식입니다. 최근 N개 데이터의 합, 평균, 최댓값 계산에 쓰입니다.',
    analogy: '기차 창문으로 보이는 풍경만 기록하는 관찰자와 같습니다. 기차가 앞으로 가면 뒤쪽 풍경은 사라지고 앞쪽 풍경이 새로 들어옵니다.',
    code: ['from collections import deque', 'window = deque(maxlen=3)', 'for x in [1, 2, 3, 4]:', '    window.append(x)', '    print(list(window))']
  },
  {
    term: '모노토닉 스택',
    definition: '모노토닉 스택은 값이 증가하거나 감소하는 순서를 유지하도록 원소를 넣고 빼는 스택입니다. 다음 큰 값, 주식 가격, 히스토그램 문제처럼 가까운 우세 원소를 찾을 때 사용합니다.',
    analogy: '키 순서가 깨지면 뒤 사람을 줄에서 빼는 사진 대기줄과 같습니다. 줄 안에는 항상 정해진 키 방향이 유지되어 바로 비교할 수 있습니다.',
    code: ['stack = []', 'for x in [2, 1, 3]:', '    while stack and stack[-1] < x:', '        print("pop", stack.pop())', '    stack.append(x)', 'print(stack)']
  },
  {
    term: '모노토닉 큐',
    definition: '모노토닉 큐는 큐 안의 값이 한 방향으로 정렬되도록 유지하는 자료구조입니다. 슬라이딩 윈도우 최댓값이나 최솟값을 빠르게 구할 때 유용합니다.',
    analogy: '가장 큰 택배 상자가 항상 앞쪽에 보이도록 작은 상자를 뒤에서 정리하는 컨베이어 벨트와 같습니다. 창이 움직이면 오래된 상자는 앞에서 빠집니다.',
    code: ['from collections import deque', 'dq = deque()', 'for x in [1, 3, 2]:', '    while dq and dq[-1] < x:', '        dq.pop()', '    dq.append(x)', 'print(dq[0])']
  },
  {
    term: '희소 배열',
    definition: '희소 배열은 대부분의 원소가 기본값이나 0인 배열을 실제 값이 있는 위치만 저장해 표현한 구조입니다. 큰 인덱스 공간에서 메모리를 절약할 수 있습니다.',
    analogy: '거대한 달력에서 일정이 있는 날짜만 포스트잇으로 표시하는 방식과 같습니다. 빈 날짜를 전부 종이에 쓰지 않아도 필요한 날만 찾을 수 있습니다.',
    code: ['sparse = {1000: "값", 5000: "다른 값"}', 'print(sparse.get(1000))', 'print(sparse.get(2, 0))']
  },
  {
    term: '비트 배열',
    definition: '비트 배열은 각 상태를 하나의 비트로 저장하는 조밀한 불리언 배열입니다. 많은 참/거짓 값을 적은 메모리로 보관해야 할 때 사용합니다.',
    analogy: '수천 개 체크박스를 전구 하나씩으로 표시하는 패널과 같습니다. 켜짐과 꺼짐만 필요하므로 큰 종이 대신 작은 불빛으로 충분합니다.',
    code: ['bits = 0', 'bits |= 1 << 3', 'bits |= 1 << 5', 'print(bool(bits & (1 << 3)))']
  },
  {
    term: '해시 셋',
    definition: '해시 셋은 값을 해시로 배치해 중복 없이 저장하고 포함 여부를 빠르게 확인하는 집합 자료구조입니다. 순서보다 존재 여부 검사와 중복 제거가 중요할 때 쓰입니다.',
    analogy: '입장 도장을 찍은 손님 명단과 같습니다. 같은 사람이 다시 와도 한 번만 기록하고, 명단에 있는지는 빠르게 확인합니다.',
    code: ['seen = set()', 'for x in [1, 2, 2, 3]:', '    seen.add(x)', 'print(2 in seen, seen)']
  },
  {
    term: '문자열 풀',
    definition: '문자열 풀은 같은 문자열 값을 하나만 저장하고 여러 곳에서 공유하도록 관리하는 메모리 최적화 기법입니다. 중복 문자열이 많을 때 메모리 사용량과 비교 비용을 줄일 수 있습니다.',
    analogy: '회사에서 같은 양식 문서를 여러 번 복사하지 않고 원본 링크만 공유하는 방식과 같습니다. 모두 같은 문서를 가리키므로 저장 공간을 아낍니다.',
    code: ['import sys', 'a = sys.intern("status_ok")', 'b = sys.intern("status_" + "ok")', 'print(a is b)']
  },
  {
    term: '영속적 자료구조',
    definition: '영속적 자료구조는 수정 후에도 이전 버전을 보존하는 자료구조입니다. 변경된 부분만 새로 만들고 나머지를 공유해 되돌리기나 버전 관리에 유리합니다.',
    analogy: '문서의 새 버전을 만들 때 전체를 복사하지 않고 바뀐 페이지만 새로 끼워 넣는 편집 방식과 같습니다. 예전 판본도 그대로 다시 열 수 있습니다.',
    code: ['old = (1, 2, 3)', 'new = old + (4,)', 'print(old)', 'print(new)']
  },
  {
    term: '함수형 자료구조',
    definition: '함수형 자료구조는 변경 가능한 상태를 피하고 새 값을 만들어 반환하는 방식에 맞춘 자료구조입니다. 불변성과 구조 공유를 활용해 예측 가능한 코드를 작성하게 돕습니다.',
    analogy: '레고 작품을 뜯어고치기보다 새 조각을 덧붙인 다른 작품 사진을 남기는 방식과 같습니다. 원래 작품은 그대로 보존됩니다.',
    code: ['def add_item(items, value):', '    return items + (value,)', 'base = (1, 2)', 'print(base, add_item(base, 3))']
  },
  {
    term: '블룸 필터',
    definition: '블룸 필터는 여러 해시 함수와 비트 배열로 원소가 집합에 없음을 빠르게 판단하는 확률적 자료구조입니다. 거짓 양성은 가능하지만 거짓 음성은 없도록 설계됩니다.',
    analogy: '입구에서 여러 색 도장을 확인하는 간이 출입 검사와 같습니다. 도장이 없으면 확실히 미등록이지만, 도장이 있다고 해서 반드시 본인이라고 단정할 수는 없습니다.',
    code: ['bits = set()', 'def add(x):', '    bits.update({hash(x) % 10, hash(x + "!") % 10})', 'def maybe(x):', '    return {hash(x) % 10, hash(x + "!") % 10} <= bits', 'add("cat")', 'print(maybe("cat"), maybe("dog"))']
  },
  {
    term: '스킵 리스트',
    definition: '스킵 리스트는 여러 높이의 링크를 둔 정렬 연결 리스트로, 일부 노드가 빠른 길 역할을 합니다. 균형 트리처럼 평균 로그 시간 검색을 제공하면서 구현이 비교적 단순합니다.',
    analogy: '일반 도로 위에 급행 정류장이 층층이 있는 버스 노선과 같습니다. 가까운 곳은 일반 정류장으로, 먼 곳은 급행 링크로 건너뜁니다.',
    code: ['levels = {2: [1, 5, 9], 1: [1, 3, 5, 7, 9]}', 'target = 7', 'print(any(x == target for x in levels[1]))']
  },
  {
    term: '피보나치 힙',
    definition: '피보나치 힙은 여러 트리를 느슨하게 묶어 decrease-key 같은 연산의 분할 상환 비용을 낮춘 우선순위 큐입니다. 이론적으로 다익스트라 알고리즘의 특정 구현에서 장점이 있습니다.',
    analogy: '서류 더미를 즉시 완벽하게 정리하지 않고 필요한 순간에 한꺼번에 묶어 정리하는 사무 방식과 같습니다. 평소 변경은 가볍게 처리하고 정산 시점에 구조를 맞춥니다.',
    code: ['tasks = [(5, "A"), (2, "B")]', 'tasks.append((1, "A의 새 우선순위"))', 'print(min(tasks))']
  },
  {
    term: '캐시 교체 정책(LRU)',
    definition: 'LRU는 가장 오랫동안 사용되지 않은 항목을 먼저 제거하는 캐시 교체 정책입니다. 최근에 쓴 데이터가 가까운 미래에도 다시 쓰일 가능성이 높다는 가정에 기반합니다.',
    analogy: '책상 위 공간이 부족하면 가장 오래 손대지 않은 책을 책장으로 돌려보내는 방식과 같습니다. 방금 읽은 책은 다시 볼 가능성이 높아 책상에 남겨 둡니다.',
    code: ['from collections import OrderedDict', 'cache = OrderedDict()', 'for k in ["A", "B", "A", "C"]:', '    if k in cache: cache.move_to_end(k)', '    cache[k] = True', 'print(list(cache))']
  },
  {
    term: 'LFU 캐시',
    definition: 'LFU 캐시는 사용 빈도가 가장 낮은 항목을 먼저 제거하는 캐시 교체 정책입니다. 접근 횟수를 기록해 자주 쓰이는 데이터를 오래 보존합니다.',
    analogy: '카페 메뉴판에서 거의 주문되지 않는 메뉴를 먼저 내리는 방식과 같습니다. 최근 주문 여부보다 누적 인기가 낮은 메뉴가 교체 대상이 됩니다.',
    code: ['freq = {"A": 3, "B": 1, "C": 2}', 'victim = min(freq, key=freq.get)', 'print(victim)']
  },
  {
    term: '구간 트리(Interval Tree)',
    definition: '구간 트리는 시작과 끝을 가진 여러 구간을 저장하고 특정 점이나 구간과 겹치는 항목을 빠르게 찾는 자료구조입니다. 일정 충돌, 범위 검색, 지리 정보 처리에 쓰입니다.',
    analogy: '회의실 예약표에서 원하는 시간과 겹치는 예약을 빠르게 찾는 도구와 같습니다. 모든 예약을 하나씩 훑지 않고 겹칠 가능성이 있는 구간으로 좁힙니다.',
    code: ['intervals = [(1, 4), (6, 9), (3, 5)]', 'point = 3', 'hits = [iv for iv in intervals if iv[0] <= point <= iv[1]]', 'print(hits)']
  },
  {
    term: 'KD-트리',
    definition: 'KD-트리는 k차원 점들을 축을 번갈아 기준으로 나누어 저장하는 공간 분할 트리입니다. 다차원 최근접 이웃 검색과 범위 검색에 사용됩니다.',
    analogy: '지도에서 세로선과 가로선을 번갈아 그어 지역을 계속 반으로 나누는 방식과 같습니다. 찾는 위치가 어느 칸에 있는지 따라 후보를 줄입니다.',
    code: ['points = [(1, 2), (5, 4), (2, 3)]', 'target = (2, 2)', 'nearest = min(points, key=lambda p: (p[0]-target[0])**2 + (p[1]-target[1])**2)', 'print(nearest)']
  },
  {
    term: 'R-트리',
    definition: 'R-트리는 사각형 경계 상자로 공간 객체를 계층적으로 묶어 저장하는 인덱스 구조입니다. 지도, 도형, 위치 기반 데이터의 범위 검색과 충돌 후보 검색에 적합합니다.',
    analogy: '서류를 작은 봉투에 넣고, 관련 봉투를 더 큰 상자에 넣어 보관하는 지도 보관함과 같습니다. 찾는 지역과 겹치는 상자만 열어 보면 됩니다.',
    code: ['boxes = [((0, 0), (2, 2)), ((5, 5), (7, 7))]', 'x, y = 1, 1', 'print([b for b in boxes if b[0][0] <= x <= b[1][0] and b[0][1] <= y <= b[1][1]])']
  },
  {
    term: '쿼드트리',
    definition: '쿼드트리는 2차원 공간을 네 개의 사분면으로 반복 분할하는 트리 자료구조입니다. 이미지 압축, 충돌 검사, 공간 검색에서 영역을 효율적으로 나눌 때 사용합니다.',
    analogy: '종이를 계속 네 칸으로 접어 필요한 칸만 더 잘게 나누는 지도와 같습니다. 복잡한 지역은 세밀하게, 단순한 지역은 크게 유지합니다.',
    code: ['x, y = 3, 7', 'mid = 5', 'quadrant = ("top" if y >= mid else "bottom", "right" if x >= mid else "left")', 'print(quadrant)']
  },
  {
    term: '트레이(Treap)',
    definition: '트레이는 키에는 이진 탐색 트리 규칙을, 무작위 우선순위에는 힙 규칙을 적용하는 자료구조입니다. 무작위성을 이용해 평균적으로 균형 잡힌 탐색 트리를 만듭니다.',
    analogy: '이름순으로 줄을 세우되 각 사람에게 뽑기 번호를 줘 높은 번호가 위층에 서도록 조정하는 계단식 명단과 같습니다. 이름 순서와 우선순위 규칙이 동시에 유지됩니다.',
    code: ['node = {"key": 10, "priority": 0.42}', 'left = {"key": 5, "priority": 0.30}', 'print(left["key"] < node["key"] and left["priority"] < node["priority"])']
  },
  {
    term: '스플레이 트리',
    definition: '스플레이 트리는 접근한 노드를 회전을 통해 루트로 끌어올리는 자가 조정 이진 탐색 트리입니다. 최근 접근한 값이 다시 쓰일 때 빠르게 접근할 수 있습니다.',
    analogy: '자주 찾는 파일을 서랍 깊숙한 곳에서 꺼내 책상 맨 위에 올려두는 습관과 같습니다. 방금 쓴 파일은 다음에 다시 찾기 쉬워집니다.',
    code: ['recent = []', 'def access(x):', '    if x in recent: recent.remove(x)', '    recent.insert(0, x)', 'access("A"); access("B"); access("A")', 'print(recent)']
  },
  {
    term: 'XOR 연결 리스트',
    definition: 'XOR 연결 리스트는 이전 노드와 다음 노드 주소를 XOR한 값 하나만 저장해 양방향 연결을 표현하는 특수한 리스트입니다. 메모리는 줄일 수 있지만 구현과 디버깅이 어렵고 안전한 언어에서는 잘 쓰이지 않습니다.',
    analogy: '앞집 번호와 뒷집 번호를 따로 적지 않고 두 번호를 섞은 암호 하나만 적어 둔 골목 지도와 같습니다. 직전 위치를 알아야 다음 위치를 풀 수 있습니다.',
    code: ['prev_id = 10', 'next_id = 25', 'both = prev_id ^ next_id', 'print(both ^ prev_id)']
  },
  {
    term: '로프(Rope) 자료구조',
    definition: '로프는 긴 문자열을 작은 문자열 조각들의 트리로 저장하는 자료구조입니다. 대용량 텍스트의 삽입, 삭제, 연결을 전체 복사 없이 처리하는 데 유리합니다.',
    analogy: '긴 현수막을 여러 천 조각으로 나누어 고리로 연결해 둔 모습과 같습니다. 중간 문구를 바꿀 때 전체 현수막을 새로 만들지 않아도 됩니다.',
    code: ['left = "hello "', 'right = "world"', 'rope = (left, right)', 'print("".join(rope))']
  },
  {
    term: '이중 해싱(Double Hashing)',
    definition: '이중 해싱은 개방 주소법에서 충돌이 나면 두 번째 해시 함수로 탐사 간격을 정하는 방법입니다. 선형 탐사보다 군집화가 줄어드는 장점이 있습니다.',
    analogy: '첫 주차 칸이 막혀 있으면 차마다 다른 보폭으로 다음 칸을 찾아가는 주차 규칙과 같습니다. 모두가 바로 옆 칸만 찾지 않아 한 구역에 덜 몰립니다.',
    code: ['size = 7', 'key = 20', 'h1 = key % size', 'h2 = 1 + key % (size - 1)', 'print([(h1 + i * h2) % size for i in range(4)])']
  },
  {
    term: '로빈 후드 해싱',
    definition: '로빈 후드 해싱은 개방 주소법에서 더 멀리 밀려난 키가 덜 밀려난 키의 자리를 빼앗을 수 있게 하는 전략입니다. 탐사 길이의 편차를 줄여 조회 시간을 안정화합니다.',
    analogy: '줄에서 너무 멀리 밀려난 사람이 앞쪽에서 덜 기다린 사람과 자리를 바꾸는 규칙과 같습니다. 모두의 대기 시간이 비슷해지도록 조정합니다.',
    code: ['distances = {"A": 0, "B": 3}', 'new_distance = 4', 'print(new_distance > distances["A"])']
  },
  {
    term: '해시 맵 리사이징',
    definition: '해시 맵 리사이징은 저장 원소가 늘어 로드 팩터가 기준을 넘을 때 내부 버킷 배열을 더 크게 만드는 작업입니다. 리사이징 후에는 키를 새 버킷 기준으로 다시 배치해야 합니다.',
    analogy: '작은 우편 분류함이 꽉 차면 더 많은 칸이 있는 분류대로 옮기는 일과 같습니다. 칸 수가 바뀌면 편지마다 들어갈 위치도 다시 계산합니다.',
    code: ['items = 8', 'capacity = 10', 'if items / capacity > 0.7:', '    capacity *= 2', 'print(capacity)']
  },
  {
    term: '카운팅 블룸 필터',
    definition: '카운팅 블룸 필터는 비트 대신 작은 카운터 배열을 사용해 원소 삭제를 지원하는 블룸 필터 변형입니다. 삽입 시 카운터를 올리고 삭제 시 관련 카운터를 내립니다.',
    analogy: '출입 도장 대신 각 검사대에 통과 횟수 계수기를 두는 방식과 같습니다. 누가 나가면 관련 계수기를 줄일 수 있어 단순 도장보다 삭제 처리가 가능합니다.',
    code: ['counts = [0] * 5', 'positions = [1, 3]', 'for p in positions:', '    counts[p] += 1', 'for p in positions:', '    counts[p] -= 1', 'print(counts)']
  }
];

if (rows.length !== 70) {
  throw new Error(`Expected 70 rows, got ${rows.length}`);
}

const data = rows.map((row, index) => {
  const planned = plan[index];
  if (!planned || planned.term !== row.term) {
    throw new Error(`Plan mismatch at ${index}: expected ${planned && planned.term}, got ${row.term}`);
  }
  return {
    id: String(771 + index).padStart(3, '0'),
    term: row.term,
    category: '자료구조',
    difficulty: index < 14 ? 'easy' : index < 53 ? 'medium' : 'hard',
    phase: 3,
    week: 12,
    definition: row.definition,
    hint: row.term.replace(/\(.+\)/, '').trim(),
    detail: {
      easy: `${row.term}의 핵심은 저장 방식과 접근 비용을 함께 이해하는 것입니다.`,
      analogy: row.analogy,
      example: example(row.term, row.code),
      tip: `${row.term}을 사용할 때는 조회, 삽입, 삭제, 메모리 사용량 중 어떤 비용이 중요한지 먼저 정하세요.`
    }
  };
});

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'terms.week12.json'), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('wrote data/terms.week12.json');

# Claude Code 실행 프롬프트 — 사이트워드 전체 시스템 (Chapter2~5 내장형 50단어 + 사이트워드 섬 83단어)

> Cursor 터미널의 `claude` 명령에 그대로 붙여넣으세요.
> 근거 문서: `SPEC.md` §19(Chapter2~5 내장형 사이트워드), §20(사이트워드 섬) / `K-Phonics_OPS_Adventure_지도체계_마스터표.md` §2~§4. 이 문서들을 먼저 읽고 시작할 것.

---

먼저 `SPEC.md`의 §19와 §20, `K-Phonics_OPS_Adventure_지도체계_마스터표.md`의 §2~§4를 읽어줘. 그리고 `js/data.js`에서 Chapter1이 실제로 어떻게 구현돼 있는지(`sightStage()` 헬퍼, `KP_SIGHT_1/2/3`, `KP_WORD_RULES`, `KP_RULES`, `stage_order`) 확인해줘.

## 배경 — 전체 그림

K-Phonics OPS™ Adventure의 사이트워드는 133개(Dolch Pre-Primer+Primer+First Grade)를 두 갈래로 나눠서 다룬다.

1. **챕터 내장형 (50단어, 🔴12+🟢38)** — 규칙 스테이지 사이사이에 삽입, 문장 연습 조기 시작용. Chapter1(15단어, `efl-sight-1/2/3`)은 **이미 구현 완료**. Chapter2~5(35단어, 9그룹)는 SPEC §19에 설계만 되어 있고 **코드에는 아직 없음**.
2. **사이트워드 섬 (83단어, 🔴26+🟢57)** — 챕터 진행과 무관하게 상시 오픈된 별도 화면. 5개 티어(T1~T5, 챕터 클리어와 연동). **아직 코드에 없음.**

**중요한 제약**: Chapter2~5의 규칙 스테이지(2-1 VC, 2-2 CVC … 5-3 Schwa 등) 자체는 아직 구현되어 있지 않다. 챕터 내장형 사이트워드는 규칙 스테이지 "사이에" 끼워 넣는 구조라서, 그 챕터의 규칙 스테이지가 없으면 실제로 화면에 등장할 자리가 없다. 이번 작업에서는 **Chapter2~5 규칙 스테이지 자체를 새로 만들지 않는다** — 이건 별도 작업이다.

그래서 아래 두 파트로 나눠서 진행해줘.

---

## Part A — 사이트워드 섬 (지금 바로 전체 구현 가능)

- `KP_ISLAND_WORDS` 배열을 `js/data.js`에 신설. 각 항목: `{ word, kr, emoji, tier, tag }` (`tag`: `"green"` 또는 `"red"`).
- 단어·티어·태그는 SPEC.md §20-3(또는 마스터표 §4)의 83개 단어를 그대로 사용 — T1 12개, T2 14개, T3 10개, T4 44개, T5 3개.
- 각 단어는 그림(이모지)+한국어 뜻+발음 재생을 갖춘 하트 단어 카드 형식(EFL 필수 원칙, SPEC §16-1 — 위반 불가).
- 티어 해금 조건: T1=Chapter1 클리어, T2=Chapter2 클리어 … T5=Chapter5 클리어. 지금은 Chapter1만 존재하니 **T1만 실제 해금되고 T2~T5는 안개/실루엣으로 대기 표시**. 챕터가 나중에 추가되면 자동으로 해금되도록, 하드코딩 없이 "해당 챕터의 모든 스테이지가 `S.clearedStages`에 있는지"로 판정할 것.
- 월드맵에 6번째 특수 섬 아이콘 추가(기존 5개 챕터 섬과 별도, 항상 클릭 가능). 진입 시 티어별 그리드.
- 저장은 `S.islandWords = { [word]: { mastered: bool } }`처럼 별도 키로 관리 — `S.clearedStages`/`S.gems`/`stage_order` 게이트와 절대 섞지 말 것. 젬 개수(`hudHTML()`)에도 영향 주면 안 됨.

## Part B — Chapter2~5 내장형 사이트워드 (데이터만 미리 준비, 화면 연결은 보류)

Chapter2~5의 규칙 스테이지가 아직 없으므로, 이번엔 **데이터만 SPEC §19 그대로 `js/data.js`에 미리 만들어두고 `stage_order`에는 넣지 않는다.**

- Chapter1의 `sightStage()` 헬퍼와 `KP_SIGHT_1/2/3` 패턴을 그대로 따라, Chapter2~5의 9개 그룹을 `KP_SIGHT_4` ~ `KP_SIGHT_12`(또는 챕터-그룹 번호를 알아볼 수 있는 이름)로 미리 정의해줘. 단어·문장·🟢/🔴 태그는 SPEC §19-2~§19-5 표 그대로.
  - Ch2: 사이트워드2(is,on,did,get) / 사이트워드3(jump,must,went,from) / 사이트워드4(this,that,then,with,was)
  - Ch3: 사이트워드5(will,well,yes,black) / 사이트워드6(just,ask,him,his)
  - Ch4: 사이트워드7(came,ride,ate,into) / 사이트워드8(out,down,play,eat,said) / 사이트워드9(for,her)
  - Ch5: 사이트워드10(know,old,new)
- `KP_WORD_RULES`, `KP_RULES`에도 항목을 미리 등록해줘(단, `stage_order`에는 넣지 말 것 — 아직 클리어할 챕터가 없으므로 미배정 상태로 둔다).
- 각 그룹 데이터 옆에 주석으로 `// TODO: Chapter2 규칙 스테이지(2-1~2-7) 구현 시 stage_order의 2-6 직후에 efl2-sight-4로 삽입` 처럼 정확한 삽입 위치를 남겨줘. 나중에 해당 챕터를 구현하는 세션에서 이 주석만 보고 바로 끼워 넣을 수 있게.

## 검증

- `node --check js/data.js`, `node --check js/game.js` 통과.
- 사이트워드 섬 83단어 개수·티어별 개수(12/14/10/44/3)가 SPEC §20-3과 정확히 일치하는지 스크립트로 대조.
- Chapter2~5용으로 미리 넣은 9그룹 35단어가 SPEC §19 표와 정확히 일치하는지 대조.
- 기존 Chapter1 세이브 데이터(로컬스토리지)와 충돌 없는지 확인 — 특히 `hudHTML()`의 젬 카운트가 섬 단어나 미배정 Chapter2~5 사이트워드를 세지 않는지.
- 브라우저에서 `npx serve .`로 띄워서 사이트워드 섬에 들어가 T1 카드가 뜨는지, T2~T5가 안개 처리로 나오는지 확인.

## 하지 말 것

- Chapter2~5의 규칙 스테이지(2-1 VC ~ 5-3 Schwa 등) 자체를 새로 구현하지 마.
- Chapter1의 `efl-sight-1/2/3`를 수정하지 마.
- Part B에서 만든 `KP_SIGHT_4`~`KP_SIGHT_12` 데이터를 `stage_order`나 `KP_CHAPTERS`에 연결하지 마 — 데이터만 준비해두는 단계다.

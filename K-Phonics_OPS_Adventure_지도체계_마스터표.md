# K-Phonics OPS™: Adventure — 파닉스 지도체계 마스터 표

> 기준일: 2026-07-18(최근 갱신) · 이 문서는 여기저기 흩어진 작업(SPEC.md, data.js, 세션별 대화)을 하나로 모은 **기준표**입니다. 새 결정이 생기면 이 표부터 갱신하세요.

---

## 0. 지금 상태 한눈에 보기

| 구분 | 상태 |
|---|---|
| **Chapter 1 (Sound Seeds)** | ✅ 코드 구현 완료 (data.js·game.js). 아래 표는 실제 동작 중인 스테이지 순서와 100% 일치. |
| **Chapter 2~5 (Word Builders~Free Flyers)** | 📋 설계 단계. SPEC.md에 규칙·예시 단어까지는 잡혀 있으나, Chapter 1처럼 "누적 글자 기준 EFL 재구성"과 실제 문장·사이트워드 배정은 아직 안 함. |
| **지도 용어** | 열린 음절 / 닫힌 음절 / **모음 짝꿍 규칙** / **split e(떨어진 짝꿍)** — Silent E·매직 E·열린 문 규칙은 폐기, 학생 노출 금지 |
| **세계관** | 개별 알파벳 캐릭터(모음 5히어로 등) 폐기. "일반 자음 + 히어로 모음(집단)" 컨셉만 유지, 모음은 글자 이름으로만 호칭 |
| **사이트워드 출처** | Dolch Pre-Primer/Primer/Grade1 기준. 그 시점까지 배운 누적 글자로 해독 가능한지 대조해 배치 |
| **사이트워드 총량** | 하이브리드 구조 확정(2026-07-17): 챕터 내 **50단어**(🔴13+🟢37, §1~§2) + **사이트워드 섬 83단어**(🔴27+🟢56, §4) = Dolch 133단어 전체 커버. 2026-07-18 `KPhonics_단계별_파닉스규칙목록.pdf` 대조로 old·want 🟢→🔴 재분류(§2·§4 각주 참고) |

---

## 1. Chapter 1 — Sound Seeds (✅ 구현 완료)

**세계관:** 출항의 항구마을 · **배지:** 🌱 씨앗 뱃지

| 순서 | 스테이지 ID | 단계명 | 학습 내용 | 예시 단어 / 문장 | 사이트워드(하트 단어) |
|---|---|---|---|---|---|
| 1 | `efl-1` | 첫 소리 탐험대 | 새 글자 음가: **m·s·a·t·p·i·n** | 대표단어: moon, sun, apple, tiger, pig, ink, net | — |
| 2 | `efl-2` | 첫 단어 조립소 | VC/CVC 블렌딩 (SetA 글자만) | at, am, it, in, sat, sit, map, pin, tap, mat, man, pan · 문장: "Sam sat." "Tim, sit." "Pam, tap it." | — |
| 3 | `efl-sight-1` | **첫 번째 하트 단어** | 문장 연습 시작점 (efl-2 직후) | 문장: "I see a map." "I see the pin." "I see a man." | **I · a · the · see** (전부 🔴 진짜 사이트워드) |
| 4 | `efl-3` | 두 번째 소리 탐험대 | 새 글자 음가: **+d·c·o·g** | 대표단어: duck, cat, octopus, goat | — |
| 5 | `efl-4` | 두 번째 단어 조립소 | CVC 블렌딩 (SetB 글자까지) | cat, dad, dig, dot, cot, can, gap, gas, got, tag, dip, cod · 문장: "Dan can dig." "Cat can sit." "Dad got it." | — |
| 6 | `efl-sight-2` | 두 번째 하트 단어 | efl-4 직후 | 문장: "The cat can not sit." "I go to the mat." "My dad got a cat." | **and · not**(🟢 해독 가능) **/ go · to · my**(🔴) |
| 7 | `efl-5` | 세 번째 소리 탐험대 | 새 글자 음가: **+e·u·r·h·b·f·l** | 대표단어: egg, umbrella, rain, hat, ball, fish, lion | — |
| 8 | `efl-6` | 세 번째 단어 조립소 | CVC 블렌딩 (SetC=Ch1 전체 18글자) | bed, red, run, fun, hut, sun, leg, lip, fan, ham, rub, fit · 문장: "Ben can run." "Sam had fun." | — |
| 9 | `efl-sight-3` | 세 번째 하트 단어 | efl-6 직후, Chapter1 사이트워드 마무리 | 문장: "I like the sun." "Come and help Dad." "Come to me." | **up · help · big**(🟢) **/ like · me · come**(🔴) |
| 10 | `efl-fluency-1` | 한 장 읽기 도전 (필수) | 몸풀기→하트단어 복습→문장 피라미드→이해 확인 | 몸풀기: pig, big, map, hop, has, sun · 이야기: "The big pig has a map." "The pig can hop." "I like the big pig." | 복습: I · a · the · like |

**Chapter 1 누적 글자 (18개, efl-6 완료 시점):** m·s·a·t·p·i·n·d·c·o·g·e·u·r·h·b·f·l
**Chapter 1 총 하트 단어 (15개):** I, a, the, see / and, not, go, to, my / up, help, big, like, me, come
**미학습 글자 (다음 챕터로 이월):** j·k·q·v·w·x·y·z

> **참고 — 선택 활동(진행 필수 아님):** 「단어 연습장」(prac-a/b/c, 조립소별 확장 단어 16~24개, 체크리스트+플립카드)은 위 표와 별개로 각 조립소 뒤에 열림. 정식 학습 경로에는 영향 없음.
>
> **참고 — 미사용 레거시 데이터:** data.js에 `1-1`/`1-2`/`1-3`(자음 21개·모음 5개를 한 번에 소개하던 구버전 방식) 객체가 남아있으나 `stage_order`에는 없어 실제로 플레이되지 않음. 삭제 전까지는 무시할 것.

---

## 2. Chapter 2~5 — 설계 단계 (📋 미구현, 사이트워드는 배정 완료)

아래는 SPEC.md에 잡혀 있는 목표 커리큘럼입니다. **사이트워드는 Chapter 1과 같은 방식(Dolch 목록 → 그 시점 누적 글자·규칙으로 해독 가능한지 대조)으로 전 챕터에 배정을 마쳤습니다.** 다만 글자 묶음 단위의 EFL 재구성(efl-1처럼 소리 스테이지를 잘게 쪼개는 작업)과 실제 예문·플래시카드 데이터 작성은 아직입니다. Chapter 2 작업을 시작할 때 이어서 진행하면 됩니다.

> **50단어 예산:** 전체 5챕터 사이트워드는 🔴 진짜 사이트워드 12개 + 🟢 해독 가능(재노출) 38개 = 총 50개로 고정. Chapter 1이 이미 15개(🔴10+🟢5)를 썼기 때문에, was·said 딱 2곳에만 🔴 예산을 추가로 썼고 나머지는 전부 🟢. away·we·you·here·where·what·who·were·give·live 등 실생활에 흔히 쓰이는 불규칙 단어들은 예산 부족으로 이번엔 빠졌습니다 (3-2 보류 후보 참고). 검증표는 이 섹션 끝에 있습니다.

### Chapter 2 — Word Builders (🌊 파도 뱃지)

| 규칙ID | 내용 | 예시 단어 | 사이트워드 |
|---|---|---|---|
| 2-1 | VC 구조 | at, in, up | |
| 2-2 | CVC 단모음 | cat, bed, pig, hot, bug | |
| — | 🎁 사이트워드 2 (2-2 직후) | | **is, on, did, get** (전부 🟢) |
| 2-3 | CVCC | fast, milk, jump | |
| 2-4 | CCVC (초성 블렌드) | flag, swim, drip | |
| — | 🎁 사이트워드 3 (2-4 직후) | | **jump, must, went, from** (전부 🟢) |
| 2-5 | Digraph 시작 (ch·sh·th·wh) | chip, ship, this, when | |
| 2-6 | Digraph 끝 (ng·nk·ck) | ring, sink, duck | |
| — | 🎁 사이트워드 4 (2-6 직후) | | **this, that, then, with**(🟢) **· was**(🔴) |
| 2-7 | -s 발음 규칙 (무성/s/, 유성/z/) | cats /s/, dogs /z/ | |

> MVP 우선순위: 실수업 적용 범위(16차시)는 1-1~2-6까지. 2-7과 Chapter 3~5는 체계 완결용 확장 콘텐츠.
> 전제: Chapter 2 시작 시 남은 글자 j·k·q·v·w·x·y·z를 2-1/2-2 어딘가에서 지도한다고 가정 — 세부 소리 스테이지 설계는 착수 시 확정 필요.

### Chapter 3 — Pattern Power (🌫️ 안개 뱃지)

| 규칙ID | 내용 | 예시 단어 | 사이트워드 |
|---|---|---|---|
| 3-1 | ck 규칙 (단모음 뒤) | duck, lock, pick | |
| 3-2 | Floss Rule (f·l·s·z) | off, bell, miss, buzz | |
| — | 🎁 사이트워드 5 (3-2 직후) | | **will, well, yes, black** (전부 🟢) |
| 3-3 | tch | catch, fetch, witch | |
| 3-4 | dge | badge, edge, bridge | |
| — | 🎁 사이트워드 6 (3-4 직후) | | **just, ask, him, his** (전부 🟢) |
| 3-5 | **split e (떨어진 짝꿍)** | cape, Pete, bike, home, cube | |
| 3-6 | Soft C (e·i·y 앞) | city, cell, icy | |
| 3-7 | Soft G (e·i·y 앞) | gem, giant, gym | |

> split e·Soft C/G 직후엔 SPEC에 사이트워드 슬롯이 원래 없었음. came/ride/ate처럼 split e로 풀리는 단어는 Chapter 4 사이트워드 7로 이월.

### Chapter 4 — Bridge Readers (❄️ 얼음 뱃지)

| 규칙ID | 내용 | 예시 단어 | 사이트워드 |
|---|---|---|---|
| 4-1 | **열린/닫힌 음절** 공식화 | ti·ger vs. cab·in | |
| 4-2 | Tiger Rule (V/CV, 열린음절) | ti-ger, pa-per, o-pen | |
| 4-3 | Camel Rule (VC/V, 닫힌음절) | cab-in, lev-el, riv-er | |
| — | 🎁 사이트워드 7 (4-3 직후, split e는 Ch3에서 이미 학습됨) | | **came, ride, ate, into** (전부 🟢) |
| 4-4 | Vowel Teams — 장모음 | rain, play, feet, sea, boat | |
| 4-5 | Vowel Teams — 기타 (oo는 Moon팀/Book팀) | moon, book, out, cow, oil | |
| — | 🎁 사이트워드 8 (4-5 직후) | | **out, down, play, eat**(🟢) **· said**(🔴) |
| 4-6 | R통제 ar | car, star, farm | |
| 4-7 | R통제 er·ir·ur | her, bird, burn | |
| 4-8 | R통제 or | corn, fork, storm | |
| — | 🎁 사이트워드 9 (4-8 직후) | | **for, her** (전부 🟢, or/ar/er 패턴 고빈도 기능어가 이 둘뿐) |
| 4-9 | R통제 are·ore·ire·ure | care, more, fire, cure | |
| 4-10 | Sounds of Y | fly, my / happy, funny | |
| 4-11 | 2음절 종합 | bas-ket, rab-bit, nap-kin | |

> "said"는 4-4(ai 모음팀: rain 등)를 막 배운 직후 배치 — "규칙엔 예외가 있다"를 가르치는 자리.

### Chapter 5 — Free Flyers (🪽 날개 뱃지)

| 규칙ID | 내용 | 예시 단어 | 사이트워드 |
|---|---|---|---|
| 5-1 | Quad/Trigraphs | night, caught, though, eight | |
| 5-2 | Silent letters (kn·gn·wr·mb·gh) | knife, gnome, write, lamb | |
| — | 🎁 사이트워드 10 (5-2 직후) | | **know, new**(🟢) **· old**(🔴) |
| 5-3 | Schwa | a-bout, o-pen, ba-na-na | |
| 5-4~5-8 | 접두/접미/Doubling/Drop-E/Change-Y (보너스 통합 라운드로 연출) | replay, helpful, running, making, happiest | |
| 5-9 | 3음절+ 종합 | en-ter-tain-ment | |
| ⭐ | 보너스 특수패턴(선택, 미확정): Wild-Old Rule, Broad A | child, wild, wash, want | |
| 👑 | 최종 보물 스테이지 — 전 챕터 누적 복습 | | |

> know=kn 묵음(🟢), new=ew 모음팀(🟢, 3-1 규칙표 공백 참고). old는 Wild-Old Rule과 연결되는데, `KPhonics_단계별_파닉스규칙목록.pdf`(2026-05 확정본) 검토 포인트⑤에서 Wild-Old Rule·Broad A가 아직 "Stage 4~5 포함 여부 결정 필요"인 미확정 규칙임을 확인(2026-07-18) — 정식 규칙이 아니므로 old는 🔴(암기)로 재분류.

### 사이트워드 예산 검증

| 챕터 | 🟢 | 🔴 | 소계 |
|---|---|---|---|
| Chapter 1 | 5 | 10 | 15 |
| Chapter 2 | 12 | 1 (was) | 13 |
| Chapter 3 | 8 | 0 | 8 |
| Chapter 4 | 10 | 1 (said) | 11 |
| Chapter 5 | 2 | 1 (old) | 3 |
| **합계** | **37** | **13** | **50** ✅ |

> 2026-07-18: `KPhonics_단계별_파닉스규칙목록.pdf` 대조 결과 old를 🔴로 재분류하며 🔴가 12→13개로 늘었다. 총 50단어는 그대로. Wild-Old Rule이 정식 규칙ID를 받으면 12개로 되돌릴 수 있다.

---

## 3. 사이트워드 설계 중 발견한 공백·보류 사항

### 3-1. 규칙표에 아직 없는 패턴 (사이트워드 배정 중 발견)

| 패턴 | 관련 단어 | 비고 |
|---|---|---|
| -ere (r통제 장모음) | here, where, were | 4-9(R통제 are·ore·ire·ure)와 유사하나 별도 규칙 항목 없음 |
| 자음+le 음절 | little, table, apple | Chapter 4~5 음절 유형표엔 있으나 규칙ID(4-x) 미배정 |
| -ve 규칙 (단어 끝 v는 항상 e 동반) | give, live, have | Soft G 예외로 오분류하기 쉬움 — give/live는 🔴여야 함 |
| -ew 모음팀 | new, few, grew | 4-4/4-5 Vowel Teams에 -ew가 명시적으로 없음 |

> 이 4개는 규칙표 완결 작업(Chapter 2~5 착수 시) 때 정식 규칙ID를 배정할 것.

### 3-2. 50단어 예산 밖 보류 후보

예산(🔴12+🟢38=50) 초과로 이번 배정에서 제외한 고빈도 불규칙 단어들:

away, we, you, here, where, what, who, were, give, live

> 위 단어들은 실생활 빈도가 높지만 🔴 슬롯이 이미 Chapter1~4에 소진되어 포함하지 못함. 추후 50단어 예산 자체를 늘리기로 결정하면 최우선 추가 후보.

---

## 4. 사이트워드 섬 (Sight Word Island) — 하이브리드 구조 (2026-07-17 확정)

Dolch Pre-Primer+Primer+First Grade 원본은 133단어인데 §1~§2의 50단어 예산만으로는 부족하다는 판단 하에, **기존 50단어(챕터 내 삽입)는 그대로 두고 나머지 83단어를 별도의 "사이트워드 섬"에 배치**하는 하이브리드 구조로 확정했다. 섬은 월드맵의 6번째 특수 섬으로 상시 오픈되며, 챕터 클리어 시점에 맞춰 티어 단위로 해금되지만 순서 강제는 없다. 섬에는 50단어 예산이 적용되지 않아 133단어 전체를 정확한 🟢/🔴 분류로 수용한다.

| 티어 | 해금 조건 | 단어 수 | 🟢 | 🔴 |
|---|---|---|---|---|
| T1 | Chapter 1 클리어 | 12 | 12 | 0 |
| T2 | Chapter 2 클리어 | 14 | 7 | 7 |
| T3 | Chapter 3 클리어 | 10 | 3 | 7 |
| T4 | Chapter 4 클리어 | 44 | 33 | 11 |
| T5 | Chapter 5 클리어 | 3 | 1 | 2 |
| **합계** | | **83** | **56** | **27** |

- **T1:** can, in, it, red, run, am, at, but, ran, an, had, let (전부 🟢)
- **T2:** as, has, stop, thank, them, think, when(🟢) · one, two, you, what, who, of, put(🔴)
- **T3:** make, white, take(🟢) · all, have, give, live, once, some, want(🔴 — give·live·have는 Soft G·silent e 규칙의 예외, want는 Broad A 규칙이 미확정이라 재분류, 아래 참고)
- **T4:** funny, little, look, three, we, yellow, be, brown, four, good, he, no, now, our, please, saw, say, she, so, soon, they, too, under, after, by, every, fly, how, may, open, over, round(🟢) · away, blue, here, where, are, do, pretty, there, again, any, walk, were(🔴 — here·where·there·are·were는 §3-1 -ere/-are 공백과 연결)
- **T5:** going(🟢) · find, could(🔴 — find는 Wild-Old Rule 계열)

**전체 133단어 최종 합계:** 🟢 37(챕터)+56(섬)=93, 🔴 13(챕터)+27(섬)=40. §3-2의 보류 후보였던 away·we·you·here·where·what·who·were·give·live는 이 섬 설계로 전부 T2~T4에 정식 배치되어 해소됨.

> **2026-07-18 업데이트:** `KPhonics_단계별_파닉스규칙목록.pdf`(2026-05 확정본) 대조 결과, 검토 포인트⑤에서 Wild-Old Rule·Broad A가 "Stage 4~5 포함 여부 결정 필요"인 미확정 규칙임을 확인. 이 두 규칙에 기대어 🟢로 분류했던 **old**(챕터 내장형, 위 Chapter5 표)와 **want**(이 섬 T3)를 🔴로 재분류했다. 두 규칙이 정식 확정되면 다시 🟢 검토 가능.

---

## 5. 공통 원칙 (모든 챕터 적용)

- **EFL 원칙(변경 불가):** 새 단어·문장은 반드시 그림 동반 + 클릭 시 뒤집혀 한국어 뜻이 보이는 카드 형태.
- **사이트워드 배치 원칙:** Dolch 목록 → 그 시점 누적 글자로 해독 가능 여부 대조 → 규칙 스테이지 2~3개당 1그룹 삽입. j·k·q·v·w·x·y·z가 필요한 단어는 해당 글자를 배우는 챕터로 이월(단, my·like 같은 고빈도 기능어는 예외적으로 조기 도입 가능).
- **예외 단어 관리:** `-og` 패턴, `x=/ks/`, wa 변형, 미학습 규칙 혼입 단어는 자동/수동 필터로 퀴즈·문장에서 100% 제외.
- **문장 구성 원칙:** 같은 세트 내 단순 주어 치환 금지, 누적 단어로 주어·동사·목적어를 골고루 재사용, 아직 안 배운 철자 패턴 사용 금지.
- **퀴즈 규칙:** 출제 범위는 잠금 해제된 모든 규칙 랜덤 혼합, 미학습 규칙 단어 100% 제외.

---

*근거 문서: SPEC.md (섹션 6·15·16·17·18·19·20) · js/data.js (Chapter 1 실제 구현) · KPhonics_단계별_파닉스규칙목록.pdf (2026-05 확정본, 규칙ID 대조용)*

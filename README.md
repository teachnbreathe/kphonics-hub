# K-Phonics OPS™: Adventure

초등학생 대상 어드벤처 게임형 파닉스 웹앱 (마인크래프트/스타듀밸리풍 레트로 픽셀 아트).
K-Phonics OPS™ 5단계 커리큘럼과 Heroes Universe(자음=시민, 모음=히어로) 세계관 기반.

## 실행 방법

`index.html`을 크롬 브라우저로 열면 바로 실행됩니다. 설치·빌드 과정이 없습니다.
(태블릿/크롬북 배포 시에는 GitHub Pages에 올려 URL로 접속 — Phase 4에서 진행)

## 테스트 모드

현재 `js/game.js`의 `TEST_MODE = true`로 설정되어 있어 5개 챕터와 등록된 모든 스테이지를 진도와 관계없이 확인할 수 있습니다. 실제 학생 배포 전에는 `false`로 변경합니다.

## 현재 상태: Phase 1.5

- ✅ 인트로 + 캐릭터(탐험가) 선택 10종 — 기본 셰이프 + 팔레트 스왑 방식, 순수 코스메틱
- ✅ 전체 월드맵 (5개 섬, 배 항해, 잠금 표시, 뱃지 슬롯)
- ✅ Chapter 1 (Sound Seeds · 출항의 항구마을) EFL 개정 10개 스테이지
  - 첫/두 번째/세 번째 소리 탐험대: `m·s·a·t·p·i·n` → `d·c·o·g` → `e·u·r·h·b·f·l`
  - 각 소리 묶음 직후 첫/두 번째/세 번째 단어 조립소에서 VC/CVC 읽기와 쓰기
  - 핵심 단어 `I, a, the, see, like`를 마지막에 문장과 함께 학습
- ✅ 학습 사이클 + 퀴즈 (blend: 소리 찾기 → 혼자 읽기 → 단어 만들기 → 문장 속에서 찾기 → 실력 확인)
- ✅ 퀴즈 rule_id 필터링: 잠금 해제된 규칙만 출제, 미학습 규칙 100% 제외
- ✅ localStorage 저장/재개 — 스테이지 중간 단계(카드 열람 기록까지) 정확히 기억
- ✅ 챕터 인트로 컷씬, 보물상자/코인 보상, 씨앗 뱃지, 복습(재도전) 모드
- ✅ 8비트 효과음 (WebAudio) + 발음 재생 (Web Speech API)
- ✅ 단계 네비게이션: 이전 단계 버튼 + 완료(✓) 탭 클릭 재방문
- ✅ 음가/글자이름/단어 오디오 리소스 분리 (`KP_AUDIO_ASSETS`에 mp3 등록 시 TTS 대체)
- ✅ 단어 읽기 방식 토글: 나눠 읽기(segmenting, 기본) / 바로 읽기(blending) — 설정 유지
- ✅ 오디오 재생 중 전체 버튼 자동 잠금 (재생 종료 시 해제)
- ✅ 픽셀아트 월드맵: 테마별 섬 일러스트 5종(코드 렌더링), 항로 점선, 물결/포말 애니메이션
- ✅ "문장 속에서 찾기" 재설계: 중앙 일러스트 + 문장 + 배운 규칙 단어만 색 강조/클릭 재생
- ✅ EFL 개정 Chapter 1: 소리 묶음과 VC/CVC 단어 조립을 번갈아 학습
- ✅ blend 스테이지 쓰기 활동: 듣고 글자 타일을 눌러 6개 단어 만들기
- ✅ 학급코드+이름별 로컬 프로필 저장, GAS 전체 세이브 업로드와 JSONP 복원

## Phase 1에서 내린 구현 판단 (기획서와 다르거나 보완한 부분)

1. **발음 오디오**: 음가(phoneme)는 `assets/audio/phonemes/`의 녹음 mp3만 사용합니다.
   음가 파일이 없으면 재생하지 않으며 TTS로 대체하지 않습니다. 글자 이름과 단어·문장은
   브라우저 TTS를 사용할 수 있고, `js/audio.js`의 `KP_AUDIO_ASSETS`에 녹음 경로를 등록하면
   녹음 파일이 우선 재생됩니다.
2. **확장하기(extend) 단계의 Chapter 1 변형**: 기획서의 "문장 속 읽기"는 읽을 수 있는 단어가
   생기는 Chapter 2부터 원형대로 적용 가능. Chapter 1에서는 학습 수준에 맞게 변형:
   - 1-1, 1-2(글자 스테이지): "첫소리 찾기" (그림+소리 → 첫 글자 고르기)
   - 1-3: "어떤 소리게?" (짝 단어 듣고 고르기)
   - 사이트워드: 기획서 원형대로 문장 3개 + 목표 단어 클릭
3. **데이터 파일**: `words.json` 등 별도 JSON 대신 `js/data.js`에 JS 상수로 내장.
   `file://`로 직접 열 때 fetch가 차단되는 문제를 피하기 위함 (스키마 구조는 기획서 8절과 동일).
4. **1-1 스테이지의 카드 수**: 자음 21개 특성상 "단어 8개" 대신 21개 글자 카드로 구성.
5. Chapter 2~5 섬은 월드맵에 잠금 상태로 표시되며, Chapter 1 뱃지 획득 후 클릭하면
   "다음 업데이트" 안내가 나옴 (Phase 2~3에서 구현).

## 오디오 구성

- **고립 음가**: `assets/audio/phonemes/`에 선생님 녹음 파일을 넣으며 TTS로 대체하지 않습니다.
- **글자 이름 26개·단어 105개·문장/질문 48개**: Piper `en_US-lessac-medium`, `length_scale 1.18`(기본보다 약 15% 느림)로 생성한 WAV를 사용합니다.
- 앱은 `js/generated-audio.js` 매핑을 통해 Piper 음원을 우선 재생하고, 매핑되지 않은 새 문구만 브라우저 TTS로 대체합니다.
- 음원 목록 재추출: `node tools/extract-audio-manifest.mjs`
- 누락 음원 재생성: `.tools/piper-venv/Scripts/python.exe tools/generate-piper-audio.py`
## 파일 구조

```
k-phonics-adventure/
├── index.html        # 진입점 (이 파일을 브라우저로 열기)
├── css/style.css     # 레트로 픽셀 스타일
├── gas/Code.gs       # Google Sheet 세이브 업로드/JSONP 복원용 Apps Script
└── js/
    ├── data.js       # 챕터/스테이지/규칙/단어 데이터 (rule_id 체계)
    ├── audio.js      # 8비트 효과음 + TTS 발음
    ├── sprites.js    # 캔버스 픽셀 스프라이트 (캐릭터 10종/배) + 알파벳 캐릭터
    └── game.js       # 화면 플로우, 학습 사이클, 퀴즈, 저장/재개
```

## 저장 데이터

- 위치: 브라우저 localStorage, 키 `kpa_save_v2:<학급코드>:<이름>`
- 초기화: 인트로 화면의 "처음부터 새로 하기" (확인 창 있음)

## Google Apps Script 기기 간 진도 동기화

기기 간 동기화는 로컬 저장을 기본으로 유지하면서, 스테이지 클리어와 뱃지 획득 시 전체 세이브를 Google Sheet에 추가 저장합니다. 인터넷이 끊겨도 현재 기기의 학습은 계속됩니다.

### 1. Google Sheet와 Apps Script 준비

1. 학생 기록을 저장할 Google Sheet를 엽니다.
2. 상단 메뉴에서 **확장 프로그램 → Apps Script**를 선택합니다.
3. 프로젝트의 `gas/Code.gs` 내용을 Apps Script 편집기의 `Code.gs`에 전부 붙여넣고 저장합니다.
4. 시트에서 직접 Apps Script를 열었다면 `SPREADSHEET_ID`는 빈 문자열로 둡니다. 독립형 Apps Script를 사용한다면 시트 주소의 `/d/`와 `/edit` 사이 값을 입력합니다.
5. 처음 저장이 들어오면 `Game_Saves` 시트가 자동 생성됩니다.

### 2. 웹 앱으로 배포

1. Apps Script 오른쪽 위 **배포 → 새 배포**를 선택합니다.
2. 유형은 **웹 앱**, 실행 사용자는 **나**, 액세스 권한은 **모든 사용자**로 설정합니다.
3. 권한 요청을 승인하고 배포합니다.
4. 발급된 주소 중 `/exec`로 끝나는 URL을 복사합니다.
5. `js/game.js` 위쪽의 `GAS_WEBAPP_URL`에 주소를 입력합니다.

```js
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/발급값/exec";
```

6. Apps Script 코드를 나중에 수정하면 **배포 관리 → 편집 → 새 버전**으로 다시 배포합니다.

학생은 처음 시작할 때 학급코드와 이름을 입력합니다. 다른 기기에서는 인트로의 **다른 기기에서 이어하기**를 눌러 같은 학급코드와 이름으로 진도를 복원합니다. 학급코드와 이름을 아는 사람은 기록을 불러올 수 있으므로, 공개 수업에서는 실명 대신 교사가 정한 별칭을 사용하는 것을 권장합니다.

## GitHub Pages 배포 — `teachnbreathe` 계정

현재 HTML·CSS·JS·오디오 경로는 모두 프로젝트 루트 기준 상대경로이므로 GitHub Pages의 하위 경로에서도 작동합니다. 별도 빌드 과정은 없습니다.

1. GitHub의 `teachnbreathe` 계정에서 새 저장소 `k-phonics-adventure`를 만듭니다.
2. 이 폴더의 **내용물**(`index.html`, `css`, `js`, `assets`, `gas`, `README.md` 등)을 저장소 최상위에 올립니다. 폴더 자체를 한 번 더 감싸지 않습니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment**에서 `Deploy from a branch`, 브랜치 `main`, 폴더 `/(root)`를 선택하고 저장합니다.
5. 배포가 완료되면 아래 주소로 접속합니다.

   `https://teachnbreathe.github.io/k-phonics-adventure/`

6. 첫 화면, 오디오 파일, 쓰기 타일, 새로고침을 확인합니다. 404가 나면 `index.html`이 저장소 최상위에 있는지와 파일명의 대소문자가 코드의 상대경로와 정확히 같은지 확인합니다.

이 앱은 주소 기반 내부 라우팅을 사용하지 않으므로 별도의 `404.html`은 필요하지 않습니다. GAS의 `/exec` 주소는 GitHub Pages 배포 전에 `js/game.js`에 설정해야 합니다.

## 다음 단계 (기획서 로드맵)

- **Phase 2**: Chapter 2 (Word Builders) — CVC 블렌딩 본격 시작, 사이트워드 스테이지 로직 일반화,
  교사용 대시보드 v1 (진도표 + 예외단어 팁존)
- **Phase 3**: Chapter 3~5, 최종 보물 스테이지, 보상 확장
- **Phase 4**: Firebase 동기화, 원어민 음원 교체, 실기기 테스트, GitHub Pages 배포

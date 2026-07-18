# 필요한 오디오 녹음 파일 목록

**위치:** `assets/audio/phonemes/` 폴더에 아래 파일명 그대로 넣으면 됩니다.
파일을 넣고 새로고침하면 자동으로 인식됩니다 (해당 카드의 "🔇 준비 중" 배지가 사라짐).

## 왜 녹음 파일이 필요한가

브라우저 TTS(Web Speech API)는 고립 음가(/g/)를 발음할 수 없어 슈와(ə)가 붙은
"그(guh)" 같은 잘못된 소리를 냅니다. 파닉스 교육에서 치명적인 오개념을 유발하므로,
**음가는 녹음 파일로만 재생**하고 파일이 없으면 재생하지 않습니다 (TTS 대체 금지).
단어 전체 읽기(cat 등)와 글자 이름("비")은 TTS가 자연스러워 당분간 TTS를 유지합니다.

## Phase 1에 필요한 파일 (26개)

### 자음 음가 21개

| 파일명 | 음가 | 주의사항 |
|---|---|---|
| `b.mp3` | /b/ | 짧게, 슈와 금지 ("브ㅡ" ❌) |
| `c.mp3` | /k/ | k와 같은 소리 (하드 c) |
| `d.mp3` | /d/ | |
| `f.mp3` | /f/ | 무성음, 길게 끌 수 있음 (fff) |
| `g.mp3` | /g/ | 하드 g. "그" ❌ |
| `h.mp3` | /h/ | 숨소리만 |
| `j.mp3` | /dʒ/ | |
| `k.mp3` | /k/ | |
| `l.mp3` | /l/ | 유성 지속음 (lll) |
| `m.mp3` | /m/ | 유성 지속음 (mmm) |
| `n.mp3` | /n/ | 유성 지속음 (nnn) |
| `p.mp3` | /p/ | 무성 파열음, 아주 짧게 |
| `q.mp3` | /kw/ | qu 결합 소리 |
| `r.mp3` | /r/ | 혀 말기, "러" ❌ |
| `s.mp3` | /s/ | 무성 지속음 (sss) |
| `t.mp3` | /t/ | 무성 파열음, 아주 짧게 |
| `v.mp3` | /v/ | 유성 지속음 (vvv) |
| `w.mp3` | /w/ | |
| `x.mp3` | /ks/ | 단어 끝 기준 (box의 x) |
| `y.mp3` | /j/ | 자음 y (yes의 첫소리) |
| `z.mp3` | /z/ | 유성 지속음 (zzz) |

### 단모음 음가 5개

| 파일명 | 음가 | 예시 |
|---|---|---|
| `a_short.mp3` | /æ/ | **a**pple, c**a**t |
| `e_short.mp3` | /e/ | **e**gg, n**e**t |
| `i_short.mp3` | /ɪ/ | **i**nk, p**i**g |
| `o_short.mp3` | /ɑ/ | **o**ctopus, b**o**x |
| `u_short.mp3` | /ʌ/ | **u**mbrella, s**u**n |

## 녹음 가이드

- **슈와(ə) 금지가 핵심**: 파열음(b, d, g, p, t, k)은 뒤에 "으" 소리가 붙지 않게 아주 짧게 끊어서.
- 지속음(f, l, m, n, r, s, v, z)은 0.5~1초 정도 끌어도 좋음.
- 파일당 소리 1회만 (반복 재생은 앱이 처리).
- 앞뒤 무음은 0.1초 이내로 잘라주세요 (나눠 읽기 때 간격이 일정해짐).
- 포맷: mp3, 44.1kHz, 모노면 충분.
- 참고 검색어: "phoneme pronunciation pure sounds", "letter sounds no schwa"

## 향후 확장 시 파일명 규칙 (Chapter 3~5 대비, 지금은 불필요)

- 장모음(이름 소리): `a_long.mp3`, `e_long.mp3`, `i_long.mp3`, `o_long.mp3`, `u_long.mp3`
- 이중자(digraph): `sh.mp3`, `ch.mp3`, `th_voiced.mp3`(this), `th_voiceless.mp3`(think), `ng.mp3`, `wh.mp3`
- r-통제 모음: `ar.mp3`, `er.mp3`, `ir.mp3`, `or.mp3`, `ur.mp3`
- 모음팀: `oo_long.mp3`(moon), `oo_short.mp3`(book), `ai.mp3`, `ee.mp3`, `oa.mp3` 등
- 단어 녹음(선택, TTS 대체용): `assets/audio/words/cat.mp3` 형식 — `js/audio.js`의
  `KP_AUDIO_ASSETS.word`에 등록하면 TTS보다 우선 재생됨

새 음가 파일을 추가할 때는 `js/audio.js` 상단의 `KP_PHONEME_FILES` 매핑에
글자(또는 패턴) → 파일명 한 줄만 추가하면 됩니다.

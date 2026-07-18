/* =====================================================
   K-Phonics OPS™: Adventure — 오디오 (Phase 2)

   ★ 음가(phoneme)는 절대 TTS로 재생하지 않는다 ★
   Web Speech API는 고립 음가(/g/)를 만들 수 없어 슈와(ə)가 붙은
   "그(guh)" 같은 잘못된 소리를 낸다 → 파닉스 오개념 유발.
   따라서 음가는 assets/audio/phonemes/ 의 녹음 mp3로만 재생하고,
   파일이 없으면 재생하지 않는다(UI는 "🔇 준비 중" 표시).
   필요한 파일 목록: audio_files_needed.md 참고.

   리소스 분리:
   - 음가        → 녹음 파일 전용 (KP_PHONEME_FILES, TTS 금지)
   - 글자 이름   → TTS 허용 ("B"는 이름 '비'로 정확히 읽힘)
   - 단어/문장   → 당분간 TTS 유지 (단어 단위는 TTS가 자연스러움)

   재생 잠금: 모든 음성 재생 API는 busy 카운터로 감싸져 있고,
   onBusyChange 콜백으로 game.js가 재생 중 버튼을 잠근다.
   ===================================================== */

// ---------- 음가 녹음 파일 매핑 (글자 → 파일명) ----------
// 파일 위치: assets/audio/phonemes/
// 규칙: 자음은 글자 그대로(b.mp3), 단모음은 <글자>_short.mp3
const KP_PHONEME_DIR = "assets/audio/phonemes/";
const KP_PHONEME_FILES = {
  b: "b.mp3", c: "c.mp3", d: "d.mp3", f: "f.mp3", g: "g.mp3", h: "h.mp3",
  j: "j.mp3", k: "k.mp3", l: "l.mp3", m: "m.mp3", n: "n.mp3", p: "p.mp3",
  q: "q.mp3", r: "r.mp3", s: "s.mp3", t: "t.mp3", v: "v.mp3", w: "w.mp3",
  x: "x.mp3", y: "y.mp3", z: "z.mp3",
  a: "a_short.mp3", e: "e_short.mp3", i: "i_short.mp3", o: "o_short.mp3", u: "u_short.mp3"
};

// 글자이름/단어 녹음 파일 등록 슬롯 (등록 시 TTS보다 우선; Phase 4)
const KP_AUDIO_ASSETS = {
  letterName: typeof KP_GENERATED_AUDIO !== "undefined" ? KP_GENERATED_AUDIO.letterName : {},
  word: typeof KP_GENERATED_AUDIO !== "undefined" ? KP_GENERATED_AUDIO.word : {},
  sentence: typeof KP_GENERATED_AUDIO !== "undefined" ? KP_GENERATED_AUDIO.sentence : {}
};

const KPAudio = (() => {
  let ctx = null;
  let muted = localStorage.getItem("kpa_muted") === "1";
  let readMode = localStorage.getItem("kpa_readmode") || "segment"; // segment | blend
  let voice = null;

  const api = {};

  // ---------- 재생 중 잠금 (busy) ----------
  let busyCount = 0;
  let lastBusy = false;
  function notifyBusy() {
    const b = busyCount > 0;
    if (b !== lastBusy) {
      lastBusy = b;
      if (api.onBusyChange) api.onBusyChange(b);
    }
  }
  async function tracked(fn) {
    busyCount++;
    notifyBusy();
    try { return await fn(); }
    finally { busyCount--; notifyBusy(); }
  }

  // ---------- 8비트 효과음 (짧아서 잠금 없음) ----------
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function beep(freq, dur, type = "square", vol = 0.12, when = 0) {
    if (muted) return;
    const a = ac();
    const t = a.currentTime + when;
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(a.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  const SFX = {
    click:  () => beep(660, 0.07),
    flip:   () => { beep(520, 0.06); beep(780, 0.08, "square", 0.12, 0.06); },
    ok:     () => { beep(523, 0.09); beep(659, 0.09, "square", 0.12, 0.09); beep(784, 0.14, "square", 0.12, 0.18); },
    no:     () => { beep(220, 0.18, "sawtooth", 0.1); beep(180, 0.22, "sawtooth", 0.1, 0.12); },
    win:    () => { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.12, "square", 0.13, i * 0.11)); beep(1319, 0.3, "square", 0.13, 0.46); },
    chest:  () => { [392, 494, 587, 784, 988].forEach((f, i) => beep(f, 0.1, "triangle", 0.15, i * 0.08)); },
    badge:  () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => beep(f, 0.13, "square", 0.13, i * 0.12)); },
    sail:   () => { beep(330, 0.15, "triangle"); beep(440, 0.15, "triangle", 0.12, 0.13); beep(550, 0.2, "triangle", 0.12, 0.26); },
    coin:   () => { beep(988, 0.06); beep(1319, 0.14, "square", 0.12, 0.05); }
  };
  function sfx(name) { if (SFX[name]) SFX[name](); }

  // ---------- TTS 기반 저수준 재생 ----------
  function pickVoices() {
    const vs = speechSynthesis.getVoices();
    if (!vs.length) return;
    voice =
      vs.find(v => v.lang === "en-US" && /natural|online/i.test(v.name)) ||
      vs.find(v => v.lang === "en-US") ||
      vs.find(v => v.lang.startsWith("en")) || null;
  }
  if ("speechSynthesis" in window) {
    pickVoices();
    speechSynthesis.onvoiceschanged = pickVoices;
  }

  function speak(text, opts = {}) {
    if (muted || !("speechSynthesis" in window)) return Promise.resolve();
    return new Promise(resolve => {
      let finished = false;
      let guard = null;
      const done = () => {
        if (finished) return;
        finished = true;
        clearTimeout(guard);
        resolve();
      };
      // 워치독: onend가 안 오는 환경(음성 미설치 등)에서 잠금이 안 풀리는 것 방지
      guard = setTimeout(done, Math.min(1200 + text.length * 220, 7000));
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      if (voice) u.voice = voice;
      u.rate = opts.rate || 0.85;
      u.pitch = opts.pitch || 1.05;
      u.onend = done;
      u.onerror = done;
      speechSynthesis.speak(u);
    });
  }

  function stopSpeak() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  function playAudioFile(url) {
    if (muted) return Promise.resolve();
    return new Promise(resolve => {
      const a = new Audio(url);
      const guard = setTimeout(resolve, 8000);
      const done = () => { clearTimeout(guard); resolve(); };
      a.onended = done;
      a.onerror = done;
      a.play().catch(done);
    });
  }

  // ---------- 음가 파일 존재 여부 사전 확인 ----------
  // 시작 시 각 파일을 프리로드해서 ok / missing 판정.
  // missing이면 UI가 "🔇 준비 중"을 표시하고, 음가는 재생하지 않는다.
  const phonemeStatus = {}; // { b: "loading" | "ok" | "missing" }
  function notifyPhonemeStatus() {
    if (api.onPhonemeStatus) api.onPhonemeStatus({ ...phonemeStatus });
  }
  Object.keys(KP_PHONEME_FILES).forEach(l => {
    phonemeStatus[l] = "loading";
    const a = new Audio();
    a.preload = "auto";
    a.addEventListener("canplaythrough", () => {
      if (phonemeStatus[l] !== "ok") { phonemeStatus[l] = "ok"; notifyPhonemeStatus(); }
    }, { once: true });
    a.addEventListener("error", () => {
      phonemeStatus[l] = "missing"; notifyPhonemeStatus();
    }, { once: true });
    a.src = KP_PHONEME_DIR + KP_PHONEME_FILES[l];
    a.load();
  });

  const delay = ms => new Promise(r => setTimeout(r, ms));

  // ---------- 단위 재생 ----------
  // 음가: 녹음 파일만 재생. 파일이 없으면 아무것도 재생하지 않음 (TTS 대체 금지!)
  function phonemeOnce(letter) {
    const l = letter.toLowerCase();
    if (phonemeStatus[l] !== "ok") return Promise.resolve();
    return playAudioFile(KP_PHONEME_DIR + KP_PHONEME_FILES[l]);
  }
  function letterNameOnce(letter) {
    const l = letter.toLowerCase();
    if (KP_AUDIO_ASSETS.letterName[l]) return playAudioFile(KP_AUDIO_ASSETS.letterName[l]);
    return speak(letter.toUpperCase(), { rate: 0.8 }); // 글자 "이름"은 여기만 사용
  }
  function wordOnce(word) {
    const w = word.toLowerCase().trim();
    if (KP_AUDIO_ASSETS.word[w]) return playAudioFile(KP_AUDIO_ASSETS.word[w]);
    return speak(word, { rate: 0.8 });
  }
  function sentenceOnce(text) {
    const key = text.toLowerCase().replace(/\s+/g, " ").trim();
    if (KP_AUDIO_ASSETS.sentence[key]) return playAudioFile(KP_AUDIO_ASSETS.sentence[key]);
    return speak(text, { rate: 0.78 });
  }

  // ---------- 공개 API (전부 busy 잠금 적용) ----------
  api.sfx = sfx;
  api.stopSpeak = stopSpeak;

  // 음가 파일 준비 여부 (UI 배지/버튼 표시용)
  api.hasPhoneme = letter => phonemeStatus[(letter || "").toLowerCase()] === "ok";
  api.onPhonemeStatus = null; // game.js가 설정 (판정 도착 시 배지 갱신)

  // 음가만 재생: /f/ — 녹음 파일 전용. 파일 없으면 무음 (TTS 대체 금지)
  api.speakPhoneme = letter => tracked(async () => {
    stopSpeak();
    await phonemeOnce(letter);
  });

  // 글자 이름만 재생: "에프(F)" — 이름은 TTS가 정확하므로 유지
  api.speakLetterName = letter => tracked(async () => {
    stopSpeak();
    await letterNameOnce(letter);
  });

  // 글자 소개 (카드 뒤집기 등): 음가 파일 있으면 음가 2번 + 예시 단어,
  // 없으면 예시 단어만 (음가를 TTS로 대체하지 않는다)
  api.speakLetterIntro = (letter, word) => tracked(async () => {
    stopSpeak();
    if (api.hasPhoneme(letter)) {
      await phonemeOnce(letter);
      await delay(180);
      await phonemeOnce(letter);
      if (word) await delay(300);
    }
    if (word) await wordOnce(word);
  });

  // 단어 통째로 읽기 (blending)
  api.speakWordWhole = word => tracked(async () => {
    stopSpeak();
    await wordOnce(word);
  });

  // 단어의 모든 글자 음가 파일이 준비됐는가 (정확한 segmenting 가능 여부)
  api.canSegment = word => word.toLowerCase().replace(/[^a-z]/g, "").split("").every(l => phonemeStatus[l] === "ok");

  // 나눠 읽기 (segmenting & blending): /k/ → /æ/ → /t/ → "cat"
  // 음가 파일이 하나라도 없으면 단어 전체 읽기로 폴백 (음가 TTS 금지).
  // opts.onSegStep(phase, i): "start"(letters배열) → "letter"(index) → "blend" → "end"
  api.speakWordSegmented = (word, opts = {}) => tracked(async () => {
    stopSpeak();
    const letters = word.toLowerCase().replace(/[^a-z]/g, "").split("");
    if (!letters.every(l => phonemeStatus[l] === "ok")) {
      await wordOnce(word);
      return;
    }
    const cb = opts.onSegStep || (() => {});
    cb("start", letters);
    try {
      for (let i = 0; i < letters.length; i++) {
        cb("letter", i);
        await phonemeOnce(letters[i]);
        await delay(230); // 음소 사이 짧은 간격
      }
      cb("blend");
      await delay(150);
      await wordOnce(word); // 블렌딩: 단어 전체를 자연스럽게
    } finally {
      cb("end");
    }
  });

  // 읽기 방식 설정을 따르는 단어 재생.
  // forceWhole: 사이트워드/불규칙 단어/문장활동 등 항상 통째로 읽어야 하는 경우
  api.playWord = (word, opts = {}) => {
    if (readMode === "segment" && !opts.forceWhole) return api.speakWordSegmented(word, opts);
    return api.speakWordWhole(word);
  };

  api.speakSentence = text => tracked(async () => {
    stopSpeak();
    await sentenceOnce(text);
  });

  api.setReadMode = m => { readMode = m === "blend" ? "blend" : "segment"; localStorage.setItem("kpa_readmode", readMode); };
  api.getReadMode = () => readMode;

  api.setMuted = m => { muted = m; localStorage.setItem("kpa_muted", m ? "1" : "0"); if (m) stopSpeak(); };
  api.isMuted = () => muted;
  api.isBusy = () => busyCount > 0;
  api.onBusyChange = null; // game.js가 설정

  return api;
})();

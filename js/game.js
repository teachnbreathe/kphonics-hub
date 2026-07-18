/* =====================================================
   K-Phonics OPS™: Adventure — 게임 로직 (Phase 1)
   화면 플로우: 인트로 → 캐릭터선택 → 월드맵 → 챕터맵
             → 스테이지(소리찾기→이름배우기→혼자읽기→단어만들기→문장→실력확인)
             → 보상 → (챕터 완료 시) 뱃지
   저장: localStorage. 단계(step) 완료·카드 열람마다 저장.
   네비게이션: 완료(✓)한 단계 탭은 클릭해 재방문 가능, 이전 단계 버튼 제공.
   오디오: 재생 중에는 전체 버튼 잠금 (KPAudio busy → body.audio-busy)
   ===================================================== */

const SAVE_KEY = "kpa_save_v1"; // Phase 1 구버전 단일 저장 키(자동 이관용)
const PROFILE_KEY_PREFIX = "kpa_save_v2";
const ACTIVE_PROFILE_KEY = "kpa_active_profile_v2";
const CLASS_RECORDS_KEY = "kpa_class_records_v1";
const TEACHER_PIN = "1234"; // 로컬 MVP용. 서버 연동 단계에서 계정 인증으로 교체.
// 개발 검수용: true이면 모든 챕터와 현재 등록된 모든 스테이지를 자유롭게 연다.
// 실제 학생 배포 전에는 반드시 false로 바꾼다.
const TEST_MODE = true;
// GAS 웹앱 배포 후 발급된 /exec 주소를 따옴표 안에 입력한다. 비어 있으면 동기화를 건너뛴다.
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxbPBeQX4Q5Q-L3yIwZ-qrvraKox3vBWliFpFLWD8XbsU-ULBF7jPy10LDKDE1RqRnL8A/exec";
const STAGE_GEMS = {
  "efl-1": { id: "gem-blue", name: "파란 소리 보석", emoji: "💎" },
  "efl-2": { id: "gem-green", name: "초록 조립 보석", emoji: "🟢" },
  "efl-3": { id: "gem-orange", name: "주황 소리 보석", emoji: "🟠" },
  "efl-4": { id: "gem-purple", name: "보라 조립 보석", emoji: "🟣" },
  "efl-5": { id: "gem-red", name: "붉은 소리 보석", emoji: "🔴" },
  "efl-6": { id: "gem-teal", name: "청록 조립 보석", emoji: "🔷" },
  "efl-sight-1": { id: "gem-gold", name: "노란 하트 보석", emoji: "💛" },
  "efl-sight-2": { id: "gem-blue-heart", name: "파란 하트 보석", emoji: "💙" },
  "efl-sight-3": { id: "gem-green-heart", name: "초록 하트 보석", emoji: "💚" },
  "efl-fluency-1": { id: "gem-pink", name: "분홍 이야기 보석", emoji: "💗" }
};
const SHOP_ITEMS = [
  { id: "sprout", name: "새싹 머리핀", emoji: "🌱", price: 5 },
  { id: "cap", name: "탐험가 모자", emoji: "🧢", price: 10 },
  { id: "cape", name: "작은 망토", emoji: "🦸", price: 15 },
  { id: "wand", name: "별 지팡이", emoji: "🪄", price: 20 },
  { id: "captain", name: "선장 모자", emoji: "🎩", price: 25 },
  { id: "slime", name: "미니 슬라임", emoji: "🟢", price: 20 }
];
let S = null;      // 저장 상태
let view = {};     // 현재 화면의 임시 상태 (저장 안 함)
const app = document.getElementById("app");

// ---------------- 유틸 ----------------
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
const sample = (arr, n) => shuffle(arr).slice(0, n);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function toast(msg, kind = "info") {
  const t = document.createElement("div");
  t.className = `toast toast-${kind}`;
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 2200);
}

// ---------------- 소리 상자 (세그멘팅-블렌딩 시각화) ----------------
// 첫소리(초록) → 모음(노랑) → 끝소리(빨강) 색 상자 + 아래 점선 화살표.
// 소리가 나는 상자를 차례로 강조한 뒤, 화살표를 따라 블렌딩한다.
const KP_VOWEL_LETTERS = "aeiou";
function soundBoxParts(word) {
  const letters = String(word).toLowerCase().replace(/[^a-z]/g, "").split("");
  const firstV = letters.findIndex(l => KP_VOWEL_LETTERS.includes(l));
  return letters.map((l, i) => ({
    letter: l,
    cls: KP_VOWEL_LETTERS.includes(l) ? "sb-vowel" : (firstV >= 0 && i < firstV ? "sb-onset" : "sb-coda")
  }));
}
function soundBoxHTML(word, size = "") {
  const parts = soundBoxParts(word);
  return `<span class="sound-boxes ${size}">
    <span class="sb-row">${parts.map(p => `<span class="sound-box ${p.cls}">${p.letter}</span>`).join("")}</span>
    <span class="sound-arrow" aria-hidden="true"></span>
  </span>`;
}

// ---------------- 나눠 읽기 시각 하이라이트 ----------------
// KPAudio.speakWordSegmented의 onSegStep 콜백 → 화면 하단 오버레이에
// 색깔 소리 상자를 크게 띄우고, 지금 소리 나는 상자를 강조한다.
function segVisual(phase, arg) {
  let ov = document.getElementById("segOverlay");
  if (phase === "start") {
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "segOverlay";
    ov.className = "seg-overlay";
    const parts = soundBoxParts(arg.join(""));
    ov.innerHTML = `<span class="sound-boxes seg-boxes">
      <span class="sb-row">${parts.map(p => `<span class="seg-letter sound-box ${p.cls}">${p.letter}</span>`).join("")}</span>
      <span class="sound-arrow" aria-hidden="true"></span>
    </span>`;
    document.body.appendChild(ov);
    return;
  }
  if (!ov) return;
  const letters = ov.querySelectorAll(".seg-letter");
  if (phase === "letter") {
    letters.forEach((el, i) => el.classList.toggle("on", i === arg));
  } else if (phase === "blend") {
    ov.classList.add("blending");
    letters.forEach(el => { el.classList.remove("on"); el.classList.add("blend"); });
  } else if (phase === "end") {
    setTimeout(() => ov.remove(), 350);
  }
}

// ---------------- 오디오 라우팅 ----------------
// kind: letter(음가 소개) | seg(읽기방식 설정 적용) | whole(항상 통째로)
function playByKind(kind, letter, word) {
  if (kind === "letter") return KPAudio.speakLetterIntro(letter, word);
  if (kind === "seg") return KPAudio.playWord(word, { onSegStep: segVisual });
  return KPAudio.playWord(word, { forceWhole: true });
}
// 단어의 특성에 맞는 kind 결정: 글자=음가 1:1 대응 단어만 나눠 읽기 허용
function wordKind(word) {
  return KP_SEGMENTABLE.includes(word.toLowerCase()) ? "seg" : "whole";
}

// ---------------- 저장/불러오기 ----------------
function defaultSave() {
  return {
    v: 2,
    classCode: "",
    name: "",
    character: null,
    coins: 0,
    badges: [],
    clearedStages: [],
    unlockedRules: [],
    seenCutscenes: [],
    current: null,          // { chapter, stage, step }
    stepProgress: {},       // { [stageId]: { seen: [...], done: [...], max: 0 } }
    quizAttempts: [],       // [{ stageId, correct, total, accuracy, passed, at }]
    gems: [],               // 스테이지별 건틀렛 보석
    stamps: [],             // 월드맵 완료 도장
    ownedItems: [],         // 상점 구매 아이템
    equippedItem: null,     // 현재 장착 아이템
    practice: {},           // 단어 연습장(선택) 체크 기록: { [setId]: [word, ...] }
    islandWords: {},        // 사이트워드 섬 자기 체크(진도 게이트 아님): { [word]: { mastered: bool } }
    lastUpdated: null
  };
}

function profileSaveKey(classCode, name) {
  return `${PROFILE_KEY_PREFIX}:${encodeURIComponent(String(classCode).trim())}:${encodeURIComponent(String(name).trim())}`;
}

function migrateSave(data) {
  const oldVersion = Number(data?.v || 1);
  const next = Object.assign(defaultSave(), data || {});
  next.stepProgress = next.stepProgress || {};
  next.quizAttempts = Array.isArray(next.quizAttempts) ? next.quizAttempts : [];
  next.gems = Array.isArray(next.gems) ? next.gems : [];
  next.stamps = Array.isArray(next.stamps) ? next.stamps : [];
  next.ownedItems = Array.isArray(next.ownedItems) ? next.ownedItems : [];
  next.practice = next.practice && typeof next.practice === "object" ? next.practice : {};
  next.islandWords = next.islandWords && typeof next.islandWords === "object" ? next.islandWords : {};
  // Phase 1.5 이전 blend 단계는 discover→apply→extend→quiz였다.
  // 새 spell 단계가 중간에 들어가므로 숫자형 max만 한 칸 이동한다.
  if (oldVersion < 2) {
    ["efl-2", "efl-4", "efl-6"].forEach(stageId => {
      const prog = next.stepProgress[stageId];
      if (prog && Number(prog.max) >= 2) prog.max = Number(prog.max) + 1;
    });
  }
  next.v = 2;
  return next;
}

function loadSave() {
  try {
    const activeKey = localStorage.getItem(ACTIVE_PROFILE_KEY);
    const raw = (activeKey && localStorage.getItem(activeKey)) || localStorage.getItem(SAVE_KEY);
    if (raw) {
      S = migrateSave(JSON.parse(raw));
      if (S.classCode && S.name) {
        const key = profileSaveKey(S.classCode, S.name);
        localStorage.setItem(key, JSON.stringify(S));
        localStorage.setItem(ACTIVE_PROFILE_KEY, key);
      }
      return;
    }
  } catch (e) { /* 손상된 저장 → 새로 시작 */ }
  S = defaultSave();
}

function save() {
  S.lastUpdated = new Date().toISOString();
  const key = S.classCode && S.name ? profileSaveKey(S.classCode, S.name) : SAVE_KEY;
  localStorage.setItem(key, JSON.stringify(S));
  if (key !== SAVE_KEY) localStorage.setItem(ACTIVE_PROFILE_KEY, key);
  if (S.name) {
    const records = loadClassRecords();
    records[`${S.classCode || "미지정"}::${S.name}`] = JSON.parse(JSON.stringify(S));
    localStorage.setItem(CLASS_RECORDS_KEY, JSON.stringify(records));
  }
}

function uploadSave(reason) {
  if (!GAS_WEBAPP_URL || !S.classCode || !S.name) return;
  const payload = JSON.stringify({ classCode: S.classCode, name: S.name, reason, save: S });
  try {
    fetch(GAS_WEBAPP_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: payload })
      .catch(() => { /* 로컬 저장은 이미 완료됨: 다음 완료 때 다시 업로드 */ });
  } catch (e) { /* 오프라인이어도 학습은 계속 */ }
}

function loadClassRecords() {
  try { return JSON.parse(localStorage.getItem(CLASS_RECORDS_KEY) || "{}"); }
  catch (e) { return {}; }
}

function resetSave() {
  const activeKey = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (activeKey) localStorage.removeItem(activeKey);
  localStorage.removeItem(ACTIVE_PROFILE_KEY);
  localStorage.removeItem(SAVE_KEY);
  S = defaultSave();
}

// ---------------- 진행 규칙 헬퍼 ----------------
const chapterById = id => KP_CHAPTERS.find(c => c.chapter_id === id);
const stageById = id => KP_STAGES[id];

function isChapterUnlocked(ch) {
  if (TEST_MODE) return true;
  if (ch.num === 1) return true;
  const prev = KP_CHAPTERS.find(c => c.num === ch.num - 1);
  return S.badges.includes(prev.badge.id);
}

function isStageCleared(stageId) { return S.clearedStages.includes(stageId); }

function isStageUnlocked(stageId) {
  if (TEST_MODE) return true;
  const st = stageById(stageId);
  const ch = chapterById(st.chapter_id);
  if (!isChapterUnlocked(ch)) return false;
  const idx = ch.stage_order.indexOf(stageId);
  if (idx === 0) return true;
  return isStageCleared(ch.stage_order[idx - 1]);
}

function isChapterComplete(ch) {
  return ch.stage_order.length > 0 && ch.stage_order.every(isStageCleared);
}

function currentChapter() {
  if (S.current && S.current.chapter) return chapterById(S.current.chapter);
  for (const ch of KP_CHAPTERS) {
    if (ch.implemented && !isChapterComplete(ch)) return ch;
  }
  return KP_CHAPTERS[0];
}

// 퀴즈/강조 대상: 클리어한 규칙 + 지금 배우는 스테이지의 규칙 (미학습 규칙 100% 제외)
function unlockedRuleSet(currentStageId) {
  const set = new Set(S.clearedStages.map(id => stageById(id).rule_id));
  if (currentStageId) set.add(stageById(currentStageId).rule_id);
  return set;
}

function stepProg(stageId) {
  if (!S.stepProgress[stageId]) S.stepProgress[stageId] = { seen: [], done: [], max: 0 };
  if (S.stepProgress[stageId].max === undefined) S.stepProgress[stageId].max = 0;
  return S.stepProgress[stageId];
}

// 현재 스테이지에서 도달 가능한 가장 먼 단계 index
function effMax(st) {
  if (view.review) return st.steps.length - 1;
  return Math.min(stepProg(st.stage_id).max, st.steps.length - 1);
}

// ---------------- 렌더 공통 ----------------
function render(html) {
  app.innerHTML = html;
  KPSprites.paintAll(app);
}

function hudHTML(opts = {}) {
  const mute = KPAudio.isMuted();
  return `
  <div class="hud">
    <div class="hud-left">
      ${S.character ? avatarHTML(3, "hud-char") : ""}
      <span class="hud-name">${esc(S.name || "탐험가")}</span>
    </div>
    <div class="hud-right">
      <span class="hud-coins">🪙 ${S.coins}</span>
      ${S.character ? `<button class="pxbtn pxbtn-sm" data-action="openGauntlet" title="소리 건틀렛">💠 ${S.gems?.length || 0}/${KP_CHAPTERS[0].stage_order.length}</button><button class="pxbtn pxbtn-sm" data-action="openShop" title="픽셀 상점">🏪</button>` : ""}
      <button class="pxbtn pxbtn-sm" data-action="toggleMute" title="소리 켜기/끄기">${mute ? "🔇" : "🔊"}</button>
      ${opts.home === false ? "" : `<button class="pxbtn pxbtn-sm" data-action="goWorld" title="월드맵">🗺️</button>`}
    </div>
  </div>`;
}

function avatarHTML(scale = 3, cls = "") {
  const item = SHOP_ITEMS.find(x => x.id === S.equippedItem);
  return `<span class="avatar-wrap">${KPSprites.charHTML(S.character, scale, cls)}${item ? `<span class="avatar-item item-${item.id}">${item.emoji}</span>` : ""}</span>`;
}

// ---------------- 화면 1: 인트로 ----------------
function showIntro() {
  view = { screen: "intro" };
  const hasSave = !!(S.character && S.name);
  render(`
    <div class="screen intro-screen">
      <div class="intro-sky"><div class="px-cloud c1"></div><div class="px-cloud c2"></div><div class="px-cloud c3"></div></div>
      <div class="intro-logo">
        <div class="logo-brand">K-PHONICS OPS<span class="tm">™</span></div>
        <div class="logo-title">ADVENTURE</div>
        <div class="logo-sub">잃어버린 소리의 보물을 찾아서</div>
      </div>
      <div class="intro-ship">${KPSprites.shipHTML(6)}</div>
      <div class="intro-buttons">
        ${hasSave ? `<button class="pxbtn pxbtn-big pxbtn-gold" data-action="continueGame">⛵ 이어하기 <small>(${esc(S.name)})</small></button>` : ""}
        <button class="pxbtn pxbtn-big" data-action="newGame">✨ ${hasSave ? "처음부터 새로 하기" : "모험 시작!"}</button>
        <button class="pxbtn" data-action="showRestore">☁️ 다른 기기에서 이어하기</button>
        <button class="pxbtn teacher-entry" data-action="teacherLogin">📋 교사 로그인</button>
      </div>
    </div>
  `);
}

function showRestore() {
  view = { screen: "restore" };
  render(`
    <div class="screen restore-screen">
      <div class="restore-panel">
        <div class="restore-cloud">☁️</div>
        <h1>다른 기기에서 이어하기</h1>
        <p>선생님이 알려 준 학급코드와 학습할 때 사용한 이름을 똑같이 입력해요.</p>
        <label for="restoreClassCode">학급코드</label>
        <input id="restoreClassCode" class="pxinput" maxlength="20" autocomplete="off" placeholder="예: 3-2">
        <label for="restoreName">이름</label>
        <input id="restoreName" class="pxinput" maxlength="10" autocomplete="off" placeholder="예: 김하늘">
        <div class="restore-actions">
          <button class="pxbtn" data-action="backToIntro">돌아가기</button>
          <button class="pxbtn pxbtn-gold" data-action="restoreGame">☁️ 진도 불러오기</button>
        </div>
        <p class="restore-note">인터넷 연결과 선생님의 동기화 설정이 필요해요.</p>
      </div>
    </div>`);
}

function restoreSaveJSONP(classCode, name) {
  return new Promise((resolve, reject) => {
    if (!GAS_WEBAPP_URL) { reject(new Error("동기화 주소가 아직 설정되지 않았어요.")); return; }
    const callback = `kpaRestore_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;
    const timer = setTimeout(() => finish(new Error("기록을 불러오는 시간이 너무 오래 걸려요.")), 12000);
    function finish(error, data) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      delete window[callback];
      script.remove();
      if (error) reject(error); else resolve(data);
    }
    window[callback] = data => finish(null, data);
    script.onerror = () => finish(new Error("인터넷 연결을 확인해 주세요."));
    script.src = `${GAS_WEBAPP_URL}?classCode=${encodeURIComponent(classCode)}&name=${encodeURIComponent(name)}&callback=${encodeURIComponent(callback)}&_=${Date.now()}`;
    document.head.appendChild(script);
  });
}

// ---------------- 교사 로그인 / 같은 기기 학급 현황 ----------------
function showTeacherLogin() {
  view = { screen: "teacherLogin" };
  render(`
    <div class="screen teacher-screen">
      <div class="teacher-panel teacher-login-panel">
        <div class="teacher-kicker">TEACHER MODE</div>
        <h1>교사 로그인</h1>
        <p>학생들의 학습 진행 상황을 확인합니다.</p>
        <label class="teacher-label" for="teacherPin">교사용 PIN</label>
        <input id="teacherPin" class="teacher-input" type="password" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="PIN 입력">
        <div id="teacherError" class="teacher-error" aria-live="polite"></div>
        <button class="pxbtn pxbtn-big pxbtn-gold" data-action="submitTeacherLogin">현황판 열기</button>
        <button class="pxbtn" data-action="backToIntro">학생 화면으로 돌아가기</button>
        <p class="teacher-demo-note">로컬 MVP 기본 PIN: <b>1234</b></p>
      </div>
    </div>`);
  setTimeout(() => app.querySelector("#teacherPin")?.focus(), 0);
}

function showTeacherDashboard() {
  view = { screen: "teacherDashboard", teacherAuthed: true };
  const storedRecords = loadClassRecords();
  // 기능 추가 전부터 이 브라우저에서 학습하던 학생도 첫 진입 시 자동 이관
  const currentRecordKey = `${S.classCode || "미지정"}::${S.name}`;
  if (S.name && !storedRecords[currentRecordKey]) {
    storedRecords[currentRecordKey] = JSON.parse(JSON.stringify(S));
    localStorage.setItem(CLASS_RECORDS_KEY, JSON.stringify(storedRecords));
  }
  const records = Object.values(storedRecords).sort((a, b) => String(b.lastUpdated || "").localeCompare(String(a.lastUpdated || "")));
  const implementedStages = KP_CHAPTERS.filter(c => c.implemented).flatMap(c => c.stage_order).length || 1;
  const rows = records.map(student => {
    const cleared = student.clearedStages?.length || 0;
    const pct = Math.min(100, Math.round(cleared / implementedStages * 100));
    const stage = student.current?.stage ? stageById(student.current.stage) : null;
    const updated = student.lastUpdated ? new Date(student.lastUpdated).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "기록 없음";
    const attempts = student.quizAttempts || [];
    const answered = attempts.reduce((n, a) => n + (a.total || 0), 0);
    const correct = attempts.reduce((n, a) => n + (a.correct || 0), 0);
    const accuracy = answered ? Math.round(correct / answered * 100) : null;
    return `<tr>
      <td>${esc(student.classCode || "미지정")}</td>
      <td><b>${esc(student.name || "이름 없음")}</b></td>
      <td><div class="progress-cell"><span>${pct}%</span><div class="teacher-progress"><i style="width:${pct}%"></i></div></div></td>
      <td>${cleared} / ${implementedStages}</td>
      <td>${accuracy === null ? "—" : `<b class="accuracy ${accuracy >= 75 ? "good" : "needs-work"}">${accuracy}%</b><small>${correct}/${answered}</small>`}</td>
      <td>${stage ? `${stage.icon} ${esc(stage.title_kr)}` : "시작 전"}</td>
      <td>🪙 ${student.coins || 0}</td>
      <td>${student.badges?.length || 0}개</td>
      <td>${updated}</td>
    </tr>`;
  }).join("");
  render(`
    <div class="screen teacher-screen teacher-dashboard-screen">
      <div class="teacher-dashboard">
        <header class="teacher-dashboard-head">
          <div><div class="teacher-kicker">K-PHONICS OPS™</div><h1>학급 학습 현황</h1><p>이 기기에서 학습한 학생 기록입니다.</p></div>
          <button class="pxbtn" data-action="teacherLogout">로그아웃</button>
        </header>
        <div class="teacher-summary">
          <div><b>${records.length}</b><span>등록 학생</span></div>
          <div><b>${records.filter(s => (s.clearedStages?.length || 0) > 0).length}</b><span>학습 시작</span></div>
          <div><b>${records.reduce((n, s) => n + (s.clearedStages?.length || 0), 0)}</b><span>완료 스테이지</span></div>
        </div>
        ${records.length ? `<div class="teacher-table-wrap"><table class="teacher-table"><thead><tr><th>학급</th><th>학생</th><th>진행률</th><th>완료</th><th>누적 정답률</th><th>현재 위치</th><th>코인</th><th>뱃지</th><th>최근 학습</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="teacher-empty"><span>🧭</span><b>아직 학생 기록이 없습니다.</b><p>학생이 학급코드와 이름을 입력하고 모험을 시작하면 여기에 표시됩니다.</p></div>`}
        <p class="teacher-local-note">현재 버전은 같은 브라우저의 기록만 표시합니다. 여러 기기 통합은 서버 연동 후 제공됩니다.</p>
      </div>
    </div>`);
}

// ---------------- 화면 2: 캐릭터 선택 ----------------
function showCharSelect() {
  view = { screen: "charselect", selected: S.character || null };
  render(`
    <div class="screen charselect-screen">
      <h1 class="screen-title">나의 탐험가를 골라요!</h1>
      <p class="screen-desc">누구를 골라도 모험은 똑같이 즐거워요 😊</p>
      <div class="name-row">
        <label for="classCodeInput">학급코드:</label>
        <input id="classCodeInput" class="pxinput" maxlength="20" autocomplete="off" placeholder="예: 3-2" value="${esc(S.classCode || "")}">
        <label for="nameInput">이름:</label>
        <input id="nameInput" class="pxinput" maxlength="10" autocomplete="off" placeholder="이름을 써 주세요" value="${esc(S.name || "")}">
      </div>
      <div class="char-grid">
        ${KP_CHARACTERS.map(c => `
          <button class="char-card ${view.selected === c.id ? "selected" : ""}" data-action="pickChar" data-char="${c.id}">
            ${KPSprites.charHTML(c.id, 6)}
            <span class="char-name">${c.name_kr}</span>
          </button>`).join("")}
      </div>
      <button class="pxbtn pxbtn-big pxbtn-gold" data-action="startAdventure">⛵ 출항!</button>
    </div>
  `);
}

// ---------------- 화면 3: 월드맵 ----------------
function showWorldMap() {
  view = { screen: "world" };
  const cur = currentChapter();
  const routePts = KP_CHAPTERS.map(c => `${c.map_pos.x},${c.map_pos.y}`).join(" ");
  render(`
    <div class="screen world-screen">
      ${hudHTML({ home: false })}
      <div class="world-heading">
        <div><span class="world-kicker">K-PHONICS EXPEDITION MAP</span><h1 class="world-title">소리의 바다</h1></div>
        ${TEST_MODE ? `<span class="test-mode-flag">🧪 TEST MODE · 모든 월드 개방</span>` : ""}
      </div>
      <div class="world-map">
        <div class="world-depth depth-a" aria-hidden="true"></div>
        <div class="world-depth depth-b" aria-hidden="true"></div>
        <div class="world-fog fog-a" aria-hidden="true"></div>
        <div class="world-fog fog-b" aria-hidden="true"></div>
        <div class="world-sun" aria-hidden="true"></div>
        <div class="world-cloud cloud-a" aria-hidden="true"></div>
        <div class="world-cloud cloud-b" aria-hidden="true"></div>
        <div class="world-compass" aria-hidden="true"><span>N</span>✦</div>
        <div class="sea-waves"></div>
        <div class="sea-sparkle"></div>
        <svg class="route" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="${routePts}" />
        </svg>
        ${KP_CHAPTERS.map(ch => {
          const unlocked = isChapterUnlocked(ch);
          const complete = isChapterComplete(ch);
          const badge = S.badges.includes(ch.badge.id);
          return `
          <button class="island biome-${ch.world_theme} ${unlocked ? "" : "locked"}"
                  style="left:${ch.map_pos.x}%; top:${ch.map_pos.y}%;"
                  data-action="enterChapter" data-chapter="${ch.chapter_id}">
            <span class="island-art">
              <span class="island-block-shadow"></span>
              ${KPSprites.islandHTML(ch.world_theme, 8)}
              ${unlocked ? "" : `<span class="island-lock">🔒</span>`}
            </span>
            <span class="island-tag"><span class="island-num">${ch.num}</span><span><b>${ch.chapter_name_kr}</b><small>${ch.stage_name}</small></span></span>

            ${badge ? `<span class="island-badge">${ch.badge.emoji}</span>` : ""}
            ${complete ? `<span class="island-done">✔</span>` : ""}
          </button>`;
        }).join("")}
        <button class="island sight-island" style="left:13%; top:26%;" data-action="openIsland" title="사이트워드 섬 — 언제나 방문 가능">
          <span class="island-art sight-island-art">
            <span class="island-block-shadow"></span>
            <span class="sight-island-emoji">🏝️</span>
            <span class="sight-island-heart">❤️</span>
          </span>
          <span class="island-tag"><span class="island-num">★</span><span><b>사이트워드 섬</b><small>SIGHT WORD ISLAND</small></span></span>
        </button>
        <div class="world-ship" style="left:${cur.map_pos.x + 8}%; top:${cur.map_pos.y + 16}%;">
          <span class="ship-wake"></span>${KPSprites.shipHTML(5)}
          ${S.character ? `<span class="ship-rider">${avatarHTML(2)}</span>` : ""}
        </div>
      </div>
      <div class="world-badges">
        ${KP_CHAPTERS.map(ch => `<span class="badge-slot ${S.badges.includes(ch.badge.id) ? "earned" : ""}" title="${ch.badge.name_kr}">${S.badges.includes(ch.badge.id) ? ch.badge.emoji : "·"}</span>`).join("")}
      </div>
    </div>
  `);
}

// ---------------- 화면 4: 컷씬 ----------------
function showCutscene(chId, slideIdx = 0) {
  const slides = KP_CUTSCENES[chId] || [];
  if (!slides.length || slideIdx >= slides.length) {
    if (!S.seenCutscenes.includes(chId)) { S.seenCutscenes.push(chId); save(); }
    showChapterMap(chId);
    return;
  }
  view = { screen: "cutscene", chId, slideIdx };
  const sl = slides[slideIdx];
  render(`
    <div class="screen cutscene-screen">
      <div class="cutscene-art">${sl.art}</div>
      <div class="cutscene-text">${sl.text}</div>
      <div class="cutscene-dots">${slides.map((_, i) => `<span class="dot ${i === slideIdx ? "on" : ""}"></span>`).join("")}</div>
      <div class="cutscene-buttons">
        <button class="pxbtn pxbtn-sm" data-action="skipCutscene" data-chapter="${chId}">건너뛰기</button>
        <button class="pxbtn pxbtn-gold" data-action="nextCutscene" data-chapter="${chId}" data-idx="${slideIdx + 1}">${slideIdx + 1 < slides.length ? "다음 ▶" : "출발! ⛵"}</button>
      </div>
    </div>
  `);
}

// ---------------- 화면 5: 챕터 내부 스테이지맵 ----------------
function showChapterMap(chId) {
  const ch = chapterById(chId);
  if (!ch.implemented && !TEST_MODE) { toast("이 세계는 다음 업데이트에서 열려요! 🚧"); showWorldMap(); return; }
  if (!S.seenCutscenes.includes(chId)) { showCutscene(chId, 0); return; }
  view = { screen: "chapter", chId };
  render(`
    <div class="screen chapter-screen theme-${ch.world_theme}">
      ${hudHTML()}
      <h1 class="chapter-title">${ch.emoji} Chapter ${ch.num}. ${ch.chapter_name_kr}</h1>
      <p class="chapter-eng">${ch.stage_name}</p>
      ${TEST_MODE ? `<div class="chapter-test-banner">🧪 테스트 모드 — 잠금과 진도 조건 없이 확인할 수 있어요.</div>` : ""}
      <div class="chapter-collection-strip">
        <button class="gauntlet-mini" data-action="openGauntlet"><span>소리 건틀렛</span>${ch.stage_order.map(sid => {
          const gem = STAGE_GEMS[sid];
          return `<i class="${gem && S.gems.includes(gem.id) ? "filled" : ""}">${gem && S.gems.includes(gem.id) ? gem.emoji : "◇"}</i>`;
        }).join("")}</button>
        <button class="pxbtn pxbtn-sm" data-action="openPractice">📚 단어 연습장 <small>(선택)</small></button>
        <button class="pxbtn pxbtn-sm" data-action="openShop">🏪 픽셀 상점</button>
      </div>
      <div class="stage-path ${ch.stage_order.length ? "" : "empty-world"}">
        ${!ch.stage_order.length ? `<div class="world-preview-card"><div class="preview-biome preview-${ch.world_theme}">${KPSprites.islandHTML(ch.world_theme, 10)}</div><h2>${ch.chapter_name_kr}</h2><p>${ch.stage_name}</p><strong>월드 지형 미리보기</strong><span>이 챕터의 학습 스테이지는 다음 개발 단계에서 연결됩니다.</span></div>` : ""}
        ${ch.stage_order.map((sid, i) => {
          const st = stageById(sid);
          const cleared = isStageCleared(sid);
          const unlocked = isStageUnlocked(sid);
          const inProgress = S.current && S.current.stage === sid && !cleared;
          const state = cleared ? "cleared" : unlocked ? (inProgress ? "current" : "open") : "locked";
          return `
          ${i > 0 ? `<div class="path-link ${isStageCleared(ch.stage_order[i - 1]) ? "walked" : ""}"></div>` : ""}
          <button class="stage-node ${state} ${st.type === "sight" ? "sight-node" : ""}" data-action="enterStage" data-stage="${sid}">
            <span class="node-icon">${cleared ? "⭐" : unlocked ? st.icon : "🔒"}</span>
            <span class="node-title">${st.title_kr}</span>
            <span class="node-sub">${st.subtitle}</span>
            ${S.stamps.includes(sid) ? `<span class="stage-stamp">CLEAR</span>` : ""}
            ${inProgress ? `<span class="node-flag">항해 중!</span>` : ""}
          </button>
          ${stoneRowHTML(st, cleared, unlocked)}`;
        }).join("")}
      </div>
      <button class="pxbtn" data-action="goWorld">🗺️ 월드맵으로</button>
    </div>
  `);
}

// ---------------- 학습 단계 징검다리 (챕터 화면) ----------------
// 스테이지의 5개(사이트워드는 4개) 학습 단계를 징검다리 돌로 표시.
// 완료=색칠+✔, 현재=강조, 미도달=회색. 완료/현재 돌은 클릭해 바로 진입.
// 저장 데이터를 오염시키지 않도록 stepProg() 대신 읽기 전용으로 조회한다.
function stoneRowHTML(st, cleared, unlocked) {
  let max = cleared ? st.steps.length : ((S.stepProgress[st.stage_id] || {}).max || 0);
  if (!cleared && S.current && S.current.stage === st.stage_id) {
    max = Math.max(max, st.steps.indexOf(S.current.step)); // 구버전 저장 호환
  }
  return `
  <div class="stone-row ${unlocked ? "" : "locked"}">
    ${st.steps.map((s, i) => {
      const state = !unlocked ? "future" : cleared || i < max ? "done" : i === max ? "current" : "future";
      const clickable = unlocked && state !== "future";
      const face = state === "done" ? "✔" : state === "current" ? "👣" : "";
      const stone = `
        <span class="stone-top">${face}</span>
        <span class="stone-label">${KP_STEP_LABELS[s]}</span>`;
      return `
      ${i > 0 ? `<span class="stone-gap ${state === "future" ? "" : "walked"}"></span>` : ""}
      ${clickable
        ? `<button class="stone ${state}" data-action="enterStep" data-stage="${st.stage_id}" data-step="${s}" title="${KP_STEP_LABELS[s]}(으)로 바로 가기">${stone}</button>`
        : `<span class="stone ${state}">${stone}</span>`}`;
    }).join("")}
  </div>`;
}

// ---------------- 스테이지 진입/진행 ----------------
function enterStage(stageId) {
  const st = stageById(stageId);
  if (!isStageUnlocked(stageId)) { KPAudio.sfx("no"); toast("아직 잠겨 있어요! 이전 스테이지를 먼저 클리어해요 🔒"); return; }
  const review = isStageCleared(stageId);
  view = { screen: "stage", stageId, review };
  let step = st.steps[0];
  if (!review) {
    const prog = stepProg(stageId);
    // 구버전 저장 호환: current.step이 max보다 앞서 있으면 반영
    if (S.current && S.current.stage === stageId) {
      const savedIdx = st.steps.indexOf(S.current.step);
      if (savedIdx > prog.max) prog.max = savedIdx;
    }
    step = st.steps[Math.min(prog.max, st.steps.length - 1)]; // 멈춘 지점부터 재개
    S.current = { chapter: st.chapter_id, stage: stageId, step };
    save();
  }
  view.step = step;
  showStep();
}

function gotoStep(step) {
  view.step = step;
  view.quiz = null;
  view.extend = null;
  view.fq = null;
  if (!view.review) {
    const st = stageById(view.stageId);
    const prog = stepProg(view.stageId);
    // 재개 지점은 항상 "가장 멀리 도달한 단계"로 저장 (이전 탭 재방문해도 후퇴 안 함)
    S.current = { chapter: st.chapter_id, stage: view.stageId, step: st.steps[Math.min(prog.max, st.steps.length - 1)] };
    save();
  }
  showStep();
}

function completeStep() {
  const st = stageById(view.stageId);
  const idx = st.steps.indexOf(view.step);
  KPAudio.sfx("ok");
  if (!view.review && idx === stepProg(view.stageId).max && idx + 1 < st.steps.length) {
    stepProg(view.stageId).max = idx + 1;
    save();
  }
  if (idx + 1 < st.steps.length) {
    gotoStep(st.steps[idx + 1]);
  } else {
    clearStage();
  }
}

function clearStage() {
  const stageId = view.stageId;
  const st = stageById(stageId);
  const first = !isStageCleared(stageId);
  if (first) {
    S.clearedStages.push(stageId);
    const gem = STAGE_GEMS[stageId];
    if (gem && !S.gems.includes(gem.id)) S.gems.push(gem.id);
    if (!S.stamps.includes(stageId)) S.stamps.push(stageId);
    if (!S.unlockedRules.includes(st.rule_id)) S.unlockedRules.push(st.rule_id);
    delete S.stepProgress[stageId];
    const ch = chapterById(st.chapter_id);
    const i = ch.stage_order.indexOf(stageId);
    const next = ch.stage_order[i + 1];
    S.current = next ? { chapter: ch.chapter_id, stage: next, step: stageById(next).steps[0] } : null;
    save();
    uploadSave("stage-clear");
    showReward(stageId);
  } else {
    S.coins += 2; save();
    KPAudio.sfx("coin");
    toast("복습 완료! 🪙 +2");
    showChapterMap(st.chapter_id);
  }
}

// ---------------- 스텝 공통 프레임 ----------------
function stepFrameHTML(st, inner, footer) {
  const steps = st.steps;
  const curIdx = steps.indexOf(view.step);
  const maxIdx = effMax(st);
  const readMode = KPAudio.getReadMode();
  // spell/사이트워드는 항상 통째로 읽기. 유창성 스테이지는 몸풀기 단어에서만 선택 제공.
  const showReadMode = st.type !== "sight" && view.step !== "spell" && (st.type !== "fluency" || view.step === "warmup");
  return `
  <div class="screen stage-screen theme-${chapterById(st.chapter_id).world_theme}">
    ${hudHTML()}
    <div class="stage-head">
      <button class="pxbtn pxbtn-sm" data-action="backToChapter" data-chapter="${st.chapter_id}">✖ 나가기</button>
      ${curIdx > 0 ? `<button class="pxbtn pxbtn-sm" data-action="prevStep">◀ 이전 단계</button>` : ""}
      <div class="stage-head-title">${st.icon} ${st.title_kr} ${view.review ? `<span class="review-tag">복습</span>` : ""}</div>
    </div>
    <div class="step-tabs">
      ${steps.map((s, i) => {
        const state = i < curIdx ? "done" : i === curIdx ? "now" : i <= maxIdx ? "reachable" : "";
        const clickable = i !== curIdx && i <= maxIdx;
        return clickable
          ? `<button class="step-tab ${state} clickable" data-action="jumpStep" data-step="${s}" title="이 단계로 이동">${i < curIdx ? "✔ " : ""}${KP_STEP_LABELS[s]}</button>`
          : `<span class="step-tab ${state}">${i < curIdx ? "✔ " : ""}${KP_STEP_LABELS[s]}</span>`;
      }).join("")}
    </div>
    ${showReadMode ? `
    <div class="readmode-bar">
      <span class="readmode-label">단어 읽기 방식:</span>
      <button class="rm-btn ${readMode === "segment" ? "on" : ""}" data-action="setReadMode" data-mode="segment">🔤 나눠 읽기</button>
      <button class="rm-btn ${readMode === "blend" ? "on" : ""}" data-action="setReadMode" data-mode="blend">💨 바로 읽기</button>
    </div>` : ""}
    <div class="step-body">${inner}</div>
    <div class="step-footer">${footer || ""}</div>
  </div>`;
}

function nextBtnHTML(enabled, label = "다음 단계 ▶") {
  return `<button class="pxbtn pxbtn-big pxbtn-gold ${enabled ? "" : "disabled"}" data-action="completeStep">${label}</button>`;
}

// 이미 완료한 단계를 재방문 중인가? (완료 단계는 활동을 다시 안 해도 다음으로 진행 가능)
function isRevisit(st) {
  return view.review || st.steps.indexOf(view.step) < stepProg(st.stage_id).max;
}

function showStep() {
  const st = stageById(view.stageId);
  const fn = {
    discover: renderDiscover, name: renderName, apply: renderApply,
    spell: renderSpell, extend: renderExtend, quiz: renderQuiz,
    warmup: renderWarmup, heart: renderHeart, pyramid: renderPyramid, fquiz: renderFluencyQuiz
  }[view.step];
  fn(st);
}

// ---------------- 스텝: 소리 찾기 (discover) ----------------
function discoverCards(st) {
  if (st.type === "letters") {
    return st.letters.map(L => ({
      id: L.letter, kind: "letter", letter: L.letter,
      noAudio: !KPAudio.hasPhoneme(L.letter), // 음가 녹음 파일 미비 → 🔇 준비 중
      front: KPSprites.buddyHTML(L.letter, st.isHero ? "hero" : "citizen", "lg"),
      back: `<span class="card-emoji">${L.emoji}</span><span class="card-word">${L.word}</span><span class="card-kr">${L.wordKr}</span>${L.note ? `<span class="card-note">${L.note}</span>` : ""}`,
      word: L.word
    }));
  }
  if (st.type === "contrast") {
    const cards = [];
    st.pairs.forEach((p, i) => {
      cards.push({ id: `s${i}`, kind: wordKind(p.short.word), word: p.short.word, front: `<span class="card-bigword">${p.short.word}</span><span class="card-tag tag-short">짧은 소리</span>`, back: `<span class="card-emoji">${p.short.emoji}</span><span class="card-word">${p.short.word}</span><span class="card-kr">${p.short.kr}</span>` });
      cards.push({ id: `l${i}`, kind: "whole", word: p.long.word, front: `<span class="card-bigword">${p.long.word}</span><span class="card-tag tag-long">이름 소리</span>`, back: `<span class="card-emoji">${p.long.emoji}</span><span class="card-word">${p.long.word}</span><span class="card-kr">${p.long.kr}</span>` });
    });
    return cards;
  }
  if (st.type === "blend") {
    return st.words.map((w, i) => ({
      id: `b${i}`, kind: "seg", word: w.word,
      front: `${soundBoxHTML(w.word, "sb-md")}<span class="card-tag tag-short">소리 붙이기</span>`,
      back: `<span class="card-emoji">${w.emoji}</span><span class="card-word">${w.word}</span><span class="card-kr">${w.kr}</span>`
    }));
  }
  // sight: 통글자 암기 대상 → 항상 통째로 읽기
  return st.words.map((w, i) => ({
    id: `w${i}`, kind: "whole", word: w.word,
    front: `<span class="card-bigword card-gold">${w.word}</span><span class="card-tag tag-gold">❤️ 하트 단어</span>`,
    back: `<span class="card-emoji">${w.emoji}</span><span class="card-word">${w.word}</span><span class="card-kr">${w.kr}</span><span class="card-note">${esc(w.sentence)}</span>`
  }));
}

const CARDS_PER_PAGE = 4;

function renderDiscover(st) {
  const cards = discoverCards(st);
  const prog = stepProg(st.stage_id);
  const seen = new Set(prog.seen);
  const allSeen = cards.every(c => seen.has(c.id));
  const pages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE));
  view.cardPage = Math.min(Math.max(view.cardPage || 0, 0), pages - 1);
  const pg = view.cardPage;
  const pageCards = cards.slice(pg * CARDS_PER_PAGE, (pg + 1) * CARDS_PER_PAGE);
  const inner = `
    <p class="step-desc">카드를 눌러 소리를 듣고 뒤집어 봐! <b>모든 카드</b>를 봐야 다음으로 갈 수 있어. (${seen.size}/${cards.length})</p>
    <div class="card-pager">
      <button class="pxbtn page-arrow ${pg === 0 ? "disabled" : ""}" data-action="prevCardPage" title="이전 카드">◀</button>
      <div class="card-grid grid-page">
        ${pageCards.map(c => `
          <button class="flip-card ${seen.has(c.id) ? "seen" : ""} ${c.letter ? (KP_VOWELS.some(v => v.letter === c.letter) ? "vowel-learning-card" : "consonant-learning-card") : ""}" data-action="flipCard" data-card="${c.id}" data-kind="${c.kind}" data-letter="${c.letter || ""}" data-word="${c.word || ""}">
            <span class="flip-inner">
              <span class="flip-front">${c.front}${c.noAudio ? `<span class="card-noaudio">🔇 준비 중</span>` : ""}</span>
              <span class="flip-back">${c.back}</span>
            </span>
            ${seen.has(c.id) ? `<span class="card-check">✔</span>` : ""}
          </button>`).join("")}
      </div>
      <button class="pxbtn page-arrow ${pg >= pages - 1 ? "disabled" : ""}" data-action="nextCardPage" title="다음 카드">▶</button>
    </div>
    <div class="page-indicator">
      <span class="page-dots">${Array.from({ length: pages }, (_, i) => `<span class="pdot ${i === pg ? "on" : ""}"></span>`).join("")}</span>
      <span class="page-count">${pg + 1}/${pages} 페이지</span>
    </div>`;
  render(stepFrameHTML(st, inner, nextBtnHTML(allSeen || isRevisit(st))));
}

// ---------------- 스텝: 이름 배우기 (name) ----------------
function renderName(st) {
  const ns = st.nameStep;
  if (st.type === "letters" && st.stage_id.startsWith("efl-")) {
    const inner = `
      <p class="step-desc">글자를 하나씩 눌러 <b>짧고 정확한 소리</b>를 듣고 따라 해 보자.</p>
      <div class="sound-set-grid">
        ${st.letters.map(L => `
          <article class="sound-letter-card ${KP_VOWELS.includes(L) ? "vowel-card" : "consonant-card"}">
            <button class="sound-card-flip" data-action="toggleSoundCard" aria-label="${L.letter.toUpperCase()} 카드 뒤집기">
              <span class="sound-card-inner">
                <span class="sound-card-face sound-card-front">
                  <span class="sound-card-spark">✦</span>
                  <span class="sound-kind-badge">${KP_VOWELS.includes(L) ? "모음" : "자음"}</span>
                  <strong>${L.letter.toUpperCase()}${L.letter}</strong>
                  <small>${L.ipa}</small>
                  <em>눌러서 뜻 보기</em>
                </span>
                <span class="sound-card-face sound-card-back">
                  <span class="sound-card-emoji">${L.emoji}</span>
                  <strong>${L.word}</strong>
                  <small>${L.wordKr}</small>
                  <em>눌러서 글자 보기</em>
                </span>
              </span>
            </button>
            <div class="sound-letter-actions">
              <button class="pxbtn pxbtn-sm" data-action="speakPhonemeBtn" data-letter="${L.letter}">${KPAudio.hasPhoneme(L.letter) ? "🔊 음가" : "🔇 음가 준비 중"}</button>
              <button class="pxbtn pxbtn-sm" data-action="speakNameBtn" data-letter="${L.letter}">🔤 이름</button>
              <button class="pxbtn pxbtn-sm example-audio" data-action="speakExampleBtn" data-word="${L.word}">${L.emoji} ${L.word}</button>
            </div>
          </article>`).join("")}
      </div>
      <div class="sound-set-reminder">다음 스테이지에서 <b>${st.letters.map(x => x.letter.toUpperCase()).join(" · ")}</b> 소리를 붙여 단어를 만들어요.</div>`;
    render(stepFrameHTML(st, inner, nextBtnHTML(true, "소리를 만났어! 다음 ▶")));
    return;
  }
  const role = ns.speaker && KP_VOWELS.some(v => v.letter === ns.speaker) ? "hero" : "citizen";
  const speakerData = KP_CONSONANTS.concat(KP_VOWELS).find(x => x.letter === ns.speaker);
  const inner = `
    <div class="name-scene">
      <div class="name-speaker">
        ${KPSprites.buddyHTML(ns.speaker, role, "lg")}
        <span class="speaker-role">${ns.speakerRole}</span>
      </div>
      <div class="bubbles">
        ${ns.lines.map(l => `<div class="bubble">${l}</div>`).join("")}
        <div class="bubble-buttons">
          <button class="pxbtn pxbtn-sm" data-action="speakPhonemeBtn" data-letter="${ns.speaker}">${KPAudio.hasPhoneme(ns.speaker) ? "🔊" : "🔇"} ${ns.speaker.toUpperCase()} 소리(음가) 듣기${KPAudio.hasPhoneme(ns.speaker) ? "" : " (준비 중)"}</button>
          <button class="pxbtn pxbtn-sm" data-action="speakNameBtn" data-letter="${ns.speaker}">🔤 ${ns.speaker.toUpperCase()} 이름 듣기</button>
          ${speakerData ? `<button class="pxbtn pxbtn-sm" data-action="speakExampleBtn" data-word="${speakerData.word}">${speakerData.emoji} ${speakerData.word} 듣기</button>` : ""}
        </div>
      </div>
    </div>
    ${ns.youtube_url ? `<div class="yt-embed"><iframe src="${esc(ns.youtube_url)}" allowfullscreen></iframe></div>` : ""}`;
  render(stepFrameHTML(st, inner, nextBtnHTML(true, "알겠어! 다음 ▶")));
}

// ---------------- 스텝: 혼자 읽기 (apply) ----------------
function applyItems(st) {
  if (st.type === "letters") return st.letters.map(L => ({
    id: L.letter, label: `${L.letter.toUpperCase()}${L.letter}`, kind: "letter",
    letter: L.letter, word: L.word, emoji: L.emoji, kr: L.wordKr
  }));
  if (st.type === "contrast") return st.pairs.map((p, i) => ({ id: `a${i}`, label: p.short.word, kind: wordKind(p.short.word), word: p.short.word }));
  if (st.type === "blend") return st.words.map((w, i) => ({ id: `b${i}`, label: w.word, kind: "seg", word: w.word, emoji: w.emoji, kr: w.kr }));
  return st.words.map((w, i) => ({
    id: `a${i}`, label: w.word, kind: "whole", word: w.word,
    kr: w.kr, emoji: w.emoji, sentence: w.sentence, sentenceKr: w.sentenceKr
  }));
}

function sightSentenceHTML(sentence, word) {
  const safeSentence = esc(sentence);
  const safeWord = esc(word);
  const pattern = new RegExp(`\\b${safeWord}\\b`, "i");
  return safeSentence.replace(pattern, match => `<strong>${match}</strong>`);
}

function renderApply(st) {
  const items = applyItems(st);
  const prog = stepProg(st.stage_id);
  const done = new Set(prog.done);
  const allDone = st.type === "letters"
    ? items.every(it => prog.selfAssess?.[it.id])
    : st.type === "blend"
      ? items.every(it => prog.wordAssess?.[it.id])
      : items.every(it => done.has(it.id));
  if (st.type === "letters") {
    if (!prog.selfAssess) prog.selfAssess = {};
    if (!view.revealedAnswers) view.revealedAnswers = {};
    const assessedCount = items.filter(it => prog.selfAssess[it.id]).length;
    const correctCount = items.filter(it => prog.selfAssess[it.id] === "correct").length;
    const pages = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
    view.applyPage = Math.min(Math.max(view.applyPage || 0, 0), pages - 1);
    const pg = view.applyPage;
    const pageItems = items.slice(pg * CARDS_PER_PAGE, (pg + 1) * CARDS_PER_PAGE);
    const inner = `
      <p class="step-desc">① 글자 소리와 낱말을 읽어요 → ② 정답을 확인해요 → ③ 결과를 표시해요. <b>확인 ${assessedCount}/${items.length} · 맞음 ${correctCount}</b></p>
      <div class="apply-pager">
        <button class="pxbtn page-arrow ${pg === 0 ? "disabled" : ""}" data-action="prevApplyPage" title="이전 카드">◀</button>
        <div class="letter-apply-grid">
          ${pageItems.map(it => `
            <div class="letter-read-card ${prog.selfAssess[it.id] || ""}">
              <div class="letter-read-main"><span>${it.label}</span><small class="letter-read-word">${it.word}</small>${prog.selfAssess[it.id] ? `<b>${prog.selfAssess[it.id] === "correct" ? "✓" : "↻"}</b>` : ""}</div>
              ${view.revealedAnswers[it.id] ? `<div class="self-check-panel"><span class="answer-chip">정답 ${it.letter.toUpperCase()} ${KP_ALL_LETTERS.find(x => x.letter === it.letter)?.ipa || ""} · ${it.emoji || ""} ${it.word} (${it.kr || ""})</span><div><button class="self-btn correct-btn" data-action="selfAssessLetter" data-item="${it.id}" data-result="correct">⭕ 둘 다 맞았어요</button><button class="self-btn retry-btn" data-action="selfAssessLetter" data-item="${it.id}" data-result="wrong">❌ 다시 연습</button></div></div>` : `<button class="letter-read-audio" data-action="revealLetterAnswer" data-item="${it.id}" data-letter="${it.letter}" data-word="${it.word}">🔊 소리와 낱말 정답 확인</button>`}
            </div>`).join("")}
        </div>
        <button class="pxbtn page-arrow ${pg >= pages - 1 ? "disabled" : ""}" data-action="nextApplyPage" title="다음 카드">▶</button>
      </div>
      <div class="page-indicator">
        <span class="page-dots">${Array.from({ length: pages }, (_, i) => `<span class="pdot ${i === pg ? "on" : ""}"></span>`).join("")}</span>
        <span class="page-count">${pg + 1}/${pages} 페이지</span>
      </div>`;
    render(stepFrameHTML(st, inner, nextBtnHTML(allDone || isRevisit(st))));
    return;
  }
  if (st.type === "blend") {
    if (!prog.wordAssess) prog.wordAssess = {};
    if (!view.revealedWords) view.revealedWords = {};
    const assessedCount = items.filter(it => prog.wordAssess[it.id]).length;
    const correctCount = items.filter(it => prog.wordAssess[it.id] === "correct").length;
    const pages = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
    view.applyPage = Math.min(Math.max(view.applyPage || 0, 0), pages - 1);
    const pg = view.applyPage;
    const pageItems = items.slice(pg * CARDS_PER_PAGE, (pg + 1) * CARDS_PER_PAGE);
    const inner = `
      <p class="step-desc">① 단어를 혼자 읽어요 → ② 정답을 확인해요 → ③ 결과를 표시해요. <b>확인 ${assessedCount}/${items.length} · 맞음 ${correctCount}</b></p>
      <div class="apply-pager word-apply-pager">
        <button class="pxbtn page-arrow ${pg === 0 ? "disabled" : ""}" data-action="prevApplyPage" title="이전 카드">◀</button>
        <div class="word-self-grid">
          ${pageItems.map(it => {
            const revealed = !!view.revealedWords[it.id];
            const result = prog.wordAssess[it.id] || "";
            return `<article class="word-self-card ${revealed ? "flipped" : ""} ${result}">
              <div class="word-self-flip"><div class="word-self-inner">
                <div class="word-self-face word-self-front"><strong>${it.word}</strong><small>소리 내어 읽어 보세요</small>${result ? `<b class="word-result-mark">${result === "correct" ? "✓" : "↻"}</b>` : ""}</div>
                <div class="word-self-face word-self-back"><span>${it.emoji}</span><strong>${it.word}</strong><small>${it.kr}</small>${soundBoxHTML(it.word, "sb-sm")}</div>
              </div></div>
              ${revealed ? `<div class="self-check-panel"><span class="answer-chip">소리를 붙이면 <b>${it.word}</b></span><div><button class="self-btn correct-btn" data-action="selfAssessWord" data-item="${it.id}" data-result="correct">⭕ 맞았어요</button><button class="self-btn retry-btn" data-action="selfAssessWord" data-item="${it.id}" data-result="wrong">❌ 다시 연습</button></div></div>` : `<button class="letter-read-audio" data-action="revealWordAnswer" data-item="${it.id}" data-word="${it.word}">🔊 정답 확인</button>`}
            </article>`;
          }).join("")}
        </div>
        <button class="pxbtn page-arrow ${pg >= pages - 1 ? "disabled" : ""}" data-action="nextApplyPage" title="다음 카드">▶</button>
      </div>
      <div class="page-indicator"><span class="page-dots">${Array.from({ length: pages }, (_, i) => `<span class="pdot ${i === pg ? "on" : ""}"></span>`).join("")}</span><span class="page-count">${pg + 1}/${pages} 페이지</span></div>`;
    render(stepFrameHTML(st, inner, nextBtnHTML(allDone || isRevisit(st))));
    return;
  }
  const inner = `
    <p class="step-desc">이번엔 <b>소리 없이 혼자</b> 읽어 보는 거야! 소리 내어 읽었으면 카드를 눌러 표시해. 어려우면 🔊 힌트!</p>
    <p class="step-desc small">(${done.size}/${items.length})</p>
    <div class="apply-grid ${st.type === "sight" ? "sight-apply-grid" : ""}">
      ${items.map(it => st.type === "sight" ? `
        <div class="apply-card sight-word-card ${done.has(it.id) ? "done" : ""}">
          <button class="sight-study-card" data-action="markRead" data-item="${it.id}" aria-label="${esc(it.word)} 읽음 표시">
            <span class="sight-card-top"><span class="sight-emoji">${it.emoji}</span><span class="sight-word">${it.word}</span>${done.has(it.id) ? `<span class="sight-check">✓</span>` : ""}</span>
            <span class="sight-meaning">${it.kr}</span>
            <span class="sight-example">${sightSentenceHTML(it.sentence, it.word)}</span>
            <span class="sight-example-kr">${it.sentenceKr}</span>
          </button>
          <button class="hint-btn sight-audio-btn" data-action="hint" data-kind="${it.kind}" data-word="${it.word}" title="${esc(it.word)} 소리 듣기">🔊</button>
        </div>` : `
        <div class="apply-card ${done.has(it.id) ? "done" : ""}">
          <button class="apply-word" data-action="markRead" data-item="${it.id}">${it.label} ${done.has(it.id) ? "✔" : ""}</button>
          <button class="hint-btn" data-action="hint" data-kind="${it.kind}" data-letter="${it.letter || ""}" data-word="${it.word || ""}" title="정답 소리 듣기">🔊</button>
        </div>`).join("")}
    </div>`;
  render(stepFrameHTML(st, inner, nextBtnHTML(allDone || isRevisit(st))));
}

// ---------------- 스텝: 단어 만들기 (spell / encoding) ----------------
// 현재 스테이지보다 앞에서 배운 글자만 모아 오답 타일 후보로 사용한다.
function learnedLettersForStage(st) {
  const ch = chapterById(st.chapter_id);
  const idx = ch.stage_order.indexOf(st.stage_id);
  const letters = ch.stage_order.slice(0, idx).flatMap(stageId => {
    const learned = stageById(stageId);
    return learned?.type === "letters" ? learned.letters.map(item => item.letter) : [];
  });
  return [...new Set(letters)];
}

function spellState(st) {
  const prog = stepProg(st.stage_id);
  if (!prog.spell || !Array.isArray(prog.spell.words)) {
    prog.spell = {
      words: sample(st.words, Math.min(6, st.words.length)).map(item => item.word),
      idx: 0, selected: [], attempts: 0, revealed: false, tiles: {}, complete: false
    };
    save();
  }
  const state = prog.spell;
  state.selected = Array.isArray(state.selected) ? state.selected : [];
  state.tiles = state.tiles || {};
  state.idx = Number(state.idx || 0);
  state.attempts = Number(state.attempts || 0);
  if (state.idx >= state.words.length) state.complete = true;
  return state;
}

function spellTiles(st, state) {
  const key = String(state.idx);
  if (!state.tiles[key]) {
    const word = state.words[state.idx].toLowerCase();
    const learned = learnedLettersForStage(st);
    const wrongPool = learned.filter(letter => !word.includes(letter));
    const wrongCount = Math.min(wrongPool.length, 2 + Math.floor(Math.random() * 2));
    const letters = word.split("").concat(sample(wrongPool, wrongCount));
    state.tiles[key] = shuffle(letters).map((letter, i) => ({ id: `${state.idx}-${i}`, letter }));
    save();
  }
  return state.tiles[key];
}

function renderSpell(st) {
  const state = spellState(st);
  if (state.complete) {
    const inner = `<div class="spell-clear"><span>🧰✨</span><h2>여섯 단어를 모두 만들었어요!</h2><p>소리를 듣고 글자로 바꾸는 힘이 자랐어요.</p></div>`;
    render(stepFrameHTML(st, inner, nextBtnHTML(true, "문장 읽기로 가기 ▶")));
    return;
  }

  const wordData = st.words.find(item => item.word === state.words[state.idx]);
  const tiles = spellTiles(st, state);
  const selectedTiles = state.selected.map(id => tiles.find(tile => tile.id === id)).filter(Boolean);
  const answerLength = wordData.word.length;
  const ready = selectedTiles.length === answerLength;
  const inner = `
    <p class="step-desc">🔊 낱말을 듣고 글자 타일을 순서대로 눌러 만들어요. <b>${state.idx + 1} / ${state.words.length}</b></p>
    <div class="spell-board ${state.shake ? "shake" : ""}">
      <div class="spell-prompt">
        <span class="spell-emoji" aria-hidden="true">${wordData.emoji}</span>
        <span class="spell-meaning">${wordData.kr}</span>
        <button class="pxbtn spell-listen" data-action="playSpellWord" data-word="${esc(wordData.word)}">🔊 낱말 듣기</button>
      </div>
      <div class="spell-answer" aria-label="만든 단어">
        ${Array.from({ length: answerLength }, (_, i) => {
          const tile = selectedTiles[i];
          return tile
            ? `<button class="spell-slot filled" data-action="removeSpellTile" data-index="${i}" title="눌러서 빼기">${tile.letter}</button>`
            : `<span class="spell-slot empty"></span>`;
        }).join("")}
      </div>
      <p class="spell-help">고른 글자나 답칸을 다시 누르면 뺄 수 있어요.</p>
      <div class="spell-tiles">
        ${tiles.map(tile => {
          const picked = state.selected.includes(tile.id);
          return `<button class="spell-tile ${picked ? "picked" : ""}" data-action="toggleSpellTile" data-tile="${tile.id}" aria-pressed="${picked}" aria-label="${tile.letter} 음가 듣고 타일 선택" title="누르면 ${tile.letter} 음가가 나와요">${tile.letter}<small>♪</small></button>`;
        }).join("")}
      </div>
      ${state.revealed ? `<div class="spell-reveal">정답은 <b>${wordData.word}</b>예요. 다시 타일로 만들어 봐요!</div>` : ""}
      <div class="spell-actions">
        ${state.attempts >= 2 && !state.revealed ? `<button class="pxbtn" data-action="revealSpellAnswer">👀 정답 보기</button>` : ""}
        <button class="pxbtn pxbtn-big pxbtn-gold ${ready ? "" : "disabled"}" data-action="checkSpell">확인하기</button>
      </div>
    </div>`;
  render(stepFrameHTML(st, inner, ""));
}

// ---------------- 스텝: 문장 속에서 찾기 / 확장 (extend) ----------------
function buildExtendRounds(st) {
  if (st.type === "letters") {
    // 배운 소리가 들어간 단어를 장면과 완전한 문장 안에서 읽기
    return sample(st.letters, Math.min(5, st.letters.length)).map(L => {
      const scene = KP_WORD_SENTENCES[L.word];
      const surfaceWord = scene.text.match(new RegExp(`\\b${L.word}s?\\b`, "i"))?.[0] || L.word;
      const tokens = scene.text.split(" ").map(tok => {
        const clean = tok.replace(/[^a-zA-Z-]/g, "");
        return { tok, clean, target: clean.toLowerCase() === surfaceWord.toLowerCase() };
      });
      return { kind: "sentence", targetWord: L.word, targetLetter: L.letter, ...scene, tokens };
    });
  }
  if (st.type === "contrast") {
    // 들은 단어 고르기 (짝꿍 중에서)
    return shuffle(st.pairs).map(p => {
      const pickShort = Math.random() < 0.5;
      const ans = pickShort ? p.short : p.long;
      return { kind: "hearWord", word: ans.word, emoji: ans.emoji, answer: ans.word, choices: shuffle([p.short.word, p.long.word]) };
    });
  }
  if (st.type === "blend") {
    // 현재 조립소만이 아니라 이전 조립소에서 배운 단어까지 누적 강조한다.
    const chapter = chapterById(st.chapter_id);
    const currentIndex = chapter.stage_order.indexOf(st.stage_id);
    const learned = new Set(
      chapter.stage_order.slice(0, currentIndex + 1)
        .map(stageById)
        .filter(stage => stage && (stage.type === "blend" || stage.type === "sight"))
        .flatMap(stage => (stage.words || []).map(item => item.word.toLowerCase()))
    );
    return st.sentences.map(s => ({
      kind: "sentence", ...s,
      tokens: s.text.split(" ").map(tok => {
        const clean = tok.replace(/[^a-zA-Z-]/g, "");
        return { tok, clean, target: learned.has(clean.toLowerCase()) };
      })
    }));
  }
  // sight: 스테이지별 문장 세트 — 배운 규칙이 적용된 단어를 강조하고 클릭 시 통째로 읽기
  const unlocked = unlockedRuleSet(st.stage_id);
  return (st.sentences || []).map(s => {
    const tokens = s.text.split(" ").map(tok => {
      const clean = tok.replace(/[^a-zA-Z]/g, "");
      const rule = KP_WORD_RULES[clean.toLowerCase()];
      return { tok, clean, target: !!rule && unlocked.has(rule) };
    });
    return { kind: "sentence", text: s.text, kr: s.kr, sky: s.sky, main: s.main, ground: s.ground, tokens };
  });
}

function renderExtend(st) {
  if (!view.extend) view.extend = { rounds: buildExtendRounds(st), idx: 0, clicked: {} };
  const ex = view.extend;
  const already = isRevisit(st);

  if (ex.rounds[0]?.kind === "sentence") {
    // ---- 문장 속에서 찾기: 한 문장씩, 일러스트 중앙 + 문장 아래 ----
    let targetCount = 0, clickedCount = 0;
    ex.rounds.forEach((r, ri) => r.tokens.forEach((t, ti) => {
      if (t.target) { targetCount++; if (ex.clicked[`${ri}-${ti}`]) clickedCount++; }
    }));
    const allDone = clickedCount >= targetCount;
    const ri = ex.idx;
    const r = ex.rounds[ri];
    const inner = `
      <p class="step-desc">그림과 문장을 보고, <b>색깔 단어</b>를 눌러 나눠 읽어 봐! <b>(${clickedCount}/${targetCount})</b></p>
      <div class="sent-stage">
        <div class="sent-illus">
          <div class="illus-sky">${r.sky}</div>
          <div class="illus-main">${r.main}</div>
          <div class="illus-ground">${r.ground}</div>
        </div>
        <div class="sent-text">
          ${r.tokens.map((t, ti) => t.target
            ? `<button class="word-token ${ex.clicked[`${ri}-${ti}`] ? "clicked" : ""}" data-action="clickToken" data-r="${ri}" data-t="${ti}" data-word="${t.clean}">${t.tok}</button>`
            : `<span class="word-plain">${t.tok}</span>`).join(" ")}
          <button class="hint-btn sent-hint" data-action="speakSentenceBtn" data-text="${esc(r.text)}" title="문장 전체 듣기">🔊</button>
        </div>
        ${r.targetLetter ? `<div class="sent-target-note"><b>${r.targetLetter.toUpperCase()}${r.targetLetter}</b> 소리로 시작하는 단어를 찾아요</div>` : ""}
        <div class="sent-kr">${r.kr}</div>
        <div class="sent-nav">
          <button class="pxbtn pxbtn-sm ${ri === 0 ? "disabled" : ""}" data-action="prevSentence">◀ 이전 문장</button>
          <span class="sent-count">문장 ${ri + 1} / ${ex.rounds.length}</span>
          <button class="pxbtn pxbtn-sm ${ri >= ex.rounds.length - 1 ? "disabled" : ""}" data-action="nextSentence">다음 문장 ▶</button>
        </div>
      </div>`;
    render(stepFrameHTML(st, inner, nextBtnHTML(allDone || already)));
    return;
  }

  // letters / contrast: 라운드형
  if (ex.idx >= ex.rounds.length) {
    render(stepFrameHTML(st, `<div class="round-clear">🎉 ${st.extendTitle} 완료!</div>`, nextBtnHTML(true)));
    return;
  }
  const r = ex.rounds[ex.idx];
  const inner = `
    <p class="step-desc">${st.extendTitle} — ${st.extendDesc} (${ex.idx + 1}/${ex.rounds.length})</p>
    <div class="round-box">
      <div class="round-prompt">
        ${r.kind === "firstSound" ? `<span class="round-emoji">${r.emoji}</span>` : `<span class="round-emoji">👂</span>`}
        <button class="pxbtn" data-action="playRound">🔊 소리 듣기</button>
      </div>
      <div class="round-choices">
        ${r.choices.map(c => `<button class="choice-btn" data-action="answerRound" data-choice="${c}">${r.kind === "firstSound" ? c.toUpperCase() + c : c}</button>`).join("")}
      </div>
    </div>`;
  render(stepFrameHTML(st, inner, already ? nextBtnHTML(true) : ""));
}

// ---------------- 유창성 스텝 1: 몸풀기 단어 (warmup) ----------------
// 이야기에 나올 단어를 소리 상자로 미리 읽는다.
// 카드 앞: 소리 상자 / 뒤: 그림 + 한국어 뜻 (EFL 필수 원칙)
function renderWarmup(st) {
  const prog = stepProg(st.stage_id);
  const seen = new Set(prog.seen);
  const allSeen = st.warmup.every(w => seen.has(w.word));
  const inner = `
    <p class="step-desc">몸풀기! 단어를 눌러 <b>소리 상자</b>를 따라 읽고, 뒤집어 뜻을 확인해요. (${seen.size}/${st.warmup.length})</p>
    <div class="warm-grid">
      ${st.warmup.map(w => `
        <button class="flip-card warm-card ${seen.has(w.word) ? "seen" : ""}" data-action="flipWarmCard" data-word="${w.word}">
          <span class="flip-inner">
            <span class="flip-front">${soundBoxHTML(w.word, "sb-md")}<span class="card-tag tag-short">소리 붙이기</span></span>
            <span class="flip-back"><span class="card-emoji">${w.emoji}</span><span class="card-word">${w.word}</span><span class="card-kr">${w.kr}</span></span>
          </span>
          ${seen.has(w.word) ? `<span class="card-check">✔</span>` : ""}
        </button>`).join("")}
    </div>`;
  render(stepFrameHTML(st, inner, nextBtnHTML(allSeen || isRevisit(st))));
}

// ---------------- 유창성 스텝 2: 하트 단어 (heart) ----------------
// 이야기에 나올 사이트워드를 눈으로 익힌다. 항상 통째로 읽기.
function renderHeart(st) {
  const prog = stepProg(st.stage_id);
  if (!prog.heartSeen) prog.heartSeen = [];
  const seen = new Set(prog.heartSeen);
  const allSeen = st.heart.every(w => seen.has(w.word));
  const inner = `
    <p class="step-desc">❤️ 하트 단어는 <b>보자마자 통째로</b> 읽는 단어예요. 눌러서 듣고, 뒤집어 뜻을 확인해요. (${seen.size}/${st.heart.length})</p>
    <div class="heart-grid">
      ${st.heart.map(w => `
        <button class="flip-card heart-card ${seen.has(w.word) ? "seen" : ""}" data-action="flipHeartCard" data-word="${w.word}">
          <span class="flip-inner">
            <span class="flip-front"><span class="heart-mark">❤️</span><span class="card-bigword card-gold">${w.word}</span><span class="card-tag tag-gold">하트 단어</span></span>
            <span class="flip-back"><span class="card-emoji">${w.emoji}</span><span class="card-word">${w.word}</span><span class="card-kr">${w.kr}</span></span>
          </span>
          ${seen.has(w.word) ? `<span class="card-check">✔</span>` : ""}
        </button>`).join("")}
    </div>`;
  render(stepFrameHTML(st, inner, nextBtnHTML(allSeen || isRevisit(st))));
}

// ---------------- 유창성 스텝 3: 문장 피라미드 (pyramid) ----------------
// 문장을 짧은 조각부터 한 줄씩 늘려 읽고,
// 마지막에 그림+문장 카드를 뒤집어 한국어 뜻을 확인한다 (EFL 필수 원칙).
function pyrSentenceDone(st, prog, i) {
  return st.story[i].pyramid.every((_, li) => prog.pyr.lines[`${i}-${li}`]) && !!prog.pyr.flipped[i];
}

function renderPyramid(st) {
  const prog = stepProg(st.stage_id);
  if (!prog.pyr) prog.pyr = { lines: {}, flipped: {} };
  if (!view.pyrFlip) view.pyrFlip = {};
  view.pyrIdx = Math.min(Math.max(view.pyrIdx || 0, 0), st.story.length - 1);
  const ri = view.pyrIdx;
  const r = st.story[ri];
  const doneCount = st.story.filter((_, i) => pyrSentenceDone(st, prog, i)).length;
  const allDone = doneCount >= st.story.length;
  const inner = `
    <p class="step-desc">피라미드를 <b>위에서부터 한 줄씩</b> 눌러 읽어요. 다 읽으면 아래 <b>문장 카드</b>를 뒤집어 뜻을 확인! (${doneCount}/${st.story.length})</p>
    <div class="pyr-stage">
      <div class="sent-illus pyr-illus">
        <div class="illus-sky">${r.sky}</div>
        <div class="illus-main">${r.main}</div>
        <div class="illus-ground">${r.ground}</div>
      </div>
      <div class="pyr-lines">
        ${r.pyramid.map((line, li) => {
          const read = !!prog.pyr.lines[`${ri}-${li}`];
          return `<button class="pyr-line ${read ? "readed" : ""}" style="--pyr-i:${li}" data-action="readPyrLine" data-r="${ri}" data-l="${li}" data-text="${esc(line)}">
            <span class="pyr-line-text">${esc(line)}</span><span class="pyr-line-mark">${read ? "✔" : "🔊"}</span>
          </button>`;
        }).join("")}
      </div>
      <button class="flip-card sent-flip ${view.pyrFlip[ri] ? "flipped" : ""} ${prog.pyr.flipped[ri] ? "seen" : ""}" data-action="flipPyrCard" data-r="${ri}">
        <span class="flip-inner">
          <span class="flip-front"><span class="sent-flip-emoji">${r.main}</span><span class="sent-flip-text">${esc(r.text)}</span><span class="card-tag tag-short">눌러서 뜻 보기</span></span>
          <span class="flip-back"><span class="sent-flip-kr">${esc(r.kr)}</span><span class="sent-flip-sub">${esc(r.text)}</span></span>
        </span>
        ${prog.pyr.flipped[ri] ? `<span class="card-check">✔</span>` : ""}
      </button>
      <div class="sent-nav">
        <button class="pxbtn pxbtn-sm ${ri === 0 ? "disabled" : ""}" data-action="prevPyr">◀ 이전 문장</button>
        <span class="sent-count">문장 ${ri + 1} / ${st.story.length}</span>
        <button class="pxbtn pxbtn-sm ${ri >= st.story.length - 1 ? "disabled" : ""}" data-action="nextPyr">다음 문장 ▶</button>
      </div>
    </div>`;
  render(stepFrameHTML(st, inner, nextBtnHTML(allDone || isRevisit(st))));
}

// ---------------- 유창성 스텝 4: 이해 확인 (fquiz) ----------------
// 이야기 내용 질문. 그림 단서가 있는 보기 중에서 고른다. 전부 맞혀야 통과.
function renderFluencyQuiz(st) {
  if (!view.fq) view.fq = { idx: 0, correct: 0, answered: false };
  const fq = view.fq;
  const total = st.questions.length;

  if (fq.idx >= total) {
    const pass = fq.correct >= total;
    if (!fq.recorded) {
      fq.recorded = true;
      if (!Array.isArray(S.quizAttempts)) S.quizAttempts = [];
      S.quizAttempts.push({
        stageId: st.stage_id, correct: fq.correct, total,
        accuracy: total ? Math.round(fq.correct / total * 100) : 0,
        passed: pass, at: new Date().toISOString()
      });
      save();
    }
    const inner = `
      <div class="quiz-result ${pass ? "pass" : "fail"}">
        <div class="result-emoji">${pass ? "📖🏆" : "💪"}</div>
        <div class="result-score">${fq.correct} / ${total}</div>
        <div class="result-msg">${pass ? "이야기를 완벽하게 이해했어요!" : "이야기를 다시 읽고 도전해 봐요!"}</div>
      </div>`;
    const footer = pass
      ? nextBtnHTML(true, view.review ? "복습 끝!" : "보물상자 열기! 🎁")
      : `<button class="pxbtn pxbtn-big" data-action="retryFq">🔁 다시 도전</button>
         <button class="pxbtn pxbtn-sm" data-action="jumpStep" data-step="pyramid">이야기 다시 읽기</button>`;
    render(stepFrameHTML(st, inner, footer));
    if (pass) KPAudio.sfx("win");
    return;
  }

  const q = st.questions[fq.idx];
  const inner = `
    <p class="step-desc">이야기를 잘 읽었는지 확인해요! (${fq.idx + 1}/${total})</p>
    <div class="fq-box">
      <div class="fq-question">
        <span class="fq-q-text">${esc(q.q)}</span>
        <button class="hint-btn" data-action="playFq" title="질문 듣기">🔊</button>
      </div>
      <div class="fq-question-kr">${esc(q.kr)}</div>
      <div class="fq-choices">
        ${q.choices.map(c => `
          <button class="fq-choice ${fq.answered ? "disabled" : ""}" data-action="answerFq" data-choice="${esc(c.word)}">
            <span class="fq-choice-emoji">${c.emoji}</span>
            <span class="fq-choice-word">${esc(c.word)}</span>
          </button>`).join("")}
      </div>
    </div>`;
  render(stepFrameHTML(st, inner, ""));
}

// ---------------- 스텝: 실력 확인 (quiz) ----------------
// 절대 규칙: 잠금 해제된 규칙의 항목만 출제 (rule_id 필터)
function quizPoolItems(st) {
  const unlocked = unlockedRuleSet(st.stage_id);
  const items = [];
  KP_CHAPTERS.flatMap(ch => ch.stage_order).forEach(stageId => {
    const learnedStage = stageById(stageId);
    if (!learnedStage || !unlocked.has(learnedStage.rule_id)) return;
    if (learnedStage.type === "letters") {
      learnedStage.letters.forEach(c => items.push({ rule: learnedStage.rule_id, kind: "letter", letter: c.letter, word: c.word }));
    } else if (learnedStage.type === "blend") {
      learnedStage.words.forEach(w => items.push({ rule: learnedStage.rule_id, kind: "seg", word: w.word, alts: learnedStage.words.filter(x => x.word !== w.word).map(x => x.word) }));
    } else if (learnedStage.type === "sight") {
      learnedStage.words.forEach(w => items.push({ rule: learnedStage.rule_id, kind: "whole", word: w.word, alts: learnedStage.words.filter(x => x.word !== w.word).map(x => x.word) }));
    }
  });
  return items;
}

function buildQuiz(st) {
  const pool = quizPoolItems(st);
  const own = pool.filter(i => i.rule === st.rule_id);
  const others = pool.filter(i => i.rule !== st.rule_id);
  const total = Math.min(8, pool.length);
  const ownCount = Math.min(own.length, Math.max(4, total - others.length));
  const picked = sample(own, ownCount).concat(sample(others, total - ownCount));

  const letterPoolAll = pool.filter(i => i.kind === "letter").map(i => i.letter);
  const wordPoolAll = pool.filter(i => i.kind !== "letter").map(i => i.word);

  return shuffle(picked).map(item => {
    let choices;
    if (item.kind === "letter") {
      const wrong = sample([...new Set(letterPoolAll)].filter(l => l !== item.letter), 2);
      choices = shuffle([item.letter, ...wrong]);
    } else {
      const altPool = [...new Set((item.alts || []).concat(wordPoolAll))].filter(w => w.toLowerCase() !== item.word.toLowerCase());
      const wrong = sample(altPool, 2);
      choices = shuffle([item.word, ...wrong]);
    }
    return { ...item, choices, answer: item.kind === "letter" ? item.letter : item.word };
  });
}

function renderQuiz(st) {
  if (!view.quiz) view.quiz = { qs: buildQuiz(st), idx: 0, correct: 0, answered: false };
  const qz = view.quiz;
  const total = qz.qs.length;
  const passNeed = Math.ceil(total * 0.75);

  if (qz.idx >= total) {
    const pass = qz.correct >= passNeed;
    if (!qz.recorded) {
      qz.recorded = true;
      if (!Array.isArray(S.quizAttempts)) S.quizAttempts = [];
      S.quizAttempts.push({
        stageId: st.stage_id,
        correct: qz.correct,
        total,
        accuracy: total ? Math.round(qz.correct / total * 100) : 0,
        passed: pass,
        at: new Date().toISOString()
      });
      save();
    }
    const inner = `
      <div class="quiz-result ${pass ? "pass" : "fail"}">
        <div class="result-emoji">${pass ? "🏆" : "💪"}</div>
        <div class="result-score">${qz.correct} / ${total}</div>
        <div class="result-msg">${pass ? "통과! 소리의 보물에 한 걸음 더!" : `아쉬워! ${passNeed}개 이상 맞히면 통과야. 다시 도전!`}</div>
      </div>`;
    const footer = pass
      ? nextBtnHTML(true, view.review ? "복습 끝!" : "보물상자 열기! 🎁")
      : `<button class="pxbtn pxbtn-big" data-action="retryQuiz">🔁 다시 도전</button>
         <button class="pxbtn pxbtn-sm" data-action="jumpStep" data-step="discover">처음부터 복습하기</button>`;
    render(stepFrameHTML(st, inner, footer));
    if (pass) KPAudio.sfx("win");
    return;
  }

  const q = qz.qs[qz.idx];
  const inner = `
    <p class="step-desc">잘 듣고 알맞은 ${q.kind === "letter" ? "글자" : "낱말"}을 골라요! (${qz.idx + 1}/${total})</p>
    <div class="quiz-score">⭐ ${qz.correct}</div>
    <div class="round-box">
      <div class="round-prompt">
        <span class="round-emoji">👂</span>
        <button class="pxbtn" data-action="playQuiz">🔊 소리 듣기</button>
      </div>
      <div class="round-choices">
        ${q.choices.map(c => `<button class="choice-btn ${qz.answered ? "disabled" : ""}" data-action="answerQuiz" data-choice="${c}">${q.kind === "letter" ? c.toUpperCase() + c : c}</button>`).join("")}
      </div>
    </div>`;
  render(stepFrameHTML(st, inner, ""));
}

// ---------------- 화면: 보상 (보물상자) ----------------
function showReward(stageId) {
  const st = stageById(stageId);
  const ch = chapterById(st.chapter_id);
  const coins = 10;
  const gem = STAGE_GEMS[stageId];
  view = { screen: "reward", stageId, opened: false, coins };
  render(`
    <div class="screen reward-screen">
      <h1 class="screen-title">스테이지 클리어! ⭐</h1>
      <p class="screen-desc">${st.icon} ${st.title_kr}</p>
      <button class="chest" data-action="openChest">
        <span class="chest-emoji">🎁</span>
        <span class="chest-hint">눌러서 열어 봐!</span>
      </button>
      <div class="reward-result hidden" id="rewardResult">
        ${gem ? `<div class="reward-gem"><span>${gem.emoji}</span><b>${gem.name}</b><small>건틀렛에 장착했어요!</small></div>` : ""}
        <div class="reward-coins">🪙 +${coins}</div>
        <div class="reward-actions"><button class="pxbtn pxbtn-big" data-action="openShop">🏪 바로 사용하기</button><button class="pxbtn pxbtn-big pxbtn-gold" data-action="afterReward" data-chapter="${ch.chapter_id}">계속 항해하기 ⛵</button></div>
      </div>
    </div>
  `);
}

function showGauntlet() {
  view = { screen: "gauntlet" };
  const order = KP_CHAPTERS[0].stage_order;
  render(`<div class="screen collection-screen">${hudHTML({ home: false })}
    <div class="collection-panel">
      <div class="collection-title"><span>🧤</span><div><h1>소리 건틀렛</h1><p>스테이지를 완료하고 보석을 모두 모아요.</p></div></div>
      <div class="gauntlet-gems">${order.map((sid, i) => { const g = STAGE_GEMS[sid]; const has = g && S.gems.includes(g.id); return `<div class="gem-slot ${has ? "filled" : ""}"><span>${has ? g.emoji : "◇"}</span><b>${has ? g.name : `${i + 1}번째 보석`}</b><small>${has ? "수집 완료" : "아직 잠겨 있어요"}</small></div>`; }).join("")}</div>
      <div class="collection-progress"><i style="width:${Math.round((S.gems.length / order.length) * 100)}%"></i><span>${S.gems.length} / ${order.length}</span></div>
      <div class="collection-buttons"><button class="pxbtn" data-action="goChapterOne">⚓ 챕터로</button><button class="pxbtn pxbtn-gold" data-action="openShop">🏪 픽셀 상점</button></div>
    </div></div>`);
}

function showShop() {
  view = { screen: "shop" };
  render(`<div class="screen shop-screen">${hudHTML({ home: false })}
    <div class="shop-panel"><header><div><span class="shopkeeper">🧑‍🌾</span><h1>항구마을 픽셀 상점</h1><p>모은 골드로 꾸미기 아이템을 골라요.</p></div><div class="shop-avatar">${avatarHTML(6)}</div></header>
    <div class="shop-grid">${SHOP_ITEMS.map(item => { const owned = S.ownedItems.includes(item.id); const equipped = S.equippedItem === item.id; return `<article class="shop-item ${equipped ? "equipped" : ""}"><span>${item.emoji}</span><b>${item.name}</b><small>🪙 ${item.price}</small>${owned ? `<button class="pxbtn pxbtn-sm" data-action="equipItem" data-item="${item.id}">${equipped ? "✓ 장착 중" : "장착하기"}</button>` : `<button class="pxbtn pxbtn-sm pxbtn-gold ${S.coins < item.price ? "disabled" : ""}" data-action="buyItem" data-item="${item.id}">구매하기</button>`}</article>`; }).join("")}</div>
    <div class="collection-buttons"><button class="pxbtn" data-action="goChapterOne">⚓ 챕터로</button><button class="pxbtn" data-action="openGauntlet">💠 건틀렛 보기</button></div></div></div>`);
}

// ---------------- 화면: 단어 연습장 (선택 활동) ----------------
// 필수 진행과 무관한 자유 연습. 배운 글자만으로 만든 확장 단어를
// 읽고 스스로 체크한다. 단어 칩은 뒤집으면 그림+뜻 (EFL 필수 원칙).
function showPractice(tabIdx) {
  const unlockedTabs = KP_PRACTICE.map(s => isStageUnlocked(s.after));
  if (tabIdx === undefined) {
    tabIdx = Math.max(0, unlockedTabs.lastIndexOf(true)); // 기본: 가장 최근에 열린 묶음
  }
  view = { screen: "practice", tab: tabIdx };
  const set = KP_PRACTICE[tabIdx];
  const open = unlockedTabs[tabIdx];
  S.practice = S.practice || {};
  const done = new Set(S.practice[set.id] || []);
  render(`
    <div class="screen practice-screen">
      ${hudHTML()}
      <div class="practice-panel">
        <header class="practice-head">
          <h1>📚 단어 연습장</h1>
          <p>필수가 아니에요! 더 읽고 싶은 만큼 읽고, 읽은 단어에 체크해요. ✅</p>
        </header>
        <div class="practice-tabs">
          ${KP_PRACTICE.map((s2, i) => `
            <button class="ptab ${i === tabIdx ? "on" : ""} ${unlockedTabs[i] ? "" : "plocked"}" data-action="practiceTab" data-tab="${i}">
              ${unlockedTabs[i] ? "🧩" : "🔒"} ${s2.title}
            </button>`).join("")}
        </div>
        ${open ? `
          <div class="practice-meta">
            <span>배운 글자: <b>${set.letters}</b></span>
            <span class="practice-count">읽은 단어 <b>${done.size} / ${set.words.length}</b></span>
          </div>
          <div class="practice-grid">
            ${set.words.map(w => `
              <div class="practice-item ${done.has(w.word) ? "pdone" : ""}">
                <button class="practice-check" data-action="togglePracticeCheck" data-set="${set.id}" data-word="${w.word}" title="읽었으면 체크!">${done.has(w.word) ? "✅" : "⬜"}</button>
                <button class="practice-chip" data-action="flipPracticeChip">
                  <span class="pf-inner">
                    <span class="pf-face pf-front">${w.word}</span>
                    <span class="pf-face pf-back"><span>${w.emoji}</span><small>${esc(w.kr)}</small></span>
                  </span>
                </button>
                <button class="practice-audio" data-action="playPracticeWord" data-word="${w.word}" title="소리 듣기">🔊</button>
              </div>`).join("")}
          </div>` : `
          <div class="practice-locked-msg"><span>🔒</span><b>아직 잠겨 있어요!</b><p>「${esc(stageById(set.after).title_kr)}」 스테이지에 도착하면 열려요.</p></div>`}
        <div class="collection-buttons">
          <button class="pxbtn" data-action="goChapterOne">⚓ 챕터로 돌아가기</button>
        </div>
      </div>
    </div>`);
}

// ---------------- 화면: 사이트워드 섬 (상시 오픈 특수 섬) ----------------
// SPEC.md §20. 챕터 진행 게이트(stage_order/S.clearedStages/S.gems)와 완전히
// 분리된 별도 화면. 티어는 해당 챕터를 전부 클리어하면 해금되고,
// 티어 안에서는 순서 없이 자유 학습. 체크는 S.islandWords에만 기록한다.
function islandTierUnlocked(tier) {
  if (TEST_MODE) return true;
  const ch = chapterById(tier.chapter_id);
  return !!ch && isChapterComplete(ch);
}

function islandTierWords(tier) {
  return KP_ISLAND_WORDS.filter(w => w.tier === tier.tier);
}

function showSightIsland(tabIdx) {
  const unlockedTiers = KP_ISLAND_TIERS.map(islandTierUnlocked);
  if (tabIdx === undefined) {
    // 기본 탭은 TEST_MODE와 무관하게 "실제로 클리어한" 가장 높은 티어
    const realUnlocked = KP_ISLAND_TIERS.map(t => {
      const tierCh = chapterById(t.chapter_id);
      return !!tierCh && isChapterComplete(tierCh);
    });
    tabIdx = Math.max(0, realUnlocked.lastIndexOf(true));
  }
  view = { screen: "island", tab: tabIdx };
  const tier = KP_ISLAND_TIERS[tabIdx];
  const open = unlockedTiers[tabIdx];
  const words = islandTierWords(tier);
  const ch = chapterById(tier.chapter_id);
  S.islandWords = S.islandWords || {};
  const mastered = words.filter(w => S.islandWords[w.word]?.mastered).length;
  const totalMastered = KP_ISLAND_WORDS.filter(w => S.islandWords[w.word]?.mastered).length;
  render(`
    <div class="screen island-screen">
      ${hudHTML()}
      <div class="island-panel">
        <header class="island-head">
          <h1>🏝️❤️ 사이트워드 섬</h1>
          <p>언제든 놀러 와서 하트 단어를 익혀요! 챕터를 깰수록 새 티어가 열려요.
          <span class="island-total">지금까지 익힌 단어 <b>${totalMastered} / ${KP_ISLAND_WORDS.length}</b></span></p>
        </header>
        <div class="practice-tabs island-tabs">
          ${KP_ISLAND_TIERS.map((t, i) => {
            const tierCh = chapterById(t.chapter_id);
            const on = unlockedTiers[i];
            return `<button class="ptab ${i === tabIdx ? "on" : ""} ${on ? "" : "plocked"}" data-action="islandTab" data-tab="${i}">
              ${on ? tierCh.emoji : "🔒"} ${t.title}
            </button>`;
          }).join("")}
        </div>
        ${open ? `
          <div class="practice-meta">
            <span>${ch.emoji} <b>Chapter ${ch.num} ${esc(ch.chapter_name_kr)}</b>의 하트 단어 · ${esc(tier.subtitle)}</span>
            <span class="practice-count">익힌 단어 <b>${mastered} / ${words.length}</b></span>
          </div>
          <p class="island-hint">카드를 누르면 소리가 나오고 뒤집혀요. 다 익힌 단어는 아래 체크를 눌러 표시해요. (체크는 순수 자기 확인용!)</p>
          <div class="island-grid">
            ${words.map(w => {
              const done = !!S.islandWords[w.word]?.mastered;
              return `
              <div class="island-word ${done ? "mastered" : ""}">
                <button class="flip-card island-card" data-action="flipIslandCard" data-word="${esc(w.word)}" aria-label="${esc(w.word)} 카드">
                  <span class="flip-inner">
                    <span class="flip-front"><span class="heart-mark">❤️</span><span class="card-bigword card-gold">${esc(w.word)}</span><span class="card-tag tag-gold">하트 단어</span></span>
                    <span class="flip-back"><span class="card-emoji">${w.emoji}</span><span class="card-word">${esc(w.word)}</span><span class="card-kr">${esc(w.kr)}</span></span>
                  </span>
                  ${done ? `<span class="card-check">✔</span>` : ""}
                </button>
                <button class="island-master-btn" data-action="toggleIslandMastered" data-word="${esc(w.word)}">${done ? "✅ 다 익혔어요!" : "⬜ 학습 완료 체크"}</button>
              </div>`;
            }).join("")}
          </div>` : `
          <div class="island-fog-note"><span>🌫️</span><b>아직 안개에 싸여 있어요!</b><p>${ch.emoji} <b>Chapter ${ch.num} ${esc(ch.chapter_name_kr)}</b>를 모두 깨면 이 티어의 하트 단어 <b>${words.length}개</b>가 열려요.</p></div>
          <div class="island-grid island-grid-fog">
            ${words.map(() => `<div class="island-fog-card"><span class="fog-cloud">☁️</span><i>?</i></div>`).join("")}
          </div>`}
        <div class="collection-buttons">
          <button class="pxbtn" data-action="goWorld">🗺️ 월드맵으로</button>
        </div>
      </div>
    </div>`);
}

// ---------------- 화면: 챕터 뱃지 ----------------
function showBadge(chId) {
  const ch = chapterById(chId);
  view = { screen: "badge", chId };
  render(`
    <div class="screen badge-screen">
      <div class="badge-burst">✨</div>
      <div class="badge-big">${ch.badge.emoji}</div>
      <h1 class="screen-title">${ch.badge.name_kr} 획득!</h1>
      <p class="screen-desc">Chapter ${ch.num} <b>${ch.chapter_name_kr}</b>의 모든 소리 씨앗을 모았어요!<br>다음 세계로 항해할 수 있어요.</p>
      <button class="pxbtn pxbtn-big pxbtn-gold" data-action="goWorld">🗺️ 월드맵으로</button>
    </div>
  `);
  KPAudio.sfx("badge");
}

// ---------------- 액션 핸들러 ----------------
const ACTIONS = {
  toggleMute() { KPAudio.setMuted(!KPAudio.isMuted()); const b = app.querySelector('[data-action="toggleMute"]'); if (b) b.textContent = KPAudio.isMuted() ? "🔇" : "🔊"; },
  goWorld() { KPAudio.sfx("click"); showWorldMap(); },
  goChapterOne() {
    KPAudio.sfx("click");
    const ch = chapterById("ch1");
    if (isChapterComplete(ch) && !S.badges.includes(ch.badge.id)) { S.badges.push(ch.badge.id); save(); uploadSave("badge-earned"); showBadge("ch1"); }
    else showChapterMap("ch1");
  },
  openGauntlet() { KPAudio.sfx("click"); showGauntlet(); },
  openShop() { KPAudio.sfx("click"); showShop(); },
  buyItem(el) {
    if (el.classList.contains("disabled")) { KPAudio.sfx("no"); toast("골드가 조금 더 필요해요! 🪙"); return; }
    const item = SHOP_ITEMS.find(x => x.id === el.dataset.item);
    if (!item || S.ownedItems.includes(item.id) || S.coins < item.price) return;
    S.coins -= item.price;
    S.ownedItems.push(item.id);
    S.equippedItem = item.id;
    save(); KPAudio.sfx("coin"); toast(`${item.emoji} ${item.name} 구매·장착 완료!`); showShop();
  },
  equipItem(el) {
    const item = SHOP_ITEMS.find(x => x.id === el.dataset.item);
    if (!item || !S.ownedItems.includes(item.id)) return;
    S.equippedItem = S.equippedItem === item.id ? null : item.id;
    save(); KPAudio.sfx("click"); showShop();
  },
  toggleSoundCard(el) {
    KPAudio.sfx("flip");
    el.closest(".sound-letter-card")?.classList.toggle("flipped");
  },
  teacherLogin() { KPAudio.sfx("click"); showTeacherLogin(); },
  showRestore() { KPAudio.sfx("click"); showRestore(); },
  backToIntro() { KPAudio.sfx("click"); showIntro(); },
  async restoreGame() {
    const classCode = (app.querySelector("#restoreClassCode")?.value || "").trim();
    const name = (app.querySelector("#restoreName")?.value || "").trim();
    if (!classCode || !name) { KPAudio.sfx("no"); toast("학급코드와 이름을 모두 입력해 주세요."); return; }
    const button = app.querySelector('[data-action="restoreGame"]');
    if (button?.classList.contains("disabled")) return;
    if (button) { button.classList.add("disabled"); button.textContent = "☁️ 불러오는 중…"; }
    try {
      const result = await restoreSaveJSONP(classCode, name);
      if (!result?.ok || !result.save) throw new Error(result?.message || "저장된 기록을 찾지 못했어요.");
      S = migrateSave(typeof result.save === "string" ? JSON.parse(result.save) : result.save);
      S.classCode = classCode;
      S.name = name;
      save();
      KPAudio.sfx("win");
      toast("진도를 불러왔어요! 이어서 항해해요. ⛵", "success");
      showWorldMap();
    } catch (error) {
      KPAudio.sfx("no");
      toast(error?.message || "기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      if (button) { button.classList.remove("disabled"); button.textContent = "☁️ 진도 불러오기"; }
    }
  },
  submitTeacherLogin() {
    const input = app.querySelector("#teacherPin");
    const error = app.querySelector("#teacherError");
    if (input?.value === TEACHER_PIN) { KPAudio.sfx("ok"); showTeacherDashboard(); return; }
    KPAudio.sfx("no");
    if (error) error.textContent = "PIN이 맞지 않습니다.";
    input?.focus();
  },
  teacherLogout() { KPAudio.sfx("click"); showIntro(); },

  newGame() {
    KPAudio.sfx("click");
    if (S.character && S.name && !confirm("정말 처음부터 새로 시작할까요? 지금까지의 모험 기록이 사라져요!")) return;
    resetSave();
    showCharSelect();
  },
  continueGame() {
    if (!S.classCode) {
      KPAudio.sfx("click");
      showCharSelect();
      toast("기존 진도를 이어가려면 학급코드를 한 번 입력해 주세요. 🏫");
      return;
    }
    KPAudio.sfx("sail");
    if (S.current && S.current.stage && !isStageCleared(S.current.stage)) enterStage(S.current.stage);
    else showWorldMap();
  },

  pickChar(el) {
    KPAudio.sfx("click");
    view.selected = el.dataset.char;
    app.querySelectorAll(".char-card").forEach(c => c.classList.toggle("selected", c.dataset.char === view.selected));
  },
  startAdventure() {
    const classCode = (app.querySelector("#classCodeInput") || {}).value || "";
    const name = (app.querySelector("#nameInput") || {}).value || "";
    if (!classCode.trim()) { KPAudio.sfx("no"); toast("학급코드를 먼저 써 주세요! 🏫"); return; }
    if (!name.trim()) { KPAudio.sfx("no"); toast("이름을 먼저 써 주세요! ✏️"); return; }
    if (!view.selected) { KPAudio.sfx("no"); toast("탐험가를 골라 주세요! 🧭"); return; }
    S.classCode = classCode.trim();
    S.name = name.trim();
    S.character = view.selected;
    save();
    KPAudio.sfx("sail");
    showWorldMap();
  },

  enterChapter(el) {
    const ch = chapterById(el.dataset.chapter);
    if (!isChapterUnlocked(ch)) { KPAudio.sfx("no"); el.classList.add("shake"); setTimeout(() => el.classList.remove("shake"), 500); toast("아직 잠겨 있어요! 이전 세계의 뱃지가 필요해요 🔒"); return; }
    KPAudio.sfx("sail");
    showChapterMap(ch.chapter_id);
  },
  nextCutscene(el) { KPAudio.sfx("click"); showCutscene(el.dataset.chapter, parseInt(el.dataset.idx, 10)); },
  skipCutscene(el) { const chId = el.dataset.chapter; if (!S.seenCutscenes.includes(chId)) { S.seenCutscenes.push(chId); save(); } showChapterMap(chId); },

  enterStage(el) { KPAudio.sfx("click"); enterStage(el.dataset.stage); },
  backToChapter(el) { KPAudio.sfx("click"); showChapterMap(el.dataset.chapter); },
  completeStep(el) { if (el.classList.contains("disabled")) { KPAudio.sfx("no"); toast("아직이야! 위의 활동을 모두 끝내 줘 😊"); return; } completeStep(); },

  // 단계 탭 네비게이션 (완료 탭 재방문 / 이전 단계)
  jumpStep(el) {
    const st = stageById(view.stageId);
    const idx = st.steps.indexOf(el.dataset.step);
    if (idx < 0 || idx > effMax(st)) { KPAudio.sfx("no"); return; }
    KPAudio.sfx("click");
    gotoStep(el.dataset.step);
  },
  prevStep() {
    const st = stageById(view.stageId);
    const idx = st.steps.indexOf(view.step);
    if (idx > 0) { KPAudio.sfx("click"); gotoStep(st.steps[idx - 1]); }
  },

  // 읽기 방식 (나눠 읽기 / 바로 읽기) — 설정 유지
  setReadMode(el) {
    KPAudio.setReadMode(el.dataset.mode);
    KPAudio.sfx("click");
    app.querySelectorAll(".rm-btn").forEach(b => b.classList.toggle("on", b.dataset.mode === KPAudio.getReadMode()));
  },

  // 소리 찾기
  flipCard(el) {
    KPAudio.sfx("flip");
    el.classList.toggle("flipped");
    const { card, kind, letter, word } = el.dataset;
    playByKind(kind, letter, word);
    const prog = stepProg(view.stageId);
    if (!prog.seen.includes(card)) {
      prog.seen.push(card);
      save();
      el.classList.add("seen");
      if (!el.querySelector(".card-check")) el.insertAdjacentHTML("beforeend", `<span class="card-check">✔</span>`);
      const st = stageById(view.stageId);
      const cards = discoverCards(st);
      const desc = app.querySelector(".step-desc");
      if (desc) desc.innerHTML = `카드를 눌러 소리를 듣고 뒤집어 봐! <b>모든 카드</b>를 봐야 다음으로 갈 수 있어. (${prog.seen.length}/${cards.length})`;
      if (cards.every(c => prog.seen.includes(c.id))) {
        const btn = app.querySelector('.step-footer .pxbtn');
        if (btn) btn.classList.remove("disabled");
        KPAudio.sfx("coin");
      }
    }
  },

  // 카드 페이지 넘기기 (소리 찾기)
  prevCardPage(el) {
    if (el && el.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.cardPage = (view.cardPage || 0) - 1;
    renderDiscover(stageById(view.stageId));
  },
  nextCardPage(el) {
    if (el && el.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.cardPage = (view.cardPage || 0) + 1;
    renderDiscover(stageById(view.stageId));
  },
  prevApplyPage(el) {
    if (el?.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.applyPage = Math.max(0, (view.applyPage || 0) - 1);
    renderApply(stageById(view.stageId));
  },
  nextApplyPage(el) {
    if (el?.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.applyPage = (view.applyPage || 0) + 1;
    renderApply(stageById(view.stageId));
  },

  // 챕터 화면 징검다리 → 해당 스테이지의 특정 단계로 바로 진입
  enterStep(el) {
    const sid = el.dataset.stage;
    const step = el.dataset.step;
    if (!isStageUnlocked(sid)) { KPAudio.sfx("no"); return; }
    KPAudio.sfx("click");
    enterStage(sid); // 잠금 검사 + view/저장 세팅 (기존 재개 로직 재사용)
    if (view.screen !== "stage" || view.step === step) return;
    const st = stageById(sid);
    const idx = st.steps.indexOf(step);
    if (idx >= 0 && idx <= effMax(st)) gotoStep(step);
  },

  // 이름 배우기: 음가 / 글자 이름 / 예시 단어 (리소스 분리)
  // 음가는 녹음 파일 전용 — 파일 없으면 재생하지 않음 (TTS 대체 금지)
  speakPhonemeBtn(el) {
    if (!KPAudio.hasPhoneme(el.dataset.letter)) {
      KPAudio.sfx("no");
      toast("이 글자의 음가 녹음이 아직 준비 중이에요 🔇");
      return;
    }
    KPAudio.speakPhoneme(el.dataset.letter);
  },
  speakNameBtn(el) { KPAudio.speakLetterName(el.dataset.letter); },
  speakExampleBtn(el) { KPAudio.playWord(el.dataset.word, { forceWhole: true }); },

  // 혼자 읽기
  revealLetterAnswer(el) {
    if (!view.revealedAnswers) view.revealedAnswers = {};
    view.revealedAnswers[el.dataset.item] = true;
    if (KPAudio.hasPhoneme(el.dataset.letter)) KPAudio.speakLetterIntro(el.dataset.letter, el.dataset.word);
    else {
      KPAudio.playWord(el.dataset.word, { forceWhole: true });
      toast("음가 녹음은 준비 중이라 낱말 소리부터 들려줘요.");
    }
    renderApply(stageById(view.stageId));
  },
  selfAssessLetter(el) {
    const prog = stepProg(view.stageId);
    if (!prog.selfAssess) prog.selfAssess = {};
    prog.selfAssess[el.dataset.item] = el.dataset.result;
    if (el.dataset.result === "correct") {
      if (!prog.done.includes(el.dataset.item)) prog.done.push(el.dataset.item);
      KPAudio.sfx("ok");
    } else {
      prog.done = prog.done.filter(id => id !== el.dataset.item);
      KPAudio.sfx("no");
    }
    save(); renderApply(stageById(view.stageId));
  },
  revealWordAnswer(el) {
    if (!view.revealedWords) view.revealedWords = {};
    view.revealedWords[el.dataset.item] = true;
    KPAudio.playWord(el.dataset.word, { onSegStep: segVisual });
    renderApply(stageById(view.stageId));
  },
  selfAssessWord(el) {
    const prog = stepProg(view.stageId);
    if (!prog.wordAssess) prog.wordAssess = {};
    prog.wordAssess[el.dataset.item] = el.dataset.result;
    if (el.dataset.result === "correct") {
      if (!prog.done.includes(el.dataset.item)) prog.done.push(el.dataset.item);
      KPAudio.sfx("ok");
    } else {
      prog.done = prog.done.filter(id => id !== el.dataset.item);
      KPAudio.sfx("no");
    }
    save(); renderApply(stageById(view.stageId));
  },
  markRead(el) {
    const id = el.dataset.item;
    const prog = stepProg(view.stageId);
    if (!prog.done.includes(id)) {
      prog.done.push(id);
      save();
      KPAudio.sfx("click");
      renderApply(stageById(view.stageId)); // 카운터/버튼 상태 갱신
    }
  },
  hint(el) {
    const { kind, letter, word } = el.dataset;
    playByKind(kind, letter, word);
  },

  // 단어 만들기: 단어 소리는 통째로 재생하고, 타일은 탭으로 선택/취소한다.
  playSpellWord(el) { KPAudio.playWord(el.dataset.word, { forceWhole: true }); },
  toggleSpellTile(el) {
    const st = stageById(view.stageId);
    const state = spellState(st);
    const tiles = spellTiles(st, state);
    const id = el.dataset.tile;
    const tile = tiles.find(item => item.id === id);
    if (!tile) return;
    const pickedAt = state.selected.indexOf(id);
    if (pickedAt >= 0) state.selected.splice(pickedAt, 1);
    else {
      const answerLength = state.words[state.idx].length;
      if (state.selected.length >= answerLength) return;
      state.selected.push(id);
    }
    state.revealed = false;
    // 음가는 녹음 mp3가 준비된 경우에만 재생한다. TTS로 대체하지 않는다.
    if (KPAudio.hasPhoneme(tile.letter)) KPAudio.speakPhoneme(tile.letter);
    else KPAudio.sfx("click");
    save(); renderSpell(st);
  },
  removeSpellTile(el) {
    const st = stageById(view.stageId);
    const state = spellState(st);
    const index = Number(el.dataset.index);
    if (index >= 0 && index < state.selected.length) state.selected.splice(index, 1);
    KPAudio.sfx("click");
    save(); renderSpell(st);
  },
  checkSpell(el) {
    if (el.classList.contains("disabled")) { KPAudio.sfx("no"); return; }
    const st = stageById(view.stageId);
    const state = spellState(st);
    const tiles = spellTiles(st, state);
    const answer = state.selected.map(id => tiles.find(tile => tile.id === id)?.letter || "").join("");
    const target = state.words[state.idx].toLowerCase();
    if (answer === target) {
      KPAudio.sfx("ok");
      state.idx++;
      state.selected = [];
      state.attempts = 0;
      state.revealed = false;
      if (state.idx >= state.words.length) state.complete = true;
      save(); renderSpell(st);
      return;
    }
    state.attempts++;
    save();
    state.shake = true;
    KPAudio.sfx("no");
    renderSpell(st);
    state.shake = false;
    toast(state.attempts >= 2 ? "한 번 더 해 보고, 어려우면 정답 보기를 눌러요." : "글자 순서를 다시 살펴봐요.");
  },
  revealSpellAnswer() {
    const st = stageById(view.stageId);
    const state = spellState(st);
    state.revealed = true;
    KPAudio.playWord(state.words[state.idx], { forceWhole: true });
    save(); renderSpell(st);
  },

  // 확장하기 (라운드형)
  playRound() {
    const r = view.extend.rounds[view.extend.idx];
    if (r.kind === "firstSound") KPAudio.playWord(r.word, { forceWhole: true }); // 예시 단어는 통째로
    else playByKind(wordKind(r.word), null, r.word);
  },
  answerRound(el) {
    const r = view.extend.rounds[view.extend.idx];
    if (el.dataset.choice === r.answer) {
      KPAudio.sfx("ok");
      view.extend.idx++;
      renderExtend(stageById(view.stageId));
    } else {
      KPAudio.sfx("no");
      el.classList.add("wrong");
      toast("다시 잘 들어 봐! 👂");
    }
  },

  // 문장 속에서 찾기 — 규칙 단어는 세그먼트 → 블렌딩으로 읽기
  clickToken(el) {
    const key = `${el.dataset.r}-${el.dataset.t}`;
    KPAudio.playWord(el.dataset.word, { onSegStep: segVisual });
    if (!view.extend.clicked[key]) {
      view.extend.clicked[key] = true;
      KPAudio.sfx("coin");
      renderExtend(stageById(view.stageId));
    }
  },
  speakSentenceBtn(el) { KPAudio.speakSentence(el.dataset.text); },
  prevSentence(el) {
    if (el.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.extend.idx = Math.max(0, view.extend.idx - 1);
    renderExtend(stageById(view.stageId));
  },
  nextSentence(el) {
    if (el.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.extend.idx = Math.min(view.extend.rounds.length - 1, view.extend.idx + 1);
    renderExtend(stageById(view.stageId));
  },

  // 퀴즈
  playQuiz() {
    const q = view.quiz.qs[view.quiz.idx];
    if (q.kind === "letter") KPAudio.speakLetterIntro(q.letter, q.word);
    else playByKind(q.kind, null, q.word);
  },
  answerQuiz(el) {
    const qz = view.quiz;
    if (qz.answered) return;
    const q = qz.qs[qz.idx];
    const pick = el.dataset.choice;
    qz.answered = true;
    if (pick === q.answer) {
      qz.correct++;
      KPAudio.sfx("ok");
      el.classList.add("right");
    } else {
      KPAudio.sfx("no");
      el.classList.add("wrong");
      app.querySelectorAll(".choice-btn").forEach(b => { if (b.dataset.choice === q.answer) b.classList.add("right"); });
    }
    setTimeout(() => { qz.idx++; qz.answered = false; renderQuiz(stageById(view.stageId)); }, 900);
  },
  retryQuiz() { KPAudio.sfx("click"); view.quiz = null; renderQuiz(stageById(view.stageId)); },

  // ---------- 유창성: 몸풀기 단어 ----------
  flipWarmCard(el) {
    KPAudio.sfx("flip");
    el.classList.toggle("flipped");
    const word = el.dataset.word;
    playByKind(wordKind(word), null, word);
    const st = stageById(view.stageId);
    const prog = stepProg(view.stageId);
    if (!prog.seen.includes(word)) {
      prog.seen.push(word);
      save();
      el.classList.add("seen");
      if (!el.querySelector(".card-check")) el.insertAdjacentHTML("beforeend", `<span class="card-check">✔</span>`);
      const desc = app.querySelector(".step-desc");
      if (desc) desc.innerHTML = `몸풀기! 단어를 눌러 <b>소리 상자</b>를 따라 읽고, 뒤집어 뜻을 확인해요. (${prog.seen.length}/${st.warmup.length})`;
      if (st.warmup.every(w => prog.seen.includes(w.word))) {
        app.querySelector(".step-footer .pxbtn")?.classList.remove("disabled");
        KPAudio.sfx("coin");
      }
    }
  },

  // ---------- 유창성: 하트 단어 ----------
  flipHeartCard(el) {
    KPAudio.sfx("flip");
    el.classList.toggle("flipped");
    const word = el.dataset.word;
    KPAudio.playWord(word, { forceWhole: true }); // 사이트워드는 항상 통째로
    const st = stageById(view.stageId);
    const prog = stepProg(view.stageId);
    if (!prog.heartSeen) prog.heartSeen = [];
    if (!prog.heartSeen.includes(word)) {
      prog.heartSeen.push(word);
      save();
      el.classList.add("seen");
      if (!el.querySelector(".card-check")) el.insertAdjacentHTML("beforeend", `<span class="card-check">✔</span>`);
      const desc = app.querySelector(".step-desc");
      if (desc) desc.innerHTML = `❤️ 하트 단어는 <b>보자마자 통째로</b> 읽는 단어예요. 눌러서 듣고, 뒤집어 뜻을 확인해요. (${prog.heartSeen.length}/${st.heart.length})`;
      if (st.heart.every(w => prog.heartSeen.includes(w.word))) {
        app.querySelector(".step-footer .pxbtn")?.classList.remove("disabled");
        KPAudio.sfx("coin");
      }
    }
  },

  // ---------- 유창성: 문장 피라미드 ----------
  readPyrLine(el) {
    const st = stageById(view.stageId);
    const prog = stepProg(view.stageId);
    if (!prog.pyr) prog.pyr = { lines: {}, flipped: {} };
    KPAudio.speakSentence(el.dataset.text);
    const key = `${el.dataset.r}-${el.dataset.l}`;
    if (!prog.pyr.lines[key]) {
      prog.pyr.lines[key] = true;
      save();
      renderPyramid(st);
    }
  },
  flipPyrCard(el) {
    const st = stageById(view.stageId);
    const prog = stepProg(view.stageId);
    if (!prog.pyr) prog.pyr = { lines: {}, flipped: {} };
    const ri = Number(el.dataset.r);
    KPAudio.sfx("flip");
    if (!view.pyrFlip) view.pyrFlip = {};
    view.pyrFlip[ri] = !view.pyrFlip[ri];
    KPAudio.speakSentence(st.story[ri].text);
    if (!prog.pyr.flipped[ri]) {
      prog.pyr.flipped[ri] = true;
      save();
    }
    renderPyramid(st);
  },
  prevPyr(el) {
    if (el.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.pyrIdx = Math.max(0, (view.pyrIdx || 0) - 1);
    renderPyramid(stageById(view.stageId));
  },
  nextPyr(el) {
    if (el.classList.contains("disabled")) return;
    KPAudio.sfx("click");
    view.pyrIdx = (view.pyrIdx || 0) + 1;
    renderPyramid(stageById(view.stageId));
  },

  // ---------- 유창성: 이해 확인 ----------
  playFq() {
    const st = stageById(view.stageId);
    KPAudio.speakSentence(st.questions[view.fq.idx].q);
  },
  answerFq(el) {
    const st = stageById(view.stageId);
    const fq = view.fq;
    if (fq.answered) return;
    const q = st.questions[fq.idx];
    fq.answered = true;
    if (el.dataset.choice === q.answer) {
      fq.correct++;
      KPAudio.sfx("ok");
      el.classList.add("right");
    } else {
      KPAudio.sfx("no");
      el.classList.add("wrong");
      app.querySelectorAll(".fq-choice").forEach(b => { if (b.dataset.choice === q.answer) b.classList.add("right"); });
    }
    setTimeout(() => { fq.idx++; fq.answered = false; renderFluencyQuiz(stageById(view.stageId)); }, 900);
  },
  retryFq() { KPAudio.sfx("click"); view.fq = null; renderFluencyQuiz(stageById(view.stageId)); },

  // ---------- 단어 연습장 (선택) ----------
  openPractice() { KPAudio.sfx("click"); showPractice(); },
  practiceTab(el) {
    KPAudio.sfx("click");
    showPractice(Number(el.dataset.tab));
  },
  flipPracticeChip(el) {
    KPAudio.sfx("flip");
    el.classList.toggle("flipped");
  },
  playPracticeWord(el) {
    const word = el.dataset.word;
    playByKind(wordKind(word), null, word);
  },
  togglePracticeCheck(el) {
    const { set, word } = el.dataset;
    S.practice = S.practice || {};
    if (!Array.isArray(S.practice[set])) S.practice[set] = [];
    const i = S.practice[set].indexOf(word);
    if (i >= 0) { S.practice[set].splice(i, 1); KPAudio.sfx("click"); }
    else { S.practice[set].push(word); KPAudio.sfx("coin"); }
    save();
    showPractice(view.tab);
  },

  // ---------- 사이트워드 섬 (상시 오픈, 진도 게이트 아님) ----------
  openIsland() { KPAudio.sfx("sail"); showSightIsland(); },
  islandTab(el) { KPAudio.sfx("click"); showSightIsland(Number(el.dataset.tab)); },
  flipIslandCard(el) {
    KPAudio.sfx("flip");
    el.classList.toggle("flipped");
    // 사이트워드는 통글자 인식 — 항상 단어 전체 발음 (음가 아님 → TTS 사용 가능)
    KPAudio.playWord(el.dataset.word, { forceWhole: true });
  },
  toggleIslandMastered(el) {
    const word = el.dataset.word;
    S.islandWords = S.islandWords || {};
    const next = !S.islandWords[word]?.mastered;
    S.islandWords[word] = { mastered: next };
    KPAudio.sfx(next ? "coin" : "click");
    save();
    showSightIsland(view.tab);
  },

  // 보상
  openChest(el) {
    if (view.opened) return;
    view.opened = true;
    KPAudio.sfx("chest");
    el.classList.add("open");
    el.querySelector(".chest-emoji").textContent = "💰";
    el.querySelector(".chest-hint").textContent = "와아!";
    S.coins += view.coins;
    save();
    uploadSave("reward-opened");
    setTimeout(() => {
      const r = document.getElementById("rewardResult");
      if (r) r.classList.remove("hidden");
      KPAudio.sfx("coin");
    }, 600);
  },
  afterReward(el) {
    const chId = el.dataset.chapter;
    const ch = chapterById(chId);
    if (isChapterComplete(ch) && !S.badges.includes(ch.badge.id)) {
      S.badges.push(ch.badge.id);
      save();
      uploadSave("badge-earned");
      showBadge(chId);
    } else {
      KPAudio.sfx("sail");
      showChapterMap(chId);
    }
  }
};

// 이벤트 위임 + 오디오 재생 중 버튼 잠금
app.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  if (KPAudio.isBusy() && el.dataset.action !== "toggleMute") return; // 재생 끝나면 자동 해제
  const fn = ACTIONS[el.dataset.action];
  if (fn) fn(el);
});

// 스와이프로 카드 페이지 넘기기 (소리 찾기 화면)
let swipeX = null;
app.addEventListener("touchstart", e => { swipeX = e.touches[0].clientX; }, { passive: true });
app.addEventListener("touchend", e => {
  if (swipeX === null) return;
  const dx = e.changedTouches[0].clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) < 50 || view.screen !== "stage" || view.step !== "discover" || KPAudio.isBusy()) return;
  if (dx < 0) ACTIONS.nextCardPage(app.querySelector('[data-action="nextCardPage"]'));
  else ACTIONS.prevCardPage(app.querySelector('[data-action="prevCardPage"]'));
}, { passive: true });

// 재생 중 시각적 잠금 표시
KPAudio.onBusyChange = busy => document.body.classList.toggle("audio-busy", busy);

// 음가 파일 프리로드 판정이 도착하면 화면의 "🔇 준비 중" 배지를 제자리 갱신
// (전체 재렌더 없이 배지만 갱신 → 카드 플립 상태 보존)
KPAudio.onPhonemeStatus = () => {
  if (view.screen !== "stage" || view.step !== "discover") return;
  app.querySelectorAll('.flip-card[data-kind="letter"]').forEach(card => {
    const ok = KPAudio.hasPhoneme(card.dataset.letter);
    const badge = card.querySelector(".card-noaudio");
    if (ok && badge) badge.remove();
    if (!ok && !badge) card.querySelector(".flip-front").insertAdjacentHTML("beforeend", `<span class="card-noaudio">🔇 준비 중</span>`);
  });
};

// ---------------- 시작 ----------------
loadSave();
showIntro();

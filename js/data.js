/* =====================================================
   K-Phonics OPS™: Adventure — 데이터 정의 (Phase 1)
   - 챕터/스테이지/규칙/단어/사이트워드/컷씬
   - rule_id 기반 퀴즈 필터링의 원천 데이터
   ===================================================== */

// ---------- 챕터 (5개 월드) ----------
const KP_CHAPTERS = [
  {
    chapter_id: "ch1",
    num: 1,
    stage_name: "Sound Seeds",
    chapter_name_kr: "출항의 항구마을",
    world_theme: "harbor",
    emoji: "⚓",
    color: "#e8a24b",
    sea: "#69c8e8",
    map_pos: { x: 16, y: 68 },
    stage_order: ["efl-1", "efl-2", "efl-sight-1", "efl-3", "efl-4", "efl-sight-2", "efl-5", "efl-6", "efl-sight-3"],
    badge: { id: "seed_badge", name_kr: "씨앗 뱃지", emoji: "🌱" },
    implemented: true
  },
  {
    chapter_id: "ch2",
    num: 2,
    stage_name: "Word Builders",
    chapter_name_kr: "대양 항해",
    world_theme: "ocean",
    emoji: "🌊",
    color: "#4b9de8",
    sea: "#3f8fd4",
    map_pos: { x: 40, y: 38 },
    stage_order: [],
    badge: { id: "wave_badge", name_kr: "파도 뱃지", emoji: "🌊" },
    implemented: false
  },
  {
    chapter_id: "ch3",
    num: 3,
    stage_name: "Pattern Power",
    chapter_name_kr: "안개 늪지대",
    world_theme: "swamp",
    emoji: "🌫️",
    color: "#8aa06b",
    sea: "#5d7a63",
    map_pos: { x: 64, y: 62 },
    stage_order: [],
    badge: { id: "fog_badge", name_kr: "안개 뱃지", emoji: "🌫️" },
    implemented: false
  },
  {
    chapter_id: "ch4",
    num: 4,
    stage_name: "Bridge Readers",
    chapter_name_kr: "빙하 다리 지대",
    world_theme: "ice",
    emoji: "❄️",
    color: "#9fd4ef",
    sea: "#7fb8d9",
    map_pos: { x: 82, y: 32 },
    stage_order: [],
    badge: { id: "ice_badge", name_kr: "얼음 뱃지", emoji: "❄️" },
    implemented: false
  },
  {
    chapter_id: "ch5",
    num: 5,
    stage_name: "Free Flyers",
    chapter_name_kr: "하늘섬 보물지대",
    world_theme: "sky",
    emoji: "☁️",
    color: "#c9a7e8",
    sea: "#b48fd9",
    map_pos: { x: 55, y: 12 },
    stage_order: [],
    badge: { id: "wing_badge", name_kr: "날개 뱃지", emoji: "🪽" },
    implemented: false
  }
];

// ---------- 자음 21개 (rule 1-1) ----------
// sound_hint: TTS 근사 발음 (Phase 4에서 원어민 mp3로 교체 예정)
const KP_CONSONANTS = [
  { letter: "b", ipa: "/b/",  krSound: "브", word: "ball",   emoji: "⚽", wordKr: "공" },
  { letter: "c", ipa: "/k/",  krSound: "크", word: "cat",    emoji: "🐱", wordKr: "고양이" },
  { letter: "d", ipa: "/d/",  krSound: "드", word: "duck",   emoji: "🦆", wordKr: "오리" },
  { letter: "f", ipa: "/f/",  krSound: "프(입술)", word: "fish", emoji: "🐟", wordKr: "물고기" },
  { letter: "g", ipa: "/g/",  krSound: "그", word: "goat",   emoji: "🐐", wordKr: "염소" },
  { letter: "h", ipa: "/h/",  krSound: "흐", word: "hat",    emoji: "🎩", wordKr: "모자" },
  { letter: "j", ipa: "/dʒ/", krSound: "즈", word: "jet",    emoji: "✈️", wordKr: "제트기" },
  { letter: "k", ipa: "/k/",  krSound: "크", word: "king",   emoji: "👑", wordKr: "왕" },
  { letter: "l", ipa: "/l/",  krSound: "르", word: "lion",   emoji: "🦁", wordKr: "사자" },
  { letter: "m", ipa: "/m/",  krSound: "므", word: "moon",   emoji: "🌙", wordKr: "달" },
  { letter: "n", ipa: "/n/",  krSound: "느", word: "net",    emoji: "🥅", wordKr: "그물" },
  { letter: "p", ipa: "/p/",  krSound: "프", word: "pig",    emoji: "🐷", wordKr: "돼지" },
  { letter: "q", ipa: "/kw/", krSound: "쿠", word: "queen",  emoji: "👸", wordKr: "여왕", note: "q는 늘 u랑 손잡고 다녀요 (qu)" },
  { letter: "r", ipa: "/r/",  krSound: "르(혀말기)", word: "rain", emoji: "🌧️", wordKr: "비" },
  { letter: "s", ipa: "/s/",  krSound: "스", word: "sun",    emoji: "☀️", wordKr: "해" },
  { letter: "t", ipa: "/t/",  krSound: "트", word: "tiger",  emoji: "🐯", wordKr: "호랑이" },
  { letter: "v", ipa: "/v/",  krSound: "브(입술)", word: "van", emoji: "🚐", wordKr: "밴" },
  { letter: "w", ipa: "/w/",  krSound: "워", word: "web",    emoji: "🕸️", wordKr: "거미줄" },
  { letter: "x", ipa: "/ks/", krSound: "크스", word: "box",  emoji: "📦", wordKr: "상자", note: "x는 단어 끝에서 소리나요 (box)" },
  { letter: "y", ipa: "/j/",  krSound: "이여", word: "yo-yo", emoji: "🪀", wordKr: "요요" },
  { letter: "z", ipa: "/z/",  krSound: "즈(벌소리)", word: "zebra", emoji: "🦓", wordKr: "얼룩말" }
];

// ---------- 모음 5개 (rule 1-2) — 개별 캐릭터 없음, 글자 이름으로만 부름 ----------
const KP_VOWELS = [
  { letter: "a", ipa: "/æ/", krSound: "애", word: "apple",    emoji: "🍎", wordKr: "사과" },
  { letter: "e", ipa: "/e/", krSound: "에", word: "egg",      emoji: "🥚", wordKr: "달걀" },
  { letter: "i", ipa: "/ɪ/", krSound: "이", word: "ink",      emoji: "🖋️", wordKr: "잉크" },
  { letter: "o", ipa: "/ɑ/", krSound: "아", word: "octopus",  emoji: "🐙", wordKr: "문어" },
  { letter: "u", ipa: "/ʌ/", krSound: "어", word: "umbrella", emoji: "☂️", wordKr: "우산" }
];

// ---------- 열린/닫힌 음절 직관 대비 쌍 (rule 1-3, 규칙 명시 아님) ----------
const KP_CONTRAST_PAIRS = [
  { short: { word: "cat",  emoji: "🐱", kr: "고양이" }, long: { word: "cake", emoji: "🍰", kr: "케이크" }, vowel: "a" },
  { short: { word: "cap",  emoji: "🧢", kr: "모자" },   long: { word: "cape", emoji: "🦸", kr: "망토" },   vowel: "a" },
  { short: { word: "tap",  emoji: "🚰", kr: "수도꼭지" }, long: { word: "tape", emoji: "📼", kr: "테이프" }, vowel: "a" },
  { short: { word: "pin",  emoji: "📌", kr: "핀" },     long: { word: "pine", emoji: "🌲", kr: "소나무" }, vowel: "i" },
  { short: { word: "cub",  emoji: "🐻", kr: "새끼 곰" }, long: { word: "cube", emoji: "🧊", kr: "정육면체" }, vowel: "u" }
];

/* =====================================================
   사이트워드 3그룹 — Dolch Pre-Primer(40단어) 기준 선정
   (2026-07-17, EFL 파닉스 누적 글자 규칙에 맞춰 배치)

   원칙:
   1. 출처: Dolch Pre-Primer 목록(a, and, away, big, blue, can, come, down,
      find, for, funny, go, help, here, I, in, is, it, jump, little, look,
      make, me, my, not, one, play, red, run, said, see, the, three, to,
      two, up, we, where, yellow, you) 중, Chapter 1에서 배우는 글자·문장
      수준에 맞는 단어만 선별해 3그룹으로 배치한다.
   2. 각 단어는 🟢(그 시점까지 배운 글자로 완전히 해독 가능 — 유창성 강화
      목적) 또는 🔴(진짜 사이트워드 — 소리·철자 불일치로 암기 필요) 중 하나.
      단, 학생에게는 구분 없이 모두 "하트 단어"(통글자 인식)로 제시한다.
   3. j·k·q·v·w·x·y·z가 필요한 단어(away, blue, down, find, funny, jump,
      little, look, make, one, play, said, three, two, where, yellow, you,
      we, for, here)는 해당 글자를 배우는 이후 챕터로 미룬다. 단, "my"는
      기존 "like"(k 미학습)와 같은 전례로 고빈도 기능어라 조기 포함한다.
   ===================================================== */
const sightStage = (id, title, subtitle, words, sentences) => ({
  stage_id: id, rule_id: id, chapter_id: "ch1", type: "sight", title_kr: title,
  subtitle, icon: "❤️", steps: ["discover", "apply", "extend", "quiz"], words, sentences,
  extendTitle: "문장 속에서 찾기", extendDesc: "그림과 문장을 보고, 반짝이는 하트 단어를 눌러 소리를 들어 봐!"
});

// ---------- 하트 단어 1탄 (efl-2 직후 — m·s·a·t·p·i·n만으로 문장 연습 시작) ----------
// 🔴 전부 True Sight: I(대명사 관례), a(약모음), the(th+슈와), see(ee 모음팀 미학습)
const KP_SIGHT_1 = [
  { word: "I",   kr: "나는", emoji: "🙋",  sentence: "I sat.",         sentenceKr: "나는 앉았어요." },
  { word: "a",   kr: "하나의", emoji: "1️⃣", sentence: "I see a pin.",   sentenceKr: "나는 핀 하나를 봐요." },
  { word: "the", kr: "그",   emoji: "👉",  sentence: "I see the map.", sentenceKr: "나는 그 지도를 봐요." },
  { word: "see", kr: "보다", emoji: "👀",  sentence: "I see a man.",   sentenceKr: "나는 한 남자를 봐요." }
];
const KP_SIGHT1_SENTENCES = [
  { text: "I see a map.",  kr: "나는 지도를 봐요.",   sky: "☁️  🌤️  ☁️", main: "🧒  👀  🗺️", ground: "🌱  🌼  🌱" },
  { text: "I see the pin.", kr: "나는 그 핀을 봐요.", sky: "☀️  ☁️",      main: "🧒  👀  📌", ground: "🌱  🌼  🌱" },
  { text: "I see a man.",  kr: "나는 한 남자를 봐요.", sky: "☁️  ☀️  ☁️", main: "🧒  👀  🧑", ground: "🌱  🌼  🌱" }
];

// ---------- 하트 단어 2탄 (efl-4 직후 — +d·c·o·g) ----------
// 🟢 and·not: 이제 완전히 해독 가능(재확인 목적) / 🔴 go·to·my: 열린음절·기능어 관례
const KP_SIGHT_2 = [
  { word: "and", kr: "그리고", emoji: "➕",  sentence: "Dad and I sit.",       sentenceKr: "아빠와 나는 앉아요." },
  { word: "not", kr: "아니다", emoji: "🚫",  sentence: "The cat can not sit.", sentenceKr: "그 고양이는 앉지 못해요." },
  { word: "go",  kr: "가다",   emoji: "🚶",  sentence: "I go to the mat.",     sentenceKr: "나는 그 매트로 가요." },
  { word: "to",  kr: "~으로",  emoji: "➡️", sentence: "Dad got to the cot.", sentenceKr: "아빠가 그 간이침대에 도착했어요." },
  { word: "my",  kr: "나의",   emoji: "🙆",  sentence: "My cat sat.",          sentenceKr: "내 고양이가 앉았어요." }
];
const KP_SIGHT2_SENTENCES = [
  { text: "The cat can not sit.", kr: "그 고양이는 앉지 못해요.",   sky: "☁️  ☀️",      main: "🐱  🚫  🪑", ground: "🌱  🌼  🌱" },
  { text: "I go to the mat.",     kr: "나는 그 매트로 가요.",       sky: "☀️  ☁️",      main: "🧒  🚶  🟫", ground: "🌱  🌼  🌱" },
  { text: "My dad got a cat.",    kr: "우리 아빠가 고양이를 얻었어요.", sky: "☁️  ☀️  ☁️", main: "👨  ✅  🐱", ground: "🌱  🌼  🌱" }
];

// ---------- 하트 단어 3탄 (efl-6 직후 — +e·u·r·h·b·f·l, Chapter1 마무리) ----------
// 🟢 up·help·big: 완전히 해독 가능 / 🔴 like·me·come: 기능어·열린음절·불규칙
const KP_SIGHT_3 = [
  { word: "up",   kr: "위로",       emoji: "⬆️", sentence: "Sit up, Sam.",       sentenceKr: "샘, 일어나 앉아요." },
  { word: "help", kr: "돕다",       emoji: "🤝", sentence: "I can help Dad.",    sentenceKr: "나는 아빠를 도울 수 있어요." },
  { word: "big",  kr: "큰",         emoji: "🐘", sentence: "I see a big hut.",   sentenceKr: "나는 큰 오두막을 봐요." },
  { word: "like", kr: "좋아하다",   emoji: "❤️", sentence: "I like the sun.",    sentenceKr: "나는 해가 좋아요." },
  { word: "me",   kr: "나에게",     emoji: "🙋", sentence: "Come to me.",        sentenceKr: "나에게로 와요." },
  { word: "come", kr: "오다",       emoji: "👋", sentence: "Come and help.",     sentenceKr: "와서 도와줘요." }
];
const KP_SIGHT3_SENTENCES = [
  { text: "I like the sun.",     kr: "나는 해가 좋아요.",          sky: "☀️  ☀️  ☀️", main: "🧒  ❤️",       ground: "🌻  🌱  🌻" },
  { text: "Come and help Dad.",  kr: "아빠를 도와드리러 와요.",    sky: "☁️  ☀️",      main: "👋  🤗  👨",   ground: "🌱  🌼  🌱" },
  { text: "Come to me.",         kr: "나에게로 와요.",             sky: "☁️  ☀️  ☁️",  main: "👋  ➡️  🙋",   ground: "🌱  🌼  🌱" }
];

// ---------- 문장 속 단어 → 필요 규칙 매핑 ----------
// "문장 속에서 찾기"에서 현재까지 배운 규칙이 적용된 단어만 색깔 강조 + 클릭 재생.
// 여기 없는 단어이거나 규칙 미해제면 강조하지 않는다.
const KP_WORD_RULES = {
  cat: "2-2", sun: "2-2", pig: "2-2", cap: "2-2", tap: "2-2", pin: "2-2", cub: "2-2",
  cake: "3-5", cape: "3-5", tape: "3-5", pine: "3-5", cube: "3-5",
  moon: "4-4"
};

// 소리 나눠 읽기(segmenting)가 가능한 단어 (글자=음가 1:1 대응 단어만)
const KP_SEGMENTABLE = ["cat", "cap", "tap", "pin", "cub", "sun", "pig"];

// 글자/모음 스테이지의 "문장 속에서 찾기" 활동.
// 각 예시 단어가 실제 문장과 장면 속에서 다시 등장한다.
const KP_WORD_SENTENCES = {
  ball:     { text: "I kick a ball.",        kr: "나는 공을 차요.",             sky: "☁️  ☀️  ☁️", main: "🧒  ⚽", ground: "🌱  🌼  🌱  🌼  🌱" },
  cat:      { text: "I see a cat.",          kr: "나는 고양이를 봐요.",         sky: "☁️  🌤️  ☁️", main: "🧒  👀  🐱", ground: "🌱  🌼  🌱  🌼  🌱" },
  duck:     { text: "The duck can swim.",    kr: "오리가 헤엄칠 수 있어요.",    sky: "☁️  ☀️  ☁️", main: "🦆  💦", ground: "🌿  〰️  🌿" },
  fish:     { text: "I see a fish.",         kr: "나는 물고기를 봐요.",         sky: "☀️  ☁️", main: "🧒  👀  🐟", ground: "🪸  〰️  🪸" },
  goat:     { text: "The goat can jump.",    kr: "염소가 뛸 수 있어요.",        sky: "☁️  ☀️", main: "🐐  ✨", ground: "🌿  🪨  🌿" },
  hat:      { text: "I have a hat.",         kr: "나는 모자가 있어요.",         sky: "☁️  ☀️", main: "🧒  🎩", ground: "🌱  🌼  🌱" },
  jet:      { text: "The jet is fast.",      kr: "제트기는 빨라요.",            sky: "☁️  ✈️  ☁️", main: "💨  💨", ground: "🏙️  🏙️" },
  king:     { text: "I see a king.",         kr: "나는 왕을 봐요.",             sky: "☁️  ☀️", main: "🧒  👀  👑", ground: "🏰  🌳" },
  lion:     { text: "The lion can run.",     kr: "사자가 달릴 수 있어요.",      sky: "☀️  ☁️", main: "🦁  💨", ground: "🌾  🌾  🌾" },
  moon:     { text: "I see the moon.",       kr: "나는 달을 봐요.",             sky: "🌙  ⭐  ✨", main: "🧒  👀", ground: "🏠  🌲  🌲" },
  net:      { text: "I have a net.",         kr: "나는 그물이 있어요.",         sky: "☁️  ☀️", main: "🧒  🥅", ground: "🌱  🌼  🌱" },
  pig:      { text: "I see a pig.",          kr: "나는 돼지를 봐요.",           sky: "☁️  ☀️", main: "🧒  👀  🐷", ground: "🌾  🌱  🌾" },
  queen:    { text: "I see a queen.",        kr: "나는 여왕을 봐요.",           sky: "☁️  ☀️", main: "🧒  👀  👸", ground: "🏰  🌳" },
  rain:     { text: "I like the rain.",      kr: "나는 비가 좋아요.",           sky: "🌧️  ☁️  🌧️", main: "🧒  ☂️", ground: "💧  🌱  💧" },
  sun:      { text: "I like the sun.",       kr: "나는 해가 좋아요.",           sky: "☀️  ☀️  ☀️", main: "🧒  ❤️", ground: "🌻  🌱  🌻" },
  tiger:    { text: "The tiger can run.",    kr: "호랑이가 달릴 수 있어요.",    sky: "☁️  ☀️", main: "🐯  💨", ground: "🌿  🌴  🌿" },
  van:      { text: "I see a van.",          kr: "나는 밴을 봐요.",             sky: "☁️  ☀️", main: "🧒  👀  🚐", ground: "🌳  🛣️  🌳" },
  web:      { text: "I see a web.",          kr: "나는 거미줄을 봐요.",         sky: "🌙  ⭐", main: "🧒  👀  🕸️", ground: "🌲  🌿  🌲" },
  box:      { text: "I have a box.",         kr: "나는 상자가 있어요.",         sky: "☁️  ☀️", main: "🧒  📦", ground: "🌱  🌼  🌱" },
  "yo-yo": { text: "I have a yo-yo.",      kr: "나는 요요가 있어요.",         sky: "☁️  ☀️", main: "🧒  🪀", ground: "🌱  🌼  🌱" },
  zebra:    { text: "I see a zebra.",        kr: "나는 얼룩말을 봐요.",         sky: "☁️  ☀️", main: "🧒  👀  🦓", ground: "🌾  🌳  🌾" },
  apple:    { text: "I like apples.",        kr: "나는 사과를 좋아해요.",       sky: "☁️  ☀️  ☁️", main: "🧒  ❤️  🍎", ground: "🌱  🌼  🌱  🌼  🌱" },
  egg:      { text: "I see an egg.",         kr: "나는 달걀을 봐요.",           sky: "☁️  ☀️", main: "🧒  👀  🥚", ground: "🌾  🪹  🌾" },
  ink:      { text: "The ink is black.",     kr: "잉크는 검은색이에요.",        sky: "☁️  ☀️", main: "🖋️  ⚫  📄", ground: "🪵  🪵  🪵" },
  octopus:  { text: "I see an octopus.",     kr: "나는 문어를 봐요.",           sky: "☀️  ☁️", main: "🧒  👀  🐙", ground: "🪸  〰️  🪸" },
  umbrella: { text: "I have an umbrella.",   kr: "나는 우산이 있어요.",         sky: "🌧️  ☁️  🌧️", main: "🧒  ☂️", ground: "💧  🌱  💧" }
};

// ---------- 스테이지 정의 (Chapter 1) ----------
// student_labels: 학생 노출용 쉬운 말 (내부 명칭 discover/name/apply/extend/quiz)
const KP_STEP_LABELS = {
  discover: "소리 찾기",
  name: "이름 배우기",
  apply: "혼자 읽기",
  spell: "단어 만들기",
  extend: "문장 속에서 찾기",
  quiz: "실력 확인",
  warmup: "몸풀기 단어",
  heart: "하트 단어",
  pyramid: "문장 피라미드",
  fquiz: "이해 확인"
};

const KP_STAGES = {
  "1-1": {
    stage_id: "1-1",
    rule_id: "1-1",
    chapter_id: "ch1",
    type: "letters",
    title_kr: "영어 마을의 자음들",
    subtitle: "자음 21개의 기본 소리",
    icon: "🏘️",
    steps: ["discover", "name", "apply", "extend", "quiz"],
    letters: KP_CONSONANTS,
    isHero: false,
    nameStep: {
      speaker: "b",
      speakerRole: "자음",
      lines: [
        "영어 마을에는 <b>일반 자음</b>과 <b>히어로 모음</b>이 살아!",
        "자음은 각자 <b>자기만의 소리</b>를 하나씩 갖고 있어.",
        "중요한 비밀! 글자의 <b>이름</b>과 <b>소리</b>는 달라. B의 이름은 '비'지만, 소리는 <b>/b/(브)</b>야!",
        "카드를 눌러서 자음들의 소리를 들어 봐!"
      ],
      youtube_url: null
    },
    extendTitle: "첫소리 찾기",
    extendDesc: "그림을 보고, 단어의 첫소리 글자를 골라 봐!"
  },
  "1-2": {
    stage_id: "1-2",
    rule_id: "1-2",
    chapter_id: "ch1",
    type: "letters",
    title_kr: "히어로 모음 등장!",
    subtitle: "단모음 A·E·I·O·U",
    icon: "🦸",
    steps: ["discover", "name", "apply", "extend", "quiz"],
    letters: KP_VOWELS,
    isHero: true,
    nameStep: {
      speaker: "a",
      speakerRole: "모음",
      lines: [
        "<b>히어로 모음</b>은 A·E·I·O·U, 딱 <b>다섯 개</b>뿐이야!",
        "모음이 없으면 <b>어떤 단어도 만들 수 없어</b>. 자음과 모음이 함께 있어야 단어가 태어나!",
        "오늘은 모음의 <b>짧은 소리</b>를 배워: A는 '애', E는 '에', I는 '이', O는 '아', U는 '어'!",
        "모음은 5개밖에 없어서, 서로 힘을 합쳐 <b>여러 가지 소리</b>를 만들어. 그 이야기는 차차 만나자!"
      ],
      youtube_url: null
    },
    extendTitle: "첫소리 찾기",
    extendDesc: "그림을 보고, 단어의 첫소리 글자를 골라 봐!"
  },
  "1-3": {
    stage_id: "1-3",
    rule_id: "1-3",
    chapter_id: "ch1",
    type: "contrast",
    title_kr: "모음의 두 목소리",
    subtitle: "짧은 소리 vs. 이름 소리 (맛보기)",
    icon: "🎭",
    steps: ["discover", "name", "apply", "extend", "quiz"],
    pairs: KP_CONTRAST_PAIRS,
    nameStep: {
      speaker: "a",
      speakerRole: "모음",
      lines: [
        "비밀 하나 알려 줄게. 사실 모음은 <b>목소리가 두 개</b>야!",
        "<b>cat</b>의 a는 짧은 소리 '애', <b>cake</b>의 a는 자기 이름 소리 '에이'!",
        "왜 목소리가 바뀌는지는… 나중에 <b>안개 늪지대</b>에서 밝혀질 거야. 🌫️",
        "지금은 딱 하나만 기억해: <b>\"어? 다르게 들리네!\"</b> 그거면 충분해!"
      ],
      youtube_url: null
    },
    extendTitle: "어떤 소리게?",
    extendDesc: "소리를 잘 듣고, 들은 단어를 골라 봐!"
  }
};

// ---------- EFL 정규수업용 Chapter 1 재구성 ----------
// 소수 음가를 배운 직후, 배운 글자만으로 VC/CVC 블렌딩·세그먼팅을 수행한다.
const KP_ALL_LETTERS = KP_CONSONANTS.concat(KP_VOWELS);
const makeLetterSet = letters => letters.map(letter => KP_ALL_LETTERS.find(x => x.letter === letter));
const KP_EFL_SET_A = makeLetterSet(["m", "s", "a", "t", "p", "i", "n"]);
const KP_EFL_SET_B = makeLetterSet(["d", "c", "o", "g"]);
const KP_EFL_SET_C = makeLetterSet(["e", "u", "r", "h", "b", "f", "l"]);

const KP_BLEND_A = [
  { word: "at", emoji: "📍", kr: "~에" }, { word: "am", emoji: "🙋", kr: "~이다" },
  { word: "it", emoji: "👉", kr: "그것" }, { word: "in", emoji: "📥", kr: "안에" },
  { word: "sat", emoji: "🪑", kr: "앉았다" }, { word: "sit", emoji: "🪑", kr: "앉다" },
  { word: "map", emoji: "🗺️", kr: "지도" }, { word: "pin", emoji: "📌", kr: "핀" },
  { word: "tap", emoji: "👆", kr: "톡 치다" }, { word: "mat", emoji: "🟫", kr: "매트" },
  { word: "man", emoji: "👨", kr: "남자" }, { word: "pan", emoji: "🍳", kr: "팬" }
];
const KP_BLEND_B = [
  { word: "cat", emoji: "🐱", kr: "고양이" }, { word: "dad", emoji: "👨", kr: "아빠" },
  { word: "dig", emoji: "⛏️", kr: "파다" }, { word: "dot", emoji: "🔴", kr: "점" },
  { word: "cot", emoji: "🛏️", kr: "간이침대" }, { word: "can", emoji: "🥫", kr: "깡통 / 할 수 있다" },
  { word: "gap", emoji: "↔️", kr: "틈" }, { word: "gas", emoji: "💨", kr: "가스" },
  { word: "got", emoji: "✅", kr: "얻었다" }, { word: "tag", emoji: "🏷️", kr: "꼬리표" },
  { word: "dip", emoji: "💧", kr: "살짝 담그다" }, { word: "cod", emoji: "🐟", kr: "대구" }
];
const KP_BLEND_C = [
  { word: "bed", emoji: "🛏️", kr: "침대" }, { word: "red", emoji: "🔴", kr: "빨간" },
  { word: "run", emoji: "🏃", kr: "달리다" }, { word: "fun", emoji: "🎉", kr: "재미" },
  { word: "hut", emoji: "🛖", kr: "오두막" }, { word: "sun", emoji: "☀️", kr: "해" },
  { word: "leg", emoji: "🦵", kr: "다리" }, { word: "lip", emoji: "👄", kr: "입술" },
  { word: "fan", emoji: "🪭", kr: "부채" }, { word: "ham", emoji: "🥓", kr: "햄" },
  { word: "rub", emoji: "👐", kr: "문지르다" }, { word: "fit", emoji: "🧩", kr: "맞다" }
];

const sentenceRound = (text, kr, sky, main, ground) => ({ text, kr, sky, main, ground });
// 문장 구성 원칙: 같은 세트에서 단순 주어 치환을 금지하고, 지금까지 배운
// 단어를 누적하여 주어·동사·목적어를 골고루 다시 사용한다.
const KP_BLEND_SENTENCES_A = [
  sentenceRound("Sam sat.", "샘이 앉았어요.", "☁️  ☀️", "🧒  🪑", "🌱  🌼  🌱"),
  sentenceRound("Tim, sit.", "팀아, 앉아.", "☁️  ☀️", "🧒  👇  🪑", "🌱  🌼  🌱"),
  sentenceRound("Pam, tap it.", "팸아, 그것을 톡 쳐.", "☁️  ☀️", "👧  👆  🔘", "🌱  🌼  🌱")
];
const KP_BLEND_SENTENCES_B = [
  sentenceRound("Dan can dig.", "댄은 땅을 팔 수 있어요.", "☁️  ☀️", "🧒  ⛏️", "🟫  🌱  🟫"),
  sentenceRound("Cat can sit.", "고양이는 앉을 수 있어요.", "☁️  ☀️", "🐱  🪑", "🌱  🌼  🌱"),
  sentenceRound("Dad got it.", "아빠가 그것을 얻었어요.", "☁️  ☀️", "👨  ✅", "🌱  🌼  🌱")
];
const KP_BLEND_SENTENCES_C = [
  sentenceRound("Hug Ben, Dad.", "아빠, 벤을 안아 주세요.", "☁️  ☀️", "👨  🤗  🧒", "🌱  🌼  🌱"),
  sentenceRound("Ben can run.", "벤은 달릴 수 있어요.", "☁️  ☀️", "🧒  🏃", "🌱  🌼  🌱"),
  sentenceRound("Sam had fun.", "샘은 즐거웠어요.", "☁️  ☀️", "🧒  🎉", "🌱  🌼  🌱")
];

const soundStage = (id, title, subtitle, letters, speaker) => ({
  stage_id: id, rule_id: id, chapter_id: "ch1", type: "letters", title_kr: title,
  subtitle, icon: "🔤", steps: ["discover", "name", "apply", "quiz"], letters, isHero: false,
  nameStep: { speaker, speakerRole: "소리 탐험대", lines: [
    `오늘 만날 소리는 <b>${letters.map(x => x.letter.toUpperCase()).join(" · ")}</b>야.`,
    "글자 이름보다 먼저 <b>짧고 정확한 소리</b>를 듣고 따라 해 보자.",
    "다음 스테이지에서 이 소리들을 붙여 진짜 단어를 읽을 거야!"
  ], youtube_url: null }
});
const blendStage = (id, title, subtitle, words, sentences) => ({
  stage_id: id, rule_id: id, chapter_id: "ch1", type: "blend", title_kr: title,
  subtitle, icon: "🧩", steps: ["discover", "apply", "spell", "extend", "quiz"], words, sentences,
  extendTitle: "문장 읽기", extendDesc: "배운 소리로 문장을 읽어 봐!"
});

Object.assign(KP_STAGES, {
  "efl-1": soundStage("efl-1", "첫 소리 탐험대", "m · s · a · t · p · i · n", KP_EFL_SET_A, "m"),
  "efl-2": blendStage("efl-2", "첫 단어 조립소", "at · sat · sit · map · pin", KP_BLEND_A, KP_BLEND_SENTENCES_A),
  "efl-3": soundStage("efl-3", "두 번째 소리 탐험대", "d · c · o · g", KP_EFL_SET_B, "d"),
  "efl-4": blendStage("efl-4", "두 번째 단어 조립소", "cat · dad · dig · dot", KP_BLEND_B, KP_BLEND_SENTENCES_B),
  "efl-5": soundStage("efl-5", "세 번째 소리 탐험대", "e · u · r · h · b · f · l", KP_EFL_SET_C, "e"),
  "efl-6": blendStage("efl-6", "세 번째 단어 조립소", "bed · run · sun · leg", KP_BLEND_C, KP_BLEND_SENTENCES_C),
  "efl-sight-1": sightStage("efl-sight-1", "첫 번째 하트 단어", "I · a · the · see", KP_SIGHT_1, KP_SIGHT1_SENTENCES),
  "efl-sight-2": sightStage("efl-sight-2", "두 번째 하트 단어", "and · not · go · to · my", KP_SIGHT_2, KP_SIGHT2_SENTENCES),
  "efl-sight-3": sightStage("efl-sight-3", "세 번째 하트 단어", "up · help · big · like · me · come", KP_SIGHT_3, KP_SIGHT3_SENTENCES)
});

KP_SEGMENTABLE.push(...KP_BLEND_A.map(x => x.word), ...KP_BLEND_B.map(x => x.word), ...KP_BLEND_C.map(x => x.word));
Object.assign(KP_WORD_RULES, {
  i: "efl-sight-1", a: "efl-sight-1", the: "efl-sight-1", see: "efl-sight-1",
  and: "efl-sight-2", not: "efl-sight-2", go: "efl-sight-2", to: "efl-sight-2", my: "efl-sight-2",
  up: "efl-sight-3", help: "efl-sight-3", big: "efl-sight-3", like: "efl-sight-3", me: "efl-sight-3", come: "efl-sight-3",
  cat: "efl-4", dad: "efl-4", dig: "efl-4", dot: "efl-4", can: "efl-4",
  sun: "efl-6", run: "efl-6", bed: "efl-6", red: "efl-6"
});

// ---------- 규칙 메타 (교사용/필터링용) ----------
const KP_RULES = {
  "1-1": { rule_id: "1-1", chapter_id: "ch1", rule_name_kr: "자음 21개 기본 음가" },
  "1-2": { rule_id: "1-2", chapter_id: "ch1", rule_name_kr: "단모음 음가 (A·E·I·O·U)" },
  "1-3": { rule_id: "1-3", chapter_id: "ch1", rule_name_kr: "열린/닫힌 음절 직관 도입" },
  "efl-sight-1": { rule_id: "efl-sight-1", chapter_id: "ch1", rule_name_kr: "하트 단어 1탄 — Dolch Pre-Primer (I, a, the, see)" },
  "efl-sight-2": { rule_id: "efl-sight-2", chapter_id: "ch1", rule_name_kr: "하트 단어 2탄 — Dolch Pre-Primer (and, not, go, to, my)" },
  "efl-sight-3": { rule_id: "efl-sight-3", chapter_id: "ch1", rule_name_kr: "하트 단어 3탄 — Dolch Pre-Primer (up, help, big, like, me, come)" }
};

// ---------- 챕터 인트로 컷씬 ----------
const KP_CUTSCENES = {
  ch1: [
    { art: "🌊⭐🌊", text: "먼 옛날, 세상의 모든 소리가 담긴 <b>'소리의 보물'</b>이 다섯 개의 세계에 흩어졌어요." },
    { art: "🏘️⚓⛵", text: "여기는 <b>출항의 항구마을</b>. 항해를 떠나려면 먼저 <b>소리 씨앗</b>을 모아야 해요." },
    { art: "🔤✨⭐", text: "영어 마을의 <b>일반 자음</b>과 <b>히어로 모음</b>이 함께 단어를 만들며 항해를 도와줄 거예요. 자, 출발!" }
  ]
};

// ---------- 탐험가(플레이어) 캐릭터 10종 ----------
// shape + palette 조합 (스프라이트 정의는 sprites.js)
const KP_CHARACTERS = [
  { id: "boy1",   name_kr: "바다",   shape: "kidA", palette: "boy1" },
  { id: "boy2",   name_kr: "하늘",   shape: "kidA", palette: "boy2" },
  { id: "girl1",  name_kr: "노을",   shape: "kidB", palette: "girl1" },
  { id: "girl2",  name_kr: "새벽",   shape: "kidB", palette: "girl2" },
  { id: "cat",    name_kr: "야옹 선장", shape: "cat",    palette: "cat" },
  { id: "dog",    name_kr: "멍멍 항해사", shape: "dog",    palette: "dog" },
  { id: "fox",    name_kr: "여우 탐험가", shape: "cat",    palette: "fox" },
  { id: "rabbit", name_kr: "토끼 파수꾼", shape: "rabbit", palette: "rabbit" },
  { id: "owl",    name_kr: "부엉 박사", shape: "owl",    palette: "owl" },
  { id: "turtle", name_kr: "거북 현자", shape: "turtle", palette: "turtle" }
];

/* =====================================================
   읽기 유창성 스테이지 — "한 장 읽기 도전" (문장 피라미드)
   구성: 몸풀기 단어 → 하트 단어(사이트워드) → 문장 피라미드 → 이해 확인
   원칙(EFL, 변경 불가):
   - 새 단어/문장은 반드시 뜻을 유추할 그림과 함께 제시
   - 문장 카드는 클릭 시 뒤집혀 한국어 뜻이 보이는 플래시카드 형태
   - 모든 단어·문장은 현재까지 배운 글자 + 배운 사이트워드만 사용
   ===================================================== */
const KP_FLUENCY_1 = {
  stage_id: "efl-fluency-1",
  rule_id: "efl-fluency-1",
  chapter_id: "ch1",
  type: "fluency",
  title_kr: "한 장 읽기 도전",
  subtitle: "배운 단어로 이야기 한 편 읽기",
  icon: "📖",
  steps: ["warmup", "heart", "pyramid", "fquiz"],
  // 몸풀기: 이야기에 나올 단어 미리 읽기 (전부 배운 글자만 사용)
  warmup: [
    { word: "pig", emoji: "🐷", kr: "돼지" },
    { word: "big", emoji: "🐘", kr: "큰" },
    { word: "map", emoji: "🗺️", kr: "지도" },
    { word: "hop", emoji: "🐇", kr: "깡충 뛰다" },
    { word: "has", emoji: "🤲", kr: "가지고 있다" },
    { word: "sun", emoji: "☀️", kr: "해" }
  ],
  // 하트 단어: 눈으로 익히는 사이트워드 복습
  heart: [
    { word: "I",    kr: "나는",     emoji: "🙋" },
    { word: "a",    kr: "하나의",   emoji: "1️⃣" },
    { word: "the",  kr: "그",       emoji: "👉" },
    { word: "like", kr: "좋아하다", emoji: "❤️" }
  ],
  // 문장 피라미드: 짧게 시작해 문장을 완성해 가며 읽기
  story: [
    {
      text: "The big pig has a map.",
      kr: "커다란 돼지가 지도를 가지고 있어요.",
      sky: "☁️  ☀️  ☁️", main: "🐷  🗺️", ground: "🌱  🌼  🌱",
      pyramid: ["The big pig", "The big pig has", "The big pig has a map."]
    },
    {
      text: "The pig can hop.",
      kr: "돼지는 깡충 뛸 수 있어요.",
      sky: "☁️  ☀️", main: "🐷  💨", ground: "🌱  🌼  🌱",
      pyramid: ["The pig", "The pig can", "The pig can hop."]
    },
    {
      text: "I like the big pig.",
      kr: "나는 그 커다란 돼지가 좋아요.",
      sky: "☀️  ☁️", main: "🧒  ❤️  🐷", ground: "🌱  🌼  🌱",
      pyramid: ["I like", "I like the big pig."]
    }
  ],
  // 이해 확인: 이야기 내용 질문 (그림 단서 포함)
  questions: [
    {
      q: "What does the pig have?", kr: "돼지는 무엇을 가지고 있나요?",
      choices: [
        { word: "a map", emoji: "🗺️" },
        { word: "a cat", emoji: "🐱" },
        { word: "a pin", emoji: "📌" }
      ],
      answer: "a map"
    },
    {
      q: "What can the pig do?", kr: "돼지는 무엇을 할 수 있나요?",
      choices: [
        { word: "hop", emoji: "🐇" },
        { word: "dig", emoji: "⛏️" },
        { word: "sit", emoji: "🪑" }
      ],
      answer: "hop"
    }
  ]
};
KP_STAGES["efl-fluency-1"] = KP_FLUENCY_1;
KP_CHAPTERS[0].stage_order.push("efl-fluency-1");
// has는 s가 /z/로 소리 나므로 나눠 읽기 대상에서 제외 (통째로만 재생)
KP_SEGMENTABLE.push("big", "hop", "map", "pig", "sun");

/* =====================================================
   단어 연습장 (선택 활동 — 진행 필수 아님)
   각 조립소에서 배운 글자만으로 만들 수 있는 확장 단어 목록.
   원칙: 누적 글자만 사용, -og 패턴·x·wa·묵음·digraph 제외.
   ===================================================== */
const KP_PRACTICE = [
  {
    id: "prac-a",
    title: "첫 조립소",
    after: "efl-2",
    letters: "m · s · a · t · p · i · n",
    words: [
      { word: "at",  emoji: "📍", kr: "~에" },
      { word: "an",  emoji: "1️⃣", kr: "하나의" },
      { word: "it",  emoji: "👉", kr: "그것" },
      { word: "in",  emoji: "📥", kr: "안에" },
      { word: "sat", emoji: "🪑", kr: "앉았다" },
      { word: "sit", emoji: "🪑", kr: "앉다" },
      { word: "mat", emoji: "🟫", kr: "매트" },
      { word: "map", emoji: "🗺️", kr: "지도" },
      { word: "man", emoji: "👨", kr: "남자" },
      { word: "nap", emoji: "😴", kr: "낮잠" },
      { word: "pan", emoji: "🍳", kr: "팬" },
      { word: "pat", emoji: "🖐️", kr: "토닥이다" },
      { word: "pin", emoji: "📌", kr: "핀" },
      { word: "sip", emoji: "🥤", kr: "홀짝 마시다" },
      { word: "tap", emoji: "👆", kr: "톡 치다" },
      { word: "tip", emoji: "💡", kr: "팁" }
    ]
  },
  {
    id: "prac-b",
    title: "두 번째 조립소",
    after: "efl-4",
    letters: "+ d · c · o · g",
    words: [
      { word: "cat", emoji: "🐱", kr: "고양이" },
      { word: "can", emoji: "🥫", kr: "할 수 있다" },
      { word: "cap", emoji: "🧢", kr: "모자" },
      { word: "cot", emoji: "🛏️", kr: "간이침대" },
      { word: "cop", emoji: "👮", kr: "경찰" },
      { word: "dad", emoji: "👨", kr: "아빠" },
      { word: "dig", emoji: "⛏️", kr: "파다" },
      { word: "dip", emoji: "💧", kr: "살짝 담그다" },
      { word: "dot", emoji: "🔴", kr: "점" },
      { word: "gap", emoji: "↔️", kr: "틈" },
      { word: "gas", emoji: "💨", kr: "가스" },
      { word: "got", emoji: "✅", kr: "얻었다" },
      { word: "mad", emoji: "😠", kr: "화난" },
      { word: "mop", emoji: "🧹", kr: "대걸레" },
      { word: "nod", emoji: "🙆", kr: "끄덕이다" },
      { word: "not", emoji: "🚫", kr: "아니다" },
      { word: "pad", emoji: "📝", kr: "패드" },
      { word: "pot", emoji: "🍲", kr: "냄비" },
      { word: "sad", emoji: "😢", kr: "슬픈" },
      { word: "top", emoji: "🔝", kr: "꼭대기" }
    ]
  },
  {
    id: "prac-c",
    title: "세 번째 조립소",
    after: "efl-6",
    letters: "+ e · u · r · h · b · f · l",
    words: [
      { word: "bat", emoji: "🦇", kr: "박쥐 / 방망이" },
      { word: "bag", emoji: "👜", kr: "가방" },
      { word: "bed", emoji: "🛏️", kr: "침대" },
      { word: "big", emoji: "🐘", kr: "큰" },
      { word: "bug", emoji: "🐛", kr: "벌레" },
      { word: "bus", emoji: "🚌", kr: "버스" },
      { word: "cup", emoji: "☕", kr: "컵" },
      { word: "cut", emoji: "✂️", kr: "자르다" },
      { word: "fan", emoji: "🪭", kr: "부채" },
      { word: "fun", emoji: "🎉", kr: "재미" },
      { word: "hat", emoji: "🎩", kr: "모자" },
      { word: "hen", emoji: "🐔", kr: "암탉" },
      { word: "hot", emoji: "🔥", kr: "뜨거운" },
      { word: "hug", emoji: "🤗", kr: "안다" },
      { word: "hut", emoji: "🛖", kr: "오두막" },
      { word: "leg", emoji: "🦵", kr: "다리" },
      { word: "lip", emoji: "👄", kr: "입술" },
      { word: "net", emoji: "🥅", kr: "그물" },
      { word: "pen", emoji: "🖊️", kr: "펜" },
      { word: "pet", emoji: "🐶", kr: "반려동물" },
      { word: "red", emoji: "🔴", kr: "빨간" },
      { word: "run", emoji: "🏃", kr: "달리다" },
      { word: "ten", emoji: "🔟", kr: "열(10)" },
      { word: "tub", emoji: "🛁", kr: "욕조" }
    ]
  }
];
KP_PRACTICE.forEach(set => KP_SEGMENTABLE.push(...set.words.map(w => w.word)));

/* =====================================================
   사이트워드 섬 (Sight Word Island) — SPEC.md §20 (2026-07-17 확정)
   - 챕터 내장형 50단어(efl-sight-1/2/3)와 별개의 상시 오픈 화면 데이터.
   - Dolch 133단어 중 나머지 83단어를 챕터 클리어 연동 5개 티어로 배치.
   - tag: "green"(🟢 그 시점 규칙으로 해독 가능) / "red"(🔴 진짜 사이트워드).
     학생 화면에는 구분 없이 모두 "하트 단어"로 제시한다 (§19 원칙).
   - 진도 게이트(stage_order/KP_STAGES/S.gems)에 절대 넣지 않는다.
   ===================================================== */
const KP_ISLAND_TIERS = [
  { tier: 1, chapter_id: "ch1", title: "티어 1", subtitle: "18글자·CVC만" },
  { tier: 2, chapter_id: "ch2", title: "티어 2", subtitle: "블렌드·다이그래프" },
  { tier: 3, chapter_id: "ch3", title: "티어 3", subtitle: "split e·Soft C/G" },
  { tier: 4, chapter_id: "ch4", title: "티어 4", subtitle: "모음팀·R통제·Y" },
  { tier: 5, chapter_id: "ch5", title: "티어 5", subtitle: "묵음·schwa·접사" }
];

const KP_ISLAND_WORDS = [
  // ---- T1 (12단어, 전부 🟢) — Chapter 1 클리어 시 해금 ----
  { word: "can",  kr: "할 수 있다",   emoji: "💪", tier: 1, tag: "green" },
  { word: "in",   kr: "안에",         emoji: "📥", tier: 1, tag: "green" },
  { word: "it",   kr: "그것",         emoji: "👉", tier: 1, tag: "green" },
  { word: "red",  kr: "빨간",         emoji: "🔴", tier: 1, tag: "green" },
  { word: "run",  kr: "달리다",       emoji: "🏃", tier: 1, tag: "green" },
  { word: "am",   kr: "~이다",        emoji: "🙋", tier: 1, tag: "green" },
  { word: "at",   kr: "~에",          emoji: "📍", tier: 1, tag: "green" },
  { word: "but",  kr: "하지만",       emoji: "🤔", tier: 1, tag: "green" },
  { word: "ran",  kr: "달렸다",       emoji: "💨", tier: 1, tag: "green" },
  { word: "an",   kr: "하나의",       emoji: "1️⃣", tier: 1, tag: "green" },
  { word: "had",  kr: "가지고 있었다", emoji: "🤲", tier: 1, tag: "green" },
  { word: "let",  kr: "~하게 하다",   emoji: "🙆", tier: 1, tag: "green" },
  // ---- T2 (14단어: 🟢7 + 🔴7) — Chapter 2 클리어 시 해금 ----
  { word: "as",    kr: "~처럼",       emoji: "🟰", tier: 2, tag: "green" },
  { word: "has",   kr: "가지고 있다", emoji: "🎒", tier: 2, tag: "green" },
  { word: "stop",  kr: "멈추다",      emoji: "🛑", tier: 2, tag: "green" },
  { word: "thank", kr: "감사하다",    emoji: "🙏", tier: 2, tag: "green" },
  { word: "them",  kr: "그들을",      emoji: "👥", tier: 2, tag: "green" },
  { word: "think", kr: "생각하다",    emoji: "💭", tier: 2, tag: "green" },
  { word: "when",  kr: "언제",        emoji: "⏰", tier: 2, tag: "green" },
  { word: "one",   kr: "하나",        emoji: "☝️", tier: 2, tag: "red" },
  { word: "two",   kr: "둘",          emoji: "2️⃣", tier: 2, tag: "red" },
  { word: "you",   kr: "너",          emoji: "🫵", tier: 2, tag: "red" },
  { word: "what",  kr: "무엇",        emoji: "❓", tier: 2, tag: "red" },
  { word: "who",   kr: "누구",        emoji: "🕵️", tier: 2, tag: "red" },
  { word: "of",    kr: "~의",         emoji: "🧩", tier: 2, tag: "red" },
  { word: "put",   kr: "놓다",        emoji: "📦", tier: 2, tag: "red" },
  // ---- T3 (10단어: 🟢4 + 🔴6) — Chapter 3 클리어 시 해금 ----
  { word: "make",  kr: "만들다",      emoji: "🛠️", tier: 3, tag: "green" },
  { word: "white", kr: "하얀",        emoji: "⬜", tier: 3, tag: "green" },
  { word: "want",  kr: "원하다",      emoji: "🌠", tier: 3, tag: "green" },
  { word: "take",  kr: "가져가다",    emoji: "🤝", tier: 3, tag: "green" },
  { word: "all",   kr: "모두",        emoji: "💯", tier: 3, tag: "red" },
  { word: "have",  kr: "가지고 있다", emoji: "🧺", tier: 3, tag: "red" },
  { word: "give",  kr: "주다",        emoji: "🎁", tier: 3, tag: "red" },
  { word: "live",  kr: "살다",        emoji: "🏠", tier: 3, tag: "red" },
  { word: "once",  kr: "한 번",       emoji: "🕐", tier: 3, tag: "red" },
  { word: "some",  kr: "조금의",      emoji: "🍪", tier: 3, tag: "red" },
  // ---- T4 (44단어: 🟢32 + 🔴12) — Chapter 4 클리어 시 해금 ----
  { word: "funny",  kr: "웃긴",        emoji: "😂", tier: 4, tag: "green" },
  { word: "little", kr: "작은",        emoji: "🐭", tier: 4, tag: "green" },
  { word: "look",   kr: "보다",        emoji: "👀", tier: 4, tag: "green" },
  { word: "three",  kr: "셋",          emoji: "3️⃣", tier: 4, tag: "green" },
  { word: "we",     kr: "우리는",      emoji: "👫", tier: 4, tag: "green" },
  { word: "yellow", kr: "노란",        emoji: "💛", tier: 4, tag: "green" },
  { word: "be",     kr: "~이 되다",    emoji: "🌱", tier: 4, tag: "green" },
  { word: "brown",  kr: "갈색의",      emoji: "🟫", tier: 4, tag: "green" },
  { word: "four",   kr: "넷",          emoji: "4️⃣", tier: 4, tag: "green" },
  { word: "good",   kr: "좋은",        emoji: "👍", tier: 4, tag: "green" },
  { word: "he",     kr: "그는",        emoji: "👦", tier: 4, tag: "green" },
  { word: "no",     kr: "아니요",      emoji: "🙅", tier: 4, tag: "green" },
  { word: "now",    kr: "지금",        emoji: "⏱️", tier: 4, tag: "green" },
  { word: "our",    kr: "우리의",      emoji: "👨‍👩‍👧", tier: 4, tag: "green" },
  { word: "please", kr: "부탁해요",    emoji: "🥺", tier: 4, tag: "green" },
  { word: "saw",    kr: "보았다",      emoji: "🔭", tier: 4, tag: "green" },
  { word: "say",    kr: "말하다",      emoji: "💬", tier: 4, tag: "green" },
  { word: "she",    kr: "그녀는",      emoji: "👧", tier: 4, tag: "green" },
  { word: "so",     kr: "그래서",      emoji: "😮", tier: 4, tag: "green" },
  { word: "soon",   kr: "곧",          emoji: "⏳", tier: 4, tag: "green" },
  { word: "they",   kr: "그들은",      emoji: "👨‍👩‍👦", tier: 4, tag: "green" },
  { word: "too",    kr: "~도, 너무",   emoji: "➕", tier: 4, tag: "green" },
  { word: "under",  kr: "아래에",      emoji: "⬇️", tier: 4, tag: "green" },
  { word: "after",  kr: "~후에",       emoji: "⏭️", tier: 4, tag: "green" },
  { word: "by",     kr: "~옆에",       emoji: "🚏", tier: 4, tag: "green" },
  { word: "every",  kr: "모든",        emoji: "🌈", tier: 4, tag: "green" },
  { word: "fly",    kr: "날다",        emoji: "🦋", tier: 4, tag: "green" },
  { word: "how",    kr: "어떻게",      emoji: "🤷", tier: 4, tag: "green" },
  { word: "may",    kr: "~해도 좋다",  emoji: "🙇", tier: 4, tag: "green" },
  { word: "open",   kr: "열다",        emoji: "🚪", tier: 4, tag: "green" },
  { word: "over",   kr: "~위로",       emoji: "🌉", tier: 4, tag: "green" },
  { word: "round",  kr: "둥근",        emoji: "⚪", tier: 4, tag: "green" },
  { word: "away",   kr: "멀리",        emoji: "🛫", tier: 4, tag: "red" },
  { word: "blue",   kr: "파란",        emoji: "🔵", tier: 4, tag: "red" },
  { word: "here",   kr: "여기",        emoji: "👇", tier: 4, tag: "red" },
  { word: "where",  kr: "어디",        emoji: "🗺️", tier: 4, tag: "red" },
  { word: "are",    kr: "~이다(여럿)", emoji: "🧑‍🤝‍🧑", tier: 4, tag: "red" },
  { word: "do",     kr: "하다",        emoji: "✅", tier: 4, tag: "red" },
  { word: "pretty", kr: "예쁜",        emoji: "🌸", tier: 4, tag: "red" },
  { word: "there",  kr: "저기",        emoji: "👉", tier: 4, tag: "red" },
  { word: "again",  kr: "다시",        emoji: "🔄", tier: 4, tag: "red" },
  { word: "any",    kr: "어떤 ~라도",  emoji: "❔", tier: 4, tag: "red" },
  { word: "walk",   kr: "걷다",        emoji: "🚶", tier: 4, tag: "red" },
  { word: "were",   kr: "~이었다",     emoji: "⏮️", tier: 4, tag: "red" },
  // ---- T5 (3단어: 🟢1 + 🔴2) — Chapter 5 클리어 시 해금 ----
  { word: "going", kr: "가고 있는",     emoji: "🚶‍♂️", tier: 5, tag: "green" },
  { word: "find",  kr: "찾다",          emoji: "🔍", tier: 5, tag: "red" },
  { word: "could", kr: "할 수 있었다",  emoji: "🗝️", tier: 5, tag: "red" }
];

/* =====================================================
   K-Phonics OPS™: Adventure — 픽셀 스프라이트 (Phase 1)
   - 캔버스 기반 픽셀아트 (코드로 직접 렌더링)
   - 캐릭터: 기본 셰이프 + 팔레트 스왑으로 10종 구성
   - 월드맵: 테마별 섬 일러스트 5종 + 항해선
   ===================================================== */

const KPSprites = (() => {
  // 셰이프 그리드. '.'=투명, 나머지 문자는 팔레트 색상 키
  const SHAPES = {
    kidA: [
      "....hhhh....",
      "..hhhhhhhh..",
      "..hssssssh..",
      "..sBssssBs..",
      "..ssssssss..",
      "...ssmmss...",
      "..tttttttt..",
      ".stttttttts.",
      "..tttttttt..",
      "..pppppppp..",
      "..pp....pp..",
      "..ww....ww.."
    ],
    kidB: [
      "....hhhh....",
      "..hhhhhhaa..",
      ".hhsssssshh.",
      ".hsBssssBsh.",
      ".hssssssssh.",
      ".h.ssmmss.h.",
      ".h.tttttt.h.",
      "..tttttttt..",
      "..tttttttt..",
      "..pppppppp..",
      "..pp....pp..",
      "..ww....ww.."
    ],
    cat: [
      ".h........h.",
      ".hh......hh.",
      ".hhhhhhhhhh.",
      ".hhhhhhhhhh.",
      ".hBhhhhhhBh.",
      ".hhhhmmhhhh.",
      "..hhhhhhhh..",
      "..haaaaaah..",
      "..hhhhhhhh..",
      "..hhhhhhhh..",
      "..hh.hh.hh..",
      "............"
    ],
    dog: [
      "............",
      "..hhhhhhhh..",
      ".shhhhhhhhs.",
      ".shhhhhhhhs.",
      ".shBhhhhBhs.",
      "..hhhmmhhh..",
      "..hhhhhhhh..",
      "..haaaaaah..",
      "..hhhhhhhh..",
      "..hhhhhhhh..",
      "..hh.hh.hh..",
      "............"
    ],
    rabbit: [
      "...hh..hh...",
      "...hh..hh...",
      "...hh..hh...",
      "..hhhhhhhh..",
      ".hhBhhhhBhh.",
      ".hhhhmmhhhh.",
      "..hhhhhhhh..",
      "..hhhhhhhh..",
      "..hwwwwwwh..",
      "..hwwwwwwh..",
      "..hh.hh.hh..",
      "............"
    ],
    owl: [
      ".hh......hh.",
      "..hhhhhhhh..",
      ".hhhhhhhhhh.",
      ".hwBhhhhBwh.",
      ".hhhhaahhhh.",
      ".hhhhhhhhhh.",
      ".shhhhhhhhs.",
      ".shwwwwwwhs.",
      ".shwwwwwwhs.",
      "..hhhhhhhh..",
      "...aa..aa...",
      "............"
    ],
    turtle: [
      "............",
      "....ssss....",
      "...sBssBs...",
      "....ssss....",
      "..hhhhhhhh..",
      ".hhaahhaahh.",
      ".hhhhhhhhhh.",
      ".hhaahhaahh.",
      "..hhhhhhhh..",
      "..ss....ss..",
      "............",
      "............"
    ],
    // 항해선 (돛 2장 + 깃발 + 금줄 장식 + 현창)
    ship: [
      ".........mrr......",
      "....wwwwwm.r......",
      "...wwwwwwmwww.....",
      "..wwwwwwwmwwww....",
      "..wwwwwwwmwwww....",
      "...wwwwwwmwww.....",
      "....wwwwwm........",
      ".........m........",
      ".hhhhhhhhhhhhhhhh.",
      ".haaaaaaaaaaaaaah.",
      "..hhhohhhhohhhh...",
      "...hhhhhhhhhhh....",
      "....hhhhhhhhh....."
    ],
    // ---- 월드맵 섬 일러스트 (테마별) ----
    // Chapter 1: 항구마을 — 빨간 지붕 집, 야자수, 부두
    isl_harbor: [
      "........rrr.........",
      ".......rrrrr........",
      "......rrrrrrr.......",
      "......wwwwwww..ll...",
      "......wowwwow..llll.",
      "......wwwwwww...kk..",
      "..GggggwwwwwwwggkkgG",
      ".GggggggggggggggggG.",
      ".ssssssssssssssssss.",
      "..ssssssssssssssss..",
      "........dddd........",
      "........d..d........",
      "........d..d........"
    ],
    // Chapter 2: 대양 — 산호섬(라군) + 부표
    isl_ocean: [
      "....................",
      "........gg..........",
      "......gggggg........",
      "....ssgggggsss......",
      "...ssswwwwwsss......",
      "..ssswwwwwwwsss.....",
      "..sswwwwwwwwwss.....",
      "..ssswwwwwwwsss..b..",
      "...ssswwwwwsss...b..",
      "....sssssssss.......",
      "......sssss........."
    ],
    // Chapter 3: 안개 늪지대 — 어두운 숲 + 물웅덩이 + 안개
    isl_swamp: [
      "....ll......ll......",
      "...llll....llll.....",
      "...llll....llll.....",
      "....kk......kk......",
      "mm..kk..mm..kk...mm.",
      ".GggggggggggggggggG.",
      ".gggggGGgggGGgggggg.",
      "..gggggggggggggggg..",
      "...wwGggggggggGww...",
      "....wwwwwwwwwwww....",
      "..mmm.....mmmm......"
    ],
    // Chapter 4: 빙하 — 빙산 + 얼음 결정
    isl_ice: [
      ".......cc...........",
      "......cccc....cc....",
      "......cccc...cccc...",
      "....wwccccww.cccc...",
      "...wwwwwwwwwwwcc....",
      "..wwwwwwwwwwwwww....",
      ".iwwwwwwwwwwwwwwi...",
      ".iiwwwwwwwwwwwwii...",
      ".IiiiiiiiiiiiiiiI...",
      "..IIIIIIIIIIIIII...."
    ],
    // Chapter 5: 하늘섬 — 공중에 뜬 섬 + 꽃 + 구름
    isl_sky: [
      "....ggfgggggggfg....",
      "...gggggggggggggg...",
      "...dddddddddddddd...",
      "....dddddddddddd....",
      "cc...dddddddddd...cc",
      "ccc...dddddddd...ccc",
      "......DddddddD......",
      ".......DddddD.......",
      "........DddD........",
      ".........DD........."
    ]
  };

  const PALETTES = {
    boy1:   { h: "#5b3a1e", s: "#f5cfa0", B: "#26262e", m: "#e08a78", t: "#3f7fce", p: "#39506b", w: "#f2f2f2", a: "#e8c04b" },
    boy2:   { h: "#2b2b30", s: "#e8b98a", B: "#26262e", m: "#d97b6c", t: "#4caf6d", p: "#5b4632", w: "#f2f2f2", a: "#e8c04b" },
    girl1:  { h: "#7a4a21", s: "#f5cfa0", B: "#26262e", m: "#e08a78", t: "#e8739a", p: "#8a5fb5", w: "#f2f2f2", a: "#ff5f7e" },
    girl2:  { h: "#1f1f24", s: "#e8b98a", B: "#26262e", m: "#d97b6c", t: "#e8b64b", p: "#4a6b8a", w: "#f2f2f2", a: "#9a6de8" },
    cat:    { h: "#a8a8bc", B: "#26262e", m: "#e88a9a", a: "#e85f5f", s: "#8a8a9e", w: "#f2f2f2" },
    fox:    { h: "#e88a3a", B: "#26262e", m: "#3a2b1e", a: "#fff3e0", s: "#c96f26", w: "#f2f2f2" },
    dog:    { h: "#c9995e", B: "#26262e", m: "#3a2b1e", a: "#5f8fe8", s: "#8a6437", w: "#f2f2f2" },
    rabbit: { h: "#f0f0f0", B: "#26262e", m: "#f2a0b5", a: "#ffd9e0", s: "#d9d9d9", w: "#ffd9e0" },
    owl:    { h: "#8a6437", B: "#26262e", m: "#e8a24b", a: "#e8a24b", s: "#6d4f2b", w: "#f2e3c2" },
    turtle: { h: "#5f8a4a", B: "#26262e", m: "#4a6b3a", a: "#8fb573", s: "#7dc46d", w: "#f2f2f2" },
    ship:   { h: "#8a5a2b", a: "#e8c04b", m: "#5b3a1e", w: "#f5f0e0", r: "#e85f5f", o: "#f2c14b" },
    isl_harbor: { r: "#d9564b", w: "#f5ead2", o: "#7fb8d9", g: "#7dc46d", G: "#5fa04f", s: "#eed9a2", k: "#8a5a2b", l: "#4f9f3f", d: "#a8743f" },
    isl_ocean:  { g: "#7dc46d", s: "#eed9a2", w: "#9fe0f2", b: "#e85f5f" },
    isl_swamp:  { g: "#6d8a5a", G: "#4f6b45", k: "#5b4632", l: "#3f5f38", m: "#cfd9cc", w: "#42594f" },
    isl_ice:    { w: "#f2f8fc", i: "#b5e0f2", I: "#7fb8d9", c: "#d9f2ff" },
    isl_sky:    { g: "#8fd95f", d: "#8a6437", D: "#6b4a26", c: "#ffffff", f: "#ff8fb5" }
  };

  function paint(canvas) {
    const shape = SHAPES[canvas.dataset.shape];
    const pal = PALETTES[canvas.dataset.palette];
    if (!shape || !pal) return;
    const scale = parseInt(canvas.dataset.scale || "6", 10);
    const cols = Math.max(...shape.map(r => r.length));
    const rows = shape.length;
    canvas.width = cols * scale;
    canvas.height = rows * scale;
    const g = canvas.getContext("2d");
    g.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const ch = shape[y][x];
        if (ch === "." || !pal[ch]) continue;
        g.fillStyle = pal[ch];
        g.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  // innerHTML 렌더 후 호출: root 안의 모든 스프라이트 캔버스를 그린다
  function paintAll(root = document) {
    root.querySelectorAll("canvas.sprite").forEach(paint);
  }

  function charHTML(charId, scale = 6, cls = "") {
    const c = KP_CHARACTERS.find(c => c.id === charId) || KP_CHARACTERS[0];
    return `<canvas class="sprite ${cls}" data-shape="${c.shape}" data-palette="${c.palette}" data-scale="${scale}"></canvas>`;
  }

  function shipHTML(scale = 5, cls = "") {
    return `<canvas class="sprite ${cls}" data-shape="ship" data-palette="ship" data-scale="${scale}"></canvas>`;
  }

  function islandHTML(theme, scale = 5, cls = "") {
    const key = `isl_${theme}`;
    if (!SHAPES[key]) return "";
    return `<canvas class="sprite ${cls}" data-shape="${key}" data-palette="${key}" data-scale="${scale}"></canvas>`;
  }

  // 알파벳 캐릭터 (눈·발 달린 글자) — CSS 기반
  // role: citizen(자음 시민) | hero(모음 히어로)
  function buddyHTML(letter, role = "citizen", size = "md") {
    const cls = role === "hero" ? "buddy-hero" : "buddy-citizen";
    const cape = role === "hero" ? `<span class="buddy-star">★</span>` : "";
    return `
      <span class="letter-buddy ${cls} buddy-${size}">
        ${cape}
        <span class="buddy-eyes"><span class="buddy-eye"></span><span class="buddy-eye"></span></span>
        <span class="buddy-letter">${letter.toUpperCase()}${letter.toLowerCase()}</span>
        <span class="buddy-feet"><span class="buddy-foot"></span><span class="buddy-foot"></span></span>
      </span>`;
  }

  return { paint, paintAll, charHTML, shipHTML, islandHTML, buddyHTML };
})();

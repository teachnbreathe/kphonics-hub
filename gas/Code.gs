/**
 * K-Phonics OPS™: Adventure — Google Apps Script 동기화 서버
 *
 * 설정 방법
 * 1) 학생 기록을 받을 Google Sheet에서 확장 프로그램 → Apps Script를 엽니다.
 * 2) 이 파일 전체를 Code.gs에 붙여넣습니다.
 * 3) 이 스크립트를 시트에 연결해서 만들었다면 SPREADSHEET_ID는 비워 둡니다.
 *    독립형 Apps Script라면 아래 따옴표 안에 스프레드시트 ID를 입력합니다.
 * 4) 배포 → 새 배포 → 유형: 웹 앱 → 실행 사용자: 나 → 액세스: 모든 사용자로 배포합니다.
 * 5) 발급된 /exec 주소를 js/game.js의 GAS_WEBAPP_URL에 입력합니다.
 */

const SPREADSHEET_ID = "";
const SAVE_SHEET_NAME = "Game_Saves";
const TOTAL_STAGES = 10;
const HEADERS = [
  "학생키", "학급코드", "이름", "세이브 JSON", "진행률", "완료 스테이지",
  "뱃지 수", "코인", "최근 학습시각", "서버 저장시각"
];

function getSpreadsheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("연결된 스프레드시트가 없습니다. SPREADSHEET_ID를 확인하세요.");
  return ss;
}

function getSaveSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SAVE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SAVE_SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#f7c54a");
    sheet.setColumnWidth(1, 220);
    sheet.setColumnWidth(4, 420);
  }
  return sheet;
}

function clean_(value) {
  return String(value == null ? "" : value).trim();
}

function studentKey_(classCode, name) {
  return clean_(classCode).toLowerCase() + "::" + clean_(name).toLowerCase();
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_(name, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0 || !sheet.getRange(1, 1).getDisplayValue()) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return 0;
  const found = sheet.getRange(2, column, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(value)).matchEntireCell(true).findNext();
  return found ? found.getRow() : 0;
}

// 기존 Google Sheet 템플릿의 대시보드가 참조하는 표를 함께 갱신한다.
function syncTemplateDashboard_(classCode, name, key, save) {
  const students = getOrCreateSheet_("Students", [
    "student_id", "학생 이름", "class_id", "PIN 해시", "QR 토큰", "상태", "등록일", "메모"
  ]);
  let studentRow = findRow_(students, 1, key);
  const registeredAt = studentRow ? students.getRange(studentRow, 7).getValue() : new Date();
  if (!studentRow) studentRow = students.getLastRow() + 1;
  students.getRange(studentRow, 1, 1, 8).setValues([[
    key, name, classCode, "", "", "활성", registeredAt || new Date(), "웹앱 자동 동기화"
  ]]);

  const cleared = Array.isArray(save.clearedStages) ? save.clearedStages.length : 0;
  const badges = Array.isArray(save.badges) ? save.badges.length : 0;
  const progressRate = Math.min(1, cleared / TOTAL_STAGES);
  const current = save.current || {};
  const progress = getOrCreateSheet_("Progress", [
    "updated_at", "student_id", "current_chapter", "current_stage", "current_step",
    "완료 스테이지 수", "진행률", "코인", "뱃지 수", "save_json"
  ]);
  let progressRow = findRow_(progress, 2, key);
  if (!progressRow) progressRow = progress.getLastRow() + 1;
  progress.getRange(progressRow, 1, 1, 10).setValues([[
    clean_(save.lastUpdated), key, clean_(current.chapter), clean_(current.stage), clean_(current.step),
    cleared, progressRate, Number(save.coins || 0), badges, JSON.stringify(save)
  ]]);
  progress.getRange(progressRow, 7).setNumberFormat("0%");

  const attemptsSheet = getOrCreateSheet_("Attempts", [
    "attempt_id", "응시 시간", "student_id", "학생 이름", "stage_id", "단계명",
    "정답 수", "전체 문항", "정답률", "통과 여부", "소요 시간(초)", "device_id"
  ]);
  const attempts = Array.isArray(save.quizAttempts) ? save.quizAttempts : [];
  attempts.forEach((attempt, index) => {
    const attemptId = `${key}::${clean_(attempt.at) || index}::${clean_(attempt.stageId)}`;
    let attemptRow = findRow_(attemptsSheet, 1, attemptId);
    if (!attemptRow) attemptRow = attemptsSheet.getLastRow() + 1;
    const accuracy = Number(attempt.total || 0)
      ? Number(attempt.correct || 0) / Number(attempt.total)
      : 0;
    attemptsSheet.getRange(attemptRow, 1, 1, 12).setValues([[
      attemptId, clean_(attempt.at), key, name, clean_(attempt.stageId), clean_(attempt.stageId),
      Number(attempt.correct || 0), Number(attempt.total || 0), accuracy,
      attempt.passed ? "통과" : "재도전", "", ""
    ]]);
    attemptsSheet.getRange(attemptRow, 9).setNumberFormat("0%");
  });

  const dashboard = getSpreadsheet_().getSheetByName("대시보드");
  if (dashboard) {
    const answered = attempts.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const correct = attempts.reduce((sum, item) => sum + Number(item.correct || 0), 0);
    const accuracy = answered ? correct / answered : "";
    // Students 2행은 대시보드 7행과 대응한다.
    const dashboardRow = studentRow + 5;
    dashboard.getRange(dashboardRow, 1, 1, 8).setValues([[
      name, classCode, progressRate, cleared, accuracy,
      [clean_(current.stage), clean_(current.step)].filter(Boolean).join(" · "),
      clean_(save.lastUpdated), "—"
    ]]);
    dashboard.getRange(dashboardRow, 3).setNumberFormat("0%");
    dashboard.getRange(dashboardRow, 5).setNumberFormat("0%");
  }
}

// 이미 Game_Saves에 들어 있는 기존 학생들을 대시보드에 한 번에 반영한다.
// Apps Script 상단 함수 목록에서 이 함수를 선택하고 실행하면 된다.
function rebuildDashboardFromGameSaves() {
  const sheet = getSaveSheet_();
  if (sheet.getLastRow() < 2) return;
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  rows.forEach(row => {
    const key = clean_(row[0]);
    const classCode = clean_(row[1]);
    const name = clean_(row[2]);
    if (!key || !classCode || !name || !row[3]) return;
    try {
      const save = typeof row[3] === "string" ? JSON.parse(row[3]) : row[3];
      syncTemplateDashboard_(classCode, name, key, save);
    } catch (ignore) { /* 손상된 한 행은 건너뛰고 나머지는 계속 처리 */ }
  });
  SpreadsheetApp.flush();
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const classCode = clean_(payload.classCode);
    const name = clean_(payload.name);
    const save = typeof payload.save === "string" ? JSON.parse(payload.save) : payload.save;
    if (!classCode || !name || !save) return jsonOutput_({ ok: false, message: "학급코드, 이름, 세이브가 필요합니다." });

    const sheet = getSaveSheet_();
    const key = studentKey_(classCode, name);
    const cleared = Array.isArray(save.clearedStages) ? save.clearedStages.length : 0;
    const badges = Array.isArray(save.badges) ? save.badges.length : 0;
    const progress = Math.min(100, Math.round(cleared / TOTAL_STAGES * 100)) + "%";
    const rowValues = [[
      key, classCode, name, JSON.stringify(save), progress, cleared,
      badges, Number(save.coins || 0), clean_(save.lastUpdated), new Date()
    ]];
    const found = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
      .createTextFinder(key).matchEntireCell(true).findNext();
    if (found) sheet.getRange(found.getRow(), 1, 1, HEADERS.length).setValues(rowValues);
    else sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.length).setValues(rowValues);
    syncTemplateDashboard_(classCode, name, key, save);
    return jsonOutput_({ ok: true });
  } catch (error) {
    return jsonOutput_({ ok: false, message: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(params.callback || "")
    ? params.callback
    : "callback";
  let result;
  try {
    const classCode = clean_(params.classCode);
    const name = clean_(params.name);
    if (!classCode || !name) throw new Error("학급코드와 이름을 모두 입력하세요.");
    const sheet = getSaveSheet_();
    const key = studentKey_(classCode, name);
    const found = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
      .createTextFinder(key).matchEntireCell(true).findNext();
    if (!found) result = { ok: false, message: "저장된 학습 기록을 찾지 못했어요." };
    else {
      const saveJson = sheet.getRange(found.getRow(), 4).getDisplayValue();
      result = { ok: true, save: JSON.parse(saveJson) };
    }
  } catch (error) {
    result = { ok: false, message: String(error && error.message || error) };
  }
  return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

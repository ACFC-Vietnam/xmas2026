/**
 * Make A Wish 2026 — Wish Status lookup (Google Apps Script web app)
 * Owner account: communication.acfc@gmail.com
 *
 * What it does
 *   GET  .../exec?key=<Submission ID>
 *   → { ok: true,  wish: { status, statusNote, submittedAt, senderName, senderTeam,
 *                          recipientType, recipientName, recipientTeam, gift, reason, message } }
 *   → { ok: false, code: 'NOT_OPEN' | 'INVALID_KEY' | 'NOT_FOUND' | 'ERROR' }
 *
 * Privacy: only the fields in FIELDS are ever returned (allow-list). Email and phone are
 * never read into the response, whatever columns the sheet has.
 *
 * Setup (once): see apps-script/README.md
 */

// ---------- CONFIG ----------
var CONFIG = {
  // Leave blank if this script is bound to the responses spreadsheet (Extensions → Apps Script).
  // Otherwise paste the spreadsheet ID from its URL.
  SPREADSHEET_ID: '',

  // Tab name Tally writes to. Blank = auto-detect the tab with a "Submission ID" column.
  SHEET_NAME: '',

  // Lookups are refused before this moment (Vietnam time). Must match assets/js/config.js.
  OPEN_AT: '2026-12-21T00:00:00+07:00',

  // Seconds a found wish is cached (lower = HR status edits show up faster).
  CACHE_SECONDS: 60
};

// Allow-list: output key → text the column header CONTAINS (case-insensitive).
// Tally names columns after the question titles; run logHeaders() once to check them.
var FIELDS = {
  key:           'Submission ID',
  submittedAt:   'Submitted at',
  senderName:    'gọi bạn là gì',
  senderTeam:    'Bạn đang làm việc ở team',
  recipientType: 'dành điều ước này cho ai',
  recipientName: 'đó là ai',
  recipientTeam: 'ở team hay cửa hàng nào vậy',
  gift:          'Tặng món quà gì',
  reason:        'Vì sao bạn chọn',
  message:       'lời chúc',
  status:        'Trạng thái',   // add this column yourself (HR fills it in)
  statusNote:    'Ghi chú'       // optional column: short message shown under the status
};

// ---------- WEB APP ----------
function doGet(e) {
  try {
    if (Date.now() < Date.parse(CONFIG.OPEN_AT)) return json_({ ok: false, code: 'NOT_OPEN' });

    var key = String((e && e.parameter && e.parameter.key) || '').trim();
    if (!/^[A-Za-z0-9]{3,20}$/.test(key)) return json_({ ok: false, code: 'INVALID_KEY' });

    var cache = CacheService.getScriptCache();
    var cached = cache.get('wish:' + key);
    if (cached) return json_({ ok: true, wish: JSON.parse(cached) });

    var wish = findWish_(key);
    if (!wish) return json_({ ok: false, code: 'NOT_FOUND' });

    cache.put('wish:' + key, JSON.stringify(wish), CONFIG.CACHE_SECONDS);
    return json_({ ok: true, wish: wish });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, code: 'ERROR' });
  }
}

function findWish_(key) {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return null;

  var headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  var cols = mapColumns_(headers);
  if (cols.key == null) throw new Error('Submission ID column not found — check FIELDS.key');

  // Exact, case-sensitive match on the Submission ID column only.
  var found = sheet.getRange(2, cols.key + 1, lastRow - 1, 1)
    .createTextFinder(key).matchCase(true).matchEntireCell(true).findNext();
  if (!found) return null;

  var row = sheet.getRange(found.getRow(), 1, 1, lastCol).getDisplayValues()[0];
  var wish = {};
  Object.keys(FIELDS).forEach(function (name) {
    if (name === 'key') return;
    wish[name] = cols[name] == null ? '' : String(row[cols[name]] || '').trim();
  });
  return wish;
}

function mapColumns_(headers) {
  var cols = {};
  var lower = headers.map(function (h) { return String(h).toLowerCase(); });
  Object.keys(FIELDS).forEach(function (name) {
    var needle = FIELDS[name].toLowerCase();
    for (var i = 0; i < lower.length; i++) {
      if (lower[i].indexOf(needle) !== -1) { cols[name] = i; break; }
    }
  });
  return cols;
}

function getSheet_() {
  var ss = CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet: open the script from the responses Sheet (Extensions → Apps Script) or fill CONFIG.SPREADSHEET_ID');
  if (CONFIG.SHEET_NAME) {
    var named = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!named) throw new Error('Tab "' + CONFIG.SHEET_NAME + '" not found — check CONFIG.SHEET_NAME');
    return named;
  }
  // No tab name given: use the first tab whose header row has a "Submission ID" column.
  var needle = FIELDS.key.toLowerCase();
  var tabs = ss.getSheets();
  for (var i = 0; i < tabs.length; i++) {
    var lastCol = tabs[i].getLastColumn();
    if (lastCol < 1) continue;
    var headers = tabs[i].getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    if (headers.some(function (h) { return String(h).toLowerCase().indexOf(needle) !== -1; })) return tabs[i];
  }
  throw new Error('No tab with a "' + FIELDS.key + '" column yet. Connect the Tally → Google Sheets sync and send one test wish, then run again.');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- HELPERS (run from the editor) ----------

/** Logs every column header and which output field it maps to. Run once after Tally creates the sheet. */
function logHeaders() {
  var sheet = getSheet_();
  console.log('Using tab: "' + sheet.getName() + '"');
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var cols = mapColumns_(headers);
  var byIndex = {};
  Object.keys(cols).forEach(function (k) { byIndex[cols[k]] = k; });
  headers.forEach(function (h, i) { console.log((i + 1) + '. ' + h + (byIndex[i] ? '  →  ' + byIndex[i] : '')); });
  Object.keys(FIELDS).forEach(function (k) { if (cols[k] == null) console.warn('Not mapped: ' + k + ' (looking for "' + FIELDS[k] + '")'); });
}

/** Test a lookup from the editor, ignoring the opening date. Change the key first. */
function testLookup() {
  console.log(JSON.stringify(findWish_('PASTE_A_SUBMISSION_ID'), null, 2));
}

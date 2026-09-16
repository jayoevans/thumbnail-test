// Google Apps Script backend. Paste into Extensions > Apps Script of a new
// Google Sheet, then Deploy > New deployment > Web app,
// "Execute as: Me", "Who has access: Anyone". Copy the web-app URL into
// VITE_SHEET_ENDPOINT.
//
// Creates two sheets on first write: "grids" and "sessions".

var GRID_HEADERS = ["ts", "session", "grid", "shown", "names", "clicked", "clickedPos", "ms", "device", "ip"];
var SESSION_HEADERS = ["ts", "session", "age", "platform", "playsEH", "gridsCompleted", "userAgent", "device", "ip"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ts = new Date().toISOString();
    if (d.type === "grid") {
      sheet(ss, "grids", GRID_HEADERS).appendRow([
        ts, d.session, d.grid,
        (d.shown || []).join("|"), (d.names || []).join("|"),
        d.clicked, d.clickedPos, d.ms, d.device || "", d.ip || "",
      ]);
    } else if (d.type === "session") {
      sheet(ss, "sessions", SESSION_HEADERS).appendRow([
        ts, d.session, d.age, d.platform, String(d.playsEH), d.gridsCompleted, d.userAgent,
        d.device || "", d.ip || "",
      ]);
    }
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("thumbtest endpoint up");
}

// Creates the tab if missing. If the header row is shorter than `headers`
// (columns were added in a later version), the missing headers are filled in;
// existing data stays aligned because new columns are only ever appended.
function sheet(ss, name, headers) {
  var s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.appendRow(headers);
    s.setFrozenRows(1);
  } else if (s.getLastColumn() < headers.length) {
    s.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return s;
}

// ============================================================
//  AAKRIT CLASSES — ADMIN PANEL BACKEND
//  Google Apps Script | Version 1.0
//  Deploy as: Web App → Execute as Me → Access: Only Myself
// ============================================================

// ─── CONFIGURATION ───────────────────────────────────────────
const CONFIG = {
  SPREADSHEET_ID: '',          // ← PASTE YOUR GOOGLE SHEET ID HERE
  ADMIN_PASSWORD:  'Aakrit@2025', // ← CHANGE THIS to your secure password
  SESSION_KEY:     'aakrit_admin_v1',

  SHEETS: {
    STUDENTS:      'Students',
    FEES:          'Fees',
    ENQUIRIES:     'Enquiries',
    BATCHES:       'Batches',
    FACULTY:       'Faculty',
    ANNOUNCEMENTS: 'Announcements',
    SETTINGS:      'Settings',
    WEBSITE:       'WebsiteControl',
  }
};

// ─── ENTRY POINT ─────────────────────────────────────────────
function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('Aakrit Classes — Admin Panel')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DENY)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  // Route actions
  const routes = {
    login:                handleLogin,
    getStats:             getStats,
    // Students
    getStudents:          getStudents,
    addStudent:           addStudent,
    updateStudent:        updateStudent,
    deleteStudent:        deleteStudent,
    // Fees
    getFees:              getFees,
    addFee:               addFee,
    updateFee:            updateFee,
    // Enquiries
    getEnquiries:         getEnquiries,
    addEnquiry:           addEnquiry,
    updateEnquiryStatus:  updateEnquiryStatus,
    deleteEnquiry:        deleteEnquiry,
    // Batches
    getBatches:           getBatches,
    addBatch:             addBatch,
    updateBatch:          updateBatch,
    deleteBatch:          deleteBatch,
    // Announcements
    getAnnouncements:     getAnnouncements,
    addAnnouncement:      addAnnouncement,
    deleteAnnouncement:   deleteAnnouncement,
    // Website Control
    getWebsiteData:       getWebsiteData,
    updateWebsiteData:    updateWebsiteData,
    // Settings
    getSettings:          getSettings,
    updateSettings:       updateSettings,
    changePassword:       changePassword,
    // Reports
    getFeeReport:         getFeeReport,
    getEnquiryReport:     getEnquiryReport,
  };

  try {
    if (!routes[action]) throw new Error('Unknown action: ' + action);
    const result = routes[action](data);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── HELPERS ─────────────────────────────────────────────────
function getSheet(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheet(sheet, name);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map((row, i) => {
    const obj = { _row: i + 2 };
    headers.forEach((h, j) => obj[h] = row[j]);
    return obj;
  }).filter(obj => obj[headers[0]] !== '');
}

function generateId(prefix) {
  return prefix + '-' + Date.now().toString().slice(-6);
}

function nowString() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm');
}

function todayString() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy');
}

// ─── SHEET INITIALIZERS ──────────────────────────────────────
function initSheet(sheet, name) {
  const headers = {
    Students:      ['StudentID','Name','Phone','Email','ParentName','ParentPhone','Class','Board','Stream','Batch','JoinDate','Status','Address','Notes'],
    Fees:          ['FeeID','StudentID','StudentName','Amount','Type','Month','PaidDate','Mode','Status','Notes'],
    Enquiries:     ['EnquiryID','Name','Phone','Grade','Board','Source','Date','Status','FollowUpDate','Notes'],
    Batches:       ['BatchID','BatchName','Class','Subject','Faculty','Time','Days','Room','MaxStrength','CurrentStrength','Status'],
    Faculty:       ['FacultyID','Name','Phone','Email','Subject','Qualification','JoinDate','Status'],
    Announcements: ['AnnID','Title','Message','Target','Priority','Date','ExpiryDate','Status'],
    WebsiteControl:['Key','Value','UpdatedOn'],
    Settings:      ['Key','Value'],
  };
  if (headers[name]) {
    sheet.appendRow(headers[name]);
    sheet.getRange(1, 1, 1, headers[name].length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

// ─── SETUP (Run once manually) ───────────────────────────────
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  CONFIG.SPREADSHEET_ID = ss.getId();

  Object.values(CONFIG.SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      initSheet(sheet, name);
    }
  });

  // Seed settings
  const settingsSheet = ss.getSheetByName('Settings');
  const existing = settingsSheet.getDataRange().getValues();
  if (existing.length <= 1) {
    settingsSheet.appendRow(['institute_name', 'Aakrit Classes']);
    settingsSheet.appendRow(['address', 'Dhanori, Pune, Maharashtra 411015']);
    settingsSheet.appendRow(['phone', '+91 85306 92113']);
    settingsSheet.appendRow(['email', '']);
    settingsSheet.appendRow(['academic_year', '2025-26']);
    settingsSheet.appendRow(['password_hash', CONFIG.ADMIN_PASSWORD]);
  }

  Logger.log('✅ Setup complete. Spreadsheet ID: ' + ss.getId());
  Logger.log('Paste this ID into CONFIG.SPREADSHEET_ID in Code.gs');
}

// ─── AUTH ─────────────────────────────────────────────────────
function handleLogin(data) {
  const sheet = getSheet('Settings');
  const rows  = sheetToObjects(sheet);
  const stored = rows.find(r => r.Key === 'password_hash');
  const correctPwd = stored ? stored.Value : CONFIG.ADMIN_PASSWORD;

  if (data.password === correctPwd) {
    return { token: CONFIG.SESSION_KEY, institute: getInstituteName() };
  }
  throw new Error('Incorrect password. Please try again.');
}

function getInstituteName() {
  try {
    const sheet = getSheet('Settings');
    const rows  = sheetToObjects(sheet);
    const row   = rows.find(r => r.Key === 'institute_name');
    return row ? row.Value : 'Aakrit Classes';
  } catch(e) { return 'Aakrit Classes'; }
}

// ─── DASHBOARD STATS ─────────────────────────────────────────
function getStats() {
  const students    = sheetToObjects(getSheet('Students'));
  const fees        = sheetToObjects(getSheet('Fees'));
  const enquiries   = sheetToObjects(getSheet('Enquiries'));
  const batches     = sheetToObjects(getSheet('Batches'));

  const activeStudents = students.filter(s => s.Status === 'Active').length;
  const totalFeesPaid  = fees.filter(f => f.Status === 'Paid').reduce((sum, f) => sum + (Number(f.Amount) || 0), 0);
  const pendingFees    = fees.filter(f => f.Status === 'Pending').reduce((sum, f) => sum + (Number(f.Amount) || 0), 0);
  const newEnquiries   = enquiries.filter(e => e.Status === 'New').length;
  const activeBatches  = batches.filter(b => b.Status === 'Active').length;

  // This month fees
  const thisMonth = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'MM/yyyy');
  const monthFees = fees.filter(f => {
    const pd = f.PaidDate || '';
    return pd.includes(thisMonth.split('/')[0] + '/' + thisMonth.split('/')[1]) && f.Status === 'Paid';
  }).reduce((sum, f) => sum + (Number(f.Amount) || 0), 0);

  // Recent enquiries (last 5)
  const recentEnquiries = enquiries.slice(-5).reverse().map(e => ({
    name: e.Name, grade: e.Grade, date: e.Date, status: e.Status, phone: e.Phone
  }));

  return {
    activeStudents,
    totalFeesPaid,
    pendingFees,
    monthFees,
    newEnquiries,
    activeBatches,
    totalStudents: students.length,
    recentEnquiries,
  };
}

// ─── STUDENTS ─────────────────────────────────────────────────
function getStudents() {
  return sheetToObjects(getSheet('Students'));
}

function addStudent(data) {
  const sheet = getSheet('Students');
  const id    = generateId('STU');
  sheet.appendRow([
    id, data.name, data.phone, data.email || '',
    data.parentName || '', data.parentPhone || '',
    data.class, data.board, data.stream || '',
    data.batch || '', todayString(),
    data.status || 'Active',
    data.address || '', data.notes || ''
  ]);
  return { id };
}

function updateStudent(data) {
  const sheet = getSheet('Students');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.StudentID) {
      sheet.getRange(i + 1, 1, 1, 14).setValues([[
        data.StudentID, data.Name, data.Phone, data.Email || '',
        data.ParentName || '', data.ParentPhone || '',
        data.Class, data.Board, data.Stream || '',
        data.Batch || '', data.JoinDate,
        data.Status, data.Address || '', data.Notes || ''
      ]]);
      return { updated: true };
    }
  }
  throw new Error('Student not found');
}

function deleteStudent(data) {
  const sheet = getSheet('Students');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      return { deleted: true };
    }
  }
  throw new Error('Student not found');
}

// ─── FEES ─────────────────────────────────────────────────────
function getFees() {
  return sheetToObjects(getSheet('Fees'));
}

function addFee(data) {
  const sheet = getSheet('Fees');
  const id    = generateId('FEE');
  sheet.appendRow([
    id, data.studentId, data.studentName,
    data.amount, data.type || 'Monthly',
    data.month || '', data.paidDate || todayString(),
    data.mode || 'Cash',
    data.status || 'Paid',
    data.notes || ''
  ]);
  return { id };
}

function updateFee(data) {
  const sheet = getSheet('Fees');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.FeeID) {
      sheet.getRange(i + 1, 1, 1, 10).setValues([[
        data.FeeID, data.StudentID, data.StudentName,
        data.Amount, data.Type, data.Month,
        data.PaidDate, data.Mode, data.Status, data.Notes || ''
      ]]);
      return { updated: true };
    }
  }
  throw new Error('Fee record not found');
}

// ─── ENQUIRIES ────────────────────────────────────────────────
function getEnquiries() {
  return sheetToObjects(getSheet('Enquiries'));
}

function addEnquiry(data) {
  const sheet = getSheet('Enquiries');
  const id    = generateId('ENQ');
  sheet.appendRow([
    id, data.name, data.phone,
    data.grade, data.board || '',
    data.source || 'Walk-in',
    todayString(),
    data.status || 'New',
    data.followUpDate || '',
    data.notes || ''
  ]);
  return { id };
}

function updateEnquiryStatus(data) {
  const sheet = getSheet('Enquiries');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 8).setValue(data.status);
      if (data.followUpDate) sheet.getRange(i + 1, 9).setValue(data.followUpDate);
      if (data.notes) sheet.getRange(i + 1, 10).setValue(data.notes);
      return { updated: true };
    }
  }
  throw new Error('Enquiry not found');
}

function deleteEnquiry(data) {
  const sheet = getSheet('Enquiries');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) { sheet.deleteRow(i + 1); return { deleted: true }; }
  }
  throw new Error('Enquiry not found');
}

// ─── BATCHES ─────────────────────────────────────────────────
function getBatches() {
  return sheetToObjects(getSheet('Batches'));
}

function addBatch(data) {
  const sheet = getSheet('Batches');
  const id    = generateId('BAT');
  sheet.appendRow([
    id, data.batchName, data.class,
    data.subject, data.faculty || '',
    data.time, data.days,
    data.room || '', data.maxStrength || 20,
    data.currentStrength || 0,
    data.status || 'Active'
  ]);
  return { id };
}

function updateBatch(data) {
  const sheet = getSheet('Batches');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.BatchID) {
      sheet.getRange(i + 1, 1, 1, 11).setValues([[
        data.BatchID, data.BatchName, data.Class,
        data.Subject, data.Faculty || '',
        data.Time, data.Days,
        data.Room || '', data.MaxStrength,
        data.CurrentStrength, data.Status
      ]]);
      return { updated: true };
    }
  }
  throw new Error('Batch not found');
}

function deleteBatch(data) {
  const sheet = getSheet('Batches');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) { sheet.deleteRow(i + 1); return { deleted: true }; }
  }
  throw new Error('Batch not found');
}

// ─── ANNOUNCEMENTS ───────────────────────────────────────────
function getAnnouncements() {
  return sheetToObjects(getSheet('Announcements'));
}

function addAnnouncement(data) {
  const sheet = getSheet('Announcements');
  const id    = generateId('ANN');
  sheet.appendRow([
    id, data.title, data.message,
    data.target || 'All',
    data.priority || 'Normal',
    todayString(),
    data.expiryDate || '',
    'Active'
  ]);
  return { id };
}

function deleteAnnouncement(data) {
  const sheet = getSheet('Announcements');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) { sheet.deleteRow(i + 1); return { deleted: true }; }
  }
  throw new Error('Announcement not found');
}

// ─── WEBSITE CONTROL ─────────────────────────────────────────
function getWebsiteData() {
  return sheetToObjects(getSheet('WebsiteControl'));
}

function updateWebsiteData(data) {
  const sheet = getSheet('WebsiteControl');
  const rows  = sheet.getDataRange().getValues();
  const now   = nowString();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.key) {
      sheet.getRange(i + 1, 2).setValue(data.value);
      sheet.getRange(i + 1, 3).setValue(now);
      return { updated: true };
    }
  }
  // New key
  sheet.appendRow([data.key, data.value, now]);
  return { inserted: true };
}

// ─── SETTINGS ────────────────────────────────────────────────
function getSettings() {
  return sheetToObjects(getSheet('Settings'));
}

function updateSettings(data) {
  const sheet = getSheet('Settings');
  const rows  = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.key) {
      sheet.getRange(i + 1, 2).setValue(data.value);
      return { updated: true };
    }
  }
  sheet.appendRow([data.key, data.value]);
  return { inserted: true };
}

function changePassword(data) {
  if (!data.newPassword || data.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }
  return updateSettings({ key: 'password_hash', value: data.newPassword });
}

// ─── REPORTS ─────────────────────────────────────────────────
function getFeeReport(data) {
  const fees = sheetToObjects(getSheet('Fees'));
  const filtered = data.month
    ? fees.filter(f => (f.Month || '').includes(data.month))
    : fees;

  const paid    = filtered.filter(f => f.Status === 'Paid');
  const pending = filtered.filter(f => f.Status === 'Pending');
  const totalPaid    = paid.reduce((s, f) => s + (Number(f.Amount) || 0), 0);
  const totalPending = pending.reduce((s, f) => s + (Number(f.Amount) || 0), 0);

  return { paid, pending, totalPaid, totalPending, count: filtered.length };
}

function getEnquiryReport() {
  const enquiries = sheetToObjects(getSheet('Enquiries'));
  const byStatus  = {};
  enquiries.forEach(e => { byStatus[e.Status] = (byStatus[e.Status] || 0) + 1; });
  const bySource  = {};
  enquiries.forEach(e => { bySource[e.Source] = (bySource[e.Source] || 0) + 1; });
  return { total: enquiries.length, byStatus, bySource };
}

// ============================================================
//   ETTASKY WEDDING — Google Apps Script
//   Paste into: Google Sheet → Extensions → Apps Script
// ============================================================

const SHEET_ID   = '1Cljr6iKO-bzeBJbD5cHS9XOoabVUQD5zlc2Yz1IEds0';
const SHEET_NAME = 'RSVPs';

function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet + headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = [
        'Timestamp',
        'Submitted By',
        'Attending',
        'Party Size',
        'Guest Names',
        'Meal Choices',
        'Dogs Game',
        'Dietary Restrictions',
        'Favorite Love Song',
        'Notes',
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    sheet.appendRow([
      data.timestamp    || new Date().toISOString(),
      data.submittedBy  || '',
      data.attending    || '',
      data.partySize    || 0,
      data.guestNames   || '',
      data.mealChoices  || '',
      data.dogsGame     || '',
      data.dietary      || '',
      data.loveSong     || '',
      data.notes        || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this manually first to test before going live
function testWrite() {
  doPost({
    postData: {
      contents: JSON.stringify({
        timestamp:   new Date().toISOString(),
        submittedBy: 'Test Guest',
        attending:   'Yes',
        partySize:   2,
        guestNames:  'Test Guest, Test Plus One',
        mealChoices: 'Test Guest: Chicken | Test Plus One: Vegetarian',
        dogsGame:    'Yes',
        dietary:     '',
        loveSong:    'At Last - Etta James',
        notes:       'This is a test row — safe to delete!',
      })
    }
  });
}

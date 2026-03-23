# Hướng Dẫn Kết Nối Google Sheets

## Bước 1: Tạo Google Sheet
1. Vào [Google Sheets](https://sheets.google.com) → tạo sheet mới
2. Đặt tên: `Quiz Results`
3. Thêm header ở hàng 1: `Thời gian` | `Tên nhóm` | `Nghi phạm` | `Điểm` | `Manh mối`

## Bước 2: Tạo Apps Script
1. Trong Google Sheet → **Extensions** → **Apps Script**
2. Xóa hết code mặc định, dán code sau:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('vi-VN'),
      data.teamName || '',
      data.suspectName || '',
      data.score || '',
      data.clues || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Bước 3: Deploy Web App
1. Click **Deploy** → **New deployment**
2. Chọn type: **Web app**
3. Cài đặt:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy** → **Authorize** khi được yêu cầu
5. Copy **Web app URL** (dạng: `https://script.google.com/macros/s/AKfy.../exec`)

## Bước 4: Cập nhật URL trong code
Mở file [src/App.jsx](file:///Users/bo-khanh/Desktop/Src/out/quizzz/src/App.jsx), tìm dòng:
```javascript
const SHEET_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_SCRIPT_ID/exec';
```
Thay `REPLACE_WITH_YOUR_SCRIPT_ID` bằng URL thực từ bước 3.

> [!IMPORTANT]
> Sau khi thay URL, commit và push lại code.

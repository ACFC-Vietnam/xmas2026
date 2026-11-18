# Wish Status: Apps Script setup

Owner account: **communication.acfc@gmail.com**. Do this after Tally's Google Sheets sync has created the responses sheet.

1. Open the responses spreadsheet → **Extensions → Apps Script**.
2. Replace the default code with `Code.gs` from this folder and save.
3. In the sheet, add two columns at the far right:
   - **`Trạng thái`**: the status HR updates (e.g. "Đã nhận", "Đang chuẩn bị").
   - **`Ghi chú`** (optional): a short note shown under the status.
4. In the editor, run **`logHeaders`** (approve the permission prompt once). Check the log: every field should show `→ fieldName`. If one says *Not mapped*, edit its text in `FIELDS` to match part of the real column header.
5. Optional: put a real Submission ID into `testLookup` and run it to see the JSON.
6. **Deploy → New deployment → Web app**
   - Execute as: **Me (communication.acfc@gmail.com)**
   - Who has access: **Anyone**
7. Copy the URL ending in `/exec` and paste it into `appsScriptUrl` in `assets/js/config.js`.

Notes:
- Lookups return `NOT_OPEN` before **21/12/2026 00:00** (Vietnam time), whatever the website shows.
- Only the fields listed in `FIELDS` are returned. Email and phone are never sent.
- After editing the code, use **Deploy → Manage deployments → Edit → New version** so the `/exec` URL stays the same.

# AAKRIT CLASSES — ADMIN PANEL
## Complete Setup & Deployment Guide
### Google Apps Script | Version 1.0

---

## WHAT YOU'RE GETTING

Two files that work together:
- `Code.gs`   → Your backend (runs on Google's servers, reads/writes your Sheet)
- `Index.html` → Your frontend (the visual admin panel)

Your data lives in **Google Sheets** in your Google Drive.
Your admin panel runs at a private Google URL — no hosting needed.

---

## STEP 1 — CREATE YOUR GOOGLE SHEET

1. Go to **sheets.google.com**
2. Click **Blank** to create a new spreadsheet
3. Name it: `Aakrit Classes Admin DB`
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_ID/edit
   ```
   It's the long string between `/d/` and `/edit`

---

## STEP 2 — CREATE THE APPS SCRIPT PROJECT

1. In your Google Sheet, click:
   **Extensions → Apps Script**
2. A new tab opens — this is your Apps Script editor
3. You'll see a default file called `Code.gs`

---

## STEP 3 — ADD THE BACKEND CODE

1. **Delete** everything in `Code.gs`
2. **Paste** the entire contents of `Code.gs` from this folder
3. Find this line near the top:
   ```javascript
   SPREADSHEET_ID: '',
   ```
4. Paste your Sheet ID inside the quotes:
   ```javascript
   SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
   ```
5. Also change the password (optional but recommended):
   ```javascript
   ADMIN_PASSWORD: 'Aakrit@2025',  // ← Change this!
   ```

---

## STEP 4 — ADD THE HTML FILE

1. In Apps Script editor, click the **+** next to "Files"
2. Select **HTML**
3. Name it exactly: `Index` (no extension, no caps variation)
4. **Delete** everything in the new file
5. **Paste** the entire contents of `Index.html` from this folder

---

## STEP 5 — RUN SETUP (One time only)

1. In Apps Script, select function `setupSpreadsheet` from the dropdown
2. Click **▶ Run**
3. First time: Google will ask for permissions — click **Review Permissions**
4. Choose your Google account → Click **Advanced** → **Go to Aakrit Classes (unsafe)**
   (It says "unsafe" only because it's your own unverified script — this is normal)
5. Click **Allow**
6. Check the **Logs** (View → Logs) — you should see:
   ```
   ✅ Setup complete. Spreadsheet ID: your-id-here
   ```
7. Go back to your Sheet — you'll see all tabs created:
   Students, Fees, Enquiries, Batches, Faculty, Announcements, Settings, WebsiteControl

---

## STEP 6 — DEPLOY AS WEB APP

1. In Apps Script, click **Deploy → New Deployment**
2. Click the gear ⚙ next to "Type" → Select **Web app**
3. Fill in:
   - Description: `Aakrit Admin Panel v1`
   - Execute as: **Me** (your Google account)
   - Who has access: **Only myself**
4. Click **Deploy**
5. Copy the **Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfy.../exec
   ```
   **Save this URL — this is your admin panel!**

---

## STEP 7 — CONNECT THE FRONTEND

1. Back in Apps Script, open `Index.html`
2. Find this line near the bottom of the file:
   ```javascript
   const SCRIPT_URL = ''; // ← PASTE YOUR DEPLOYED SCRIPT URL HERE
   ```
3. Paste your Web App URL:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfy.../exec';
   ```
4. Click **Save** (Ctrl+S / Cmd+S)

---

## STEP 8 — REDEPLOY WITH THE URL

After pasting the URL, you must redeploy:
1. Click **Deploy → Manage Deployments**
2. Click the pencil ✏ next to your deployment
3. Change Version to: **New version**
4. Click **Deploy**

---

## STEP 9 — OPEN YOUR ADMIN PANEL

1. Open the Web App URL in your browser
2. You'll see the login screen
3. Enter your password (default: `Aakrit@2025`)
4. You're in! 🎉

**Bookmark this URL** — this is your permanent admin panel address.

---

## STEP 10 — CHANGE YOUR PASSWORD

1. Go to **Settings** in the sidebar
2. Scroll to "Change Admin Password"
3. Enter and confirm your new password
4. Click **Update Password**

---

## DEMO MODE

Before you connect the script URL, the panel runs in **Demo Mode** with sample data.
This is intentional — you can preview everything before setup.
Once you paste the SCRIPT_URL, it switches to live data automatically.

---

## HOW TO UPDATE THE PANEL IN FUTURE

Whenever you change code:
1. Edit in Apps Script
2. Deploy → Manage Deployments → Edit → New Version → Deploy
3. Refresh your browser

---

## TROUBLESHOOTING

### "Script function not found"
→ Make sure `doGet` and `doPost` functions exist in Code.gs

### Login not working
→ Check that `SPREADSHEET_ID` is correct
→ Ensure you ran `setupSpreadsheet()` first

### Data not saving
→ The script needs **Execute as: Me** — check your deployment settings

### "You do not have permission"
→ Re-deploy with **Who has access: Only myself**
→ Make sure you're opening the URL while logged into the correct Google account

### Sheet tabs missing
→ Run `setupSpreadsheet()` again from the Apps Script editor

---

## YOUR SHEET STRUCTURE

After setup, your Sheet will have these tabs:

| Tab | Purpose |
|-----|---------|
| Students | All student records |
| Fees | Payment records |
| Enquiries | Lead tracking |
| Batches | Class batches & timings |
| Faculty | Teacher records |
| Announcements | Notice board |
| Settings | Institute settings & password |
| WebsiteControl | Website content keys |

**Never delete the header row** (Row 1) in any tab.
You can safely view and filter data in Sheets anytime.

---

## SECURITY NOTES

- The panel is accessible **only to you** (logged into your Google account)
- Password is stored in the Settings sheet — change it immediately
- Never share the Web App URL with others unless intended
- Google Apps Script runs on Google's secure infrastructure
- All data stays within your Google account

---

## MODULES INCLUDED

| Module | Features |
|--------|----------|
| Dashboard | Live stats, quick actions, recent enquiries |
| Students | Add/Edit/Delete, search, filter by class & status |
| Fees | Record payments, track pending, filter by month |
| Enquiries | Log leads, track status, follow-up dates |
| Batches | Manage class batches, strength tracking |
| Announcements | Publish notices with priority & expiry |
| Website Control | Update homepage content from admin |
| Reports | Fee collection report, enquiry analytics |
| Settings | Institute details, password management |

---

*Aakrit Classes Admin Panel | Built for internal use only*

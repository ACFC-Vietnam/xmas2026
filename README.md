# ACFC Xmas 2026 🎄

Hub site for ACFC's Christmas 2026 event series. Live at **https://acfc-vietnam.github.io/xmas2026/** once GitHub Pages is on (Settings → Pages → Deploy from branch `main`, folder `/`).

| Path | What |
|---|---|
| `/` | Series hub. The Wish Status card appears automatically from 21/12/2026 00:00 |
| `/make-a-wish/` | Embedded Tally form `LDKGNO` + sealing ceremony + key (copy / save as image) |
| `/wish-status/` | Countdown until 21/12/2026 00:00, then key lookup (via Apps Script) |
| `assets/js/config.js` | **All settings**: form ID, dates, Apps Script URL, transparent embed switch |
| `apps-script/` | Status lookup backend for communication.acfc@gmail.com (setup in its README) |
| `tally/` | Custom CSS for the Tally form (paste into Tally, see its README) |

## Key dates (Vietnam time)
- 30/11/2026: launch
- 20/12/2026 23:59: form closes (set in Tally)
- 21/12/2026 00:00: Wish Status opens (enforced by the Apps Script)

## Testing
- Preview the ceremony without submitting: `/make-a-wish/#preview-key=Test12`
- Delete test submissions in Tally before launch.

## Placeholder art
All visuals are CSS placeholders until the event KV is ready. Colours are variables at the top of `assets/css/site.css` and `tally/make-a-wish.css`. Replace `assets/img/og-make-a-wish.png` (1200×630) with the KV link-preview image.

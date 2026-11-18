# Tally form: Make A Wish 2026 (`LDKGNO`)

`make-a-wish.css` is the letter/envelope styling for the form:
page 1 is the envelope front, page 2 the ruled letter, and the thank-you page shows a sealing animation plus the key.

**Status:** Tally's API refused to save this CSS ("unsafe content"), so it is **not applied yet**.
To apply it: Tally editor → **Customize** (design) → **Custom CSS** → paste the whole file → Preview.

Optional handwriting fonts: the CSS already refers to *Dancing Script* (greeting and sign-off) and *Patrick Hand* (what people type). Until they are loaded, both fall back to Be Vietnam Pro. Tally's docs show loading Google Fonts with an `@import` line at the top of the Custom CSS box.

After the CSS is in, set `tallyTransparentBackground: true` in `assets/js/config.js` so the cards float on the snowy page.

Swapping in the key visual: change the `--mw-*` colour variables at the top of the file.

Block-specific selectors (`.tally-block-<uuid>`) target: the greeting lines, the sign-off, the section headings, the thank-you title and the key. If those blocks are deleted and re-created, update the uuids.

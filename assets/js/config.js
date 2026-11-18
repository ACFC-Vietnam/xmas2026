/* ACFC Xmas 2026 — shared site config.
   Edit here, not in the page scripts. All times are Vietnam time (UTC+7). */
window.XMAS_CONFIG = {
  tallyFormId: 'LDKGNO',

  // Make A Wish closes (Tally also closes the form itself at this time).
  formCloseAt: '2026-12-20T23:59:59+07:00',

  // Wish Status page opens. The Apps Script enforces the same date server-side.
  wishStatusOpenAt: '2026-12-21T00:00:00+07:00',

  // false = the form keeps its own paper background inside a letter frame (safe default).
  // Set to true ONLY after tally/make-a-wish.css is pasted into Tally's Custom CSS box,
  // so the envelope/letter cards float directly on the snowy scene.
  tallyTransparentBackground: false,

  // Paste the Apps Script web-app URL (ends in /exec) after deploying apps-script/Code.gs.
  appsScriptUrl: ''
};

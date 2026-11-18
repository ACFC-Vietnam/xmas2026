/* Wish Status page: countdown until opening, then key lookup against the Apps Script web app.
   The Apps Script also refuses lookups before the opening time, so this client-side lock is cosmetic. */
(function () {
  var cfg = window.XMAS_CONFIG || {};
  var openAt = Date.parse(cfg.wishStatusOpenAt || '2026-12-21T00:00:00+07:00');
  var $ = function (id) { return document.getElementById(id); };

  var vLocked = $('view-locked'), vLookup = $('view-lookup'), vResult = $('view-result');
  var timer = null;

  function show(view) {
    [vLocked, vLookup, vResult].forEach(function (v) { v.hidden = v !== view; });
  }

  /* ---------- Countdown ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var ms = openAt - Date.now();
    if (ms <= 0) { clearInterval(timer); startLookup(); return; }
    var s = Math.floor(ms / 1000);
    $('cd-d').textContent = Math.floor(s / 86400);
    $('cd-h').textContent = pad(Math.floor(s % 86400 / 3600));
    $('cd-m').textContent = pad(Math.floor(s % 3600 / 60));
    $('cd-s').textContent = pad(s % 60);
  }

  /* ---------- Lookup ---------- */
  var form = $('lookup-form'), input = $('key-input'), btn = $('lookup-btn'), err = $('lookup-error');

  function startLookup() {
    show(vLookup);
    var m = location.hash.match(/key=([A-Za-z0-9]{3,20})/);
    if (m) { input.value = m[1]; history.replaceState(null, '', location.pathname); }
    input.focus({ preventScroll: true });
  }

  function setError(text) { err.textContent = text; err.hidden = !text; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var key = input.value.trim().replace(/\s+/g, '');
    setError('');
    if (!/^[A-Za-z0-9]{3,20}$/.test(key)) { setError('Chìa khoá chỉ gồm chữ và số thôi nè, bạn kiểm tra lại nhé.'); return; }
    if (!cfg.appsScriptUrl) { setError('Trang tra cứu chưa được kết nối dữ liệu. Bạn quay lại sau nhé!'); return; }

    btn.disabled = true; btn.textContent = 'Đang mở thư…';
    var url = cfg.appsScriptUrl + (cfg.appsScriptUrl.indexOf('?') > -1 ? '&' : '?') + 'key=' + encodeURIComponent(key);
    fetch(url, { method: 'GET', redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.ok) { render(data.wish); return; }
        var code = data && data.code;
        if (code === 'NOT_OPEN') { show(vLocked); timer = setInterval(tick, 1000); tick(); return; }
        if (code === 'NOT_FOUND') setError('Không tìm thấy lá thư nào với chìa khoá này. Bạn kiểm tra lại chữ hoa, chữ thường nhé 🔍');
        else if (code === 'INVALID_KEY') setError('Chìa khoá chưa đúng định dạng, bạn kiểm tra lại nhé.');
        else setError('Có chút trục trặc rồi, bạn thử lại sau ít phút nhé 🙏');
      })
      .catch(function () { setError('Không kết nối được hòm thư. Bạn kiểm tra mạng rồi thử lại nhé 🙏'); })
      .then(function () { btn.disabled = false; btn.textContent = 'Mở thư ✉️'; });
  });

  function text(id, value) { $(id).textContent = value || ''; }
  function row(id, value) { $(id).hidden = !value; }

  function render(w) {
    w = w || {};
    text('r-status', w.status || 'Đang chờ cập nhật');
    text('r-status-note', w.statusNote); $('r-status-note').hidden = !w.statusNote;
    text('r-date', w.submittedAt ? 'Gửi lúc ' + w.submittedAt : '');

    var self = /bản thân/i.test(w.recipientType || '') || !w.recipientName;
    text('r-greeting', self ? 'Gửi chính mình thân mến,' : 'Gửi ' + w.recipientName + ' thân mến,');

    text('r-gift', w.gift); row('row-gift', w.gift);
    text('r-reason', w.reason); row('row-reason', w.reason);
    text('r-message', w.message); row('row-message', w.message);
    text('r-sender', w.senderName);
    text('r-sender-team', w.senderTeam);
    show(vResult);
    vResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('btn-another').addEventListener('click', function () {
    input.value = ''; setError(''); startLookup();
  });

  /* ---------- Boot ---------- */
  if (Date.now() < openAt) { show(vLocked); tick(); timer = setInterval(tick, 1000); }
  else startLookup();
})();

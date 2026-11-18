/* Make A Wish page: loads the Tally embed, listens for the submit event,
   then plays the sealing ceremony and shows the wish key (Tally Submission ID). */
(function () {
  var cfg = window.XMAS_CONFIG || {};
  var frame = document.getElementById('letter-frame');
  var iframe = document.getElementById('wish-form');
  var loading = document.getElementById('embed-loading');
  var ceremony = document.getElementById('ceremony');
  var keyCodeEl = document.getElementById('key-code');
  var currentKey = '';

  /* ---------- Embed ---------- */
  var transparent = !!cfg.tallyTransparentBackground;
  if (transparent) frame.classList.add('is-transparent');
  var src = 'https://tally.so/embed/' + encodeURIComponent(cfg.tallyFormId) +
    '?alignLeft=1&hideTitle=0&dynamicHeight=1' + (transparent ? '&transparentBackground=1' : '');
  iframe.setAttribute('data-tally-src', src);

  var loaded = false;
  function loadEmbed() {
    if (loaded) return;
    loaded = true;
    if (window.Tally && typeof window.Tally.loadEmbeds === 'function') {
      window.Tally.loadEmbeds();
    } else {
      iframe.src = src; // fallback: no dynamic height, but the form still works
    }
  }
  window.__tallyReady = loadEmbed;
  if (window.Tally) loadEmbed();
  setTimeout(loadEmbed, 4000); // embed.js blocked or slow

  iframe.addEventListener('load', function () { loading.style.display = 'none'; });

  /* ---------- Events from the form ---------- */
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://tally.so') return;
    var msg = e.data;
    if (typeof msg === 'string') {
      if (msg.indexOf('Tally.') === -1) return;
      try { msg = JSON.parse(msg); } catch (err) { return; }
    }
    if (!msg || typeof msg.event !== 'string') return;

    if (msg.event === 'Tally.FormPageView') {
      // Keep the top of the letter in view when moving between pages (matters on phones).
      var top = frame.getBoundingClientRect().top + window.pageYOffset - 12;
      if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }

    if (msg.event === 'Tally.FormSubmitted') {
      var p = msg.payload || {};
      var key = p.id || p.submissionId || p.responseId || '';
      showCeremony(String(key));
    }
  });

  /* ---------- Ceremony ---------- */
  function showCeremony(key) {
    currentKey = key;
    keyCodeEl.textContent = key || '— xem email —';
    if (!key) {
      document.getElementById('btn-copy').hidden = true;
      document.getElementById('btn-save').hidden = true;
    }
    ceremony.hidden = false;
    document.body.style.overflow = 'hidden';
    // restart animation reliably
    ceremony.classList.remove('play');
    void ceremony.offsetWidth;
    ceremony.classList.add('play');
    setTimeout(function () { document.getElementById('btn-copy').focus({ preventScroll: true }); }, 3400);
  }

  document.getElementById('btn-close').addEventListener('click', function () {
    ceremony.hidden = true;
    document.body.style.overflow = '';
  });

  /* ---------- Copy ---------- */
  function toast(text) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 2200);
  }
  function copyKey() {
    if (!currentKey) return;
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = currentKey; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Đã sao chép chìa khoá 🔑'); }
      catch (err) { toast('Hãy nhấn giữ để sao chép nhé'); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentKey).then(function () { toast('Đã sao chép chìa khoá 🔑'); }, fallback);
    } else { fallback(); }
  }
  document.getElementById('btn-copy').addEventListener('click', copyKey);
  document.getElementById('key-box').addEventListener('click', copyKey);

  /* ---------- Save key as image ---------- */
  document.getElementById('btn-save').addEventListener('click', function () {
    if (!currentKey) return;
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () {
      var W = 1080, H = 1350, c = document.createElement('canvas');
      c.width = W; c.height = H;
      var x = c.getContext('2d');

      // background
      var g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0f2a20'); g.addColorStop(1, '#1f4d3a');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      // paper card
      x.fillStyle = '#fbf6ec';
      roundRect(x, 90, 150, W - 180, H - 300, 28); x.fill();
      // title
      x.textAlign = 'center';
      x.fillStyle = '#b3282d';
      x.font = '700 84px "Dancing Script", cursive';
      x.fillText('Make A Wish 2026', W / 2, 330);
      x.fillStyle = '#7a6555';
      x.font = '500 38px "Be Vietnam Pro", sans-serif';
      x.fillText('Chìa khoá điều ước của bạn', W / 2, 430);
      // key plate
      var kg = x.createLinearGradient(0, 560, 0, 720);
      kg.addColorStop(0, '#e9cf86'); kg.addColorStop(1, '#a8842f');
      x.fillStyle = kg;
      roundRect(x, 170, 560, W - 340, 170, 85); x.fill();
      x.fillStyle = '#3a2a0c';
      x.font = '700 92px "Courier New", monospace';
      x.fillText(spaced(currentKey), W / 2, 678);
      // wax seal
      x.beginPath(); x.arc(W / 2, 880, 64, 0, Math.PI * 2);
      var sg = x.createRadialGradient(W / 2 - 20, 860, 10, W / 2, 880, 64);
      sg.addColorStop(0, '#e05a4f'); sg.addColorStop(.6, '#b3282d'); sg.addColorStop(1, '#8c1d22');
      x.fillStyle = sg; x.fill();
      x.font = '64px serif'; x.fillText('🎄', W / 2, 902);
      // footer
      x.fillStyle = '#3b2a20';
      x.font = '40px "Patrick Hand", sans-serif';
      x.fillText('Giữ kỹ chiếc chìa khoá này nhé 🔑', W / 2, 1060);
      x.fillStyle = '#7a6555';
      x.font = '500 30px "Be Vietnam Pro", sans-serif';
      x.fillText('ACFC · Xmas 2026', W / 2, 1130);

      c.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'chia-khoa-dieu-uoc-' + currentKey + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast('Đã lưu ảnh chìa khoá 🖼️');
      }, 'image/png');
    });
  });

  function spaced(s) { return s.split('').join(' '); }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Preview helper for testing the ceremony without submitting: add #preview-key=AbC123 to the URL.
  var m = location.hash.match(/preview-key=([A-Za-z0-9]{3,20})/);
  if (m) setTimeout(function () { showCeremony(m[1]); }, 600);
})();

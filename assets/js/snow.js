/* Light falling snow on a fixed canvas. Pauses when the tab is hidden; off for reduced motion. */
(function () {
  var canvas = document.getElementById('snow');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = canvas.getContext('2d');
  var flakes = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = Math.round(Math.min(110, (w * h) / 14000));
    while (flakes.length < target) flakes.push(make(true));
    flakes.length = target;
  }
  function make(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: Math.random() * 2.2 + 0.8,
      s: Math.random() * 0.6 + 0.35,
      drift: Math.random() * 0.6 - 0.3,
      phase: Math.random() * Math.PI * 2,
      a: Math.random() * 0.5 + 0.35
    };
  }
  function tick(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.s;
      f.x += f.drift + Math.sin(t / 1600 + f.phase) * 0.25;
      if (f.y > h + 10) flakes[i] = make(false);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,' + f.a + ')';
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(tick);
})();

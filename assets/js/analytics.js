/* Site analytics (Google Analytics 4). Inactive until XMAS_CONFIG.ga4MeasurementId is set.
   Sends page views + named events only — never names, keys, emails or phone numbers. */
(function () {
  var cfg = window.XMAS_CONFIG || {};
  var id = cfg.ga4MeasurementId;

  // Safe no-op until GA loads (or forever, if no ID is configured).
  window.xmasTrack = function (name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  };
  if (!id) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id);

  // Any element with data-track="event_name" reports a click.
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (!el) return;
    var params = {};
    if (el.getAttribute('href')) params.link_url = el.getAttribute('href');
    window.xmasTrack(el.getAttribute('data-track'), params);
  });
})();

(function() {
  var els = document.querySelectorAll('[data-signum-domain]');
  if (!els.length) return;

  var style = document.createElement('style');
  style.textContent = '.signum-badge{display:inline-flex;align-items:center;gap:6px;background:#0d1424;border:1px solid #1e2d45;border-radius:8px;padding:6px 12px;font-family:-apple-system,sans-serif;font-size:12px;text-decoration:none;color:#94a3b8;transition:border-color 0.15s;}.signum-badge:hover{border-color:#3b82f6;}.signum-badge .sb-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}.signum-badge .sb-score{font-weight:700;font-size:13px;}.signum-badge .sb-label{color:#64748b;font-size:11px;}';
  document.head.appendChild(style);

  els.forEach(function(el) {
    var domain = el.getAttribute('data-signum-domain');
    if (!domain) return;

    el.innerHTML = '<a class="signum-badge" href="https://www.signumaiapp.com/?domain=' + encodeURIComponent(domain) + '" target="_blank" rel="noopener"><span class="sb-dot" style="background:#334155;"></span><span class="sb-score">—</span><span class="sb-label">Checking...</span></a>';

    fetch('https://detective-app-production-7080.up.railway.app/extension/scan', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({domain: domain})
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var score = d.risk_score || 0;
      var verdict = (d.verdict || '').toUpperCase();
      var color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
      var label = score >= 70 ? 'High Risk' : score >= 40 ? 'Caution' : 'Trusted';
      var badge = el.querySelector('.signum-badge');
      if (badge) {
        badge.querySelector('.sb-dot').style.background = color;
        badge.querySelector('.sb-dot').style.boxShadow = '0 0 5px ' + color + '60';
        badge.querySelector('.sb-score').textContent = score + '/100';
        badge.querySelector('.sb-score').style.color = color;
        badge.querySelector('.sb-label').textContent = label + ' · Signum';
      }
    })
    .catch(function() {
      var badge = el.querySelector('.signum-badge');
      if (badge) badge.querySelector('.sb-label').textContent = 'Signum';
    });
  });
})();

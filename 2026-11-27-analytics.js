// Basic consent mode: no Google tag or measurement requests before acceptance.
(() => {
  const measurementId = 'G-2NYYYGV2X7';
  const storageKey = 'ftg-analytics-consent-v1';
  const panel = document.getElementById('analytics-choice');
  const preferences = document.getElementById('analytics-preferences');
  const legacySite = location.hostname === 'ptylr.github.io' && location.pathname.startsWith('/fuck-that/');
  const customSite = ['fuckthat.golf', 'www.fuckthat.golf'].includes(location.hostname);
  if (!legacySite && !customSite) return;
  const cookiePath = legacySite ? '/fuck-that/' : '/';
  const cookieDomain = legacySite ? 'ptylr.github.io' : 'fuckthat.golf';
  const disableKey = `ga-disable-${measurementId}`;
  let started = false;
  let choice = null;
  try { choice = localStorage.getItem(storageKey); } catch { /* Choice still works for this visit. */ }
  function tag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }
  function start() {
    window[disableKey] = false;
    if (started) {
      tag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    started = true;
    window.gtag = tag;
    tag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    tag('consent', 'update', { analytics_storage: 'granted' });
    tag('js', new Date());
    tag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_prefix: 'ftg',
      cookie_expires: 63072000, // Two years; disclosed in Data & privacy.
      cookie_update: true,
      cookie_path: cookiePath,
      page_location: location.origin + location.pathname,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }
  function decline() {
    window[disableKey] = true;
    if (started) tag('consent', 'update', { analytics_storage: 'denied' });
    // Remove only this app's prefixed Analytics cookies, including domain cookies.
    for (const entry of document.cookie.split(';')) {
      const name = entry.trim().split('=')[0];
      if (!/^ftg_ga(?:_|$)/.test(name)) continue;
      for (const domain of new Set(['', location.hostname, `.${location.hostname}`, cookieDomain, `.${cookieDomain}`])) {
        const scope = domain ? `; Domain=${domain}` : '';
        document.cookie = `${name}=; Max-Age=0; Path=${cookiePath}${scope}; SameSite=Lax; Secure`;
      }
    }
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(storageKey, value); } catch { /* Do not block forecasts. */ }
    if (value === 'accepted') start(); else decline();
    panel.hidden = true;
    preferences.focus();
  }
  document.getElementById('analytics-accept').addEventListener('click', () => choose('accepted'));
  document.getElementById('analytics-decline').addEventListener('click', () => choose('declined'));
  preferences.addEventListener('click', () => {
    panel.hidden = false;
    document.getElementById('analytics-accept').focus();
  });
  preferences.hidden = false;
  if (choice === 'accepted') start();
  else if (choice === 'declined') decline();
  else panel.hidden = false;
})();

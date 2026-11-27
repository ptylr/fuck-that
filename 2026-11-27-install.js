// Installation is progressive enhancement: forecasts never depend on this script.
(() => {
  const button = document.getElementById('install-app');
  const dialog = document.getElementById('install-guide');
  const hint = document.getElementById('install-hint');
  const standalone = window.matchMedia('(display-mode: standalone)');
  const picker = document.getElementById('install-browser');
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const mac = /Macintosh|Mac OS X/.test(ua) && !ios;
  const windows = /Windows/.test(ua);
  // Use detection only to select helpful copy. The native install event decides capability.
  picker.value = ios ? 'ios' : /Android/.test(ua) ? 'android' : /Edg\//.test(ua) ? 'edge' : /Firefox\//.test(ua) ? 'firefox' : /Chrome\//.test(ua) && !/OPR\//.test(ua) ? 'chrome' : /Safari\//.test(ua) && !/Chrom/.test(ua) ? 'safari' : 'other';
  const routes = {
    chrome: ['Install with Chrome', 'Open Chrome’s three-dot menu → Cast, save, and share → Install page as app… and confirm Install. You can also use the install icon in the address bar when it appears.'],
    edge: ['Install with Microsoft Edge', 'Open Edge’s three-dot menu → More tools → Apps → Install this site as an app. You can also use the install icon in the address bar when it appears.'],
    safari: ['Add to Dock with Safari', 'On macOS Sonoma 14 or later, choose File → Add to Dock (or Share → Add to Dock), keep the name “Fuck That!” and click Add.'],
    ios: ['Add to your Home Screen', 'In Safari, tap Share → Add to Home Screen, then Add. If your current browser offers Add to Home Screen in its Share menu, you can use that too.'],
    android: ['Install on Android', 'In Chrome, open the three-dot menu → Add to home screen → Install. Other Android browsers may call this Install app or Add to Home screen.'],
    firefox: ['Use Firefox’s web-app option where available', windows ? 'In supported Firefox versions on Windows, use the web-app / pin icon in the address bar to add this site to your taskbar.' : 'Firefox on this device does not offer the same desktop web-app installation. Open this page in Chrome or Edge to install it, or Safari on Mac to add it to the Dock. You can still bookmark and use it in Firefox.'],
    other: ['Check your browser’s app options', 'Look for Install app or Add to Home Screen in your browser menu. If neither is available, open this page in Chrome or Edge, or Safari on Mac. Bookmarking the page also works.'],
  };
  const renderRoute = () => {
    const route = routes[picker.value] || routes.other;
    document.getElementById('install-route-title').textContent = route[0];
    document.getElementById('install-route-steps').textContent = route[1];
    document.getElementById('install-pin').textContent = mac && ['chrome', 'edge'].includes(picker.value)
      ? 'Once the app opens, right-click its Dock icon → Options → Keep in Dock.'
      : 'The installed app uses the green golf-flag icon. Installation options vary by browser and device.';
  };
  picker.addEventListener('change', () => { renderRoute(); update(); });
  renderRoute();
  let pendingPrompt = null;
  let installed = standalone.matches || navigator.standalone === true;
  const update = () => {
    button.hidden = installed;
    button.textContent = pendingPrompt ? 'Install app' : ios ? 'Add to Home Screen' : mac && picker.value === 'safari' ? 'Add to Dock' : 'Get the app';
  };
  const showGuide = () => {
    hint.textContent = location.protocol === 'file:'
      ? 'Open the local HTTP preview to try installation. Installing requires HTTPS or localhost.'
      : 'Forecasts need an internet connection. The app opens in its own window with the same live forecasts.';
    if (!dialog.open) dialog.showModal();
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingPrompt = event;
    update();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    pendingPrompt = null;
    if (dialog.open) dialog.close();
    update();
  });
  standalone.addEventListener('change', event => {
    installed = event.matches || navigator.standalone === true;
    update();
  });
  button.addEventListener('click', async () => {
    if (!pendingPrompt) { showGuide(); return; }
    const prompt = pendingPrompt;
    pendingPrompt = null; // Each browser event can only be used once.
    button.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome !== 'accepted' && !installed) showGuide();
    } catch {
      if (!installed) showGuide();
    } finally {
      button.disabled = false;
      update();
    }
  });
  document.getElementById('install-close').addEventListener('click', () => dialog.close());
  update();
})();

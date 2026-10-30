/* Shared app theme: one choice drives the shell, news studio, book studio and e-paper. */
(function () {
  var KEY = 'app_theme_v1';
  var CV = {
    royal:   { red: '#C1121F', yel: '#E8B23A', gold: '#8E0E15', page: '#F8ECEC', panel: '#FFFFFF', panel2: '#F6E3E3', ink: '#2B0A0E', tkb: '#2A0508' },
    night:   { red: '#E23744', yel: '#E8B23A', gold: '#C9242F', page: '#150708', panel: '#2A1215', panel2: '#1E0D0F', ink: '#FBEDEE', tkb: '#070203' },
    sun:     { red: '#D71920', yel: '#FFC800', gold: '#D71920', page: '#F3F3F3', panel: '#FFFFFF', panel2: '#F1F1F1', ink: '#101010', tkb: '#070707' },
    ink:     { red: '#2B2A8C', yel: '#FFC043', gold: '#1B2160', page: '#EEF0FB', panel: '#FFFFFF', panel2: '#E3E6F6', ink: '#17153A', tkb: '#0A0D2E' },
    emerald: { red: '#0F6B57', yel: '#F6D56F', gold: '#05342C', page: '#EAF5F0', panel: '#FFFFFF', panel2: '#DCEEE6', ink: '#07281F', tkb: '#042019' }
  };
  var T = [
    { id: 'royal', name: 'ராயல் சிவப்பு', mode: 'light', bg: '#FBF1F1', panel: '#FFFFFF', fg: '#2B0A0E', muted: '#7A5257', line: '#EBCFD1', field: '#FFF8F8', accent: '#B3121A', on: '#FFFFFF', gold: '#E0A823', goldText: '#8E6A00', deep: '#7A0C14', dark: '#2B0A0E', acc1: '#D4202B', acc2: '#8E0E15', cv: CV.royal },
    { id: 'night', name: 'இரவு சிவப்பு', mode: 'dark', bg: '#140607', panel: '#231012', fg: '#FBEDEE', muted: '#C9A3A6', line: '#4A2226', field: '#1B0C0E', accent: '#E23744', on: '#FFFFFF', gold: '#E8B23A', goldText: '#E8B23A', deep: '#8E0E1A', dark: '#0B0304', acc1: '#E23744', acc2: '#9B1420', cv: CV.night },
    { id: 'sun', name: 'மஞ்சள்', mode: 'light', bg: '#FFFDF0', panel: '#FFFFFF', fg: '#101010', muted: '#6B6B6B', line: '#EFE3B0', field: '#FFFEF8', accent: '#FFC800', on: '#101010', gold: '#B07A00', goldText: '#B07A00', deep: '#D71920', dark: '#101010', acc1: '#FFD84D', acc2: '#E0A400', cv: CV.sun },
    { id: 'ink', name: 'மை நீலம்', mode: 'light', bg: '#F6F5FB', panel: '#FFFFFF', fg: '#17153A', muted: '#5E5C80', line: '#E2E0F0', field: '#FBFAFF', accent: '#3B2FC9', on: '#FFFFFF', gold: '#F2A900', goldText: '#3B2FC9', deep: '#1B2160', dark: '#17153A', acc1: '#5A4FE0', acc2: '#2A20A0', cv: CV.ink },
    { id: 'emerald', name: 'மரகதம்', mode: 'light', bg: '#F1F8F5', panel: '#FFFFFF', fg: '#07281F', muted: '#4F6F65', line: '#CFE5DC', field: '#F8FDFB', accent: '#0F6B57', on: '#FFFFFF', gold: '#D9A520', goldText: '#0F6B57', deep: '#05342C', dark: '#07281F', acc1: '#14876E', acc2: '#0A4A3C', cv: CV.emerald }
  ];
  function byId(id) { for (var i = 0; i < T.length; i++) if (T[i].id === id) return T[i]; return null; }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  var current = (byId(stored()) || T[0]).id;

  function css() {
    if (document.getElementById('at-css')) return;
    var s = document.createElement('style'); s.id = 'at-css';
    s.textContent = '.at-row{display:flex;flex-wrap:wrap;gap:8px}.at-sw{border:2px solid var(--line,#ddd);border-radius:12px;padding:6px 10px;background:var(--field,#fff);color:var(--fg,#000);font:inherit;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.at-sw[aria-pressed=true]{border-color:var(--accent,#b3121a);box-shadow:0 0 0 2px var(--accent,#b3121a) inset}.at-sw i{width:18px;height:18px;border-radius:50%;display:inline-block;border:1px solid rgba(0,0,0,.2)}';
    document.head.appendChild(s);
  }
  function paint() {
    var els = document.querySelectorAll('.at-sw');
    for (var i = 0; i < els.length; i++) els[i].setAttribute('aria-pressed', els[i].dataset.id === current ? 'true' : 'false');
  }
  function apply(id) {
    var t = byId(id) || T[0]; current = t.id;
    var r = document.documentElement, m = {
      '--bg': t.bg, '--panel': t.panel, '--card': t.panel, '--fg': t.fg, '--ink': t.fg, '--muted': t.muted, '--mut': t.muted,
      '--line': t.line, '--field': t.field, '--in': t.field, '--accent': t.accent, '--red': t.accent, '--on': t.on, '--on-accent': t.on,
      '--gold': t.goldText, '--warm': t.gold, '--deep': t.deep, '--dark': t.dark, '--acc1': t.acc1, '--acc2': t.acc2, '--danger': t.mode === 'dark' ? '#FF8A80' : '#B3261E'
    };
    for (var k in m) r.style.setProperty(k, m[k]);
    r.style.colorScheme = t.mode;
    r.setAttribute('data-app-theme', t.id);
    var mt = document.querySelector('meta[name=theme-color]');
    if (mt) mt.setAttribute('content', t.accent === '#FFC800' ? '#D71920' : t.accent);
    paint();
    var fr = document.querySelectorAll('iframe');
    for (var i = 0; i < fr.length; i++) { try { fr[i].contentWindow.postMessage({ appTheme: t.id }, '*'); } catch (e) {} }
    if (typeof window.onAppTheme === 'function') { try { window.onAppTheme(t); } catch (e) {} }
  }
  function set(id) {
    try { localStorage.setItem(KEY, id); } catch (e) {}
    apply(id);
  }
  function mount(sel) {
    var box = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!box) return;
    css(); box.classList.add('at-row');
    box.innerHTML = T.map(function (t) { return '<button type="button" class="at-sw" data-id="' + t.id + '" aria-pressed="' + (t.id === current) + '"><i style="background:linear-gradient(135deg,' + t.accent + ',' + t.deep + ')"></i>' + t.name + '</button>'; }).join('');
    box.onclick = function (e) { var b = e.target.closest('.at-sw'); if (b) set(b.dataset.id); };
  }
  window.addEventListener('message', function (e) { if (e.data && e.data.appTheme) apply(e.data.appTheme); });
  window.addEventListener('storage', function (e) { if (e.key === KEY && e.newValue) apply(e.newValue); });
  window.AppTheme = { themes: T, mount: mount, set: set, get: function () { return current; } };
  apply(current);
})();
